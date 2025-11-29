import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  // --- IMPORTANT ---
  // Create a response object so we can write cookies to it
  const res = NextResponse.json({});

  // Create Supabase client for Route Handlers using request + response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.headers.get("cookie")?.match(new RegExp(`${name}=([^;]+)`))?.[1];
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  // Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  if (data.user.user_metadata?.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Access denied" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata.role,
      },
    },
    res // IMPORTANT: return the response with cookies included
  );
}
