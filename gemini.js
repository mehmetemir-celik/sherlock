// Sherlock Yes/No - Gemini API Service (Netlify Proxy)
// API anahtarı sunucu tarafında güvenli bir şekilde saklanıyor.
// Local test için: npx netlify dev

const PROXY_URL = '/api/gemini';

/**
 * Build the system prompt for the AI storyteller
 */
function buildSystemPrompt(story) {
    return `Sen "Sherlock Yes/No" adlı bir lateral thinking (yanal düşünce) bulmaca oyununda hikaye anlatıcısısın.

## Görevin
Oyuncuya gizemli bir senaryo verildi. Oyuncu sana SADECE Evet/Hayır soruları sorabilir. Sen çözümü biliyorsun ama doğrudan söylememelisin. Sadece sorulan soruya göre cevap ver.

## Senaryo
${story.scenario}

## Çözüm (BU BİLGİYİ ASLA DOĞRUDAN PAYLAŞMA)
${story.solution}

## Kurallar
1. ÖNCE sorunun Evet/Hayır sorusu olup olmadığını kontrol et.
   - Eğer soru "neden", "nasıl", "kim", "ne", "nerede", "ne zaman", "kaç", "hangi" gibi açık uçlu bir soruysa veya Evet/Hayır ile cevaplanamayacak bir ifadeyse:
     İlk satır: "UYARI"
     İkinci satır: Oyuncuya bu oyunda sadece Evet/Hayır soruları sorulabileceğini hatırlat. Soruyu Evet/Hayır formatına çevirebileceğine dair kısa bir öneri ver.

2. Eğer soru Evet/Hayır sorusuysa, şu formatta cevap ver:
   - İlk satır: "EVET", "HAYIR" veya "ALAKASIZ" (büyük harfle)
   - İkinci satır: Kısa bir açıklama (1-2 cümle, spoiler vermeden)

3. EVET: Soru çözümle tutarlıysa
4. HAYIR: Soru çözümle çelişiyorsa
5. ALAKASIZ: Soru hikayeyle ilgisi yoksa veya cevabı çözüm için önemsizse

6. ASLA çözümü doğrudan söyleme.
7. Oyuncuyu doğru yöne yönlendir ama cevabı verme.
8. Kısa ve öz cevap ver. Fazla detay verme.
9. Türkçe cevap ver.
10. Eğer oyuncu çözüme çok yaklaştıysa, "Çok yaklaştın! 🔥" gibi teşvik edici bir ifade ekle.
11. Eğlenceli ve gizemli bir ton kullan, bir dedektif hikayesindeki bilge karakter gibi davran.

## Örnek Cevap Formatı
Soru: "Adam uzun boylu mu?"
Cevap:
HAYIR
Hayır, adamın boyu ortalamanın altında. Bu önemli bir detay!

Soru: "Hava durumu önemli mi?"
Cevap:
EVET
Evet! Hava durumu hikayede önemli bir rol oynuyor.

Soru: "Adam neden merdiven çıkıyor?"
Cevap:
UYARI
Bu oyunda sadece Evet/Hayır soruları sorabilirsin, dedektif! 🔍 Soruyu şöyle sormayı dene: "Adamın merdiven çıkmasının sebebi fiziksel bir özelliği mi?"

Soru: "Çözüm ne?"
Cevap:
UYARI
Hey dedektif, bu şekilde sormak olmaz! 🕵️ Sadece Evet/Hayır ile cevaplanabilecek sorular sor. Örneğin: "Çözüm bir kişiyle mi ilgili?"`;
}

/**
 * Build the solution check prompt
 */
function buildSolutionCheckPrompt(story, userSolution) {
    return `Sen "Sherlock Yes/No" bulmaca oyununda hakemsin.

## Senaryo
${story.scenario}

## Gerçek Çözüm
${story.solution}

## Oyuncunun Tahmini
${userSolution}

## Görev
Oyuncunun tahminini gerçek çözümle karşılaştır. İlk satırda şu değerlendirmelerden birini yaz:
- "DOGRU" — Oyuncu çözümün özünü doğru yakalamış (kelimesi kelimesine aynı olması gerekmez, ana fikir doğruysa yeterli)
- "YAKIN" — Oyuncu doğru yolda ama bazı kritik detayları kaçırmış
- "YANLIS" — Oyuncu yanlış bir çözüm sunmuş

İkinci satırda kısa bir açıklama yaz. Eğer YANLIS ise çözümü verme, sadece neden yanlış olduğunu belirt.`;
}

