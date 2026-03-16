// Netlify Serverless Function - Gemini API Proxy
// API anahtarı burada güvenli bir şekilde environment variable olarak saklanır

export default async (req) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const API_KEY = Netlify.env.get('GEMINI_API_KEY');
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.json();
        const { cfToken, metadata, ...geminiData } = body;
        
        // 1. Get Client IP Address
        const clientIp = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown-ip';

        // 2. Integration Credentials
        const TURNSTILE_SECRET = Netlify.env.get('TURNSTILE_SECRET_KEY');
        const REDIS_URL = Netlify.env.get('UPSTASH_REDIS_REST_URL');
        const REDIS_TOKEN = Netlify.env.get('UPSTASH_REDIS_REST_TOKEN');
        const verificationKey = `verified:session:${clientIp}`;
        
        let isIPVerified = false;
        
        if (REDIS_URL && REDIS_TOKEN) {
            const checkVerifyRes = await fetch(`${REDIS_URL}/GET/${verificationKey}`, {
                headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
            });
            const checkVerifyData = await checkVerifyRes.json();
            if (checkVerifyData.result === "true") {
                isIPVerified = true;
            }
        }

        if (TURNSTILE_SECRET && !isIPVerified) {
            if (!cfToken) {
                return new Response(JSON.stringify({ error: 'Missing Captcha Token', text: 'Güvenlik doğrulaması eksik. Sayfayı yenileyip tekrar deneyin.' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }

            const formData = new URLSearchParams();
            formData.append('secret', TURNSTILE_SECRET);
            formData.append('response', cfToken);
            formData.append('remoteip', clientIp);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData
            });
            const verifyOutcome = await verifyRes.json();
            
            if (!verifyOutcome.success) {
                console.error("Turnstile failure:", verifyOutcome);
                return new Response(JSON.stringify({ error: 'Bot verification failed', text: 'Bot doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Success! Cache this IP's verification for 1 hour
            if (REDIS_URL && REDIS_TOKEN) {
                await fetch(`${REDIS_URL}/SET/${verificationKey}/true/EX/3600`, {
                    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
                });
            }
        }

        // 3. Upstash Redis IP Rate Limiting (Dual Window: 4/min AND 100/hour)
        if (REDIS_URL && REDIS_TOKEN) {
            const minuteKey = `ratelimit:min:${clientIp}`;
            const hourKey = `ratelimit:hour:${clientIp}`;
            
            // Increment logic for both windows
            const [minIncrRes, hourIncrRes] = await Promise.all([
                fetch(`${REDIS_URL}/INCR/${minuteKey}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } }),
                fetch(`${REDIS_URL}/INCR/${hourKey}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } })
            ]);

            const minIncrData = await minIncrRes.json();
            const hourIncrData = await hourIncrRes.json();
            
            const minCount = minIncrData.result;
            const hourCount = hourIncrData.result;
            
            // Set expirations if it's the first request in the window
            const expirePromises = [];
            if (minCount === 1) {
                expirePromises.push(fetch(`${REDIS_URL}/EXPIRE/${minuteKey}/60`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } }));
            }
            if (hourCount === 1) {
                expirePromises.push(fetch(`${REDIS_URL}/EXPIRE/${hourKey}/3600`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } }));
            }
            if (expirePromises.length > 0) await Promise.all(expirePromises);
            
            // Limit checks
            if (minCount > 4) {
                return new Response(JSON.stringify({ error: 'Rate limit exceeded', text: 'Çok hızlı soru soruyorsunuz! Lütfen bir dakika bekleyip tekrar deneyin.' }), {
                    status: 429, headers: { 'Content-Type': 'application/json' }
                });
            }
            if (hourCount > 100) {
                return new Response(JSON.stringify({ error: 'Rate limit exceeded', text: 'Saatlik maksimum istek limitinize (100) ulaştınız. Lütfen bir saat sonra tekrar deneyin.' }), {
                    status: 429, headers: { 'Content-Type': 'application/json' }
                });
            }
        } else {
            console.warn("Upstash Redis Credentials missing in env. Skipping Rate Limiting.");
        }

        // 4. Send request to Gemini API
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`;
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiData) // Sending data without cfToken
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Log to Redis (Asynchronous)
        if (REDIS_URL && REDIS_TOKEN) {
            const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            const logEntry = {
                time: new Date().toISOString(),
                ip: clientIp,
                story: metadata?.story || "Unknown",
                type: metadata?.type || "unknown",
                query: metadata?.text || "Unknown",
                answer: answerText
            };

            // Use LPUSH to keep a history of events
            fetch(REDIS_URL, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${REDIS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(['LPUSH', 'sherlock:logs', JSON.stringify(logEntry)])
            }).catch(err => console.error("Logging to Redis failed:", err));
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', text: 'Sunucu tarafında bir hata oluştu veya bağlantı kurulamadı.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: '/api/gemini'
};
