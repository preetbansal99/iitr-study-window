import { createClient } from "@/lib/supabase/client";

// Domain suffix for IITR emails (e.g., abc_d@ee.iitr.ac.in, abc_d@cse.iitr.ac.in)
const ALLOWED_DOMAIN_SUFFIX = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "iitr.ac.in";

/**
 * Validates if an email belongs to the allowed domain
 * Supports formats like: abc_d@ee.iitr.ac.in, abc_d@cse.iitr.ac.in, demo@iitr.ac.in
 */
export function isValidEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  const domainSuffix = ALLOWED_DOMAIN_SUFFIX.toLowerCase().replace(/^@/, "");
  
  // Check if the email ends with the domain suffix (e.g., iitr.ac.in)
  // This handles both direct domain (@iitr.ac.in) and subdomains (@ee.iitr.ac.in)
  return emailLower.endsWith(domainSuffix) || emailLower.endsWith(`.${domainSuffix}`);
}

/**
 * Get the allowed email domain for display
 */
export function getAllowedDomain(): string {
  return ALLOWED_DOMAIN_SUFFIX.startsWith("@") ? ALLOWED_DOMAIN_SUFFIX : `@${ALLOWED_DOMAIN_SUFFIX}`;
}

/**
 * Sign in with magic link
 */
export async function signInWithMagicLink(email: string) {
  if (!isValidEmail(email)) {
    throw new Error(`Only emails ending with ${getAllowedDomain()} are allowed to sign in.`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  // Note: Google OAuth 'hd' param restricts to exact domain. For subdomains like ee.iitr.ac.in,
  // we use the base domain (iitr.ac.in) and do additional validation in the callback
  const baseDomain = ALLOWED_DOMAIN_SUFFIX.replace(/^@/, "");
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        hd: baseDomain, // Restrict to iitr.ac.in domain in Google OAuth
      },
    },
  });

  if (error) throw error;
}

/**
 * Demo credentials for testing
 */
export const DEMO_CREDENTIALS = {
  email: "demo@iitr.ac.in",
  password: "demo123456",
};

/**
 * Sign in with demo credentials (email/password)
 */
export async function signInWithDemo() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}
