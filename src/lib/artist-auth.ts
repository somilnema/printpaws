import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { findArtistById } from "@/lib/portal-db";

export const ARTIST_COOKIE = "peternity_artist";
const WEEK = 60 * 60 * 24 * 7;

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

export type ArtistSession = {
  id: string;
  name: string;
  email: string;
};

export function createArtistToken(artist: { id: string; email: string }) {
  const exp = Date.now() + WEEK * 1000;
  const payload = encodePayload(
    JSON.stringify({
      id: artist.id,
      email: artist.email.trim().toLowerCase(),
      exp,
    })
  );
  return `${payload}.${hmac(payload)}`;
}

export function artistCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  };
}

export function applyArtistCookie(
  res: NextResponse,
  artist: { id: string; email: string }
) {
  res.cookies.set(ARTIST_COOKIE, createArtistToken(artist), artistCookieOptions());
  return res;
}

function readArtistToken(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(hmac(payload), signature)) return null;
  try {
    const data = JSON.parse(decodePayload(payload)) as {
      id?: string;
      email?: string;
      exp?: number;
    };
    if (!data.id || !data.email || !data.exp || data.exp < Date.now()) return null;
    return { id: data.id, email: data.email.trim().toLowerCase() };
  } catch {
    return null;
  }
}

export async function getArtistSession(): Promise<ArtistSession | null> {
  try {
    const jar = await cookies();
    const token = readArtistToken(jar.get(ARTIST_COOKIE)?.value);
    if (!token) return null;
    const data = await findArtistById(token.id);
    if (!data?.id || !data.email) return null;
    if (String(data.email).trim().toLowerCase() !== token.email) return null;
    return {
      id: String(data.id),
      name: String(data.name || ""),
      email: String(data.email),
    };
  } catch {
    return null;
  }
}
