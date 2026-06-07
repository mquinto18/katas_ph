import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() validates the JWT locally (no network round-trip to Supabase
  // on every navigation, unlike getUser) — falls back to a server check only
  // for projects still on the legacy symmetric JWT secret.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");

  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/orders", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
