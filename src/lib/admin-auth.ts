import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "peternity_admin";
const WEEK = 60 * 60 * 24 * 7;

function expectedEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

function expectedPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.SUPABASE_SECRET_KEY ||
    "peternity-admin-dev"
  );
}

function hmac(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = hmac(`cmp:${a}`);
  const right = hmac(`cmp:${b}`);
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedE = expectedEmail();
  const expectedP = expectedPassword();
  if (!expectedE || !expectedP) {
    throw new Error("Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  }
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedE);
  const passwordOk = safeEqual(password, expectedP);
  return emailOk && passwordOk;
}

function signSession(email: string) {
  const exp = Date.now() + WEEK * 1000;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function readAdminSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(hmac(payload), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      exp: number;
    };
    if (!data.exp || data.exp < Date.now()) return null;
    if (!safeEqual(data.email.trim().toLowerCase(), expectedEmail())) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  return readAdminSession(jar.get(COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function setAdminSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, signSession(email.trim().toLowerCase()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
