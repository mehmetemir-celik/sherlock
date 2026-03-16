import fs from 'fs';

// .env dosyasını oku
const envContent = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
);

const REDIS_URL = env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN) {
    console.error("Hata: .env dosyasında UPSTASH_REDIS_REST_URL veya UPSTASH_REDIS_REST_TOKEN bulunamadı.");
    process.exit(1);
}

async function downloadLogs() {
    console.log("Loglar indiriliyor...");
    
    try {
        // Redis'teki tüm logları çek (LRANGE sherlock:logs 0 -1)
        const response = await fetch(`${REDIS_URL}/LRANGE/sherlock:logs/0/-1`, {
            headers: {
                'Authorization': `Bearer ${REDIS_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Hata: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
            console.log("Herhangi bir log bulunamadı.");
            return;
        }

        // Stringify edilmiş JSON'ları parse et
        const parsedLogs = data.result.map(entry => {
            try {
                return JSON.parse(entry);
            } catch (e) {
                return entry; // Parse edilemiyorsa olduğu gibi bırak
            }
        });

        // logs klasörünü oluştur
        const logsDir = 'logs';
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        // Dosyaya kaydet
        const now = new Date();
        const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const fileName = `${logsDir}/logs_export_${timestamp}.json`;
        fs.writeFileSync(fileName, JSON.stringify(parsedLogs, null, 2));

        console.log(`\nBaşarılı! ${parsedLogs.length} adet log indirildi.`);
        console.log(`Dosya yolu: ${fileName}`);

        // Logları Redis'ten sil (DEL sherlock:logs)
        console.log("Redis'teki loglar temizleniyor...");
        const deleteResponse = await fetch(`${REDIS_URL}/DEL/sherlock:logs`, {
            headers: {
                'Authorization': `Bearer ${REDIS_TOKEN}`
            }
        });

        if (deleteResponse.ok) {
            console.log("Redis logları başarıyla silindi.");
        } else {
            console.error("Hata: Redis logları silinemedi.");
        }

    } catch (error) {
        console.error("Log indirme sırasında bir hata oluştu:", error.message);
    }
}

downloadLogs();
