import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const accessToken = data.session.access_token;
      let isAdmin = false;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          isAdmin = me?.role === "ADMIN";
        }
      } catch {
        // fall through to default redirect target
      }
      return NextResponse.redirect(`${origin}${isAdmin ? "/admin" : next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
