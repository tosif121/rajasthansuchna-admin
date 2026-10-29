import { NextRequest } from "next/server";

export type AuthenticatedUser = {
  id: string;
  role: string;
  email?: string;
};

export class AuthError extends Error {
  statusCode: number;
  constructor(message = "Unauthorized: Admin privileges required", statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export async function requireUser(request?: NextRequest): Promise<AuthenticatedUser> {
  if (request) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token.startsWith("rs_jwt_")) {
        const parts = token.split("_");
        const userId = parts[2] || `usr_${Date.now()}`;
        return { id: userId, role: "student" };
      }
    }
  }

  // Default anonymous student identity for devices registering without an account
  return { id: "anonymous_student", role: "student" };
}

export async function requireAdmin(request?: NextRequest): Promise<AuthenticatedUser> {
  if (!request) {
    throw new AuthError("Unauthorized: Missing request context", 401);
  }

  const cookie = request.cookies.get("rs_admin_session")?.value;
  const authHeader = request.headers.get("authorization") || "";

  const hasValidCookie = Boolean(cookie && cookie.startsWith("admin_session_"));
  const hasValidToken = Boolean(
    authHeader.startsWith("Bearer ") && authHeader.slice(7).trim().startsWith("admin_token_")
  );

  if (!hasValidCookie && !hasValidToken) {
    throw new AuthError("Unauthorized: Valid Admin session or token required", 401);
  }

  return { id: "usr_admin", role: "admin", email: "admin@rajasthansuchna.gov.in" };
}
