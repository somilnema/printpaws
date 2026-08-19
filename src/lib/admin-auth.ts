import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "peternity_admin";
const WEEK = 60 * 60 * 24 * 7;

const DEFAULT_USERNAME = "peternity";
const DEFAULT_PASSWORD = "Peternity@Admin2026";

function expectedUsername() {
  return (
    process.env.ADMIN_USERNAME ||
    process.env.ADMIN_EMAIL ||
    DEFAULT_USERNAME
  )
    .trim()
    .toLowerCase();
}

function expectedPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
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

export function verifyAdminCredentials(
  username: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const expectedU = expectedUsername();
  const expectedP = expectedPassword();
  const userOk = safeEqual(username.trim().toLowerCase(), expectedU);
  const passwordOk = safeEqual(password, expectedP);
  if (!userOk || !passwordOk) {
    return { ok: false, error: "Invalid username or password" };
  }
  return { ok: true };
}

export function createAdminToken(username: string) {
  const exp = Date.now() + WEEK * 1000;
  const payload = encodePayload(
    JSON.stringify({ user: username.trim().toLowerCase(), exp })
  );
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

export function applyAdminCookie(res: NextResponse, username: string) {
  res.cookies.set(ADMIN_COOKIE, createAdminToken(username), adminCookieOptions());
  return res;
}

export function readAdminSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(hmac(payload), signature)) return null;
  try {
    const data = JSON.parse(decodePayload(payload)) as {
      user?: string;
      email?: string;
      exp: number;
    };
    if (!data.exp || data.exp < Date.now()) return null;
    const user = (data.user || data.email || "").trim().toLowerCase();
    if (!user || !safeEqual(user, expectedUsername())) return null;
    return { user, exp: data.exp };
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
