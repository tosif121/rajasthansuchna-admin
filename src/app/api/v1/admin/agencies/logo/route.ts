import { NextRequest, NextResponse } from "next/server";
import { deleteAgencyLogo, saveAgencyLogo } from "@/lib/server/agency-logos";
import { agencyLogoUrl } from "@/lib/agency-logo";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "An image file is required." }, { status: 400 });
    }

    const key = await saveAgencyLogo(file);
    return NextResponse.json({
      success: true,
      key,
      url: agencyLogoUrl(key),
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "UNSUPPORTED_TYPE" || code === "INVALID_SIZE") {
      return NextResponse.json(
        {
          success: false,
          error:
            code === "UNSUPPORTED_TYPE"
              ? "Only PNG, JPG, WebP and SVG images are supported."
              : "Image must be between 1 byte and 2 MB.",
        },
        { status: 400 }
      );
    }
    console.error("Agency logo upload failed:", err);
    return NextResponse.json({ success: false, error: "Failed to upload image." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const key = new URL(req.url).searchParams.get("key") || "";
    if (!key) {
      return NextResponse.json({ success: false, error: "An image key is required." }, { status: 400 });
    }

    await deleteAgencyLogo(key);
    return NextResponse.json({ success: true, key });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "INVALID_KEY") {
      return NextResponse.json({ success: false, error: "Invalid image key." }, { status: 400 });
    }
    console.error("Agency logo delete failed:", err);
    return NextResponse.json({ success: false, error: "Failed to delete image." }, { status: 500 });
  }
}
