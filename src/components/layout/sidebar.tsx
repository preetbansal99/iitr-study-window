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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { isAdmin } from "@/lib/permissions";

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
  const { profile } = useUserStore();
  const userIsAdmin = isAdmin(profile?.email);

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