/**
 * Make a request to the Gemini API (via proxy in production, direct in dev)
 */
async function geminiRequest(requestBody) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', response.status, errorData);
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Send a question to Gemini and get a response
 */
async function askGemini(story, conversationHistory, question) {
    const systemPrompt = buildSystemPrompt(story);

    // Build conversation contents
    const contents = [];

    // Add conversation history for context
    for (const entry of conversationHistory) {
        if (entry.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: entry.text }] });
        } else if (entry.role === 'model') {
            contents.push({ role: 'model', parts: [{ text: entry.text }] });
        }
    }

    // Add current question
    contents.push({ role: 'user', parts: [{ text: question }] });

    try {
        const data = await geminiRequest({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
                topP: 0.9
            }
        });

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error('Empty response');

        return parseAIResponse(text);
    } catch (error) {
        console.error('Gemini request failed:', error);
        return {
            type: 'irrelevant',
            text: 'Bağlantı sorunu oluştu. Lütfen tekrar dene.',
            rawResponse: '',
            error: true
        };
    }
}

/**
 * Check a solution attempt using Gemini
 */
async function checkSolutionWithGemini(story, userSolution) {
    const prompt = buildSolutionCheckPrompt(story, userSolution);

    try {
        const data = await geminiRequest({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 200,
                topP: 0.9
            }
        });

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error('Empty response');

        return parseSolutionResponse(text);
    } catch (error) {
        console.error('Solution check failed:', error);
        return { result: 'error', text: 'Çözüm kontrol edilemedi. Tekrar dene.' };
    }
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const firstLine = lines[0]?.toUpperCase().trim() || '';
    const explanation = lines.slice(1).join(' ').trim() || text;

    if (firstLine.includes('EVET') || firstLine === 'EVET') {
        return { type: 'yes', text: explanation || 'Evet.', rawResponse: text };
    } else if (firstLine.includes('HAYIR') || firstLine === 'HAYIR') {
        return { type: 'no', text: explanation || 'Hayır.', rawResponse: text };
    } else if (firstLine.includes('UYARI') || firstLine === 'UYARI') {
        return { type: 'warning', text: explanation || 'Bu oyunda sadece Evet/Hayır soruları sorabilirsin!', rawResponse: text };
    } else if (firstLine.includes('ALAKASIZ') || firstLine === 'ALAKASIZ') {
        return { type: 'irrelevant', text: explanation || 'Bu soru hikayeyle alakalı değil.', rawResponse: text };
    }

    // If can't parse cleanly, try to detect from the full text
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('evet')) {
        return { type: 'yes', text: text, rawResponse: text };
    } else if (lowerText.startsWith('hayır') || lowerText.startsWith('hayir')) {
        return { type: 'no', text: text, rawResponse: text };
    }

    // Default: treat the whole response as explanation with irrelevant type
    return { type: 'irrelevant', text: text, rawResponse: text };
}

/**
 * Parse solution check response
 */
function parseSolutionResponse(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const firstLine = lines[0]?.toUpperCase().trim() || '';
    const explanation = lines.slice(1).join(' ').trim() || '';

    if (firstLine.includes('DOGRU') || firstLine.includes('DOĞRU')) {
        return { result: 'correct', text: explanation || 'Tebrikler, doğru çözüm!' };
    } else if (firstLine.includes('YAKIN') || firstLine.includes('YAKÍN')) {
        return { result: 'close', text: explanation || 'Yaklaştın ama tam değil.' };
    } else {
        return { result: 'wrong', text: explanation || 'Bu doğru çözüm değil.' };
    }
}

export { askGemini, checkSolutionWithGemini };
