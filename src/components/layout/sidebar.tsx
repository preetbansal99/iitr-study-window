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
  MessageSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { isAdmin, getUserRole } from "@/lib/permissions";

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

// Antigravity Logo Component
function AntigravityLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z"
        fill="url(#logo-gradient)"
      />
      <path d="M14 18L16 12L18 18H14Z" fill="white" />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="4"
          y1="2"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4285F4" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUserStore();

  // Role is determined by email - consistent with all other components
  const realRole = getUserRole(profile?.email);
  const userIsAdmin = isAdmin(profile?.email);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200/60 bg-white lg:block dark:border-slate-800 dark:bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <AntigravityLogo />
          <div className="flex flex-col">
            <span className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">
              <span className="text-[#4285F4]">Study</span>
              <span className="text-slate-700 dark:text-slate-300">Window</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
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
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#4285F4]/10 text-[#4285F4] dark:bg-[#4285F4]/20 dark:text-[#60a5fa]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive ? "text-[#4285F4]" : "text-slate-400")}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section with Admin badge */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200/60 p-4 dark:border-slate-800 space-y-3">

        {/* Admin Badge - only visible for admin users */}
        {userIsAdmin && (
          <div className="flex items-center justify-center">
            <Badge className="gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-300">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          </div>
        )}

        {/* User info */}
        {profile?.username && (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              @{profile.username}
            </p>
          </div>
        )}

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
