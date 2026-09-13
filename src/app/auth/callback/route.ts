import { NextResponse } from "next/server";
import { getAppUrl, hasSupabaseConfig, safeNextPath } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));
  const destination = new URL(next, getAppUrl(origin));

  if (!hasSupabaseConfig()) {
    return NextResponse.redirect(new URL("/login?error=config", getAppUrl(origin)));
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(destination);
    }
  }

  if (tokenHash && (type === "signup" || type === "invite" || type === "magiclink" || type === "recovery" || type === "email_change" || type === "email")) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(destination);
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", getAppUrl(origin)));
}
