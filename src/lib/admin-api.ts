import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { parseCookie } from "cookie";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";

const AUTH_STORAGE_KEY = "salon-kids-auth";
const BASE64_PREFIX = "base64-";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.replace("Bearer ", "");
  const cookieToken = extractAccessTokenFromAuthCookie(request);
  const token = bearerToken || cookieToken;

  const {
    data: { user },
    error,
  } = token
    ? await supabaseAdmin.auth.getUser(token)
    : await createCookieAuthClient(request).auth.getUser();

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Sesion invalida." }, { status: 401 }),
    };
  }

  return { user, response: null };
}

function createCookieAuthClient(request: Request) {
  const parsedCookies = parseCookie(request.headers.get("cookie") ?? "");

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(parsedCookies).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));
        },
      },
    },
  );
}

function extractAccessTokenFromAuthCookie(request: Request) {
  const parsedCookies = parseCookie(request.headers.get("cookie") ?? "");
  const rawValue = parsedCookies[AUTH_STORAGE_KEY];

  if (!rawValue) {
    return null;
  }

  const decodedValue = decodeSupabaseCookieValue(rawValue);

  if (!decodedValue) {
    return null;
  }

  try {
    const session = JSON.parse(decodedValue) as
      | [
          accessToken?: unknown,
          refreshToken?: unknown,
          providerToken?: unknown,
          providerRefreshToken?: unknown,
          expiresAt?: unknown,
        ]
      | {
      access_token?: unknown;
      currentSession?: { access_token?: unknown };
    };

    if (Array.isArray(session) && typeof session[0] === "string") {
      return session[0];
    }

    if (Array.isArray(session)) {
      return null;
    }

    if (typeof session.access_token === "string") {
      return session.access_token;
    }

    if (typeof session.currentSession?.access_token === "string") {
      return session.currentSession.access_token;
    }
  } catch {
    return null;
  }

  return null;
}

function decodeSupabaseCookieValue(value: string) {
  const decodedCookie = decodeURIComponent(value);

  if (!decodedCookie.startsWith(BASE64_PREFIX)) {
    return decodedCookie;
  }

  const encodedPayload = decodedCookie.slice(BASE64_PREFIX.length);
  const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return Buffer.from(paddedBase64, "base64").toString("utf8");
}
