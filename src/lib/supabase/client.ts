import { createBrowserClient } from "@supabase/ssr";

// Admin email - SINGLE SOURCE OF TRUTH for admin identification
export const ADMIN_EMAIL = 'preet_b@ee.iitr.ac.in';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
