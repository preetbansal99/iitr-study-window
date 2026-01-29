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
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z"
        fill="url(#mobile-logo-gradient)"
      />
      <path d="M14 18L16 12L18 18H14Z" fill="white" />
      <defs>
        <linearGradient
          id="mobile-logo-gradient"
          x1="4"
          y1="2"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4285F4" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white px-4 lg:hidden dark:border-slate-800 dark:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <AntigravityLogo />
        <span className="text-lg font-medium text-slate-900 dark:text-white">
          <span className="text-[#4285F4]">Study</span>
          <span className="text-slate-700 dark:text-slate-300">Window</span>
        </span>
      </div>

      {/* Hamburger Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-500" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0 bg-white dark:bg-slate-950">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AntigravityLogo />
              <span className="text-lg font-medium text-slate-900 dark:text-white">
                <span className="text-[#4285F4]">Study</span>
                <span className="text-slate-700 dark:text-slate-300">Window</span>
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
              <X className="h-5 w-5 text-slate-500" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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

          {/* Sign out */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200/60 p-4 dark:border-slate-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
