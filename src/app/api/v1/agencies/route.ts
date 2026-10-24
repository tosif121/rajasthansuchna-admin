import { NextResponse } from 'next/server';

const agencies = [
  { id: 'agency_rsmssb', slug: 'rsmssb', nameHi: 'राजस्थान कर्मचारी चयन बोर्ड', nameEn: 'RSMSSB', code: 'RSMSSB', parentGroup: 'rajasthan', officialUrl: 'https://rsmssb.rajasthan.gov.in' },
  { id: 'agency_rpsc', slug: 'rpsc', nameHi: 'राजस्थान लोक सेवा आयोग', nameEn: 'RPSC', code: 'RPSC', parentGroup: 'rajasthan', officialUrl: 'https://rpsc.rajasthan.gov.in' },
  { id: 'agency_police', slug: 'rajasthan-police', nameHi: 'राजस्थान पुलिस मुख्यालय', nameEn: 'Rajasthan Police', code: 'POLICE', parentGroup: 'rajasthan', officialUrl: 'https://police.rajasthan.gov.in' },
  { id: 'agency_ssc', slug: 'ssc', nameHi: 'कर्मचारी चयन आयोग', nameEn: 'Staff Selection Commission (SSC)', code: 'SSC', parentGroup: 'central', officialUrl: 'https://ssc.gov.in' },
  { id: 'agency_rrb', slug: 'rrb', nameHi: 'रेलवे भर्ती बोर्ड', nameEn: 'Railway Recruitment Board (RRB)', code: 'RRB', parentGroup: 'central', officialUrl: 'https://rrbcdg.gov.in' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: agencies });
}
