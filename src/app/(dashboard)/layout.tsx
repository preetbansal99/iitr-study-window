import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

// Development mode check - bypasses auth when Supabase is not configured
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 px-4 py-1 text-center text-sm font-medium text-amber-950">
          🚧 Demo Mode - Configure Supabase credentials to enable full functionality
        </div>
      )}
      <Sidebar />
      <MobileNav />
      <main className={`pt-16 lg:pl-64 lg:pt-0 ${isDemoMode ? "mt-7" : ""}`}>
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
