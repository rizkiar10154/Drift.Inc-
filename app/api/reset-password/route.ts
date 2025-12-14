import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email, newPassword } = await req.json();

  // Admin client using Service Role Key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Get all users
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  // 2. Find user by email
  const user = users.users.find((u: any) => u.email === email);

  if (!user) {
    return NextResponse.json({ error: "Email not found." }, { status: 404 });
  }

  // 3. Update password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
