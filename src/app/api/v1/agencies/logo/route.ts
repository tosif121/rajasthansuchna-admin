import { NextRequest, NextResponse } from "next/server";
import { readAgencyLogo } from "@/lib/server/agency-logos";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  if (!key) {
    return NextResponse.json({ success: false, error: "Missing logo key." }, { status: 400 });
  }

  try {
    const { bytes, contentType } = await readAgencyLogo(key);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Logo not found." }, { status: 404 });
  }
}
