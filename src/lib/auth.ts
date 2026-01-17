import { createClient } from "@/lib/supabase/client";

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "@abc.iit.ac.in";

/**
 * Validates if an email belongs to the allowed domain
 */
export function isValidEmail(email: string): boolean {
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN.toLowerCase());
}

/**
 * Get the allowed email domain for display
 */
export function getAllowedDomain(): string {
  return ALLOWED_DOMAIN;
}

/**
 * Sign in with magic link
 */
export async function signInWithMagicLink(email: string) {
  if (!isValidEmail(email)) {
    throw new Error(`Only ${ALLOWED_DOMAIN} emails are allowed to sign in.`);
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
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        hd: ALLOWED_DOMAIN.replace("@", ""), // Restrict to domain in Google OAuth
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
