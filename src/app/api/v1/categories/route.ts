import { NextResponse } from 'next/server';

const categories = [
  { id: 'cat_police', slug: 'police-defence', nameHi: 'पुलिस एवं सुरक्षा', nameEn: 'Police & Defence', icon: 'shield' },
  { id: 'cat_revenue', slug: 'revenue-patwari', nameHi: 'राजस्व एवं पटवारी', nameEn: 'Revenue & Patwari', icon: 'landmark' },
  { id: 'cat_teaching', slug: 'teaching-reet', nameHi: 'शिक्षक भर्ती एवं REET', nameEn: 'Teaching & REET', icon: 'graduationCap' },
  { id: 'cat_administrative', slug: 'administrative-ras', nameHi: 'प्रशासनिक सेवाएं (RAS)', nameEn: 'Administrative (RAS)', icon: 'briefcase' },
  { id: 'cat_central', slug: 'central-jobs', nameHi: 'केन्द्र सरकार की नौकरियां', nameEn: 'Central Government Jobs', icon: 'flag' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: categories });
}
