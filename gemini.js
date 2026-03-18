// Sherlock Yes/No - Gemini API Service (Netlify Proxy)
// API anahtarı sunucu tarafında güvenli bir şekilde saklanıyor.
// Local test için: npx netlify dev

const PROXY_URL = '/api/gemini';

/**
 * Build the system prompt for the AI storyteller
 */
function buildSystemPrompt(story) {
    const hintsList = story.hints && story.hints.length > 0 ? story.hints.map(h => `- ${h}`).join('\n') : "Yok";
    return `Sen "Sherlock Yes/No" adlı bir lateral thinking (yanal düşünce) bulmaca oyununda usta ve zeki bir hikaye anlatıcısı/hakemsin.

## Görevin
Oyuncuya gizemli ve eksik bir senaryo verildi. Oyuncu, hikayenin tamamını çözmek için sana SADECE Evet/Hayır soruları sorabilir. Sen gerçek çözümü eksiksiz olarak biliyorsun ama bunu asla doğrudan söylememelisin. Sadece sorulan soruya göre kısa, kuralına uygun cevaplar vermelisin.

## Hikaye: ${story.title || 'İsimsiz Hikaye'}
${story.scenario}

## Çözüm (BU BİLGİYİ ASLA DOĞRUDAN PAYLAŞMA)
${story.solution}

## Hikaye İpuçları (SADECE oyuncu açıkça ipucu isterse kullan!)
${hintsList}
${story.customRules ? `\n## Bu Hikayeye Özel Kurallar (DİKKATLE UYGULA)\n${story.customRules}\n` : ''}

## Kesin Kurallar (ÇOK ÖNEMLİ!)
1. AÇIK UÇLU SORU KONTROLÜ: Eğer oyuncu Evet/Hayır ile cevaplanamayacak, açık uçlu bir soru sorarsa ("neden", "niye", "nasıl", "kim", "ne zaman", "ne" gibi), KESİNLİKLE "UYARI" vererek başla ve "Lütfen sadece evet/hayır ile cevaplanabilecek sorular sorun." diyerek uyar. Asla açık uçlu sorulara "EVET" veya "HAYIR" ile başlayıp cevap verme.
2. SADECE SORULANA CEVAP VER: Açıklamaların SADECE sorulan soruyla doğrudan ilgili olmalıdır. Fazladan detay, çıkarım veya "sayıya odaklan", "şu yönden düşün" gibi yönlendirmeler KESİNLİKLE YASAK.
3. SPOILER KONTROLÜ: Oyuncunun henüz sormadığı hiçbir bilgiyi ağzından kaçırma. Ancak oyuncu bir detayı doğru tahmin ederse, o detayı dürüstçe onayla.
4. KELİME KULLANIMI: Çözüm metnindeki kilit kelimeleri (üçüz, cüce, hıçkırık vb.), oyuncu bizzat telaffuz edene kadar ASLA kullanma. Oyuncu kelimeyi kullandıktan sonra o kelime artık serbesttir ve onay için kullanılabilir.
5. ZAFER İLAN ETME: Oyuncu doğru şeyi sorsa bile hemen hikayeyi dökme. Sadece "EVET" de ve o detayı onayla. Tam çözüm sadece "Çözüm Gönder" butonuyla yapılır.
6. HİNT VERME: Oyuncu açıkça "ipucu ver" veya "yardım et" demediği sürece asla yönlendirme yapma.

## Derinlemesine Düşünme (Chain of Thought - KESİNLİKLE ZORUNLU)
Sana ayrılan geniş token hakkını kullanarak, cevap vermeden ÖNCE kendi içinde çok detaylı bir mantıksal analiz yapmalısın. Bu analiz <dusunce> ve </dusunce> etiketleri arasına yazılmalıdır.
1. Analiz: Oyuncu ne sordu? Soru sadece Evet/Hayır ile cevaplanabilir mi, yoksa açık uçlu mu (neden, nasıl, ne zaman vb.)? Açık uçlu ise analiz burada biter, "UYARI" verilir. Eğer Evet/Hayır ise bu, çözümün hangi parçasına dokunuyor?
2. Doğruluk: Cevap Evet mi, Hayır mı, Alakasız mı?
3. Seri Katil Kurallar Kontrolü:
   - Yasaklı kelimelerden birini mi sordular? (Eğer sordularsa, o yasak artık o kelime için kalkmıştır!)
   - Cevabım, oyuncunun henüz bilmediği BAŞKA bir sürprizi açık ediyor mu? (Ediyorsa o kısmı sil!)
4. Çelişki Çözümü: Eğer "asla söyleme" kuralı ile "doğru soruyu onayla" kuralı çatışıyorsa, OYUNCUNUN SORDUĞU KISMI ONAYLAMAK her zaman önceliklidir. Bilgi artık "bulunmuş" sayılır.

## Kurallar ve Format
<dusunce> etiketinden SONRA, sadece 2 satır cevap ver:
1. Satır: "EVET", "HAYIR" veya "ALAKASIZ" (Veya geçersiz soru ise "UYARI")
2. Satır: KISA, sadece sorulanı cevaplayan, yönlendirme ve yeni bilgi içermeyen bir cümle.

## Örnekler
- Soru: "Adamın boyu kısa mı?" (Çözüm: Adam bir cüce)
  Doğru Cevap:
  EVET
  Evet, adamın fiziksel boyutuyla ilgili bir durum söz konusu.

- Soru: "Adam normalde neden düğmelere basamıyor?" (Çözüm: Boyu kısa olduğu için)
  Doğru Cevap (Soru "neden" içerdiği için açık uçludur):
  UYARI
  Lütfen sadece evet veya hayır ile cevaplanabilecek sorular sorun.

- Soru: "Kadının hıçkırığı mı vardı?" (Kural: Hıçkırık kelimesini kullanma!)
  Doğru Cevap (Kural artık geçersiz çünkü oyuncu kelimeyi kullandı):
  EVET
  Evet, kadının hıçkırığı vardı.

- Soru: "Daha fazla kardeş var mı?" (Çözüm: Üçüz kardeşler)
  Doğru Cevap:
  EVET
  Evet, hikayedeki kardeş sayısı ikiden fazla. (DİKKAT: "Üçüz" kelimesini oyuncu demediği için kullanmadık!)`;
}

/**
 * Build the solution check prompt
 */
function buildSolutionCheckPrompt(story, userSolution) {
    return `Sen "Sherlock Yes/No" bulmaca oyununda nihai sonucu onaylayan Baş Hakemsin.

## Senaryo
${story.scenario}

## Gerçek Çözüm
${story.solution}

## Oyuncunun Tahmini (Kendi Çözümü)
${userSolution}
${story.customRules ? `\n## Bu Hikayeye Özel Kurallar (DİKKATLE UYGULA)\n${story.customRules}\n` : ''}
## Kesin Kurallar (ÇOK ÖNEMLİ!)
1. DOĞRU BİLME ESNEKLİĞİ: Oyuncu gerçek çözümü farklı ama mantıklı/teknik terimlerle açıklıyorsa bunu EKSİK ve YAKIN sayma, tam DOGRU kabul et. ANCAK DİKKAT: Sadece "binary", "0010" gibi kilit kelimeleri/terimleri kullanması DOĞRU sayman için yeterli değildir! Oyuncunun kurduğu MANTIK tamamen saçma veya yanlışsa, o kilit kelimelere bakmaksızın YANLIŞ veya YAKIN değerlendirmesi yap. Önceliğin kelimeler değil, kurulan olay örgüsünün/mantığın doğruluğudur.
2. SPOILER VERMEK KESİNLİKLE YASAK: Eğer oyuncunun durumu YANLIS veya YAKIN ise, ASLA hikayedeki eksik olan kilit detayı açık etme. (Örneğin "olayın temel motivasyonunu (hıçkırık) kaçırmışsın", "adamın düştüğünü bilememişsin" GİBİ CÜMLELER KURMA!). Hatalı veya eksik kısmın HANGİ GİZLİ BİLGİ OLDUĞUNU SÖYLEME!

## Detaylı Analiz (Chain of Thought - KESİNLİKLE ZORUNLU)
Sana tanınan geniş token kapasitesini kullanarak önce <dusunce> ve </dusunce> etiketleri arasında çok dikkatli bir değerlendirme yapmalısın. Oyuncu bu düşünce bloğunu görmeyecektir.
Düşünme bölümünde Adım Adım ilerle:
1. Kilit Noktaları Belirle: Gerçek çözümün "olmazsa olmaz" dediğimiz kilit kavramları, eylemleri ve karakter motivasyonları nelerdir?
2. Oyuncunun Tahminini Parçala: Oyuncunun yazdığı metin hangi ögeleri içeriyor? Kendi terminolojisiyle de olsa ana fikri çözmüş mü?
3. Eksiklik Analizi: Eğer yanlış veya yakınsa, eksik olan kısmı nasıl spoiler/kelime açık etmeden belirtebilirim?
4. Karar Aşaması: Doğru mu (tüm kilit noktaları kavramış veya alternatif mantıklı yolla çözmüş), Yakın mı (doğru yolda ama kritik bir halka eksik), yoksa Yanlış mı? (olaylarla alakası yok)?

## Görev ve Format
Düşünce bloğunu bitirdikten (</dusunce> etiketini kapattıktan) sonra, KESİNLİKLE sadece şu şekilde cevap ver:
İlk satırda:
- "DOGRU" — Oyuncu ana fikri ve hikayedeki plot twist mantığını tamamen bilmiş. (Farklı mantık yolları veya teknik terimler kullansa da)
- "YAKIN" — Temel gidişat doğru ama çözüm için şart olan spesifik bir şey eksik.
- "YANLIS" — Çözümle uyuşmuyor, senaryo çok farklı.

İkinci satırda: Kısa bir geri bildirim yaz. (DİKKAT: YANLIS veya YAKIN ise asla gerçek çözümdeki kelimeleri, örneğin hıçkırık sözcüğünü kullanarak doğrudan spoiler verme!)`;
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
        const error = new Error(errorData.text || `API error: ${response.status}`);
        error.status = response.status;
        error.serverText = errorData.text;
        throw error;
    }

    return await response.json();
}

/**
 * Send a question to Gemini and get a response
 */
async function askGemini(story, conversationHistory, question, cfToken) {
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
            cfToken: cfToken,
            metadata: {
                type: question.toLowerCase().includes('ipucu') ? 'hint' : 'question',
                story: story.title,
                text: question
            },
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 3072, // Limit arttırıldı
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
            text: error.serverText || 'Bağlantı sorunu oluştu. Lütfen tekrar dene.',
            rawResponse: '',
            error: true
        };
    }
}

/**
 * Check a solution attempt using Gemini
 */
async function checkSolutionWithGemini(story, userSolution, cfToken) {
    const prompt = buildSolutionCheckPrompt(story, userSolution);

    try {
        const data = await geminiRequest({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            cfToken: cfToken,
            metadata: {
                type: 'solution_check',
                story: story.title,
                text: userSolution
            },
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 3072, // Limit arttırıldı
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
    // Remove thought blocks if any
    let cleanText = text.replace(/<dusunce>[\s\S]*?<\/dusunce>/gi, '').trim();

    // Also remove any text that might be outside tags but looks like thinking if it's followed by İPUCU:
    // (Backup for when model misses tags)
    if (cleanText.includes('İPUCU:')) {
        cleanText = cleanText.split('İPUCU:').pop().trim();
    } else if (cleanText.includes('IPUCU:')) {
        cleanText = cleanText.split('IPUCU:').pop().trim();
    }

    const lines = cleanText.split('\n').filter(l => l.trim());
    const firstLine = lines[0]?.toUpperCase().trim() || '';
    const explanation = lines.slice(1).join(' ').trim() || cleanText;

    if (firstLine.includes('EVET') || firstLine === 'EVET') {
        return { type: 'yes', text: stripIpucu(explanation || 'Evet.'), rawResponse: text };
    } else if (firstLine.includes('HAYIR') || firstLine === 'HAYIR') {
        return { type: 'no', text: stripIpucu(explanation || 'Hayır.'), rawResponse: text };
    } else if (firstLine.includes('UYARI') || firstLine === 'UYARI') {
        return { type: 'warning', text: stripIpucu(explanation || 'Bu oyunda sadece Evet/Hayır soruları sorabilirsin!'), rawResponse: text };
    } else if (firstLine.includes('ALAKASIZ') || firstLine === 'ALAKASIZ') {
        return { type: 'irrelevant', text: stripIpucu(explanation || 'Bu soru hikayeyle alakalı değil.'), rawResponse: text };
    }

    // If can't parse cleanly, try to detect from the full clean text
    const lowerText = cleanText.toLowerCase();
    if (lowerText.startsWith('evet')) {
        return { type: 'yes', text: stripIpucu(cleanText), rawResponse: text };
    } else if (lowerText.startsWith('hayır') || lowerText.startsWith('hayir')) {
        return { type: 'no', text: stripIpucu(cleanText), rawResponse: text };
    }

    // Default: treat the whole cleaned response as explanation with irrelevant type
    return { type: 'irrelevant', text: stripIpucu(cleanText), rawResponse: text };
}

/**
 * Helper to strip the word 'İPUCU:' or 'İpucu:' from start of text
 */
function stripIpucu(text) {
    return text.replace(/^(İPUCU|İpucu|IPUCU|ipucu):\s*/i, '').trim();
}

/**
 * Parse solution check response
 */
function parseSolutionResponse(text) {
    // Remove thought blocks if any
    const cleanText = text.replace(/<dusunce>[\s\S]*?<\/dusunce>/gi, '').trim();
    const lines = cleanText.split('\n').filter(l => l.trim());
    const firstLine = lines[0]?.toUpperCase().trim() || '';
    const explanation = lines.slice(1).join(' ').trim() || '';

    if (firstLine.includes('DOGRU') || firstLine.includes('DOĞRU')) {
        return { result: 'correct', text: stripIpucu(explanation || 'Tebrikler, doğru çözüm!') };
    } else if (firstLine.includes('YAKIN') || firstLine.includes('YAKÍN')) {
        return { result: 'close', text: stripIpucu(explanation || 'Yaklaştın ama tam değil.') };
    } else {
        return { result: 'wrong', text: stripIpucu(explanation || 'Bu doğru çözüm değil.') };
    }
}

export { askGemini, checkSolutionWithGemini };
