import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('ep-sample')) {
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        const val = line.substring('DATABASE_URL='.length).trim();
        if (val && !val.includes('ep-sample')) {
          databaseUrl = val;
          break;
        }
      }
    }
  }
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log('📦 Creating notifications table in Neon PostgreSQL...');
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notice_id UUID REFERENCES notices(id) ON DELETE SET NULL,
      notice_slug TEXT,
      agency_name TEXT,
      notification_type TEXT NOT NULL DEFAULT 'newVacancy',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log('✅ notifications table created/verified!');

  const count = await sql`SELECT count(*)::int as count FROM notifications`;
  if (count[0].count === 0) {
    console.log('🌱 Seeding initial broadcast notifications...');
    await sql`
      INSERT INTO notifications (title, message, notice_slug, agency_name, notification_type)
      VALUES 
        ('राजस्थान पटवारी भर्ती 2026: 2998 पदों पर विज्ञप्ति जारी', 'राजस्व विभाग राजस्थान द्वारा पटवारी के 2998 पदों के लिए ऑनलाइन आवेदन आमंत्रित किए गए हैं।', 'rajasthan-patwari-recruitment-sample', 'RSSB Jaipur', 'newVacancy'),
        ('राजस्थान चतुर्थ श्रेणी भर्ती 2026: आवेदन पोर्टल सक्रिय', 'माध्यमिक शिक्षा बोर्ड व अधीनस्थ कार्यालयों में चतुर्थ श्रेणी कर्मचारियों हेतु ऑनलाइन फॉर्म शुरू।', 'rajasthan-4th-grade-recruitment-sample', 'RSSB Portal', 'newVacancy'),
        ('RPSC RAS/RTS 2026: प्रारंभिक परीक्षा एडमिट कार्ड जारी', 'राजस्थान प्रशासनिक सेवा प्री-परीक्षा का ई-प्रवेश पत्र आयोग की वेबसाइट पर अपलोड कर दिया गया है।', 'rpsc-ras-rts-exam-sample', 'RPSC Ajmer', 'admitCard'),
        ('राजस्थान पुलिस कांस्टेबल भर्ती: अंतिम तिथि नजदीक', 'कांस्टेबल पदों हेतु आवेदन करने के लिए केवल 3 दिन शेष हैं। तुरंत आवेदन करें।', 'rajasthan-police-constable-sample', 'Rajasthan Police', 'closingSoon')
    `;
    console.log('✅ Seeded 4 initial notifications!');
  } else {
    console.log(`ℹ️ Notifications table already contains ${count[0].count} notifications.`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
