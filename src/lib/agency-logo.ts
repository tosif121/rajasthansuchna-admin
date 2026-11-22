export const AGENCY_LOGO_PREFIX = "agencies/";

export function agencyLogoUrl(asset?: string | null, origin?: string): string {
  if (!asset) return "";
  if (/^(data:|https?:\/\/|\/)/.test(asset)) return asset;
  const path = `/api/v1/agencies/logo?key=${encodeURIComponent(asset)}`;
  return origin ? `${origin}${path}` : path;
}
