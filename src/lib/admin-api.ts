import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { parseCookie } from "cookie";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

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
