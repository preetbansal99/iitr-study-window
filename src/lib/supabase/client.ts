import { createBrowserClient } from "@supabase/ssr";

// Demo mode flag - set to true to bypass Supabase authentication
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock user for demo mode
export const DEMO_USER = {
  id: "demo-user-123",
  email: "demo@iitr.ac.in",
  user_metadata: {
    full_name: "Demo User",
    avatar_url: null,
  },
  created_at: new Date().toISOString(),
};

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
    // Make it thenable (Promise-like) for async/await support
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve(result),
  };

  return builder;
}

// Create a mock Supabase client for demo mode
function createMockClient() {
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
      signInWithPassword: async () => ({ data: { user: DEMO_USER, session: mockSession }, error: null }),
      signInWithOtp: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        // Simulate logged-in state for demo
        callback("SIGNED_IN", mockSession);
        return { data: { subscription: { unsubscribe: () => { } } } };
      },
    },
    from: () => createMockQueryBuilder(),
  };
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Running in DEMO MODE - Supabase credentials not configured");
    // Return mock client for demo mode
    return createMockClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
