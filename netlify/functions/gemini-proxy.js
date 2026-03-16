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
        const API_KEY = Netlify.env.get('GEMINI_API_KEY');

        const verificationKey = `verified:session:${clientIp}`;
        const minuteKey = `ratelimit:min:${clientIp}`;
        const hourKey = `ratelimit:hour:${clientIp}`;

        let isIPVerified = false;
        let minCount = 0;
        let hourCount = 0;

        // 3. Parallelized Redis Checks (Verification + Rate Limiting)
        if (REDIS_URL && REDIS_TOKEN) {
            const redisHeaders = { Authorization: `Bearer ${REDIS_TOKEN}` };
            
            // Perform all initial Redis lookups and increments in parallel
            const [verifyRes, minIncrRes, hourIncrRes] = await Promise.all([
                fetch(`${REDIS_URL}/GET/${verificationKey}`, { headers: redisHeaders }).then(r => r.json()),
                fetch(`${REDIS_URL}/INCR/${minuteKey}`, { headers: redisHeaders }).then(r => r.json()),
                fetch(`${REDIS_URL}/INCR/${hourKey}`, { headers: redisHeaders }).then(r => r.json())
            ]);

            isIPVerified = verifyRes.result === "true";
            minCount = parseInt(minIncrRes.result);
            hourCount = parseInt(hourIncrRes.result);

            // Set expirations if it's the first request in the window (non-blocking)
            const expirePromises = [];
            if (minCount === 1) {
                expirePromises.push(fetch(`${REDIS_URL}/EXPIRE/${minuteKey}/60`, { headers: redisHeaders }));
            }
            if (hourCount === 1) {
                expirePromises.push(fetch(`${REDIS_URL}/EXPIRE/${hourKey}/3600`, { headers: redisHeaders }));
            }
            if (expirePromises.length > 0) Promise.all(expirePromises).catch(console.error);
        }

        // 4. Rate Limit Check (Stop early if limit reached)
        if (minCount > 5) { // Sınırı 5'e esnettim (4+1 tolerans)
            return new Response(JSON.stringify({ error: 'Rate limit exceeded', text: 'Çok hızlı soru soruyorsunuz! Lütfen bir dakika bekleyip tekrar deneyin.' }), {
                status: 429, headers: { 'Content-Type': 'application/json' }
            });
        }
        if (hourCount > 100) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded', text: 'Saatlik maksimum istek limitinize ulaştınız. Lütfen bir saat sonra tekrar deneyin.' }), {
                status: 429, headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Bot Verification (Only if not already verified)
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
                return new Response(JSON.stringify({ error: 'Bot verification failed', text: 'Bot doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Cache verification for 1 hour (non-blocking)
            if (REDIS_URL && REDIS_TOKEN) {
                fetch(`${REDIS_URL}/SET/${verificationKey}/true/EX/3600`, {
                    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
                }).catch(console.error);
            }
        }

        // 6. Send request to Gemini API (With Timeout)
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500); // 8.5 saniye timeout (Netlify 10s limitinden önce)

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                return new Response(JSON.stringify(data), {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 7. Log to Redis (Asynchronous)
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

                fetch(REDIS_URL, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${REDIS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(['LPUSH', 'sherlock:logs', JSON.stringify(logEntry)])
                }).catch(err => console.error("Logging failed:", err));
            }

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                return new Response(JSON.stringify({ error: 'Timeout', text: 'Yapay zeka yanıt vermekte çok gecikti. Lütfen soruyu biraz kısaltıp tekrar deneyin.' }), {
                    status: 504,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', text: 'Sunucu tarafında bir hata oluştu. Lütfen tekrar deneyin.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: '/api/gemini'
};
