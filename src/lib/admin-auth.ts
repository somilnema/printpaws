import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "peternity_admin";
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
  const left = Buffer.from(hmac(`cmp:${a}`));
  const right = Buffer.from(hmac(`cmp:${b}`));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function encodePayload(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodePayload(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function verifyAdminCredentials(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const expectedE = expectedEmail();
  const expectedP = expectedPassword();
  if (!expectedE || !expectedP) {
    return {
      ok: false,
      error: "Admin login is not configured on the server. Add ADMIN_EMAIL and ADMIN_PASSWORD in the host environment.",
    };
  }
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedE);
  const passwordOk = safeEqual(password, expectedP);
  if (!emailOk || !passwordOk) {
    return { ok: false, error: "Invalid email or password" };
  }
  return { ok: true };
}

export function createAdminToken(email: string) {
  const exp = Date.now() + WEEK * 1000;
  const payload = encodePayload(JSON.stringify({ email: email.trim().toLowerCase(), exp }));
  return `${payload}.${hmac(payload)}`;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  };
}

export function applyAdminCookie(res: NextResponse, email: string) {
  res.cookies.set(ADMIN_COOKIE, createAdminToken(email), adminCookieOptions());
  return res;
}

export function readAdminSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(hmac(payload), signature)) return null;
  try {
    const data = JSON.parse(decodePayload(payload)) as { email: string; exp: number };
    if (!data.exp || data.exp < Date.now()) return null;
    if (!expectedEmail() || !safeEqual(data.email.trim().toLowerCase(), expectedEmail())) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  try {
    const jar = await cookies();
    return readAdminSession(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return null;
  }
}
