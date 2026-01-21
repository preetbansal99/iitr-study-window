import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verify email domain after OAuth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const allowedDomainSuffix = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "iitr.ac.in").replace(/^@/, "").toLowerCase();

      // Check if email ends with the domain suffix (supports subdomains like ee.iitr.ac.in)
      const userEmail = user?.email?.toLowerCase() || "";
      const isAllowed = userEmail.endsWith(allowedDomainSuffix) || userEmail.endsWith(`.${allowedDomainSuffix}`);

      if (user && !isAllowed) {
        // Sign out the user if email domain is not allowed
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=Only @${allowedDomainSuffix} emails are allowed`
        );
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
