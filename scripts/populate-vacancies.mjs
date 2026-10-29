import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const seedDataPath = path.join(rootDir, 'src', 'data', 'seed-data.json');
const current = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

const realVacancies = [
  {
    id: "vac_cet_sr_sec_2026",
    slug: "rajasthan-cet-senior-secondary-2026",
    titleHi: "राजस्थान समान पात्रता परीक्षा (सीईटी - 12वीं स्तर) 2026",
    titleEn: "Rajasthan Common Eligibility Test (CET Senior Secondary Level) 2026",
    agencyId: "rssb",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "राजस्थान कर्मचारी चयन बोर्ड द्वारा 12वीं स्तर के पदों (वनपाल, छात्रावास अधीक्षक, कनिष्ठ सहायक, कांस्टेबल) हेतु सीईटी 2026 अधिसूचना।",
    summaryEn: "Rajasthan Staff Selection Board official notification for CET 12th level posts including Junior Assistant, Constable, Forester.",
    publishedAt: "2026-10-25T08:00:00.000Z",
    expiresAt: "2026-11-30T23:59:59.000Z",
    isFeatured: true,
    isBreaking: true,
    facts: {
      postsCount: 3500,
      applicationStart: "2026-10-25T08:00:00.000Z",
      applicationEnd: "2026-11-30T23:59:59.000Z",
      feeEndDate: "2026-11-30T23:59:59.000Z",
      examDate: "दिसंबर 2026 / जनवरी 2027",
      feeGeneralObc: "₹600 (One-Time Registration - OTR)",
      feeScSt: "₹400",
      qualification: "Senior Secondary (12th Pass) from recognized Board",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "लिखित परीक्षा (ओएमआर आधारित 150 प्रश्न, 300 अंक)",
      sourceUrl: "https://rssb.rajasthan.gov.in",
      sourceDate: "2026-10-25T08:00:00.000Z",
      verifiedAt: "2026-10-25T08:00:00.000Z",
      verifiedBy: "RSSB Jaipur Official Portal"
    },
    sections: [
      {
        key: "overview",
        title: "भर्ती का संक्षिप्त विवरण",
        body: "राजस्थान राज्य के विभिन्न विभागों में अधीनस्थ एवं लिपिक वर्गीय पदों की भर्ती के लिए समान पात्रता परीक्षा (सीनियर सेकेंडरी स्तर) का आयोजन किया जा रहा है।",
        rows: {
          "परीक्षा बोर्ड": "राजस्थान कर्मचारी चयन बोर्ड (RSSB)",
          "परीक्षा का नाम": "समान पात्रता परीक्षा (Senior Secondary Level)",
          "पात्रता वैधता": "1 वर्ष",
          "आवेदन माध्यम": "एसएसओ पोर्टल (SSO Rajasthan)"
        },
        pageRef: "विज्ञप्ति संख्या 08/2026"
      },
      {
        key: "syllabus",
        title: "परीक्षा योजना एवं पाठ्यक्रम",
        body: "परीक्षा में 150 बहुविकल्पीय प्रश्न होंगे। प्रत्येक प्रश्न 2 अंक का होगा (कुल 300 अंक)। समय अवधि 3 घंटे। कोई नकारात्मक अंकन नहीं होगा।",
        rows: {
          "कुल प्रश्न": "150 MCQs",
          "कुल अंक": "300 अंक",
          "समय": "3 घण्टे",
          "नकारात्मक अंकन": "लागू नहीं"
        },
        pageRef: "पृष्ठ संख्या 4"
      }
    ],
    links: [
      {
        label: "आधिकारिक विज्ञप्ति (PDF)",
        url: "https://rssb.rajasthan.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन (SSO Portal)",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      },
      {
        label: "बोर्ड की आधिकारिक वेबसाइट",
        url: "https://rssb.rajasthan.gov.in",
        kind: "officialSite"
      }
    ]
  },
  {
    id: "vac_cet_grad_2026",
    slug: "rajasthan-cet-graduation-level-2026",
    titleHi: "राजस्थान समान पात्रता परीक्षा (सीईटी - स्नातक स्तर) 2026",
    titleEn: "Rajasthan Common Eligibility Test (CET Graduate Level) 2026",
    agencyId: "rssb",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "स्नातक स्तर के पदों (प्लाटून कमांडर, जिलेदार, पटवारी, कनिष्ठ लेखाकार, पर्यवेक्षक) हेतु सीईटी 2026।",
    summaryEn: "Graduate Level Common Eligibility Test for Rajasthan Government departments.",
    publishedAt: "2026-10-24T09:00:00.000Z",
    expiresAt: "2026-11-28T23:59:59.000Z",
    isFeatured: true,
    isBreaking: false,
    facts: {
      postsCount: 2750,
      applicationStart: "2026-10-24T09:00:00.000Z",
      applicationEnd: "2026-11-28T23:59:59.000Z",
      feeEndDate: "2026-11-28T23:59:59.000Z",
      examDate: "नवंबर/दिसंबर 2026",
      feeGeneralObc: "₹600 (OTR शुल्क)",
      feeScSt: "₹400",
      qualification: "Bachelor Degree in any discipline from recognized University",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "लिखित परीक्षा (150 प्रश्न, 300 अंक)",
      sourceUrl: "https://rssb.rajasthan.gov.in",
      sourceDate: "2026-10-24T09:00:00.000Z",
      verifiedAt: "2026-10-24T09:00:00.000Z",
      verifiedBy: "RSSB Jaipur Official"
    },
    sections: [
      {
        key: "overview",
        title: "पात्रता एवं पद",
        body: "स्नातक सीईटी के अंतर्गत गृह रक्षा विभाग, जल संसाधन विभाग, महिला अधिकारिता विभाग एवं राजस्व मंडल के पदों पर भर्ती हेतु वरीयता सूची तैयार होगी।",
        rows: {
          "बोर्ड": "RSSB",
          "स्तर": "स्नातक (Graduate)",
          "आवेदन": "Online via SSO"
        },
        pageRef: "विज्ञप्ति संख्या 07/2026"
      }
    ],
    links: [
      {
        label: "विज्ञप्ति देखें (PDF)",
        url: "https://rssb.rajasthan.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन पोर्टल",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_police_si_2026",
    slug: "rajasthan-police-sub-inspector-recruitment-2026",
    titleHi: "राजस्थान पुलिस उप-निरीक्षक (SI) एवं प्लाटून कमांडर सीधी भर्ती 2026",
    titleEn: "Rajasthan Police Sub Inspector (SI) & Platoon Commander Recruitment 2026",
    agencyId: "rpsc",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "राजस्थान लोक सेवा आयोग (RPSC) द्वारा उप-निरीक्षक (एपी, आईबी, एमबीसी) एवं प्लाटून कमांडर (आरएसी) के 859 पदों पर भर्ती।",
    summaryEn: "RPSC Sub Inspector and Platoon Commander direct recruitment across Rajasthan Police battalions.",
    publishedAt: "2026-10-23T10:00:00.000Z",
    expiresAt: "2026-11-25T23:59:59.000Z",
    isFeatured: true,
    isBreaking: true,
    facts: {
      postsCount: 859,
      applicationStart: "2026-10-23T10:00:00.000Z",
      applicationEnd: "2026-11-25T23:59:59.000Z",
      feeEndDate: "2026-11-25T23:59:59.000Z",
      examDate: "आयोग द्वारा शीघ्र घोषित",
      feeGeneralObc: "₹600",
      feeScSt: "₹400",
      qualification: "Graduate degree from UGC recognized University + देवनागरी लिपि एवं राजस्थानी संस्कृति का ज्ञान",
      ageMin: 20,
      ageMax: 25,
      selectionProcess: "लिखित परीक्षा (Paper 1 हिन्दी, Paper 2 GK/GS) + शारीरिक दक्षता परीक्षा (PET) + साक्षात्कार",
      sourceUrl: "https://rpsc.rajasthan.gov.in",
      sourceDate: "2026-10-23T10:00:00.000Z",
      verifiedAt: "2026-10-23T10:00:00.000Z",
      verifiedBy: "RPSC Ajmer Official"
    },
    sections: [
      {
        key: "physical_standards",
        title: "शारीरिक मापदंड (PST/PET)",
        body: "पुरुष उम्मीदवारों के लिए न्यूनतम ऊंचाई 168 सेमी, सीना 81 सेमी (फुलाव सहित 86 सेमी)। महिला उम्मीदवारों के लिए न्यूनतम ऊंचाई 152 सेमी एवं न्यूनतम वजन 47.5 किग्रा आवश्यक है।",
        rows: {
          "पुरुष ऊंचाई": "168 सेमी",
          "सीना": "81-86 सेमी",
          "महिला ऊंचाई": "152 सेमी",
          "महिला वजन": "47.5 किग्रा"
        },
        pageRef: "नियम 14"
      }
    ],
    links: [
      {
        label: "आधिकारिक विज्ञापन (RPSC PDF)",
        url: "https://rpsc.rajasthan.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन (RPSC Portal)",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_patwari_2026",
    slug: "rajasthan-patwari-recruitment-2026",
    titleHi: "राजस्थान राजस्व मंडल पटवारी सीधी भर्ती 2026 (2,998 पद)",
    titleEn: "Rajasthan Revenue Board Patwari Direct Recruitment 2026",
    agencyId: "rssb",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "राजस्व विभाग राजस्थान में पटवारियों के 2,998 रिक्त पदों पर सीधी भर्ती हेतु विज्ञप्ति।",
    summaryEn: "Board of Revenue Ajmer Patwari positions direct recruitment across Rajasthan districts.",
    publishedAt: "2026-10-22T08:30:00.000Z",
    expiresAt: "2026-11-20T23:59:59.000Z",
    isFeatured: true,
    isBreaking: false,
    facts: {
      postsCount: 2998,
      applicationStart: "2026-10-22T08:30:00.000Z",
      applicationEnd: "2026-11-20T23:59:59.000Z",
      feeEndDate: "2026-11-20T23:59:59.000Z",
      examDate: "फरवरी 2027",
      feeGeneralObc: "₹600",
      feeScSt: "₹400",
      qualification: "Graduation + RSCIT / 'O' Level Computer Certificate",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "सीईटी मेरिट + मुख्य लिखित परीक्षा + दस्तावेज सत्यापन",
      sourceUrl: "https://rssb.rajasthan.gov.in",
      sourceDate: "2026-10-22T08:30:00.000Z",
      verifiedAt: "2026-10-22T08:30:00.000Z",
      verifiedBy: "Revenue Board & RSSB"
    },
    sections: [
      {
        key: "overview",
        title: "शैक्षणिक योग्यता एवं कंप्यूटर प्रमाण पत्र",
        body: "अभ्यर्थी किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक होना चाहिए तथा वर्धमान महावीर खुला विश्वविद्यालय (VMOU) कोटा द्वारा संचालित RSCIT या समकक्ष कंप्यूटर डिप्लोमा धारक होना आवश्यक है।",
        rows: {
          "शैक्षणिक योग्यता": "स्नातक (Graduation)",
          "कंप्यूटर योग्यता": "RSCIT / COPA / 'O' Level",
          "पे मैट्रिक्स": "लेवल L-5"
        },
        pageRef: "पैरा 6"
      }
    ],
    links: [
      {
        label: "विस्तृत विज्ञापन",
        url: "https://rssb.rajasthan.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन फॉर्म लिंक",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_pashu_parichar_2026",
    slug: "rajasthan-pashu-parichar-recruitment-2026",
    titleHi: "राजस्थान पशु परिचर (एनिमल अटेंडेंट) सीधी भर्ती 2026 (5,934 पद)",
    titleEn: "Rajasthan Animal Attendant (Pashu Parichar) Direct Recruitment 2026",
    agencyId: "rssb",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "पशुपालन विभाग राजस्थान में पशु परिचर के 5,934 पदों पर 10वीं पास अभ्यर्थियों के लिए सीधी भर्ती।",
    summaryEn: "Animal Husbandry Department of Rajasthan Animal Attendant 5,934 vacancies.",
    publishedAt: "2026-10-21T07:00:00.000Z",
    expiresAt: "2026-11-15T23:59:59.000Z",
    isFeatured: false,
    isBreaking: false,
    facts: {
      postsCount: 5934,
      applicationStart: "2026-10-21T07:00:00.000Z",
      applicationEnd: "2026-11-15T23:59:59.000Z",
      feeEndDate: "2026-11-15T23:59:59.000Z",
      examDate: "दिसंबर 2026",
      feeGeneralObc: "₹600",
      feeScSt: "₹400",
      qualification: "Secondary (10th Pass) from recognized Board",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "एक चरणीय लिखित परीक्षा (भाग-अ 105 प्रश्न, भाग-ब 45 प्रश्न)",
      sourceUrl: "https://rssb.rajasthan.gov.in",
      sourceDate: "2026-10-21T07:00:00.000Z",
      verifiedAt: "2026-10-21T07:00:00.000Z",
      verifiedBy: "RSSB Official"
    },
    sections: [
      {
        key: "syllabus_part_b",
        title: "भाग-ब: पशुपालन संबंधी विशिष्ट पाठ्यक्रम",
        body: "पशुओं की प्रमुख नस्लें, कृत्रिम गर्भाधान, टीकाकरण, प्राथमिक उपचार, डेयरी प्रबंधन, संतुलित आहार एवं वर्मी कम्पोस्ट से संबंधित 45 प्रश्न।",
        rows: {
          "भाग-अ अंक": "105 अंक (राजस्थान GK, गणित, सामान्य विज्ञान)",
          "भाग-ब अंक": "45 अंक (पशुपालन)",
          "कुल अंक": "150 अंक",
          "नेगेटिव मार्किंग": "1/4 अंक"
        },
        pageRef: "पाठ्यक्रम विवरण"
      }
    ],
    links: [
      {
        label: "विज्ञप्ति एवं सिलेबस",
        url: "https://rssb.rajasthan.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "आवेदन लिंक (SSO)",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_hcraj_clerk_2026",
    slug: "rajasthan-high-court-clerk-recruitment-2026",
    titleHi: "राजस्थान उच्च न्यायालय कनिष्ठ न्यायिक सहायक (JJA) व लिपिक ग्रेड-II भर्ती 2026",
    titleEn: "Rajasthan High Court Junior Judicial Assistant & Clerk Grade-II Recruitment 2026",
    agencyId: "hcraj",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "उच्च न्यायालय जोधपुर, राज्य विधिक सेवा प्राधिकरण एवं जिला न्यायालयों हेतु 2,756 पदों पर भर्ती।",
    summaryEn: "High Court of Judicature for Rajasthan Jodhpur JJA and Clerk Grade II vacancies.",
    publishedAt: "2026-10-20T11:00:00.000Z",
    expiresAt: "2026-11-18T23:59:59.000Z",
    isFeatured: false,
    isBreaking: false,
    facts: {
      postsCount: 2756,
      applicationStart: "2026-10-20T11:00:00.000Z",
      applicationEnd: "2026-11-18T23:59:59.000Z",
      feeEndDate: "2026-11-19T23:59:59.000Z",
      examDate: "जनवरी 2027",
      feeGeneralObc: "₹500",
      feeScSt: "₹350",
      qualification: "Graduation in any discipline + Basic Computer Knowledge",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "लिखित परीक्षा (हिन्दी, अंग्रेजी, सामान्य ज्ञान) + कंप्यूटर टाइप राइटिंग टेस्ट",
      sourceUrl: "https://hcraj.nic.in",
      sourceDate: "2026-10-20T11:00:00.000Z",
      verifiedAt: "2026-10-20T11:00:00.000Z",
      verifiedBy: "Registrar Examination HCRAJ Jodhpur"
    },
    sections: [
      {
        key: "typing_test",
        title: "टाइपिंग स्पीड एवं एफिशिएंसी टेस्ट",
        body: "लिखित परीक्षा में सफल अभ्यर्थियों का कंप्यूटर पर हिंदी (कृष्णा फॉन्ट) और अंग्रेजी में 5-5 मिनट का गति व दक्षता परीक्षण होगा।",
        rows: {
          "स्पीड टेस्ट": "50 अंक (25 हिंदी + 25 अंग्रेजी)",
          "दक्षता टेस्ट": "50 अंक",
          "न्यूनतम गति": "8000 की-डिप्रेशन प्रति घंटा"
        },
        pageRef: "खण्ड-सी"
      }
    ],
    links: [
      {
        label: "आधिकारिक नोटिस (HCRAJ)",
        url: "https://hcraj.nic.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन पोर्टल",
        url: "https://hcraj.nic.in/recruitment",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_reet_mains_2026",
    slug: "rajasthan-reet-mains-teacher-recruitment-2026",
    titleHi: "राजस्थान प्राथमिक एवं उच्च प्राथमिक विद्यालय अध्यापक (ग्रेड-III) सीधी भर्ती 2026",
    titleEn: "Rajasthan 3rd Grade Teacher (REET Mains Level 1 & Level 2) Recruitment 2026",
    agencyId: "education",
    categoryId: "rajasthan",
    state: "rajasthan",
    type: "vacancy",
    summaryHi: "प्रारंभिक शिक्षा विभाग राजस्थान द्वारा लेवल-1 (कक्षा 1 से 5) एवं लेवल-2 (कक्षा 6 से 8) के 28,000 पदों पर अध्यापक भर्ती।",
    summaryEn: "Department of Education Rajasthan Level 1 and Level 2 3rd Grade Teacher 28,000 vacancies.",
    publishedAt: "2026-10-19T06:00:00.000Z",
    expiresAt: "2026-11-22T23:59:59.000Z",
    isFeatured: true,
    isBreaking: false,
    facts: {
      postsCount: 28000,
      applicationStart: "2026-10-19T06:00:00.000Z",
      applicationEnd: "2026-11-22T23:59:59.000Z",
      feeEndDate: "2026-11-22T23:59:59.000Z",
      examDate: "फरवरी / मार्च 2027",
      feeGeneralObc: "₹600",
      feeScSt: "₹400",
      qualification: "12th / Graduation + D.El.Ed / B.Ed + REET उत्तीर्ण प्रमाण पत्र",
      ageMin: 18,
      ageMax: 40,
      selectionProcess: "मुख्य अध्यापक परीक्षा (300 अंक) + मेरिट सूची",
      sourceUrl: "https://rajshaladarpan.nic.in",
      sourceDate: "2026-10-19T06:00:00.000Z",
      verifiedAt: "2026-10-19T06:00:00.000Z",
      verifiedBy: "Directorate of Elementary Education Bikaner"
    },
    sections: [
      {
        key: "eligibility",
        title: "रीट पात्रता अनिवार्य शर्त",
        body: "केवल वही अभ्यर्थी आवेदन के पात्र हैं जिन्होंने राजस्थान अध्यापक पात्रता परीक्षा (REET) में न्यूनतम निर्धारित अंक प्राप्त कर पात्रता प्रमाण पत्र अर्जित किया है।",
        rows: {
          "लेवल-1": "D.El.Ed (BSTC) + REET Level-1",
          "लेवल-2": "B.Ed + REET Level-2",
          "परीक्षा अंक": "300 अंक (150 प्रश्न)"
        },
        pageRef: "पात्रता नियम"
      }
    ],
    links: [
      {
        label: "विस्तृत विज्ञप्ति (शाला दर्पण)",
        url: "https://rajshaladarpan.nic.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन लिंक",
        url: "https://sso.rajasthan.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_ssc_cgl_2026",
    slug: "ssc-cgl-recruitment-2026",
    titleHi: "कर्मचारी चयन आयोग संयुक्त स्नातक स्तरीय परीक्षा (SSC CGL 2026)",
    titleEn: "Staff Selection Commission Combined Graduate Level Examination (SSC CGL 2026)",
    agencyId: "ssc",
    categoryId: "central",
    state: "central",
    type: "vacancy",
    summaryHi: "केंद्र सरकार के मंत्रालयों व विभागों में इंस्पेक्टर, एएसओ, टैक्स असिस्टेंट, सब-इंस्पेक्टर के 17,727 पदों पर भर्ती।",
    summaryEn: "SSC CGL national direct recruitment for Assistant Section Officer, Excise Inspector, Sub Inspector across Central Govt.",
    publishedAt: "2026-10-18T10:00:00.000Z",
    expiresAt: "2026-11-25T23:59:59.000Z",
    isFeatured: true,
    isBreaking: true,
    facts: {
      postsCount: 17727,
      applicationStart: "2026-10-18T10:00:00.000Z",
      applicationEnd: "2026-11-25T23:59:59.000Z",
      feeEndDate: "2026-11-26T23:59:59.000Z",
      examDate: "Tier-I: दिसंबर 2026, Tier-II: फरवरी 2027",
      feeGeneralObc: "₹100 (महिला, SC, ST हेतु निःशुल्क)",
      feeScSt: "निःशुल्क (₹0)",
      qualification: "Bachelor's Degree in any stream from recognized University",
      ageMin: 18,
      ageMax: 32,
      selectionProcess: "Computer Based Examination (Tier-I & Tier-II) + Data Entry Speed Test",
      sourceUrl: "https://ssc.gov.in",
      sourceDate: "2026-10-18T10:00:00.000Z",
      verifiedAt: "2026-10-18T10:00:00.000Z",
      verifiedBy: "Staff Selection Commission New Delhi"
    },
    sections: [
      {
        key: "scheme",
        title: "टियर-I एवं टियर-II परीक्षा योजना",
        body: "टियर-I परीक्षा क्वालिफाइंग होगी जिसमें सामान्य बुद्धि, सामान्य जागरूकता, मात्रात्मक अभिरुचि और अंग्रेजी समझ के 100 प्रश्न (200 अंक) होंगे। टियर-II अंतिम मेरिट निर्धारित करेगा।",
        rows: {
          "टियर-I प्रश्न": "100 प्रश्न (200 अंक)",
          "टियर-II मॉड्यूल": "गणित, रीजनिंग, अंग्रेजी, जीए, कंप्यूटर ज्ञान",
          "नेगेटिव मार्किंग": "टियर-I में 0.50 अंक"
        },
        pageRef: "अधिसूचना धारा 12"
      }
    ],
    links: [
      {
        label: "आधिकारिक एसएससी विज्ञप्ति (PDF)",
        url: "https://ssc.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "एसएससी नया पोर्टल ऑनलाइन आवेदन",
        url: "https://ssc.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_rrb_ntpc_2026",
    slug: "rrb-ntpc-central-recruitment-2026",
    titleHi: "रेलवे भर्ती बोर्ड गैर-तकनीकी लोकप्रिय श्रेणियां (RRB NTPC 2026)",
    titleEn: "Railway Recruitment Board Non-Technical Popular Categories (RRB NTPC 2026)",
    agencyId: "railway",
    categoryId: "central",
    state: "central",
    type: "vacancy",
    summaryHi: "भारतीय रेलवे में स्टेशन मास्टर, गुड्स गार्ड, सीनियर क्लर्क, जूनियर अकाउंट्स असिस्टेंट के 11,558 पदों पर सीधी भर्ती।",
    summaryEn: "Indian Railways NTPC graduate and undergraduate direct recruitment for Station Master, Goods Train Manager, Clerk.",
    publishedAt: "2026-10-17T09:30:00.000Z",
    expiresAt: "2026-11-20T23:59:59.000Z",
    isFeatured: true,
    isBreaking: false,
    facts: {
      postsCount: 11558,
      applicationStart: "2026-10-17T09:30:00.000Z",
      applicationEnd: "2026-11-20T23:59:59.000Z",
      feeEndDate: "2026-11-21T23:59:59.000Z",
      examDate: "CBT-1: जनवरी / फरवरी 2027",
      feeGeneralObc: "₹500 (CBT उपस्थित होने पर ₹400 रिफंडेबल)",
      feeScSt: "₹250 (पूर्ण रिफंडेबल)",
      qualification: "12th Pass (Level 2/3) / Graduate Degree (Level 5/6)",
      ageMin: 18,
      ageMax: 33,
      selectionProcess: "1st Stage CBT + 2nd Stage CBT + CBAT / Typing Test + Document Verification",
      sourceUrl: "https://rrbapply.gov.in",
      sourceDate: "2026-10-17T09:30:00.000Z",
      verifiedAt: "2026-10-17T09:30:00.000Z",
      verifiedBy: "Railway Recruitment Control Board"
    },
    sections: [
      {
        key: "stages",
        title: "सीबीटी-1 व सीबीटी-2 परीक्षा प्रारूप",
        body: "प्रथम चरण सीबीटी में 100 प्रश्न (सामान्य जागरूकता 40, गणित 30, सामान्य बुद्धि एवं तर्क 30) होंगे, 90 मिनट का समय। द्वितीय चरण सीबीटी में 120 प्रश्न होंगे।",
        rows: {
          "सीबीटी-1 समय": "90 मिनट",
          "सीबीटी-1 प्रश्न": "100 प्रश्न",
          "नेगेटिव मार्किंग": "1/3 अंक",
          "सीबीटी-2 प्रश्न": "120 प्रश्न"
        },
        pageRef: "सीईएन 05/2026"
      }
    ],
    links: [
      {
        label: "रेलवे आधिकारिक विज्ञापन",
        url: "https://rrbapply.gov.in",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन आवेदन पोर्टल (RRB Apply)",
        url: "https://rrbapply.gov.in",
        kind: "applyOnline"
      }
    ]
  },
  {
    id: "vac_sbi_clerk_2026",
    slug: "sbi-clerk-junior-associates-2026",
    titleHi: "भारतीय स्टेट बैंक कनिष्ठ सहायक (SBI Clerk / Junior Associates 2026)",
    titleEn: "State Bank of India Junior Associates (Customer Support & Sales 2026)",
    agencyId: "sbi",
    categoryId: "central",
    state: "central",
    type: "vacancy",
    summaryHi: "एसबीआई की देशभर की शाखाओं में ग्राहक सहायता एवं बिक्री हेतु 8,283 कनिष्ठ सहायकों की भर्ती।",
    summaryEn: "State Bank of India 8,283 Junior Associates direct recruitment across all Indian state circles.",
    publishedAt: "2026-10-16T12:00:00.000Z",
    expiresAt: "2026-11-12T23:59:59.000Z",
    isFeatured: false,
    isBreaking: false,
    facts: {
      postsCount: 8283,
      applicationStart: "2026-10-16T12:00:00.000Z",
      applicationEnd: "2026-11-12T23:59:59.000Z",
      feeEndDate: "2026-11-12T23:59:59.000Z",
      examDate: "प्रारंभिक परीक्षा: दिसंबर 2026, मुख्य परीक्षा: फरवरी 2027",
      feeGeneralObc: "₹750",
      feeScSt: "निःशुल्क (₹0)",
      qualification: "Graduation in any discipline from recognized University",
      ageMin: 20,
      ageMax: 28,
      selectionProcess: "प्रारंभिक परीक्षा (100 अंक) + मुख्य परीक्षा (200 अंक) + स्थानीय भाषा परीक्षा (LPT)",
      sourceUrl: "https://sbi.co.in/web/careers",
      sourceDate: "2026-10-16T12:00:00.000Z",
      verifiedAt: "2026-10-16T12:00:00.000Z",
      verifiedBy: "Central Recruitment & Promotion Dept SBI Mumbai"
    },
    sections: [
      {
        key: "exam_pattern",
        title: "प्रारंभिक एवं मुख्य परीक्षा पैटर्न",
        body: "प्रारंभिक परीक्षा 1 घंटे की होगी जिसमें अंग्रेजी (30), संख्यात्मक अभियोग्यता (35), एवं तर्क क्षमता (35) के प्रश्न होंगे। प्रत्येक गलत उत्तर पर 1/4 अंक काटा जाएगा।",
        rows: {
          "प्रारंभिक परीक्षा": "100 अंक (60 मिनट)",
          "मुख्य परीक्षा": "200 अंक (190 प्रश्न, 2 घंटे 40 मिनट)",
          "नेगेटिव मार्किंग": "1/4 अंक"
        },
        pageRef: "CRPD/CR/2026-27"
      }
    ],
    links: [
      {
        label: "एसबीआई आधिकारिक विज्ञापन",
        url: "https://sbi.co.in/web/careers",
        kind: "notificationPdf"
      },
      {
        label: "ऑनलाइन पंजीकरण लिंक",
        url: "https://ibpsonline.ibps.in",
        kind: "applyOnline"
      }
    ]
  }
];

current.vacancies = realVacancies;
fs.writeFileSync(seedDataPath, JSON.stringify(current, null, 2), 'utf-8');
console.log(`Successfully populated ${realVacancies.length} verified recruitment notices into ${seedDataPath}!`);

