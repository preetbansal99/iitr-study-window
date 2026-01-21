"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CalendarDays,
  Settings,
  LogOut,
  GraduationCap,
  MessageSquare,
  Shield,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { isAdmin, getUserRole } from "@/lib/permissions";

// Check if running in demo mode (no Supabase credentials)
const IS_DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "Community",
    href: "/community",
    icon: MessageSquare,
  },
  {
    title: "Timetable",
    href: "/timetable",
    icon: CalendarDays,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, demoRole, setDemoRole } = useUserStore();

  // Effective role logic: demoRole overrides real role (DEMO MODE ONLY)
  const realRole = getUserRole(profile?.email);
  const effectiveRole = IS_DEMO_MODE && demoRole ? demoRole : realRole;
  const userIsAdmin = effectiveRole === 'ADMIN';

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-slate-900 dark:text-white">
              StudyWindow
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              IIT Roorkee
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-500")}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section with Admin badge */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4 dark:border-slate-800 space-y-3">
        {/* Demo Mode Role Switcher - ONLY visible in demo mode */}
        {IS_DEMO_MODE && (
          <div className="space-y-2 rounded-lg border border-dashed border-purple-300 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-950">
            <div className="flex items-center justify-center gap-1">
              <FlaskConical className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                Demo Mode
              </span>
            </div>
            <Select
              value={demoRole || "auto"}
              onValueChange={(v) => setDemoRole(v === "auto" ? null : v as 'ADMIN' | 'STUDENT')}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Demo Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto ({realRole})</SelectItem>
                <SelectItem value="ADMIN">👑 Admin</SelectItem>
                <SelectItem value="STUDENT">🎓 Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Admin Badge - only visible for admin users */}
        {userIsAdmin && (
          <div className="flex items-center justify-center">
            <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-300">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          </div>
        )}

        {/* User info */}
        {profile?.username && (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              @{profile.username}
            </p>
          </div>
        )}

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
