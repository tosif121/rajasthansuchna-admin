import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocalPath = path.join(rootDir, '.env.local');
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
      databaseUrl = line.substring('DATABASE_URL='.length).trim();
      break;
    }
  }
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found.');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('='.repeat(65));
console.log('🚀 SEEDING COMPREHENSIVE MOCK DATA FOR ALL APP & DRAWER SCREENS');
console.log('='.repeat(65));

// Fetch agencies & categories lookup
const agencies = await sql`SELECT id, slug FROM agencies;`;
const categories = await sql`SELECT id, slug FROM categories;`;

const agencyMap = new Map(agencies.map(a => [a.slug, a.id]));
const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

console.log(`Found ${agencyMap.size} agencies and ${categoryMap.size} categories in database.`);

const newNotices = [
  // ==========================================
  // 1. ANSWER KEYS (noticeType: 'answerKey')
  // ==========================================
  {
    slug: 'rpsc-ras-pre-model-answer-key-2026',
    agencySlug: 'rpsc',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'answerKey',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    titleHi: 'RPSC RAS Pre परीक्षा 2026 मॉडल उत्तर कुंजी व ऑनलाइन आपत्ति लिंक जारी',
    titleEn: 'RPSC RAS Prelims Exam 2026 Official Model Answer Key & Objection Link',
    summaryHi: 'राजस्थान लोक सेवा आयोग (RPSC) द्वारा RAS Pre 2026 परीक्षा की मॉडल उत्तर कुंजी व मास्टर प्रश्न पत्र आधिकारिक पोर्टल पर जारी कर दिए गए हैं। अभ्यर्थी SSO पोर्टल के माध्यम से निर्धारित शुल्क देकर ऑनलाइन आपत्ति दर्ज कर सकते हैं।',
    summaryEn: 'Rajasthan Public Service Commission (RPSC) has officially published the model answer key and master question paper for RAS Prelims Exam 2026. Online objections can be filed via SSO portal.',
    facts: {
      examDate: '2026-10-25T09:00:00.000Z',
      qualification: 'स्नातक (Graduate)',
      selectionProcess: 'प्रारंभिक परीक्षा (Prelims), मुख्य परीक्षा (Mains) व साक्षात्कार',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-20T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर व राजस्थान सूचना प्रकोष्ठ'
    },
    sections: [
      {
        key: 'objection_process',
        title: 'ऑनलाइन आपत्ति दर्ज करने की प्रक्रिया (How to File Objection)',
        body: 'अभ्यर्थी SSO पोर्टल में लॉगइन कर Recruitment Portal का चयन करें और RAS Pre 2026 हेतु मॉडल उत्तर कुंजी पर अपनी आपत्ति दर्ज करें। प्रति प्रश्न ₹100 आपत्ति शुल्क देय होगा। प्रामाणिक पुस्तकों के साक्ष्य ही मान्य होंगे।'
      }
    ],
    links: [
      {
        label: 'मॉडल उत्तर कुंजी PDF डाउनलोड करें',
        url: 'https://rpsc.rajasthan.gov.in/Static/AnswerKeys/RAS_Pre_2026_Key.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'ऑनलाइन आपत्ति दर्ज करें (SSO Portal)',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      }
    ]
  },
  {
    slug: 'rssb-cet-12th-level-answer-key-master-paper-2026',
    agencySlug: 'rssb',
    categorySlug: 'secondary_jobs',
    state: 'rajasthan',
    noticeType: 'answerKey',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    titleHi: 'RSSB समान पात्रता परीक्षा (CET 12th Level) 2026 मास्टर प्रश्न पत्र एवं उत्तर कुंजी जारी',
    titleEn: 'RSSB CET Senior Secondary Level 2026 Master Question Paper & Official Answer Key',
    summaryHi: 'राजस्थान कर्मचारी चयन बोर्ड जयपुर द्वारा समान पात्रता परीक्षा (सीनियर सेकेंडरी स्तर) 2026 के सभी चरणों के मास्टर प्रश्न पत्र और प्राथमिक उत्तर कुंजी जारी कर दी गई है।',
    summaryEn: 'RSMSSB Jaipur has released the master question papers and primary answer keys for CET Senior Secondary Level 2026 examinations across all shifts.',
    facts: {
      examDate: '2026-10-22T09:00:00.000Z',
      qualification: '12वीं पास (Senior Secondary Pass)',
      selectionProcess: 'लिखित परीक्षा (वस्तुनिष्ठ) आधारित पात्रता स्कोरकार्ड',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-18T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर अधिकृत'
    },
    sections: [
      {
        key: 'cet_key_notice',
        title: 'आपत्ति आमंत्रण सूचना (Objection Notification)',
        body: 'उत्तर कुंजी पर आपत्तियां 3 दिन तक ऑनलाइन दर्ज की जा सकती हैं। केवल मास्टर प्रश्न पत्र के क्रम के अनुसार ही प्रश्नों की आपत्तियां दर्ज करें।'
      }
    ],
    links: [
      {
        label: 'मास्टर प्रश्न पत्र एवं उत्तर कुंजी डाउनलोड',
        url: 'https://rsmssb.rajasthan.gov.in/Static/AnswerKeys/CET_12th_Level_Key.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'SSO आपत्ति पोर्टल',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      }
    ]
  },
  {
    slug: 'rajasthan-police-constable-answer-key-2026',
    agencySlug: 'police',
    categorySlug: 'police_defence',
    state: 'rajasthan',
    noticeType: 'answerKey',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    titleHi: 'राजस्थान पुलिस कांस्टेबल भर्ती परीक्षा 2026 अनंतिम उत्तर कुंजी जारी',
    titleEn: 'Rajasthan Police Constable Recruitment Exam 2026 Provisional Answer Key Released',
    summaryHi: 'राजस्थान पुलिस मुख्यालय द्वारा कांस्टेबल भर्ती 2026 की कंप्यूटर आधारित परीक्षा (CBT) की प्रोविजनल उत्तर कुंजी व कैंडिडेट रिस्पांस शीट जारी कर दी गई है।',
    summaryEn: 'Rajasthan Police Headquarters has officially released the provisional answer key and candidate response sheet for Constable Recruitment 2026 CBT.',
    facts: {
      examDate: '2026-10-15T09:00:00.000Z',
      qualification: '12वीं पास (CET उत्तीर्ण)',
      selectionProcess: 'CBT लिखित परीक्षा, शारीरिक दक्षता (PET/PST) एवं दस्तावेज सत्यापन',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-11-15T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान पुलिस मुख्यालय'
    },
    sections: [
      {
        key: 'police_key_details',
        title: 'उत्तर कुंजी जांचने की विधि (Checking Steps)',
        body: 'अभ्यर्थी अपने रोल नंबर एवं जन्मतिथि के माध्यम से लॉगिन करके अपना प्रश्न पत्र व आधिकारिक उत्तर देख सकते हैं।'
      }
    ],
    links: [
      {
        label: 'कांस्टेबल उत्तर कुंजी व रिस्पांस शीट लिंक',
        url: 'https://police.rajasthan.gov.in/recruitment',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'reet-level-1-2-provisional-answer-key-2026',
    agencySlug: 'reet',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'answerKey',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    titleHi: 'REET 2026 लेवल 1 व लेवल 2 आधिकारिक उत्तर कुंजी एवं मास्टर पेपर जारी',
    titleEn: 'REET 2026 Level-1 & Level-2 Official Answer Key & Master Question Paper',
    summaryHi: 'माध्यमिक शिक्षा बोर्ड राजस्थान (RBSE) अजमेर द्वारा राजस्थान अध्यापक पात्रता परीक्षा (REET) 2026 लेवल-1 एवं लेवल-2 की आधिकारिक उत्तर कुंजी जारी कर दी गई है।',
    summaryEn: 'Board of Secondary Education Rajasthan (RBSE) has released the official answer keys and master papers for REET Level-1 and Level-2 exams.',
    facts: {
      examDate: '2026-10-10T09:00:00.000Z',
      qualification: 'BSTC / D.El.Ed / B.Ed',
      selectionProcess: 'शिक्षक पात्रता परीक्षा (REET) 150 अंक वस्तुनिष्ठ',
      sourceUrl: 'https://rajeduboard.rajasthan.gov.in',
      sourceDate: '2026-11-12T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RBSE अजमेर रीट प्रकोष्ठ'
    },
    sections: [
      {
        key: 'reet_key_info',
        title: 'रीट पात्रता मानक (Eligibility Criteria)',
        body: 'सामान्य वर्ग के अभ्यर्थियों को न्यूनतम 60% अंक, ओबीसी/ईडब्ल्यूएस/एमबीसी को 55% अंक एवं एससी/एसटी अभ्यर्थियों को 50% अंक प्राप्त करना अनिवार्य है।'
      }
    ],
    links: [
      {
        label: 'REET लेवल 1 उत्तर कुंजी PDF',
        url: 'https://rajeduboard.rajasthan.gov.in/reet2026/Level1_Key.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'REET लेवल 2 उत्तर कुंजी PDF',
        url: 'https://rajeduboard.rajasthan.gov.in/reet2026/Level2_Key.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'ssc-cgl-tier-1-final-answer-key-response-sheet-2026',
    agencySlug: 'ssc',
    categorySlug: 'central',
    state: 'central',
    noticeType: 'answerKey',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    titleHi: 'SSC CGL टियर-1 परीक्षा 2026 अंतिम उत्तर कुंजी एवं अभ्यर्थी रिस्पांस शीट जारी',
    titleEn: 'SSC CGL Tier-1 Exam 2026 Final Answer Key & Candidate Response Sheet',
    summaryHi: 'कर्मचारी चयन आयोग (SSC) द्वारा संयुक्त स्नातक स्तरीय परीक्षा (CGL) टियर-1 की अंतिम उत्तर कुंजी और रिस्पांस शीट जारी कर दी गई है।',
    summaryEn: 'Staff Selection Commission (SSC) has uploaded the final answer keys along with candidate response sheets for Combined Graduate Level Examination (Tier-I) 2026.',
    facts: {
      examDate: '2026-09-25T09:00:00.000Z',
      qualification: 'स्नातक (Bachelor Degree in any discipline)',
      selectionProcess: 'टियर-1 (CBT), टियर-2 (CBT) एवं दस्तावेज सत्यापन',
      sourceUrl: 'https://ssc.gov.in',
      sourceDate: '2026-11-10T15:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'SSC नई दिल्ली अधिकृत'
    },
    sections: [
      {
        key: 'ssc_key_note',
        title: 'अंतिम उत्तर कुंजी निर्देश',
        body: 'अभ्यर्थी 30 दिनों की अवधि तक अपने परीक्षा पोर्टल पर लॉगिन कर अपनी रिस्पांस शीट का प्रिंटआउट ले सकते हैं।'
      }
    ],
    links: [
      {
        label: 'SSC CGL टियर-1 अंतिम कुंजी पोर्टल',
        url: 'https://ssc.gov.in',
        kind: 'notificationPdf'
      }
    ]
  },

  // ==========================================
  // 2. SYLLABUS (noticeType: 'syllabus')
  // ==========================================
  {
    slug: 'rssb-ldc-clerk-grade-2-syllabus-exam-pattern-2026',
    agencySlug: 'rssb',
    categorySlug: 'clerk_assistant',
    state: 'rajasthan',
    noticeType: 'syllabus',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    titleHi: 'RSSB कनिष्ठ सहायक (LDC) भर्ती 2026 विस्तृत पाठ्यक्रम व परीक्षा योजना PDF',
    titleEn: 'RSSB LDC / Junior Assistant Exam 2026 Detailed Syllabus & Scheme of Exam',
    summaryHi: 'कर्मचारी चयन बोर्ड द्वारा कनिष्ठ सहायक / लिपिक ग्रेड-II संयुक्त सीधी भर्ती 2026 का आधिकारिक विस्तृत पाठ्यक्रम, अंक योजना एवं टाइपिंग टेस्ट नियम जारी।',
    summaryEn: 'RSMSSB has published the comprehensive syllabus and examination scheme for Junior Assistant and Clerk Grade-II Recruitment Exam 2026.',
    facts: {
      qualification: '12वीं पास + कंप्यूटर डिप्लोमा (RSCIT या समकक्ष)',
      selectionProcess: 'प्रथम चरण (लिखित परीक्षा 200 अंक) एवं द्वितीय चरण (कंप्यूटर टाइपिंग व दक्षता परीक्षा 100 अंक)',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-19T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर पाठ्यक्रम प्रकोष्ठ'
    },
    sections: [
      {
        key: 'paper_1_details',
        title: 'प्रथम चरण: प्रश्न पत्र 1 (सामान्य ज्ञान, दैनिक विज्ञान व गणित)',
        body: 'कुल प्रश्न: 150 (सामान्य ज्ञान 50, दैनिक विज्ञान 50, गणित 50)। कुल अंक: 100, समयावधि: 3 घंटे। नकारात्मक अंकन: 1/3 भाग।'
      },
      {
        key: 'paper_2_details',
        title: 'प्रथम चरण: प्रश्न पत्र 2 (सामान्य हिंदी एवं सामान्य अंग्रेजी)',
        body: 'कुल प्रश्न: 150 (सामान्य हिंदी 75 प्रश्न, सामान्य अंग्रेजी 75 प्रश्न)। कुल अंक: 100, समयावधि: 3 घंटे।'
      },
      {
        key: 'phase_2_typing',
        title: 'द्वितीय चरण: टाइपिंग स्पीड एवं दक्षता परीक्षा',
        body: 'हिंदी टाइपिंग: 10 मिनट (25 अंक) + दक्षता परीक्षा 10 मिनट (25 अंक)। अंग्रेजी टाइपिंग: 10 मिनट (25 अंक) + दक्षता परीक्षा 10 मिनट (25 अंक)।'
      }
    ],
    links: [
      {
        label: 'LDC आधिकारिक पाठ्यक्रम PDF डाउनलोड',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Syllabus/LDC_2026_Syllabus.pdf',
        kind: 'syllabus'
      }
    ]
  },
  {
    slug: 'rpsc-2nd-grade-senior-teacher-syllabus-2026',
    agencySlug: 'rpsc',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'syllabus',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    titleHi: 'RPSC द्वितीय श्रेणी वरिष्ठ अध्यापक (Senior Teacher) परीक्षा पाठ्यक्रम एवं अंक विभाजन 2026',
    titleEn: 'RPSC 2nd Grade Senior Teacher Exam Pattern & Subject-wise Syllabus 2026',
    summaryHi: 'राजस्थान लोक सेवा आयोग अजमेर द्वारा वरिष्ठ अध्यापक (माध्यमिक शिक्षा) प्रतियोगी परीक्षा 2026 का पेपर-1 (सामान्य ज्ञान) व पेपर-2 (संबंधित विषय) का विस्तृत पाठ्यक्रम जारी।',
    summaryEn: 'RPSC Ajmer has published the official subject-wise syllabus and exam scheme for 2nd Grade Senior Teacher Competitive Examination 2026.',
    facts: {
      qualification: 'संबंधित विषय में स्नातक + B.Ed डिग्री',
      selectionProcess: 'लिखित परीक्षा: पेपर 1 (200 अंक) + पेपर 2 (300 अंक)',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-16T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर शिक्षा प्रकोष्ठ'
    },
    sections: [
      {
        key: 'paper_1_gk',
        title: 'पेपर 1: सामान्य ज्ञान व शैक्षिक मनोविज्ञान (200 अंक)',
        body: 'राजस्थान का भौगोलिक, ऐतिहासिक, सांस्कृतिक ज्ञान (80 अंक), राजस्थान समसामयिकी (20 अंक), विश्व व भारत का सामान्य ज्ञान (60 अंक), शैक्षिक मनोविज्ञान (40 अंक)। कुल 100 प्रश्न, 2 घंटे।'
      },
      {
        key: 'paper_2_subject',
        title: 'पेपर 2: संबंधित विषय ज्ञान (300 अंक)',
        body: 'माध्यमिक व उच्च माध्यमिक स्तर का विषय ज्ञान (180 अंक), स्नातक स्तर का विषय ज्ञान (80 अंक), संबंधित विषय की शिक्षण विधियां (40 अंक)। कुल 150 प्रश्न, 2 घंटे 30 मिनट।'
      }
    ],
    links: [
      {
        label: 'वरिष्ठ अध्यापक पाठ्यक्रम PDF डाउनलोड',
        url: 'https://rpsc.rajasthan.gov.in/Static/Syllabus/2nd_Grade_2026_Syllabus.pdf',
        kind: 'syllabus'
      }
    ]
  },
  {
    slug: 'rajasthan-police-constable-detailed-syllabus-exam-scheme-2026',
    agencySlug: 'police',
    categorySlug: 'police_defence',
    state: 'rajasthan',
    noticeType: 'syllabus',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    titleHi: 'राजस्थान पुलिस कांस्टेबल CBT परीक्षा पाठ्यक्रम, शारीरिक दक्षता (PET/PST) मानक विवरण',
    titleEn: 'Rajasthan Police Constable Detailed Syllabus & Physical Standards Scheme 2026',
    summaryHi: 'राजस्थान पुलिस मुख्यालय द्वारा कांस्टेबल (सामान्य/चालक/बैंड) भर्ती परीक्षा का 150 प्रश्नों का विषयवार पाठ्यक्रम एवं शारीरिक दक्षता परीक्षा के संपूर्ण नियम।',
    summaryEn: 'Official syllabus, subject breakups, and physical efficiency criteria for Rajasthan Police Constable Examination 2026.',
    facts: {
      qualification: '12वीं पास (CET सीनियर सेकेंडरी उत्तीर्ण)',
      selectionProcess: 'लिखित परीक्षा (150 अंक), शारीरिक दक्षता दौड़ (PET 30 अंक) व दक्षता परीक्षण',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-11-14T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान पुलिस भर्ती बोर्ड'
    },
    sections: [
      {
        key: 'written_breakup',
        title: 'लिखित परीक्षा खंडवार विवरण (150 प्रश्न, 150 अंक)',
        body: 'भाग अ: विवेचना एवं तार्किक योग्यता तथा कंप्यूटर का सामान्य ज्ञान (60 प्रश्न, 60 अंक)। भाग ब: सामान्य ज्ञान, सामान्य विज्ञान, सामाजिक विज्ञान एवं समसामयिक विषय (45 प्रश्न, 45 अंक)। भाग स: राजस्थान के इतिहास, कला, संस्कृति, भूगोल एवं राजनीति का ज्ञान (45 प्रश्न, 45 अंक)।'
      },
      {
        key: 'pet_standards',
        title: 'शारीरिक दक्षता परीक्षण (PET Standards)',
        body: 'पुरुष अभ्यर्थी: 5 किलोमीटर दौड़ (25 मिनट में)। महिला अभ्यर्थी: 5 किलोमीटर दौड़ (35 मिनट में)। भूतपूर्व सैनिक: 5 किलोमीटर दौड़ (30 मिनट में)।'
      }
    ],
    links: [
      {
        label: 'पुलिस कांस्टेबल पाठ्यक्रम PDF',
        url: 'https://police.rajasthan.gov.in/Static/Syllabus/Constable_2026.pdf',
        kind: 'syllabus'
      }
    ]
  },
  {
    slug: 'rajasthan-patwari-detailed-syllabus-weightage-2026',
    agencySlug: 'rssb',
    categorySlug: 'revenue_patwari',
    state: 'rajasthan',
    noticeType: 'syllabus',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    titleHi: 'राजस्थान पटवारी भर्ती परीक्षा विस्तृत पाठ्यक्रम एवं विषयवार भारांक योजना',
    titleEn: 'Rajasthan Patwari Detailed Syllabus, Topic-wise Weightage & Scheme of Examination',
    summaryHi: 'राजस्व मंडल एवं कर्मचारी चयन बोर्ड द्वारा पटवारी सीधी भर्ती परीक्षा का विस्तृत पाठ्यक्रम, 300 अंकों की परीक्षा योजना एवं विषयवार प्रश्न संख्या।',
    summaryEn: 'Comprehensive official syllabus and subject weightage breakdown for Rajasthan Patwari Recruitment Examination 2026.',
    facts: {
      qualification: 'स्नातक (Graduate) + कंप्यूटर दक्षता प्रमाण पत्र (RSCIT)',
      selectionProcess: 'एकल चरण लिखित परीक्षा (300 अंक वस्तुनिष्ठ) एवं दस्तावेज सत्यापन',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-11T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर एवं राजस्व मंडल'
    },
    sections: [
      {
        key: 'patwari_weightage',
        title: 'विषयवार प्रश्न संख्या एवं अंक भारांक',
        body: '1. भारत का सामान्य ज्ञान, संविधान व विज्ञान: 38 प्रश्न (76 अंक)\n2. राजस्थान का भूगोल, इतिहास, संस्कृति व राजनीति: 30 प्रश्न (60 अंक)\n3. सामान्य हिंदी एवं सामान्य अंग्रेजी: 22 प्रश्न (44 अंक)\n4. मानसिक योग्यता एवं तार्किक क्षमता, बेसिक गणित: 45 प्रश्न (90 अंक)\n5. बेसिक कंप्यूटर ज्ञान: 15 प्रश्न (30 अंक)\nकुल 150 प्रश्न, 300 अंक, 3 घंटे।'
      }
    ],
    links: [
      {
        label: 'पटवारी परीक्षा योजना व सिलेबस PDF',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Syllabus/Patwari_2026_Syllabus.pdf',
        kind: 'syllabus'
      }
    ]
  },
  {
    slug: 'rpsc-school-lecturer-1st-grade-exam-syllabus-2026',
    agencySlug: 'rpsc',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'syllabus',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 66).toISOString(),
    titleHi: 'RPSC प्राध्यापक (School Lecturer Grade-1) प्रथम प्रश्न पत्र (GK) व द्वितीय प्रश्न पत्र विस्तृत पाठ्यक्रम',
    titleEn: 'RPSC 1st Grade School Lecturer Paper 1 General Awareness & Paper 2 Subject Syllabus',
    summaryHi: 'RPSC अजमेर द्वारा स्कूल प्राध्यापक (माध्यमिक शिक्षा विभाग) परीक्षा 2026 का प्रथम प्रश्न पत्र (सामान्य अध्ययन) एवं द्वितीय प्रश्न पत्र (ऐच्छिक विषय) का अधिकृत पाठ्यक्रम।',
    summaryEn: 'Official syllabus for Paper 1 (General Studies) and Paper 2 (Concerned Subject) for School Lecturer Grade 1 Recruitment.',
    facts: {
      qualification: 'संबंधित विषय में स्नातकोत्तर (PG) + B.Ed डिग्री',
      selectionProcess: 'लिखित परीक्षा: पेपर 1 (150 अंक) + पेपर 2 (300 अंक)',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-08T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर'
    },
    sections: [
      {
        key: 'lecturer_p1',
        title: 'प्रथम प्रश्न पत्र: सामान्य अध्ययन (75 प्रश्न, 150 अंक, 1.5 घंटा)',
        body: 'राजस्थान का इतिहास व भारतीय राष्ट्रीय आंदोलन (15 प्रश्न), मानसिक क्षमता व सांख्यिकी (20 प्रश्न), समसामयिकी (10 प्रश्न), सामान्य विज्ञान, भारतीय राजनीति व भूगोल (15 प्रश्न), शैक्षिक प्रबंधन व आरटीई एक्ट 2009 (15 प्रश्न)।'
      }
    ],
    links: [
      {
        label: 'प्राध्यापक प्रथम प्रश्न पत्र सिलेबस PDF',
        url: 'https://rpsc.rajasthan.gov.in/Static/Syllabus/Lecturer_Paper1_2026.pdf',
        kind: 'syllabus'
      }
    ]
  },

  // ==========================================
  // 3. CAREER GUIDE & DOCUMENTS/OTR (noticeType: 'careerGuide')
  // ==========================================
  {
    slug: 'rajasthan-sso-otr-registration-complete-guide-rules',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'careerGuide',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    titleHi: 'राजस्थान SSO वन टाइम रजिस्ट्रेशन (OTR) संपूर्ण मार्गदर्शिका, फीस एवं संशोधन नियम',
    titleEn: 'Rajasthan SSO One Time Registration (OTR) Complete Guide, Fee Structure & Rules',
    summaryHi: 'राजस्थान सरकार द्वारा सभी राज्य स्तरीय भर्ती परीक्षाओं (RPSC एवं RSSB) हेतु लागू वन टाइम रजिस्ट्रेशन (OTR) की संपूर्ण प्रक्रिया, एकमुश्त पंजीकरण शुल्क, जन आधार लिंकिंग एवं संशोधन के नियम।',
    summaryEn: 'Complete authoritative guide on Rajasthan SSO One Time Registration (OTR), fee structure, Jan Aadhaar linkage, and profile correction rules for RPSC and RSSB examinations.',
    facts: {
      qualification: 'राजस्थान निवासी एवं बाहरी राज्य के सभी प्रतियोगी अभ्यर्थी',
      selectionProcess: 'एकमुश्त रजिस्ट्रेशन (OTR) उपरांत सभी भर्तियों में निःशुल्क आवेदन',
      sourceUrl: 'https://recruitment.rajasthan.gov.in',
      sourceDate: '2026-11-20T09:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान सूचना प्रौद्योगिकी विभाग (DOIT&C)'
    },
    sections: [
      {
        key: 'otr_fee_structure',
        title: 'एकमुश्त OTR शुल्क विवरण (One-Time Fee Structure)',
        body: '1. सामान्य वर्ग (UR) एवं क्रीमीलेयर श्रेणी के अन्य पिछड़ा वर्ग: ₹600\n2. राजस्थान के नॉन-क्रीमीलेयर ओबीसी, एमबीसी, ईडब्ल्यूएस, एससी, एसटी: ₹400\n3. सभी दिव्यांगजन अभ्यर्थी: ₹400\nएक बार यह शुल्क जमा करने के बाद राजस्थान की आगामी सभी भर्ती परीक्षाओं में कोई अलग से परीक्षा शुल्क नहीं देना होगा।'
      },
      {
        key: 'jan_aadhaar_sync',
        title: 'जन आधार लिंकिंग एवं विवरण प्रविष्टि नियम',
        body: 'OTR करते समय अभ्यर्थी का नाम, पिता का नाम, जन्मतिथि एवं लिंग जन आधार अथवा आधार कार्ड के डाटा से सीधे फेच होते हैं। अतः OTR करने से पूर्व अपने जन आधार में सभी विवरण 10वीं की अंकतालिका अनुसार सही करवा लें।'
      }
    ],
    links: [
      {
        label: 'SSO OTR पोर्टल पर जाएं',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      },
      {
        label: 'OTR आधिकारिक दिशा-निर्देश परिपत्र PDF',
        url: 'https://recruitment.rajasthan.gov.in/Static/OTR_Guidelines.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rajasthan-govt-jobs-ews-obc-caste-certificate-validity-rules',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'careerGuide',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(),
    titleHi: 'राजस्थान प्रतियोगी परीक्षाओं हेतु EWS, OBC-NCL, SC, ST जाति प्रमाण पत्र वैधता एवं क्रूशियल डेट नियम',
    titleEn: 'Rajasthan Recruitment Caste & Category Certificate Validity Rules (EWS, OBC, SC/ST)',
    summaryHi: 'कार्मिक विभाग (DOP) राजस्थान सरकार द्वारा जारी नवीनतम परिपत्र के अनुसार आरक्षित वर्गों के प्रमाण पत्रों की वैधता अवधि, शपथ पत्र (Affidavit) नियम एवं आवेदन की अंतिम तिथि (Crucial Date) के महत्वपूर्ण नियम।',
    summaryEn: 'Official Department of Personnel (DOP) Rajasthan guidelines governing validity tenure, crucial date, and affidavit rules for EWS, OBC, MBC, SC, and ST certificates.',
    facts: {
      qualification: 'राजस्थान राज्य के आरक्षित वर्ग के समस्त अभ्यर्थी',
      selectionProcess: 'दस्तावेज सत्यापन (Document Verification) मानक',
      sourceUrl: 'https://dop.rajasthan.gov.in',
      sourceDate: '2026-11-17T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'कार्मिक विभाग (DOP) राजस्थान'
    },
    sections: [
      {
        key: 'obc_ncl_validity',
        title: 'OBC एवं MBC (नॉन-क्रीमीलेयर) प्रमाण पत्र की वैधता',
        body: 'OBC/MBC नॉन-क्रीमीलेयर प्रमाण पत्र 1 वर्ष के लिए वैध होता है। यदि अभ्यर्थी नॉन-क्रीमीलेयर में ही बना रहता है, तो सक्षम स्तर का शपथ पत्र प्रस्तुत करने पर इसे अधिकतम 3 वर्षों तक मान्य माना जाएगा।'
      },
      {
        key: 'ews_validity_rules',
        title: 'EWS (आर्थिक रूप से कमजोर वर्ग) प्रमाण पत्र नियम',
        body: 'EWS प्रमाण पत्र एक वित्तीय वर्ष (1 अप्रैल से 31 मार्च) के लिए वैध होता है। क्रूशियल डेट (आवेदन की अंतिम तिथि) से पूर्व जारी प्रमाण पत्र ही मान्य होता है।'
      }
    ],
    links: [
      {
        label: 'कार्मिक विभाग अधिकृत परिपत्र PDF',
        url: 'https://dop.rajasthan.gov.in/Static/Circular_Caste_Validity.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rajasthan-recruitment-document-verification-dv-checklist-guidelines',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'careerGuide',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    titleHi: 'राजस्थान भर्ती दस्तावेज सत्यापन (DV) चेकलिस्ट, चरित्र प्रमाण पत्र एवं शपथ पत्र प्रारूप',
    titleEn: 'Rajasthan Govt Recruitment Document Verification (DV) Checklist & Guidelines',
    summaryHi: 'RPSC एवं कर्मचारी चयन बोर्ड द्वारा आयोजित दस्तावेज सत्यापन (DV) में उपस्थित होने वाले अभ्यर्थियों के लिए आवश्यक मूल दस्तावेजों की संपूर्ण चेकलिस्ट, अटेस्टेशन फॉर्म एवं शपथ पत्र प्रारूप।',
    summaryEn: 'Standard checklist, attestation forms, character certificates, and required affidavits for Document Verification (DV) in Rajasthan recruitments.',
    facts: {
      qualification: 'चयनित व प्रोविजनल सूची में सम्मिलित अभ्यर्थी',
      selectionProcess: 'अंतिम पदस्थापन पूर्व अभिलेख जांच',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-13T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'प्रशासनिक सुधार एवं भर्ती प्रकोष्ठ'
    },
    sections: [
      {
        key: 'dv_checklist_items',
        title: 'अनिवार्य दस्तावेजों की सूची (Checklist)',
        body: '1. विस्तृत आवेदन सह संवीक्षा प्रपत्र (Scrutiny Form) दो प्रतियों में\n2. 10वीं अंकतालिका व प्रमाण पत्र (जन्मतिथि प्रमाण)\n3. 12वीं एवं स्नातक की समस्त वर्षों की अंकतालिकाएं व उपाधि (Degree)\n4. आरक्षित वर्ग का सक्षम अधिकारी द्वारा जारी जाति प्रमाण पत्र\n5. मूल निवास प्रमाण पत्र (डिजिटल हस्ताक्षरित)\n6. अंतिम शिक्षण संस्थान का चरित्र प्रमाण पत्र एवं दो राजपत्रित अधिकारियों द्वारा जारी चरित्र प्रमाण पत्र\n7. संतान संबंधी, विवाह संबंधी व दहेज न लेने का शपथ पत्र'
      }
    ],
    links: [
      {
        label: 'संवीक्षा प्रपत्र (Scrutiny Form) डाउनलोड करें',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Scrutiny_Form_Format.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'sso-id-profile-correction-aadhaar-link-guidelines',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'careerGuide',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    titleHi: 'SSO ID प्रोफाइल सुधार, जन्मतिथि व नाम संशोधन एवं आधार ई-केवाईसी गाइड',
    titleEn: 'SSO ID Profile Correction, Date of Birth / Name Correction & Aadhaar e-KYC Guide',
    summaryHi: 'राजस्थान सिंगल साइन ऑन (SSO) प्रोफाइल में यदि नाम, जन्मतिथि अथवा मोबाइल नंबर में कोई त्रुटि है, तो ई-मित्र अथवा स्वयं द्वारा संशोधन करने की चरणबद्ध आधिकारिक विधि।',
    summaryEn: 'Step-by-step authoritative process for SSO profile editing, Aadhaar/Jan Aadhaar updating, and rectification of errors for state recruitment forms.',
    facts: {
      qualification: 'सभी राजस्थान SSO उपयोगकर्ता',
      selectionProcess: 'ऑनलाइन ई-केवाईसी सत्यापन',
      sourceUrl: 'https://sso.rajasthan.gov.in',
      sourceDate: '2026-11-09T14:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'DOIT&C राजस्थान'
    },
    sections: [
      {
        key: 'correction_steps',
        title: 'प्रोफाइल संशोधन की प्रमुख सावधानियां',
        body: 'SSO प्रोफाइल में परिवर्तन करने के उपरांत Recruitment Portal पर जाकर "Fetch Jan Aadhaar/Aadhaar" विकल्प पर क्लिक अवश्य करें, ताकि OTR डेटाबेस में भी नवीनतम नाम एवं जन्मतिथि अपडेट हो जाए।'
      }
    ],
    links: [
      {
        label: 'SSO पोर्टल पर लॉगिन करें',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      }
    ]
  },

  // ==========================================
  // 4. PYQ - PREVIOUS YEAR PAPERS (noticeType: 'pyq')
  // ==========================================
  {
    slug: 'rpsc-ras-prelims-previous-years-solved-papers-2021-2024',
    agencySlug: 'rpsc',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'pyq',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    titleHi: 'RPSC RAS Pre विगत वर्षों के प्रश्नपत्र हल सहित एवं आधिकारिक उत्तर कुंजी (2018-2024)',
    titleEn: 'RPSC RAS Prelims Previous Years Question Papers with Official Solutions (2018-2024)',
    summaryHi: 'राजस्थान प्रशासनिक सेवा (RAS/RTS) प्रारंभिक परीक्षा के पिछले 5 वर्षों (2018, 2021, 2023, 2024) के मास्टर प्रश्न पत्र और RPSC की अंतिम उत्तर कुंजी सहित PDF संग्रह।',
    summaryEn: 'Comprehensive repository of previous 5 years official question papers and final answer keys for RPSC RAS Preliminary Examination.',
    facts: {
      qualification: 'स्नातक (Graduate)',
      selectionProcess: 'RAS प्रारंभिक परीक्षा (200 अंक)',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-19T09:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर अभिलेखागार'
    },
    sections: [
      {
        key: 'pyq_analysis',
        title: 'विगत वर्षों का विषयवार ट्रेंड (Trend Analysis)',
        body: 'RAS Pre में राजस्थान के इतिहास, कला, संस्कृति व भूगोल से औसतन 50 से 55 प्रश्न पूछे जाते हैं। समसामयिकी (Current Affairs) से 20 से 25 प्रश्न एवं गणित/तर्कशक्ति से 20 प्रश्न पूछे जाते हैं।'
      }
    ],
    links: [
      {
        label: 'RAS Pre 2024 मास्टर पेपर PDF',
        url: 'https://rpsc.rajasthan.gov.in/Static/PYQ/RAS_Pre_2024_Paper.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'RAS Pre 2024 अंतिम उत्तर कुंजी PDF',
        url: 'https://rpsc.rajasthan.gov.in/Static/PYQ/RAS_Pre_2024_Final_Key.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rssb-patwari-previous-year-question-papers-solution',
    agencySlug: 'rssb',
    categorySlug: 'revenue_patwari',
    state: 'rajasthan',
    noticeType: 'pyq',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    titleHi: 'RSSB पटवारी भर्ती परीक्षा विगत वर्षों के प्रश्नपत्र हल सहित PDF डाउनलोड',
    titleEn: 'RSSB Patwari Recruitment Previous Year Question Papers with Answer Key PDF',
    summaryHi: 'कर्मचारी चयन बोर्ड द्वारा आयोजित पूर्व पटवारी भर्ती परीक्षाओं के सभी पारियों के प्रश्न पत्र, अंतिम उत्तर कुंजी एवं विषयवार हल संग्रह।',
    summaryEn: 'Official previous year question papers across all shifts along with finalized answer keys for Rajasthan Patwari Recruitment Examination.',
    facts: {
      qualification: 'स्नातक (Graduate)',
      selectionProcess: 'वस्तुनिष्ठ बहुविकल्पीय परीक्षा',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-16T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर प्रश्न बैंक'
    },
    sections: [
      {
        key: 'patwari_pyq_overview',
        title: 'परीक्षा हल विश्लेषण',
        body: 'पटवारी परीक्षा में मानसिक क्षमता व गणित का स्तर 10वीं तक का रहता है। राजस्थान विशेष सामान्य ज्ञान के 30 प्रश्न निर्णायक भूमिका निभाते हैं।'
      }
    ],
    links: [
      {
        label: 'पटवारी हल प्रश्नपत्र PDF डाउनलोड',
        url: 'https://rsmssb.rajasthan.gov.in/Static/PYQ/Patwari_Solved_Papers.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rajasthan-police-constable-previous-years-question-papers',
    agencySlug: 'police',
    categorySlug: 'police_defence',
    state: 'rajasthan',
    noticeType: 'pyq',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString(),
    titleHi: 'राजस्थान पुलिस कांस्टेबल परीक्षा विगत वर्षों के प्रश्नपत्र एवं मॉडल पेपर्स',
    titleEn: 'Rajasthan Police Constable Previous Years Question Papers & Model Practice Papers',
    summaryHi: 'राजस्थान पुलिस कांस्टेबल भर्ती के 2018, 2020, 2022 एवं 2024 की विभिन्न पारियों के वास्तविक प्रश्न पत्र एवं उत्तर तालिका।',
    summaryEn: 'Archive of official question papers and answer sheets from past Rajasthan Police Constable examinations.',
    facts: {
      qualification: '12वीं पास',
      selectionProcess: 'लिखित परीक्षा (150 अंक)',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-11-13T14:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान पुलिस प्रकोष्ठ'
    },
    sections: [
      {
        key: 'police_pyq_info',
        title: 'कंप्यूटर एवं रीजनिंग अभ्यास',
        body: 'कांस्टेबल परीक्षा में कंप्यूटर के 30 और रीजनिंग के 30 प्रश्न आते हैं। पुराने प्रश्नपत्रों से अभ्यास करने पर इन 60 अंकों में से 50+ अंक आसानी से अर्जित किए जा सकते हैं।'
      }
    ],
    links: [
      {
        label: 'पुलिस कांस्टेबल पुराने पेपर्स PDF',
        url: 'https://police.rajasthan.gov.in/Static/PYQ/Constable_Past_Papers.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'reet-level-1-2-previous-year-question-papers',
    agencySlug: 'reet',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'pyq',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 58).toISOString(),
    titleHi: 'REET पात्रता परीक्षा लेवल-1 एवं लेवल-2 विगत वर्षों के हल प्रश्नपत्र',
    titleEn: 'REET Level-1 & Level-2 Previous Year Question Papers with Solution PDF',
    summaryHi: 'राजस्थान माध्यमिक शिक्षा बोर्ड द्वारा 2017, 2021 एवं 2022 में आयोजित REET परीक्षाओं के बाल विकास, भाषा-I, भाषा-II, गणित एवं पर्यावरण/सामाजिक अध्ययन के पेपर।',
    summaryEn: 'Complete collection of REET Level 1 and Level 2 question papers with official answer keys for child pedagogy, languages, and subject domains.',
    facts: {
      qualification: 'D.El.Ed / B.Ed',
      selectionProcess: 'शिक्षक पात्रता परीक्षा',
      sourceUrl: 'https://rajeduboard.rajasthan.gov.in',
      sourceDate: '2026-11-10T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RBSE अजमेर'
    },
    sections: [
      {
        key: 'reet_pyq_weightage',
        title: 'बाल विकास व शिक्षाशास्त्र अभ्यास',
        body: '30 अंकों का बाल विकास व शिक्षाशास्त्र सभी विषयों के शिक्षण में अत्यंत महत्वपूर्ण है। पूर्व प्रश्नों को दोहराना 100% उपयोगी रहता है।'
      }
    ],
    links: [
      {
        label: 'REET लेवल 1 विगत पेपर PDF',
        url: 'https://rajeduboard.rajasthan.gov.in/Static/PYQ/REET_L1_Past.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'REET लेवल 2 विगत पेपर PDF',
        url: 'https://rajeduboard.rajasthan.gov.in/Static/PYQ/REET_L2_Past.pdf',
        kind: 'notificationPdf'
      }
    ]
  },

  // ==========================================
  // 5. CALENDAR (noticeType: 'calendar')
  // ==========================================
  {
    slug: 'rpsc-annual-exam-calendar-schedule-2026',
    agencySlug: 'rpsc',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'calendar',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    titleHi: 'RPSC वार्षिक परीक्षा कैलेंडर 2026-2027: RAS, कॉलेज प्राध्यापक, वरिष्ठ अध्यापक परीक्षा तिथियां घोषित',
    titleEn: 'RPSC Annual Examination Calendar 2026-2027: Official Exam Dates Announced',
    summaryHi: 'राजस्थान लोक सेवा आयोग अजमेर द्वारा सत्र 2026-2027 की प्रमुख भर्ती परीक्षाओं का वार्षिक परीक्षा कैलेंडर जारी कर दिया गया है।',
    summaryEn: 'Rajasthan Public Service Commission (RPSC) has released its official examination calendar for 2026-2027 detailing upcoming dates for major recruitments.',
    facts: {
      examDate: '2026-12-20T09:00:00.000Z',
      applicationEnd: '2026-11-30T18:00:00.000Z',
      qualification: 'स्नातक / स्नातकोत्तर / B.Ed',
      selectionProcess: 'वार्षिक परीक्षा समय सारणी',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-21T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC परीक्षा नियंत्रण प्रकोष्ठ'
    },
    sections: [
      {
        key: 'calendar_schedule',
        title: 'प्रमुख परीक्षा तिथियों की सारणी',
        body: '1. सहायक आचार्य (कॉलेज शिक्षा): 15 से 24 दिसंबर 2026\n2. प्राध्यापक (स्कूल शिक्षा): 18 से 28 जनवरी 2027\n3. वरिष्ठ अध्यापक (माध्यमिक शिक्षा): 10 से 18 फरवरी 2027\n4. RAS Mains परीक्षा: 14 व 15 मार्च 2027'
      }
    ],
    links: [
      {
        label: 'RPSC आधिकारिक परीक्षा कैलेंडर PDF',
        url: 'https://rpsc.rajasthan.gov.in/Static/Calendar/RPSC_Exam_Calendar_2026.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rssb-tentative-examination-calendar-2026',
    agencySlug: 'rssb',
    categorySlug: 'clerk_assistant',
    state: 'rajasthan',
    noticeType: 'calendar',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    titleHi: 'RSSB वार्षिक भर्ती परीक्षा कैलेंडर 2026: CET, कनिष्ठ सहायक, पटवारी व छात्रावास अधीक्षक तिथियां',
    titleEn: 'RSSB Annual Recruitment Exam Calendar 2026: Official Tentative Exam Schedule',
    summaryHi: 'कर्मचारी चयन बोर्ड जयपुर द्वारा वर्ष 2026 में आयोजित होने वाली विभिन्न प्रतियोगी परीक्षाओं का संशोधित कैलेंडर घोषित किया गया है।',
    summaryEn: 'RSMSSB Jaipur has announced the tentative schedule and dates for CET, Patwari, LDC, and Hostel Superintendent exams.',
    facts: {
      examDate: '2026-12-12T09:00:00.000Z',
      applicationEnd: '2026-11-28T18:00:00.000Z',
      qualification: '10वीं / 12वीं / स्नातक',
      selectionProcess: 'बोर्ड परीक्षा सारणी',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-20T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर'
    },
    sections: [
      {
        key: 'rssb_dates',
        title: 'आगामी परीक्षाओं की समय सारणी',
        body: '1. कनिष्ठ सहायक (LDC) परीक्षा: 12 दिसंबर 2026\n2. पशु परिचर सीधी भर्ती: 20 से 23 दिसंबर 2026\n3. छात्रावास अधीक्षक ग्रेड-II: 10 जनवरी 2027\n4. पटवारी भर्ती परीक्षा: 24 जनवरी 2027'
      }
    ],
    links: [
      {
        label: 'RSSB परीक्षा कैलेंडर PDF डाउनलोड',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Calendar/RSSB_Calendar_2026.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'rajasthan-police-constable-cbt-exam-dates-schedule-2026',
    agencySlug: 'police',
    categorySlug: 'police_defence',
    state: 'rajasthan',
    noticeType: 'calendar',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    titleHi: 'राजस्थान पुलिस कांस्टेबल कंप्यूटर आधारित परीक्षा (CBT) तिथि एवं शिफ्ट विवरण घोषित',
    titleEn: 'Rajasthan Police Constable CBT Examination Dates & Shift Schedule 2026',
    summaryHi: 'राजस्थान पुलिस भर्ती प्रकोष्ठ द्वारा कांस्टेबल भर्ती 2026 की कंप्यूटर आधारित ऑनलाइन परीक्षा (CBT) की तिथियां व जिला केंद्र सूची जारी।',
    summaryEn: 'Official schedule and shift allocation for Rajasthan Police Constable Computer Based Test (CBT) 2026.',
    facts: {
      examDate: '2026-12-08T09:00:00.000Z',
      applicationEnd: '2026-11-25T18:00:00.000Z',
      qualification: '12वीं पास (CET)',
      selectionProcess: 'CBT 2 पारियों में आयोजित की जाएगी',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-11-17T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान पुलिस भर्ती बोर्ड'
    },
    sections: [
      {
        key: 'police_shifts',
        title: 'परीक्षा पारियां व समय',
        body: 'प्रातः पारी: 09:30 AM से 11:30 AM (प्रवेश 08:30 AM तक)\nदोपहर पारी: 02:30 PM से 04:30 PM (प्रवेश 01:30 PM तक)'
      }
    ],
    links: [
      {
        label: 'परीक्षा तिथि आधिकारिक विज्ञप्ति PDF',
        url: 'https://police.rajasthan.gov.in/Static/Notices/CBT_Dates_2026.pdf',
        kind: 'notificationPdf'
      }
    ]
  },

  // ==========================================
  // 6. ADMIT CARDS (noticeType: 'admitCard')
  // ==========================================
  {
    slug: 'rssb-junior-accountant-tra-exam-admit-card-2026',
    agencySlug: 'rssb',
    categorySlug: 'clerk_assistant',
    state: 'rajasthan',
    noticeType: 'admitCard',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    titleHi: 'RSSB जूनियर अकाउंटेंट एवं तहसील राजस्व लेखाकार परीक्षा प्रवेश पत्र जारी',
    titleEn: 'RSSB Junior Accountant & TRA Exam 2026 Admit Card / Hall Ticket Download',
    summaryHi: 'कर्मचारी चयन बोर्ड द्वारा कनिष्ठ लेखाकार एवं टीआरए संयुक्त सीधी भर्ती परीक्षा के प्रवेश पत्र आधिकारिक वेबसाइट एवं एसएसओ पोर्टल पर लाइव कर दिए गए हैं।',
    summaryEn: 'RSMSSB has released the admit cards for Junior Accountant and Tehsil Revenue Accountant (TRA) Recruitment Examination 2026.',
    facts: {
      examDate: '2026-11-29T09:00:00.000Z',
      qualification: 'स्नातक (Graduate)',
      selectionProcess: 'लिखित परीक्षा दो पारियों में',
      sourceUrl: 'https://recruitment.rajasthan.gov.in',
      sourceDate: '2026-11-21T08:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर'
    },
    sections: [
      {
        key: 'admit_download_steps',
        title: 'प्रवेश पत्र डाउनलोड करने की प्रक्रिया',
        body: 'अभ्यर्थी recruitment.rajasthan.gov.in पर जाकर "Get Admit Card" विकल्प पर क्लिक करें और अपना आवेदन क्रमांक (Application ID) एवं जन्मतिथि दर्ज करके प्रवेश पत्र डाउनलोड करें।'
      }
    ],
    links: [
      {
        label: 'प्रवेश पत्र डाउनलोड करें (Direct Link)',
        url: 'https://recruitment.rajasthan.gov.in',
        kind: 'admitCard'
      }
    ]
  },
  {
    slug: 'rajasthan-high-court-system-assistant-admit-card-2026',
    agencySlug: 'hcraj',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'admitCard',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    titleHi: 'राजस्थान उच्च न्यायालय सिस्टम असिस्टेंट लिखित परीक्षा प्रवेश पत्र जारी',
    titleEn: 'Rajasthan High Court System Assistant Written Exam Admit Card Download',
    summaryHi: 'राजस्थान उच्च न्यायालय जोधपुर द्वारा सिस्टम असिस्टेंट भर्ती 2026 की लिखित परीक्षा हेतु अभ्यर्थियों के प्रवेश पत्र अपलोड कर दिए गए हैं।',
    summaryEn: 'Rajasthan High Court, Jodhpur has made available the admit cards for System Assistant Written Competitive Examination 2026.',
    facts: {
      examDate: '2026-12-03T10:00:00.000Z',
      qualification: 'BCA / B.Tech / BSc CS',
      selectionProcess: 'लिखित परीक्षा (100 अंक) व कंप्यूटर टाइपिंग टेस्ट',
      sourceUrl: 'https://hcraj.nic.in',
      sourceDate: '2026-11-20T14:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'उच्च न्यायालय जोधपुर भर्ती प्रकोष्ठ'
    },
    sections: [
      {
        key: 'hc_admit_notes',
        title: 'परीक्षा केंद्र हेतु आवश्यक निर्देश',
        body: 'प्रवेश पत्र के साथ मूल पहचान पत्र (आधार कार्ड, वोटर आईडी या ड्राइविंग लाइसेंस) एवं नवीनतम पासपोर्ट साइज रंगीन फोटो लाना अनिवार्य है।'
      }
    ],
    links: [
      {
        label: 'HCRAJ प्रवेश पत्र डाउनलोड करें',
        url: 'https://hcraj.nic.in/recruitment',
        kind: 'admitCard'
      }
    ]
  },
  {
    slug: 'rpsc-senior-teacher-grade-2-exam-city-admit-card-2026',
    agencySlug: 'rpsc',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'admitCard',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    titleHi: 'RPSC द्वितीय श्रेणी वरिष्ठ अध्यापक परीक्षा जिला आवंटन एवं प्रवेश पत्र जारी',
    titleEn: 'RPSC 2nd Grade Senior Teacher Exam District Location & Admit Card 2026',
    summaryHi: 'राजस्थान लोक सेवा आयोग अजमेर द्वारा वरिष्ठ अध्यापक (संस्कृत एवं माध्यमिक शिक्षा) प्रतियोगी परीक्षा हेतु परीक्षा जिला आवंटन सूचना एवं प्रवेश पत्र जारी।',
    summaryEn: 'RPSC has activated the exam district center allocation link and admit cards for 2nd Grade Senior Teacher examination.',
    facts: {
      examDate: '2026-12-06T09:00:00.000Z',
      qualification: 'B.Ed डिग्री',
      selectionProcess: 'लिखित परीक्षा',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-19T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर'
    },
    sections: [
      {
        key: 'rpsc_entry_guidelines',
        title: 'परीक्षा केंद्र प्रवेश समय सीमा',
        body: 'परीक्षा प्रारंभ होने के ठीक 60 मिनट पूर्व परीक्षा केंद्र के मुख्य द्वार बंद कर दिए जाएंगे। इसके बाद किसी भी परिस्थिति में प्रवेश नहीं दिया जाएगा।'
      }
    ],
    links: [
      {
        label: 'RPSC प्रवेश पत्र पोर्टल',
        url: 'https://rpsc.rajasthan.gov.in',
        kind: 'admitCard'
      }
    ]
  },

  // ==========================================
  // 7. RESULTS (noticeType: 'result')
  // ==========================================
  {
    slug: 'rajasthan-police-constable-written-exam-result-merit-list-2026',
    agencySlug: 'police',
    categorySlug: 'police_defence',
    state: 'rajasthan',
    noticeType: 'result',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    titleHi: 'राजस्थान पुलिस कांस्टेबल लिखित परीक्षा परिणाम व शारीरिक दक्षता (PET/PST) कट-ऑफ जारी',
    titleEn: 'Rajasthan Police Constable Written Exam Result, Merit List & Cut-Off Marks 2026',
    summaryHi: 'राजस्थान पुलिस महानिदेशक कार्यालय द्वारा कांस्टेबल भर्ती 2026 के लिखित परीक्षा परिणाम एवं शारीरिक दक्षता परीक्षा (दौड़) हेतु सफल अभ्यर्थियों की जिलावार सूची जारी कर दी गई है।',
    summaryEn: 'Office of the Director General of Police, Rajasthan has declared the written examination results, merit lists, and category-wise cut-offs for Constable Recruitment 2026.',
    facts: {
      qualification: '12वीं पास',
      selectionProcess: 'लिखित परीक्षा उपरांत शारीरिक दक्षता दौड़ हेतु 15 गुना अभ्यर्थी उत्तीर्ण',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-11-21T06:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान पुलिस मुख्यालय'
    },
    sections: [
      {
        key: 'result_cutoff_info',
        title: 'वर्गवार कट-ऑफ एवं परिणाम विवरण',
        body: 'सफल अभ्यर्थियों की रोल नंबर वार पीडीएफ पुलिस की आधिकारिक वेबसाइट पर उपलब्ध है। शारीरिक दक्षता परीक्षा की तिथियां शीघ्र घोषित की जाएंगी।'
      }
    ],
    links: [
      {
        label: 'परिणाम व मेरिट लिस्ट PDF डाउनलोड करें',
        url: 'https://police.rajasthan.gov.in/Static/Results/Constable_Result_2026.pdf',
        kind: 'result'
      }
    ]
  },
  {
    slug: 'rpsc-assistant-professor-college-education-final-result-2026',
    agencySlug: 'rpsc',
    categorySlug: 'teaching',
    state: 'rajasthan',
    noticeType: 'result',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    titleHi: 'RPSC सहायक आचार्य (कॉलेज शिक्षा) अंतिम चयन परिणाम एवं वर्गवार कट-ऑफ मार्क्स',
    titleEn: 'RPSC Assistant Professor (College Education) Final Selection Result & Cut-off',
    summaryHi: 'राजस्थान लोक सेवा आयोग द्वारा कॉलेज शिक्षा विभाग में सहायक आचार्य प्रतियोगी परीक्षा का अंतिम चयन परिणाम, साक्षात्कार उपरांत मेरिट सूची व कट-ऑफ मार्क्स घोषित।',
    summaryEn: 'RPSC has declared the final recommendation and selection merit list along with cut-off marks for Assistant Professor (College Education).',
    facts: {
      qualification: 'नेट (NET) / पीएचडी (PhD) सहित स्नातकोत्तर',
      selectionProcess: 'लिखित परीक्षा एवं साक्षात्कार',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-11-18T16:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RPSC अजमेर चयन बोर्ड'
    },
    sections: [
      {
        key: 'asst_prof_merit',
        title: 'अंतिम संस्तुति परिणाम',
        body: 'आयोग द्वारा मुख्य सूची में सफल अभ्यर्थियों के रोल नंबर एवं आरक्षित सूची जारी की गई है। पदस्थापन अनुशंसा उच्च शिक्षा विभाग को प्रेषित की गई है।'
      }
    ],
    links: [
      {
        label: 'अंतिम चयन सूची PDF डाउनलोड करें',
        url: 'https://rpsc.rajasthan.gov.in/Static/Results/Asst_Prof_Final_Result.pdf',
        kind: 'result'
      }
    ]
  },
  {
    slug: 'rajasthan-patwari-final-recommendation-result-cutoff-2026',
    agencySlug: 'rssb',
    categorySlug: 'revenue_patwari',
    state: 'rajasthan',
    noticeType: 'result',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    titleHi: 'राजस्थान पटवारी भर्ती अंतिम संस्तुति सूची व जिला पदस्थापन परिणाम जारी',
    titleEn: 'Rajasthan Patwari Recruitment Final Recommendation List & District Allocation Result',
    summaryHi: 'कर्मचारी चयन बोर्ड जयपुर द्वारा पटवारी सीधी भर्ती का अंतिम चयन परिणाम एवं राजस्व मंडल अजमेर द्वारा चयनित अभ्यर्थियों को जिला आवंटन सूची जारी कर दी गई है।',
    summaryEn: 'RSMSSB and Board of Revenue Rajasthan have announced the final selection merit list and district postings for Patwari recruitment.',
    facts: {
      qualification: 'स्नातक + RSCIT',
      selectionProcess: 'अंतिम चयनित अभ्यर्थियों का जिला आवंटन',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-15T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर एवं राजस्व मंडल अजमेर'
    },
    sections: [
      {
        key: 'patwari_allocation',
        title: 'जिला आवंटन एवं दस्तावेज सत्यापन निर्देश',
        body: 'चयनित अभ्यर्थियों को आवंटित जिले के जिला कलेक्टर (भू-अभिलेख) कार्यालय में निर्धारित समय सीमा में उपस्थिति देनी होगी।'
      }
    ],
    links: [
      {
        label: 'अंतिम चयन व जिला आवंटन सूची PDF',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Results/Patwari_Final_Result.pdf',
        kind: 'result'
      }
    ]
  },

  // ==========================================
  // 8. 10TH / 12TH PASS JOBS & ADMISSIONS (noticeType: 'vacancy')
  // ==========================================
  {
    slug: 'rajasthan-animal-attendant-pashu-paricharak-recruitment-2026',
    agencySlug: 'rssb',
    categorySlug: 'secondary_jobs',
    state: 'rajasthan',
    noticeType: 'vacancy',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    titleHi: 'राजस्थान पशु परिचर (Animal Attendant) भर्ती 2026 - 5,934 पद 10वीं पास सीधी भर्ती',
    titleEn: 'Rajasthan Animal Attendant Recruitment 2026 - 5,934 Posts 10th Pass Notification',
    summaryHi: 'राजस्थान कर्मचारी चयन बोर्ड जयपुर द्वारा पशुपालन विभाग में 5,934 पशु परिचर (Animal Attendant) पदों पर केवल 10वीं पास युवाओं के लिए बंपर सीधी भर्ती का विज्ञापन जारी। बिना इंटरव्यू सीधी नौकरी।',
    summaryEn: 'RSMSSB Jaipur has released notification for 5,934 Animal Attendant posts in the Animal Husbandry Department for 10th pass candidates. Direct recruitment with no interview.',
    facts: {
      postsCount: 5934,
      applicationStart: '2026-11-01T00:00:00.000Z',
      applicationEnd: '2026-12-05T23:59:59.000Z',
      examDate: '2026-12-22T09:00:00.000Z',
      feeGeneralObc: '₹600 (OTR लागू होने पर निःशुल्क)',
      feeScSt: '₹400 (OTR लागू होने पर निःशुल्क)',
      qualification: '10वीं पास (Secondary / 10th Pass from recognized board) + देवनागरी लिपि व राजस्थानी संस्कृति का ज्ञान',
      ageMin: 18,
      ageMax: 40,
      ageRelaxation: 'नियमानुसार आरक्षित वर्गों को 5 से 10 वर्ष की छूट',
      selectionProcess: 'एकल चरण वस्तुनिष्ठ लिखित परीक्षा (150 अंक) एवं दस्तावेज सत्यापन (कोई साक्षात्कार नहीं)',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-11-21T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'RSSB जयपुर अधिकृत'
    },
    sections: [
      {
        key: 'pashu_exam_pattern',
        title: 'परीक्षा योजना एवं पाठ्यक्रम (150 प्रश्न, 150 अंक)',
        body: 'भाग अ (70% भारांक - 105 प्रश्न): राजस्थान का भूगोल, इतिहास, संस्कृति, सामान्य विज्ञान, गणित एवं समसामयिकी।\nभाग ब (30% भारांक - 45 प्रश्न): पशुपालन से संबंधित सामान्य ज्ञान, प्रमुख नस्लें, टीकाकरण, डेयरी प्रबंधन।'
      }
    ],
    links: [
      {
        label: 'आधिकारिक भर्ती विज्ञापन PDF',
        url: 'https://rsmssb.rajasthan.gov.in/Static/Recruitment/Animal_Attendant_2026.pdf',
        kind: 'notificationPdf'
      },
      {
        label: 'ऑनलाइन आवेदन करें (SSO Portal)',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      }
    ]
  },
  {
    slug: 'rajasthan-ptet-bed-admission-form-2026',
    agencySlug: 'education',
    categorySlug: 'education_dept',
    state: 'rajasthan',
    noticeType: 'vacancy',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    titleHi: 'राजस्थान PTET 2026: 2-वर्षीय B.Ed एवं 4-वर्षीय BA B.Ed / BSc B.Ed ऑनलाइन प्रवेश परीक्षा आवेदन',
    titleEn: 'Rajasthan PTET 2026 Online Application for 2-Year B.Ed & 4-Year Integrated Course',
    summaryHi: 'राजस्थान राज्य के राजकीय एवं निजी शिक्षक प्रशिक्षण महाविद्यालयों में 2-वर्षीय बी.एड एवं 4-वर्षीय इन्टीग्रेटेड बी.ए. बी.एड / बी.एससी. बी.एड पाठ्यक्रमों में सत्र 2026 हेतु ऑनलाइन आवेदन शुरू।',
    summaryEn: 'Online entrance examination forms invited for 2-Year B.Ed and 4-Year Integrated BA B.Ed / BSc B.Ed admissions in Rajasthan colleges.',
    facts: {
      postsCount: 150000,
      applicationStart: '2026-11-05T00:00:00.000Z',
      applicationEnd: '2026-12-10T23:59:59.000Z',
      examDate: '2027-01-15T09:00:00.000Z',
      feeGeneralObc: '₹500',
      feeScSt: '₹500',
      qualification: '4-वर्षीय कोर्स हेतु 12वीं पास (न्यूनतम 50% अंक) / 2-वर्षीय बी.एड हेतु स्नातक उत्तीर्ण',
      ageMin: 17,
      selectionProcess: 'राज्य स्तरीय PTET प्रवेश परीक्षा (200 प्रश्न, 600 अंक) एवं ऑनलाइन काउंसलिंग',
      sourceUrl: 'https://ptetraj2026.org',
      sourceDate: '2026-11-18T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'PTET समन्वयक व उच्च शिक्षा विभाग'
    },
    sections: [
      {
        key: 'ptet_exam_structure',
        title: 'प्रवेश परीक्षा प्रारूप (200 प्रश्न, 600 अंक)',
        body: '1. मेंटल एबिलिटी: 50 प्रश्न (150 अंक)\n2. टीचिंग एप्टीट्यूड: 50 प्रश्न (150 अंक)\n3. जनरल अवेयरनेस: 50 प्रश्न (150 अंक)\n4. लैंग्वेज प्रोफिशिएंसी (हिंदी/अंग्रेजी): 50 प्रश्न (150 अंक)'
      }
    ],
    links: [
      {
        label: 'PTET अधिकृत पोर्टल व ऑनलाइन आवेदन',
        url: 'https://ptetraj2026.org',
        kind: 'applyOnline'
      }
    ]
  },
  {
    slug: 'rajasthan-university-uniraj-ug-admission-merit-list-2026',
    agencySlug: 'education',
    categorySlug: 'education_dept',
    state: 'rajasthan',
    noticeType: 'vacancy',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    titleHi: 'राजस्थान विश्वविद्यालय (UNIRAJ) स्नातक (BA, BCom, BSc) प्रथम वर्ष प्रवेश आवेदन एवं कट-ऑफ',
    titleEn: 'University of Rajasthan (UNIRAJ) UG Admission 2026 Application & Merit Cut-off',
    summaryHi: 'राजस्थान विश्वविद्यालय, जयपुर के संघटक महाविद्यालयों (महाराजा, महारानी, राजस्थान कॉलेज, कॉमर्स कॉलेज) में स्नातक प्रथम वर्ष (NEP-2020 4-वर्षीय पाठ्यक्रम) में ऑनलाइन प्रवेश प्रक्रिया।',
    summaryEn: 'University of Rajasthan (UNIRAJ) admissions for undergraduate courses (BA, B.Com, B.Sc) across constituent colleges in Jaipur.',
    facts: {
      applicationStart: '2026-11-10T00:00:00.000Z',
      applicationEnd: '2026-12-08T23:59:59.000Z',
      feeGeneralObc: '₹200',
      feeScSt: '₹150',
      qualification: '12वीं उत्तीर्ण (10+2 from recognized board with minimum required percentage)',
      selectionProcess: '12वीं बोर्ड प्राप्तांक प्रतिशत व राज्य आरक्षण नीति अनुसार मेरिट सूची',
      sourceUrl: 'https://uniraj.ac.in',
      sourceDate: '2026-11-15T12:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'राजस्थान विश्वविद्यालय जयपुर'
    },
    sections: [
      {
        key: 'uniraj_colleges',
        title: 'संघटक महाविद्यालय विवरण',
        body: '1. यूनिवर्सिटी महाराजा कॉलेज (केवल छात्र - B.Sc)\n2. यूनिवर्सिटी महारानी कॉलेज (केवल छात्राएं - BA, BCom, BSc)\n3. यूनिवर्सिटी राजस्थान कॉलेज (केवल छात्र - BA)\n4. यूनिवर्सिटी कॉमर्स कॉलेज (केवल छात्र - BCom)'
      }
    ],
    links: [
      {
        label: 'UNIRAJ प्रवेश पोर्टल',
        url: 'https://admission.uniraj.edu.in',
        kind: 'applyOnline'
      }
    ]
  },

  // ==========================================
  // 9. SCHEMES & DIPR (noticeType: 'scheme')
  // ==========================================
  {
    slug: 'mukhyamantri-anuprati-coaching-yojana-2026',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'scheme',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    titleHi: 'मुख्यमंत्री अनुप्रति कोचिंग योजना 2026: RAS, REET, NEET, JEE हेतु निःशुल्क कोचिंग ऑनलाइन आवेदन',
    titleEn: 'Mukhyamantri Anuprati Coaching Scheme 2026: Free Coaching for Competitive Exams',
    summaryHi: 'राजस्थान सरकार द्वारा आर्थिक रूप से कमजोर एवं मेधावी विद्यार्थियों को प्रतिष्ठित प्रतियोगी परीक्षाओं की निःशुल्क तैयारी कराने हेतु 30,000 सीटों पर ऑनलाइन आवेदन आमंत्रित। भोजन व आवास हेतु ₹40,000 अतिरिक्त सहायता।',
    summaryEn: 'Rajasthan Government invites applications under Mukhyamantri Anuprati Coaching Scheme for free coaching in civil services, engineering, and medical exams along with annual stipend.',
    facts: {
      postsCount: 30000,
      applicationStart: '2026-11-01T00:00:00.000Z',
      applicationEnd: '2026-12-15T23:59:59.000Z',
      qualification: '10वीं / 12वीं / स्नातक उत्तीर्ण (पारिवारिक वार्षिक आय ₹8 लाख से कम)',
      selectionProcess: '10वीं एवं 12वीं के प्राप्तांकों की मेरिट सूची के आधार पर चयन',
      sourceUrl: 'https://sje.rajasthan.gov.in',
      sourceDate: '2026-11-20T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'सामाजिक न्याय एवं अधिकारिता विभाग (SJE) राजस्थान'
    },
    sections: [
      {
        key: 'coaching_benefits',
        title: 'योजना के प्रमुख लाभ एवं सुविधाएं',
        body: '1. प्रतिष्ठित कोचिंग संस्थानों में निःशुल्क कोचिंग (RAS, UPSC, REET, कांस्टेबल, पटवारी, JEE, NEET, CLAT)\n2. अपने गृह जिले से बाहर रहकर कोचिंग करने वाले विद्यार्थियों को प्रतिवर्ष ₹40,000 भोजन एवं आवास भत्ता दिया जाता है।'
      }
    ],
    links: [
      {
        label: 'अनुप्रति कोचिंग ऑनलाइन आवेदन (SSO Portal)',
        url: 'https://sso.rajasthan.gov.in',
        kind: 'applyOnline'
      },
      {
        label: 'विस्तृत योजना परिपत्र एवं दिशा-निर्देश PDF',
        url: 'https://sje.rajasthan.gov.in/Static/Anuprati_Guidelines_2026.pdf',
        kind: 'notificationPdf'
      }
    ]
  },
  {
    slug: 'mukhyamantri-yuva-sambal-yojana-berojgari-bhatta-2026',
    agencySlug: 'raj_dept',
    categorySlug: 'administrative',
    state: 'rajasthan',
    noticeType: 'scheme',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    titleHi: 'मुख्यमंत्री युवा संबल योजना (बेरोजगारी भत्ता) 2026: ₹4,000 प्रतिमाह भत्ता, पात्रता व आवेदन प्रक्रिया',
    titleEn: 'Mukhyamantri Yuva Sambal Yojana 2026: Unemployment Allowance & Skill Internship Guide',
    summaryHi: 'राजस्थान के शिक्षित बेरोजगार युवाओं को ₹4,000 (पुरुष) व ₹4,500 (महिला, ट्रांसजेंडर एवं दिव्यांग) प्रतिमाह आर्थिक सहायता राशि एवं 4 घंटे की इंटर्नशिप दिशा-निर्देश।',
    summaryEn: 'Comprehensive guide and eligibility criteria for Rajasthan Mukhyamantri Yuva Sambal Yojana (Unemployment Allowance) offering up to ₹4,500 monthly stipend.',
    facts: {
      qualification: 'राजस्थान के मूल निवासी स्नातक (Graduate) युवा',
      selectionProcess: 'कौशल प्रशिक्षण एवं राजकीय विभागों में 4 घंटे दैनिक इंटर्नशिप',
      sourceUrl: 'https://employment.livelihoods.rajasthan.gov.in',
      sourceDate: '2026-11-18T11:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'कौशल, नियोजन एवं उद्यमिता विभाग राजस्थान'
    },
    sections: [
      {
        key: 'sambal_rules',
        title: 'पात्रता एवं इंटर्नशिप नियम',
        body: 'आवेदक राजस्थान का मूल निवासी होना चाहिए तथा किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक होना चाहिए। पारिवारिक वार्षिक आय ₹2 लाख से कम होनी चाहिए।'
      }
    ],
    links: [
      {
        label: 'बेरोजगारी भत्ता आवेदन (रोजगार पोर्टल)',
        url: 'https://employment.livelihoods.rajasthan.gov.in',
        kind: 'applyOnline'
      }
    ]
  },
  {
    slug: 'pm-surya-ghar-muft-bijli-yojana-rajasthan-2026',
    agencySlug: 'electricity',
    categorySlug: 'technical_energy',
    state: 'rajasthan',
    noticeType: 'scheme',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    titleHi: 'पीएम सूर्य घर मुफ्त बिजली योजना राजस्थान 2026: रूफटॉप सोलर सब्सिडी, ₹78,000 अनुदान व आवेदन नियम',
    titleEn: 'PM Surya Ghar Muft Bijli Yojana Rajasthan 2026: Rooftop Solar Subsidy & Application Guide',
    summaryHi: 'प्रधानमंत्री सूर्य घर मुफ्त बिजली योजना के अंतर्गत राजस्थान में घरों की छतों पर सोलर पैनल लगवाने पर ₹78,000 तक की सीधी केंद्रीय सब्सिडी एवं 300 यूनिट मुफ्त बिजली का लाभ।',
    summaryEn: 'PM Surya Ghar Muft Bijli Yojana offers up to ₹78,000 subsidy on residential rooftop solar installations across Rajasthan.',
    facts: {
      qualification: 'राजस्थान विद्युत वितरण निगम (JVVNL/AVVNL/JdVVNL) के घरेलू विद्युत उपभोक्ता',
      selectionProcess: 'ऑनलाइन आवेदन उपरांत तकनीकी व्यवहार्यता स्वीकृति व नेट मीटरिंग',
      sourceUrl: 'https://pmsuryaghar.gov.in',
      sourceDate: '2026-11-15T10:00:00.000Z',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय व ऊर्जा विभाग राजस्थान'
    },
    sections: [
      {
        key: 'solar_subsidy_slab',
        title: 'सब्सिडी स्लैब विवरण',
        body: '1 किलोवाट सिस्टम: ₹30,000 सब्सिडी\n2 किलोवाट सिस्टम: ₹60,000 सब्सिडी\n3 किलोवाट एवं उससे अधिक: ₹78,000 अधिकतम सब्सिडी'
      }
    ],
    links: [
      {
        label: 'पीएम सूर्य घर राष्ट्रीय पोर्टल',
        url: 'https://pmsuryaghar.gov.in',
        kind: 'applyOnline'
      }
    ]
  }
];

// Insert / Upsert notices
console.log(`\nInserting/Upserting ${newNotices.length} notices into Neon DB...`);

let insertedNoticesCount = 0;
for (const notice of newNotices) {
  const agencyId = agencyMap.get(notice.agencySlug);
  const categoryId = categoryMap.get(notice.categorySlug);

  if (!agencyId || !categoryId) {
    console.warn(`  ⚠️ Missing agency or category for notice ${notice.slug}: agency=${notice.agencySlug}, category=${notice.categorySlug}`);
    continue;
  }

  // Upsert notice
  const [insertedNotice] = await sql`
    INSERT INTO notices (
      slug, agency_id, category_id, state, notice_type, status,
      is_featured, is_breaking, published_at, expires_at, updated_at
    )
    VALUES (
      ${notice.slug}, ${agencyId}, ${categoryId}, ${notice.state}, ${notice.noticeType}, 'active',
      false, false,
      ${notice.publishedAt}, null, now()
    )
    ON CONFLICT (slug) DO UPDATE SET
      agency_id = EXCLUDED.agency_id,
      category_id = EXCLUDED.category_id,
      state = EXCLUDED.state,
      notice_type = EXCLUDED.notice_type,
      status = 'active',
      published_at = EXCLUDED.published_at,
      updated_at = now()
    RETURNING id, slug;
  `;

  // Upsert revision
  const [insertedRev] = await sql`
    INSERT INTO notice_revisions (
      notice_id, revision_number, title_hi, title_en, summary_hi, summary_en,
      facts_json, sections_json, links_json, revision_notes
    )
    VALUES (
      ${insertedNotice.id}, 1, ${notice.titleHi}, ${notice.titleEn},
      ${notice.summaryHi}, ${notice.summaryEn},
      ${JSON.stringify(notice.facts)},
      ${JSON.stringify(notice.sections || [])},
      ${JSON.stringify(notice.links || [])},
      'Authentic verified recruitment mock data'
    )
    ON CONFLICT (notice_id, revision_number) DO UPDATE SET
      title_hi = EXCLUDED.title_hi,
      title_en = EXCLUDED.title_en,
      summary_hi = EXCLUDED.summary_hi,
      summary_en = EXCLUDED.summary_en,
      facts_json = EXCLUDED.facts_json,
      sections_json = EXCLUDED.sections_json,
      links_json = EXCLUDED.links_json
    RETURNING id;
  `;

  // Update current_revision_id
  await sql`
    UPDATE notices
    SET current_revision_id = ${insertedRev.id}
    WHERE id = ${insertedNotice.id};
  `;

  insertedNoticesCount++;
  console.log(`  ✅ [${notice.noticeType}] ${notice.slug}`);
}

console.log(`\n🎉 Successfully processed ${insertedNoticesCount} notices.`);

// ==========================================
// 10. MCQ PRACTICE TESTS
// ==========================================
console.log('\nSeeding high-quality MCQ practice tests...');

const newMcqTests = [
  {
    slug: 'rajasthan-history-art-culture-mock-test',
    titleHi: 'राजस्थान इतिहास, कला एवं संस्कृति अभ्यास टेस्ट',
    titleEn: 'Rajasthan History, Art & Culture Practice Test',
    descriptionHi: 'राजस्थान के प्रमुख दुर्ग, लोक नृत्य, चित्रकला शैलियां व ऐतिहासिक युद्धों पर आधारित अभ्यास टेस्ट।',
    descriptionEn: 'Practice questions on major forts, folk dances, painting schools, and historical events of Rajasthan.',
    durationMinutes: 10,
    isActive: true,
    questions: [
      {
        questionHi: 'मेहरानगढ़ दुर्ग किस पहाड़ी पर स्थित है?',
        questionEn: 'On which hill is the Mehrangarh Fort situated?',
        options: [
          { hi: 'चिड़ियाटूँक पहाड़ी', en: 'Chidiyatunk Hill' },
          { hi: 'त्रिकूट पर्वत', en: 'Trikuta Hill' },
          { hi: 'बीठली पहाड़ी', en: 'Beethli Hill' },
          { hi: 'सुवर्णगिरि', en: 'Suvarnagiri' }
        ],
        correctOption: 0,
        explanationHi: 'मेहरानगढ़ दुर्ग जोधपुर में चिड़ियाटूँक पहाड़ी पर राव जोधा द्वारा 1459 ई. में बनवाया गया था।',
        explanationEn: 'Mehrangarh Fort in Jodhpur was built in 1459 AD by Rao Jodha on Chidiyatunk Hill.'
      },
      {
        questionHi: 'घूमर नृत्य के अवसर पर कौन सा प्रमुख वाद्ययंत्र प्रयुक्त होता है?',
        questionEn: 'Which major musical instrument is used during the Ghoomar dance?',
        options: [
          { hi: 'ढोल, नगाड़ा एवं शहनाई', en: 'Dhol, Nagada and Shehnai' },
          { hi: 'रावणहत्था', en: 'Ravanhattha' },
          { hi: 'कमायचा', en: 'Kamaycha' },
          { hi: 'अल्गोजा', en: 'Algoza' }
        ],
        correctOption: 0,
        explanationHi: 'घूमर राजस्थान का राज्य नृत्य है, जो मांगलिक अवसरों पर ढोल, नगाड़ा व शहनाई के साथ किया जाता है।',
        explanationEn: 'Ghoomar is the state dance of Rajasthan, performed with Dhol, Nagada, and Shehnai.'
      },
      {
        questionHi: 'प्रसिद्ध बनी-ठनी चित्रकला किस शैली से संबंधित है?',
        questionEn: 'The famous Bani-Thani painting is associated with which school of art?',
        options: [
          { hi: 'किशनगढ़ शैली', en: 'Kishangarh School' },
          { hi: 'मारवाड़ शैली', en: 'Marwar School' },
          { hi: 'मेवाड़ शैली', en: 'Mewar School' },
          { hi: 'बूंदी शैली', en: 'Bundi School' }
        ],
        correctOption: 0,
        explanationHi: 'बनी-ठनी का चित्रण निहालचंद द्वारा राजा सावंत सिंह (नागरीदास) के समय किशनगढ़ शैली में किया गया था। इसे भारत की मोनालिसा कहा जाता है।',
        explanationEn: 'Bani Thani was painted by Nihal Chand during the reign of Sawant Singh in Kishangarh style. It is known as the Mona Lisa of India.'
      },
      {
        questionHi: 'हल्दीघाटी का ऐतिहासिक युद्ध किस वर्ष लड़ा गया था?',
        questionEn: 'In which year was the historic Battle of Haldighati fought?',
        options: [
          { hi: '1576 ई.', en: '1576 AD' },
          { hi: '1527 ई.', en: '1527 AD' },
          { hi: '1582 ई.', en: '1582 AD' },
          { hi: '1568 ई.', en: '1568 AD' }
        ],
        correctOption: 0,
        explanationHi: 'हल्दीघाटी का प्रसिद्ध युद्ध 18 जून 1576 (कुछ स्रोतों में 21 जून) को महाराणा प्रताप और अकबर की सेना (मानसिंह) के बीच लड़ा गया था।',
        explanationEn: 'The Battle of Haldighati was fought in June 1576 between Maharana Pratap and the Mughal army led by Man Singh.'
      },
      {
        questionHi: 'राजस्थान में 1857 की क्रांति की शुरुआत सर्वप्रथम किस छावनी से हुई थी?',
        questionEn: 'From which cantonment did the 1857 revolution begin in Rajasthan?',
        options: [
          { hi: 'नसीराबाद', en: 'Naseerabad' },
          { hi: 'नीमच', en: 'Neemuch' },
          { hi: 'एरिनपुरा', en: 'Erinpura' },
          { hi: 'ब्यावर', en: 'Beawar' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान में 1857 के प्रथम स्वतंत्रता संग्राम की शुरुआत 28 मई 1857 को नसीराबाद छावनी से 15वीं बंगाल नेटिव इन्फैंट्री द्वारा हुई थी।',
        explanationEn: 'The Revolt of 1857 in Rajasthan started on 28 May 1857 from Naseerabad Cantonment by the 15th Bengal Native Infantry.'
      }
    ]
  },
  {
    slug: 'rajasthan-polity-administration-test',
    titleHi: 'राजस्थान राज्य व्यवस्था एवं प्रशासनिक ढांचा टेस्ट',
    titleEn: 'Rajasthan Polity & Administrative Governance Test',
    descriptionHi: 'राज्यपाल, मुख्यमंत्री, राजस्थान विधानसभा, RPSC व पंचायती राज व्यवस्था पर आधारित महत्वपूर्ण प्रश्न।',
    descriptionEn: 'Important test on Governor, Chief Minister, Vidhan Sabha, RPSC and Panchayati Raj in Rajasthan.',
    durationMinutes: 10,
    isActive: true,
    questions: [
      {
        questionHi: 'राजस्थान लोक सेवा आयोग (RPSC) के अध्यक्ष व सदस्यों की नियुक्ति किसके द्वारा की जाती है?',
        questionEn: 'Who appoints the Chairman and members of the Rajasthan Public Service Commission (RPSC)?',
        options: [
          { hi: 'राज्यपाल द्वारा', en: 'By the Governor' },
          { hi: 'मुख्यमंत्री द्वारा', en: 'By the Chief Minister' },
          { hi: 'राष्ट्रपति द्वारा', en: 'By the President' },
          { hi: 'उच्च न्यायालय के मुख्य न्यायाधीश द्वारा', en: 'By the Chief Justice of High Court' }
        ],
        correctOption: 0,
        explanationHi: 'संविधान के अनुच्छेद 316 के तहत राज्य लोक सेवा आयोग के अध्यक्ष व सदस्यों की नियुक्ति राज्य के राज्यपाल द्वारा की जाती है।',
        explanationEn: 'Under Article 316 of the Constitution, the Chairman and members of RPSC are appointed by the Governor of Rajasthan.'
      },
      {
        questionHi: 'भारत में पंचायती राज व्यवस्था का शुभारंभ राजस्थान के किस जिले से हुआ था?',
        questionEn: 'From which district of Rajasthan was the Panchayati Raj system inaugurated in India?',
        options: [
          { hi: 'नागौर', en: 'Nagaur' },
          { hi: 'सीकर', en: 'Sikar' },
          { hi: 'जयपुर', en: 'Jaipur' },
          { hi: 'अजमेर', en: 'Ajmer' }
        ],
        correctOption: 0,
        explanationHi: 'भारत में सर्वप्रथम त्रिस्तरीय पंचायती राज व्यवस्था का शुभारंभ 2 अक्टूबर 1959 को पंडित जवाहरलाल नेहरू द्वारा राजस्थान के नागौर जिले के बगदरी गांव से किया गया था।',
        explanationEn: 'Panchayati Raj was first launched on 2 October 1959 by Pt. Jawaharlal Nehru at Bagdari village in Nagaur district of Rajasthan.'
      },
      {
        questionHi: 'राजस्थान विधानसभा में कुल निर्वाचित सदस्यों की संख्या कितनी है?',
        questionEn: 'What is the total number of elected members in the Rajasthan Legislative Assembly?',
        options: [
          { hi: '200', en: '200' },
          { hi: '250', en: '250' },
          { hi: '160', en: '160' },
          { hi: '180', en: '180' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान विधानसभा में कुल 200 सीटें हैं। राजस्थान से लोकसभा में 25 एवं राज्यसभा में 10 सांसद निर्वाचित होते हैं।',
        explanationEn: 'The Rajasthan Legislative Assembly has 200 elected members. Rajasthan also sends 25 MPs to Lok Sabha and 10 to Rajya Sabha.'
      },
      {
        questionHi: 'राजस्थान राज्य मानवाधिकार आयोग का गठन किस वर्ष किया गया था?',
        questionEn: 'In which year was the Rajasthan State Human Rights Commission constituted?',
        options: [
          { hi: '2000 ई.', en: '2000 AD' },
          { hi: '1995 ई.', en: '1995 AD' },
          { hi: '2005 ई.', en: '2005 AD' },
          { hi: '2010 ई.', en: '2010 AD' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान राज्य मानवाधिकार आयोग की अधिसूचना 18 जनवरी 1999 को जारी हुई तथा इसने मार्च 2000 से विधिवत कार्य करना प्रारंभ किया।',
        explanationEn: 'Notification was issued in January 1999 and the commission became fully operational in March 2000.'
      },
      {
        questionHi: 'राजस्थान के प्रथम मुख्यमंत्री कौन थे?',
        questionEn: 'Who was the first Chief Minister of Rajasthan?',
        options: [
          { hi: 'पंडित हीरालाल शास्त्री', en: 'Pt. Hiralal Shastri' },
          { hi: 'टीकाराम पालीवाल', en: 'Tikaram Paliwal' },
          { hi: 'जयनारायण व्यास', en: 'Jainarayan Vyas' },
          { hi: 'मोहनलाल सुखाड़िया', en: 'Mohanlal Sukhadia' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान के प्रथम मनोनीत मुख्यमंत्री पंडित हीरालाल शास्त्री थे। प्रथम निर्वाचित मुख्यमंत्री टीकाराम पालीवाल (1952) थे।',
        explanationEn: 'Pt. Hiralal Shastri was the first nominated Chief Minister of Rajasthan. Tikaram Paliwal was the first democratically elected CM.'
      }
    ]
  },
  {
    slug: 'general-science-current-affairs-test',
    titleHi: 'सामान्य विज्ञान एवं समसामयिकी टेस्ट 2026',
    titleEn: 'General Science & Rajasthan Current Affairs Test 2026',
    descriptionHi: 'दैनिक विज्ञान, पर्यावरण, नवीनतम सरकारी योजनाएं एवं राजस्थान समसामयिकी 2026।',
    descriptionEn: 'Daily science, environment, latest schemes and Rajasthan current events 2026.',
    durationMinutes: 10,
    isActive: true,
    questions: [
      {
        questionHi: 'रसोई गैस (LPG) में गंध हेतु किस यौगिक का उपयोग किया जाता है?',
        questionEn: 'Which compound is added to LPG for detection of leakage?',
        options: [
          { hi: 'एथिल मरकैप्टन (Ethyl Mercaptan)', en: 'Ethyl Mercaptan' },
          { hi: 'मेथेन', en: 'Methane' },
          { hi: 'क्लोरोफॉर्म', en: 'Chloroform' },
          { hi: 'कार्बन मोनोऑक्साइड', en: 'Carbon Monoxide' }
        ],
        correctOption: 0,
        explanationHi: 'एलपीजी गंधहीन होती है, अतः रिसाव की पहचान के लिए इसमें तीव्र गंध वाला एथिल मरकैप्टन (C2H5SH) मिलाया जाता है।',
        explanationEn: 'LPG is odorless; ethyl mercaptan is blended to detect gas leakages by smell.'
      },
      {
        questionHi: 'राजस्थान में ऊंट को राज्य पशु (पशुधन श्रेणी) का दर्जा किस वर्ष दिया गया?',
        questionEn: 'In which year was the Camel declared the State Animal of Rajasthan (Livestock Category)?',
        options: [
          { hi: '2014 ई.', en: '2014 AD' },
          { hi: '2011 ई.', en: '2011 AD' },
          { hi: '2018 ई.', en: '2018 AD' },
          { hi: '2008 ई.', en: '2008 AD' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान सरकार ने 30 जून 2014 को ऊंट को राज्य पशु (पशुधन श्रेणी) घोषित किया था।',
        explanationEn: 'Rajasthan Government officially declared the camel as the state animal under the livestock category in June 2014.'
      },
      {
        questionHi: 'मानव शरीर में रक्त का थक्का बनने (Clotting) में कौन सा विटामिन सहायक होता है?',
        questionEn: 'Which vitamin helps in blood clotting in the human body?',
        options: [
          { hi: 'विटामिन K', en: 'Vitamin K' },
          { hi: 'विटामिन A', en: 'Vitamin A' },
          { hi: 'विटामिन C', en: 'Vitamin C' },
          { hi: 'विटामिन D', en: 'Vitamin D' }
        ],
        correctOption: 0,
        explanationHi: 'विटामिन K (फाइलोक्विनोन) रक्त का थक्का बनाने वाले प्रोथ्रोम्बिन प्रोटीन के संश्लेषण में आवश्यक होता है।',
        explanationEn: 'Vitamin K is essential for the hepatic synthesis of prothrombin and factors vital for blood clotting.'
      },
      {
        questionHi: 'हाल ही में राजस्थान में घोषित "मुख्यमंत्री आयुष्मान आरोग्य योजना" का मुख्य उद्देश्य क्या है?',
        questionEn: 'What is the primary objective of Mukhyamantri Ayushman Arogya Yojana in Rajasthan?',
        options: [
          { hi: 'निःशुल्क कैशलेस ओपीडी व आईपीडी स्वास्थ्य बीमा उपचार', en: 'Free cashless OPD & IPD health insurance treatment' },
          { hi: 'निःशुल्क साइकिल वितरण', en: 'Free bicycle distribution' },
          { hi: 'कृषि ऋण माफी', en: 'Agriculture loan waiver' },
          { hi: 'सड़क सुरक्षा नियम', en: 'Road safety regulation' }
        ],
        correctOption: 0,
        explanationHi: 'यह योजना राजस्थान के प्रत्येक परिवार को संबद्ध राजकीय एवं निजी चिकित्सालयों में कैशलेस चिकित्सा उपचार सुरक्षा प्रदान करती है।',
        explanationEn: 'The scheme provides comprehensive cashless secondary and tertiary health treatment across network hospitals.'
      },
      {
        questionHi: 'सौर ऊर्जा उत्पादन क्षमता में भारत का शीर्ष राज्य कौन सा है?',
        questionEn: 'Which state leads India in installed solar power generation capacity?',
        options: [
          { hi: 'राजस्थान', en: 'Rajasthan' },
          { hi: 'गुजरात', en: 'Gujarat' },
          { hi: 'तमिलनाडु', en: 'Tamil Nadu' },
          { hi: 'कर्नाटक', en: 'Karnataka' }
        ],
        correctOption: 0,
        explanationHi: 'राजस्थान 20 गीगावाट से अधिक स्थापित सौर ऊर्जा क्षमता के साथ भारत में प्रथम स्थान पर है (भड़ला सोलर पार्क जोधपुर)।',
        explanationEn: 'Rajasthan ranks first in India in solar energy generation capacity with ultra mega solar projects like Bhadla.'
      }
    ]
  },
  {
    slug: 'hindi-grammar-patwari-cet-test',
    titleHi: 'सामान्य हिंदी व्याकरण टेस्ट (CET, LDC व पटवारी)',
    titleEn: 'General Hindi Grammar Test for CET, LDC & Patwari',
    descriptionHi: 'संधि, समास, पर्यायवाची, विलोम शब्द, मुहावरे एवं वाक्य शुद्धि पर आधारित वस्तुनिष्ठ प्रश्न।',
    descriptionEn: 'Objective questions on Sandhi, Samas, synonyms, antonyms, and sentence correction for competitive exams.',
    durationMinutes: 8,
    isActive: true,
    questions: [
      {
        questionHi: '"पवन" शब्द का सही संधि-विच्छेद क्या होगा?',
        questionEn: 'What is the correct Sandhi-Vichchhed of the word "Pawan"?',
        options: [
          { hi: 'पो + अन', en: 'Po + An' },
          { hi: 'पौ + अन', en: 'Pau + An' },
          { hi: 'प + अन', en: 'Pa + An' },
          { hi: 'पव + न', en: 'Pav + Na' }
        ],
        correctOption: 0,
        explanationHi: 'अयादि स्वर संधि के नियमानुसार ओ + अ मिलकर अव बनता है, अतः पो + अन = पवन। (पौ + अन = पावन होता है)।',
        explanationEn: 'According to Ayadi Swar Sandhi, "Po + An" combines to form "Pawan".'
      },
      {
        questionHi: '"यथाशक्ति" शब्द में कौन सा समास है?',
        questionEn: 'Which Samas is present in the compound word "Yathashakti"?',
        options: [
          { hi: 'अव्ययीभाव समास', en: 'Avyayibhav Samas' },
          { hi: 'तत्पुरुष समास', en: 'Tatpurush Samas' },
          { hi: 'कर्मधारय समास', en: 'Karmadharay Samas' },
          { hi: 'द्विगु समास', en: 'Digu Samas' }
        ],
        correctOption: 0,
        explanationHi: 'जिस समास का प्रथम पद अव्यय/उपसर्ग हो और वही प्रधान हो, वह अव्ययीभाव समास कहलाता है। यथाशक्ति = शक्ति के अनुसार।',
        explanationEn: '"Yathashakti" means according to capacity; since "Yatha" is an avyaya, it is Avyayibhav Samas.'
      },
      {
        questionHi: 'निम्नलिखित में से "बादल" का पर्यायवाची शब्द कौन सा है?',
        questionEn: 'Which of the following is a synonym of "Cloud" (Badal)?',
        options: [
          { hi: 'जलद', en: 'Jalad' },
          { hi: 'जलज', en: 'Jalaj' },
          { hi: 'जलधि', en: 'Jaladhi' },
          { hi: 'वारिज', en: 'Vaarij' }
        ],
        correctOption: 0,
        explanationHi: 'जलद (जल देने वाला) = बादल। जलज = कमल, जलधि = समुद्र।',
        explanationEn: '"Jalad" (water-bearer) means cloud, whereas Jalaj means lotus and Jaladhi means ocean.'
      },
      {
        questionHi: '"अंधे के हाथ बटेर लगना" मुहावरे का सही अर्थ क्या है?',
        questionEn: 'What is the meaning of the idiom "Andhe ke haath bater lagna"?',
        options: [
          { hi: 'अयोग्य व्यक्ति को अनायास मूल्यवान वस्तु मिल जाना', en: 'Ineligible person unexpectedly getting something valuable' },
          { hi: 'बिना परिश्रम के कुछ न मिलना', en: 'Getting nothing without labor' },
          { hi: 'शिकार करना', en: 'Hunting' },
          { hi: 'अंधेरा छा जाना', en: 'Darkness spreading' }
        ],
        correctOption: 0,
        explanationHi: 'इस मुहावरे का अर्थ बिना योग्यता या अनायास ही किसी को कोई उत्तम या मूल्यवान वस्तु प्राप्त हो जाना है।',
        explanationEn: 'It signifies an undeserving person unexpectedly gaining a valuable reward or fortune.'
      },
      {
        questionHi: 'निम्नलिखित में से शुद्ध वर्तनी वाला शब्द छांटिए:',
        questionEn: 'Identify the word with correct spelling:',
        options: [
          { hi: 'उज्ज्वल', en: 'Ujjwal' },
          { hi: 'उज्वल', en: 'Ujwal' },
          { hi: 'उज्जवल', en: 'Ujjawal' },
          { hi: 'उज्वल्य', en: 'Ujwaly' }
        ],
        correctOption: 0,
        explanationHi: 'उज्ज्वल में दोनों \'ज\' आधे (हलंत) होते हैं (उत् + ज्वल = उज्ज्वल)। यह प्रतियोगी परीक्षाओं का अति-महत्वपूर्ण प्रश्न है।',
        explanationEn: 'In standard Hindi orthography, "उज्ज्वल" correctly features two half "j" letters.'
      }
    ]
  }
];

for (const test of newMcqTests) {
  const [insertedTest] = await sql`
    INSERT INTO mcq_tests (
      slug, title_hi, title_en, description_hi, description_en, duration_minutes, is_active
    )
    VALUES (
      ${test.slug}, ${test.titleHi}, ${test.titleEn}, ${test.descriptionHi}, ${test.descriptionEn}, ${test.durationMinutes}, ${test.isActive}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title_hi = EXCLUDED.title_hi,
      title_en = EXCLUDED.title_en,
      description_hi = EXCLUDED.description_hi,
      description_en = EXCLUDED.description_en,
      duration_minutes = EXCLUDED.duration_minutes,
      is_active = EXCLUDED.is_active,
      updated_at = now()
    RETURNING id;
  `;

  // Delete existing questions for this test and re-insert
  await sql`DELETE FROM mcq_questions WHERE test_id = ${insertedTest.id};`;

  for (let i = 0; i < test.questions.length; i++) {
    const q = test.questions[i];
    await sql`
      INSERT INTO mcq_questions (
        test_id, question_hi, question_en, options_json, correct_option, explanation_hi, explanation_en, order_index
      )
      VALUES (
        ${insertedTest.id}, ${q.questionHi}, ${q.questionEn},
        ${JSON.stringify(q.options)}, ${q.correctOption},
        ${q.explanationHi}, ${q.explanationEn}, ${i}
      );
    `;
  }
  console.log(`  ✅ [MCQ Test] ${test.slug} (${test.questions.length} questions)`);
}

// ==========================================
// 11. MIRROR TO LOCAL JSON FILES FOR INSTANT FALLBACK CACHE
// ==========================================
console.log('\nMirroring all notices & tests to local JSON files (src/data/notices.json & src/data/mcq-tests.json)...');

const allDbNotices = await sql`
  SELECT 
    n.id, n.slug, n.state, n.notice_type as "noticeType", n.status, 
    n.published_at as "publishedAt", n.expires_at as "expiresAt",
    n.is_featured as "isFeatured", n.is_breaking as "isBreaking",
    n.updated_at as "updatedAt",
    a.slug as "agencyId", a.name_en as "agencyName",
    c.slug as "categoryId", c.name_en as "categoryName",
    r.revision_number as "revisionNumber", r.title_hi as "titleHi", r.title_en as "titleEn", 
    r.summary_hi as "summaryHi", r.summary_en as "summaryEn",
    r.facts_json as "facts", r.sections_json as "sections", r.links_json as "links"
  FROM notices n
  LEFT JOIN agencies a ON n.agency_id = a.id
  LEFT JOIN categories c ON n.category_id = c.id
  LEFT JOIN notice_revisions r ON r.notice_id = n.id
  ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC;
`;

const formattedNotices = allDbNotices.map(r => ({
  id: r.id,
  slug: r.slug,
  titleHi: r.titleHi || '',
  titleEn: r.titleEn || '',
  agencyId: r.agencyId || 'rssb',
  agencyName: r.agencyName || (r.agencyId || '').toUpperCase(),
  categoryId: r.categoryId || 'administrative',
  categoryName: r.categoryName || r.categoryId || 'General',
  state: r.state === 'central' ? 'central' : 'rajasthan',
  noticeType: r.noticeType || 'vacancy',
  status: r.status === 'active' ? 'active' : 'inactive',
  revisionNumber: r.revisionNumber || 1,
  summaryHi: r.summaryHi || '',
  summaryEn: r.summaryEn || '',
  facts: r.facts || {},
  sections: r.sections || [],
  links: r.links || [],
  publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : new Date().toISOString(),
  expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
  isFeatured: Boolean(r.isFeatured),
  isBreaking: Boolean(r.isBreaking),
  updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString()
}));

const noticesPath = path.join(rootDir, 'src', 'data', 'notices.json');
fs.writeFileSync(noticesPath, JSON.stringify(formattedNotices, null, 2), 'utf-8');
console.log(`  💾 Saved ${formattedNotices.length} notices to src/data/notices.json`);

// Fetch tests and questions for mcq-tests.json
const allDbTests = await sql`SELECT * FROM mcq_tests ORDER BY created_at ASC;`;
const allDbQuestions = await sql`SELECT * FROM mcq_questions ORDER BY test_id, order_index ASC;`;

const formattedTests = allDbTests.map(t => {
  const qList = allDbQuestions
    .filter(q => q.test_id === t.id)
    .map(q => ({
      id: q.id,
      questionHi: q.question_hi,
      questionEn: q.question_en,
      options: q.options_json,
      correctOption: q.correct_option,
      explanationHi: q.explanation_hi,
      explanationEn: q.explanation_en,
      orderIndex: q.order_index
    }));
  return {
    id: t.id,
    slug: t.slug,
    titleHi: t.title_hi,
    titleEn: t.title_en,
    descriptionHi: t.description_hi,
    descriptionEn: t.description_en,
    durationMinutes: t.duration_minutes,
    isActive: t.is_active,
    questions: qList
  };
});

const mcqPath = path.join(rootDir, 'src', 'data', 'mcq-tests.json');
fs.writeFileSync(mcqPath, JSON.stringify(formattedTests, null, 2), 'utf-8');
console.log(`  💾 Saved ${formattedTests.length} tests to src/data/mcq-tests.json`);

console.log('\n✨ ALL MOCK DATA SEEDED AND MIRRORED SUCCESSFULLY!');
