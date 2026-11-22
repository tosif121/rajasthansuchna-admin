import { randomUUID } from "node:crypto";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";
import { AGENCY_LOGO_PREFIX } from "@/lib/agency-logo";

const BUCKET = "uploads";
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function files() {
  return new Files({ adapter: neon({ bucket: BUCKET }) });
}

export function isAgencyLogoKey(key: string): boolean {
  return key.startsWith(AGENCY_LOGO_PREFIX) && !key.includes("..") && !key.includes("\\");
}

export async function saveAgencyLogo(file: File): Promise<string> {
  const extension = EXTENSIONS[file.type];
  if (!extension) throw new Error("UNSUPPORTED_TYPE");
  if (file.size === 0 || file.size > MAX_BYTES) throw new Error("INVALID_SIZE");

  const key = `${AGENCY_LOGO_PREFIX}${randomUUID()}.${extension}`;
  await files().upload(key, new Uint8Array(await file.arrayBuffer()), {
    contentType: file.type,
  });
  return key;
}

export async function readAgencyLogo(key: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (!isAgencyLogoKey(key)) throw new Error("INVALID_KEY");
  const file = await files().download(key);
  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    contentType: file.type || "application/octet-stream",
  };
}

export async function deleteAgencyLogo(key: string): Promise<void> {
  if (!isAgencyLogoKey(key)) throw new Error("INVALID_KEY");
  await files().delete(key);
}
