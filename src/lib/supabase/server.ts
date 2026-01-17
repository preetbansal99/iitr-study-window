import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_USER } from "./client";

// Demo mode flag
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a chainable query builder for demo mode
function createMockQueryBuilder() {
  const result = { data: [], error: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => ({ data: null, error: null }),
    maybeSingle: () => ({ data: null, error: null }),
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    contains: () => builder,
    containedBy: () => builder,
    match: () => builder,
    not: () => builder,
    or: () => builder,
    filter: () => builder,
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve(result),
  };

  return builder;
}

// Create a mock server client for demo mode
function createMockServerClient() {
  const mockSession = {
    user: DEMO_USER,
    access_token: "demo-token",
    refresh_token: "demo-refresh",
    expires_in: 3600,
    token_type: "bearer",
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session: mockSession }, error: null }),
    },
    from: () => createMockQueryBuilder(),
  };
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Server running in DEMO MODE - Supabase credentials not configured");
    return createMockServerClient() as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

