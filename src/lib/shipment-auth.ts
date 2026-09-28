import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { findShipperById } from "@/lib/portal-db";

export const SHIPMENT_COOKIE = "peternity_shipment";
const WEEK = 60 * 60 * 24 * 7;

const DEFAULT_USERNAME = "shipment";
const DEFAULT_PASSWORD = "Peternity@Ship2026";

function expectedUsername() {
  return (process.env.SHIPMENT_USERNAME || DEFAULT_USERNAME).trim().toLowerCase();
}

function expectedPassword() {
  return process.env.SHIPMENT_PASSWORD || DEFAULT_PASSWORD;
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SHIPMENT_PASSWORD ||
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

export function verifyShipmentCredentials(
  username: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const userOk = safeEqual(username.trim().toLowerCase(), expectedUsername());
  const passwordOk = safeEqual(password, expectedPassword());
  if (!userOk || !passwordOk) {
    return { ok: false, error: "Invalid username or password" };
  }
  return { ok: true };
}

export function createShipmentToken(username: string) {
  const exp = Date.now() + WEEK * 1000;
  const payload = encodePayload(JSON.stringify({ user: username.trim().toLowerCase(), role: "shipment", exp }));
  return `${payload}.${hmac(payload)}`;
}

export function createShipmentAccountToken(account: { id: string; email: string }) {
  const exp = Date.now() + WEEK * 1000;
  const payload = encodePayload(
    JSON.stringify({
      id: account.id,
      email: account.email.trim().toLowerCase(),
      role: "shipment",
      exp,
    })
  );
  return `${payload}.${hmac(payload)}`;
}

export function shipmentCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  };
}

export function applyShipmentCookie(res: NextResponse, username: string) {
  res.cookies.set(SHIPMENT_COOKIE, createShipmentToken(username), shipmentCookieOptions());
  return res;
}

export function applyShipmentAccountCookie(res: NextResponse, account: { id: string; email: string }) {
  res.cookies.set(SHIPMENT_COOKIE, createShipmentAccountToken(account), shipmentCookieOptions());
  return res;
}

export function readShipmentSession(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(hmac(payload), signature)) return null;
  try {
    const data = JSON.parse(decodePayload(payload)) as {
      id?: string;
      email?: string;
      user?: string;
      role?: string;
      exp: number;
    };
    if (!data.exp || data.exp < Date.now() || data.role !== "shipment") return null;
    if (data.id && data.email) {
      const email = data.email.trim().toLowerCase();
      return { id: data.id, email, user: email, exp: data.exp };
    }
    const user = (data.user || "").trim().toLowerCase();
    if (!user || !safeEqual(user, expectedUsername())) return null;
    return { user, exp: data.exp };
  } catch {
    return null;
  }
}

export type ShipmentSession = {
  user: string;
  id?: string;
  name?: string;
  email?: string;
};

export async function getShipmentSession(): Promise<ShipmentSession | null> {
  try {
    const jar = await cookies();
    const token = readShipmentSession(jar.get(SHIPMENT_COOKIE)?.value);
    if (!token) return null;
    if (!token.id || !token.email) {
      return token.user ? { user: token.user } : null;
    }
    const account = await findShipperById(token.id);
    if (!account?.email || account.email.trim().toLowerCase() !== token.email) return null;
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      user: account.email,
    };
  } catch {
    return null;
  }
}
