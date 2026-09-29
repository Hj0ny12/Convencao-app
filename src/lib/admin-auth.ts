import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  signSession,
  verifySession,
} from "@/lib/admin-session";

export async function readAdminToken() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || !(await verifySession(token, secret))) return null;
  return token;
}

export async function requireAdmin() {
  const token = await readAdminToken();
  if (!token) redirect("/admin/login");
  return token;
}

export async function setAdminCookie() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("missing session secret");
  const token = await signSession(secret);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(ADMIN_COOKIE);
}
