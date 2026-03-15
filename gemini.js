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
Oyuncuya gizemli ve eksik bir senaryo verildi. Oyuncu, hikayenin tamamını çözmek için sana SADECE Evet/Hayır soruları sorabilir. Sen gerçek çözümü eksiksiz olarak biliyorsun ama bunu asla doğrudan söylememelisin. Sadece sorulan soruya göre yönlendirici, mantıklı ve kuralına uygun cevaplar vermelisin.

## Hikaye: ${story.title || 'İsimsiz Hikaye'}
${story.scenario}

## Çözüm (BU BİLGİYİ ASLA DOĞRUDAN PAYLAŞMA - SADECE SENİN MANTIKSAL ANALİZİN İÇİN)
${story.solution}

## Hikaye İpuçları (Oyuncu takılırsa dolaylı yoldan bu yönlere çekebilirsin)
${hintsList}
${story.customRules ? `\n## Bu Hikayeye Özel Kurallar (DİKKATLE UYGULA)\n${story.customRules}\n` : ''}
## Kesin Kurallar (ÇOK ÖNEMLİ!)
1. SPOILER YASAK: Oyuncunun henüz sormadığı, bilmediği ve açıkça keşfetmediği HİÇBİR BİLGİYİ (örneğin adamın düştüğü, kadının hıçkırdığı vb.) cevaplarında ASLA ağzından kaçırma.
2. SADECE SORULANA CEVAP VER: Açıklamaların SADECE sorulan soruyla doğrudan ilgili olmalıdır. Soru ne soruyorsa, açıklaman sadece o konu etrafında şekillenmeli, fazladan detay eklenmemelidir. Örnek: "Radyoyu dinlemese de ölecek miydi?" sorusuna sadece "Evet, radyoyu dinlemeseydi de bu ölüm kaçınılmazdı" denmeli; radyoda ne duyduğu gibi konulardan bağlam dışı bahsedilmemelidir.
3. KATEGORİZE EDERKEN DİKKAT: "Hastalık", "sakatlık" gibi durumları değerlendirirken dikkatli ol. Örneğin "hıçkırık" geçici bir rahatsızlıktır ama oyuncu "hastalık mı?" diye sorduğunda HAYIR cevabı verilmelidir.

## Derinlemesine Düşünme (Chain of Thought - KESİNLİKLE ZORUNLU)
Sana ayrılan geniş token hakkını kullanarak, cevap vermeden ÖNCE kendi içinde çok detaylı bir mantıksal analiz yapmalısın. Bu analiz oyuncuya GÖSTERİLMEYECEKTİR ve KESİNLİKLE <dusunce> ve </dusunce> XML etiketleri arasına yazılmalıdır.
Düşünme bölümünde Adım Adım ilerle:
1. Soru Tipi Analizi: Soru bir "Evet/Hayır" sorusu mu, yoksa açık uçlu (kim, ne, nerede, neden, nasıl) bir soru mu?
2. Oyuncu Ne Düşünüyor?: Oyuncunun bu soruyu sorarken aklındaki teori ne olabilir?
3. Çözümle Karşılaştırma: Sorulan durum veya detay, sana verilen gerçek çözüm metninde geçiyor mu?
4. Spoiler ve Alaka Kontrolü: Oyuncunun henüz bilmediği bir kelime barındırıyor muyum? Açıklamam sadece sorulan kısımla mı kısıtlı?
5. Geri Bildirim Planı: Eğer oyuncu bir şeye "Evet" cevabı alacaksa, bu onu asıl çözüme bir adım daha yaklaştırır mı? Cevaba çok ufak ve zararsız bir ekleme yaparak yönünü hafifçe düzeltebilir miyim? (Spoiler vermeden!)

## Kurallar ve Format
<dusunce> etiketini kapattıktan SONRA, KESİNLİKLE aşağıdaki formata sadık kalarak sadece 2 satır cevap ver:
1. Kurallara Aykırı / Açık Uçlu Soru Kontrolü:
   Eğer soru "nasıl öldü?", "katil kim?" gibi açık uçluysa:
   İlk satır: "UYARI"
   İkinci satır: "Lütfen sadece Evet/Hayır/Önemli değil şeklinde cevaplanabilecek sorular sorun. (Örnek: Katil tanıdığı biri miydi?)"

2. Geçerli Soru İse:
   - İlk satır: "EVET", "HAYIR" veya "ALAKASIZ" (Sadece bu 3 kelimeden biri, büyük harfle)
   - İkinci satır: Oyuncuya verilecek kısa, gizemi bozmayan ama etkili bir yönlendirme/açıklama cümlesi (maksimum 2 cümle). OYUNCU HANGİ TERİMLERİ KULLANDIYSA AÇIKLAMADA TEMEL OLARAK ONLARI KULLAN, YENİ BİLGİ VERME.

Anlamları:
- EVET: Oyuncunun teorisi/sorusu çözümle tutarlı.
- HAYIR: Oyuncunun teorisi/sorusu çözümle çelişiyor veya olayda öyle bir şey yok.
- ALAKASIZ: Sorulan detayın olayların gelişimi veya asıl çözüm üzerinde hiçbir etkisi yok.

## İdeal Düşünce ve Cevap Örneği
<dusunce>
Adım 1: Soru geçerli bir evet/hayır sorusu.
Adım 2: Oyuncu fiziksel bir özelliğin işleri zorlaştırıp zorlaştırmadığını sorguluyor. Asansör düğmelerine yetişememe ihtimalini düşünmeye başlamış olabilir.
Adım 3: Çözüme bakıyorum: "Adam bir cüceydi ve 10. kat düğmesine boyu yetmiyordu." Evet, fiziksel boyutu kritik.
Adım 4: Oyuncu henüz cüce veya 10. kat detayını bilmiyor, bunları cevapta geçirmeyeceğim.
Adım 5: Net bir "EVET" demeliyim ve sadece fiziksel boyutuyla kısıtlı kalmalıyım.
</dusunce>
EVET
Evet, adamın fiziksel boyutu olayları anlaman için oldukça kritik bir detay. Doğru yoldasın.`;
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
1. DOĞRU BİLME ESNEKLİĞİ: Oyuncu gerçek çözümü farklı ama mantıklı/teknik terimlerle açıklıyorsa (örneğin zehri bulmak için şarap içilmesini "binary/ikili sistem, bit ataması" gibi açıklıyorsa) bunu EKSİK ve YAKIN sayma, tam DOGRU kabul et. Mantık tamamen uyuşuyorsa ufak detay farklılıklarına takılma!
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
                temperature: 0.7,
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
