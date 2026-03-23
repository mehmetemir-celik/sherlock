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

    const API_KEY = Netlify.env.get('GEMINI_API_KEY') || process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let geminiData = {};
    let metadata = {};
    let clientIp = 'unknown-ip';
    let REDIS_URL = Netlify.env.get('UPSTASH_REDIS_REST_URL') || process.env.UPSTASH_REDIS_REST_URL;
    let REDIS_TOKEN = Netlify.env.get('UPSTASH_REDIS_REST_TOKEN') || process.env.UPSTASH_REDIS_REST_TOKEN;

    try {
        const body = await req.json();
        const { cfToken, metadata: meta, ...data } = body;
        geminiData = data;
        metadata = meta;

        // 1. Get Client IP Address
        clientIp = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown-ip';

        // 2. Integration Credentials
        const TURNSTILE_SECRET = Netlify.env.get('TURNSTILE_SECRET_KEY') || process.env.TURNSTILE_SECRET_KEY;

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

        // 5. Bot Verification (Only if not already verified and NOT in local dev)
        const isLocalDev = process.env.NETLIFY_DEV === 'true' || process.env.NODE_ENV === 'development';
        if (TURNSTILE_SECRET && !isIPVerified && !isLocalDev) {
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
                return new Response(JSON.stringify({ 
                    error: 'Bot verification failed', 
                    text: 'Bot doğrulaması başarısız (Süre dolmuş olabilir). Lütfen sayfayı yenileyip tekrar deneyin.',
                    code: verifyOutcome['error-codes']?.[0]
                }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Cache verification for 3 hours (non-blocking)
            if (REDIS_URL && REDIS_TOKEN) {
                fetch(`${REDIS_URL}/SET/${verificationKey}/true/EX/10800`, {
                    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
                }).catch(console.error);
            }
        }

        // 5.5. Session doğrulama (Ping) için erken dönüş
        if (metadata?.type === 'init') {
            return new Response(JSON.stringify({ success: true, text: 'Session verified' }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        console.error("Verification/RateLimit error:", err);
    }

    const GROQ_API_KEY = Netlify.env.get('LLM_API_KEY') || process.env.LLM_API_KEY;

    // 6. Primary: Call Gemini API
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`;

    let modelUsed = "gemini-3.1-flash-lite";
    let apiResponse;
    let isFallback = false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiData || {}),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 429 && GROQ_API_KEY) {
            console.log("Gemini quota exceeded, falling back to Groq...");
            isFallback = true;
        } else if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return new Response(JSON.stringify(errorData), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            apiResponse = await response.json();
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            return new Response(JSON.stringify({ error: 'Timeout', text: 'Yapay zeka yanıt vermekte gecikti. Fallback deneniyor...' }), { status: 504 });
        }
        console.error("Gemini fetch error:", err);
        if (GROQ_API_KEY) isFallback = true;
        else throw err;
    }

    // 7. Fallback: Call Groq API if needed
    if (isFallback && GROQ_API_KEY) {
        modelUsed = "llama-4-scout-17b";
        try {
            apiResponse = await callGroq(geminiData, GROQ_API_KEY);
        } catch (groqErr) {
            console.error("Groq fallback failed:", groqErr.message);
            return new Response(JSON.stringify({ error: 'All models failed', text: 'Şu an tüm yapay zeka servisleri meşgul. Lütfen az sonra tekrar deneyin.' }), { status: 503 });
        }
    }

    // 8. Log to Redis (Asynchronous)
    if (REDIS_URL && REDIS_TOKEN && apiResponse) {
        const answerText = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const logEntry = {
            time: new Date().toISOString(),
            ip: clientIp,
            story: metadata?.story || "Unknown",
            type: metadata?.type || "unknown",
            query: metadata?.text || "Unknown",
            answer: answerText,
            model: modelUsed
        };

        fetch(REDIS_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(['LPUSH', 'sherlock:logs', JSON.stringify(logEntry)])
        }).catch(err => console.error("Logging failed:", err));
    }

    if (!apiResponse) {
        return new Response(JSON.stringify({ error: 'Internal server error', text: 'Yanıt oluşturulamadı.' }), { status: 500 });
    }

    return new Response(JSON.stringify(apiResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

/**
 * Call Groq API and format response to match Gemini's structure
 */
async function callGroq(geminiData, apiKey) {
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    // Map Gemini request to OpenAI/Groq format
    const messages = [];

    if (geminiData.system_instruction) {
        messages.push({ role: "system", content: geminiData.system_instruction.parts[0].text });
    }

    if (geminiData.contents) {
        for (const item of geminiData.contents) {
            messages.push({
                role: item.role === "model" ? "assistant" : "user",
                content: item.parts[0].text
            });
        }
    }

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: messages,
            temperature: 0.5,
            max_tokens: 3072
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Groq API error: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Convert back to Gemini structure for the frontend
    return {
        candidates: [{
            content: {
                role: "model",
                parts: [{ text: content }]
            }
        }]
    };
}
