"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  BookOpen,
  MessageSquare,
  Timer,
  FolderArchive,
  ArrowRight,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signInWithMagicLink, signInWithGoogle, getAllowedDomain } from "@/lib/auth";

// ============================================
// FEATURE DATA
// ============================================
const features = [
  {
    icon: BookOpen,
    title: "All courses, structured",
    description: "Every branch, every semester — find your courses instantly.",
  },
  {
    icon: FolderArchive,
    title: "Resources that matter",
    description: "PYQs, lecture notes, and senior archives. No hunting required.",
  },
  {
    icon: MessageSquare,
    title: "Discussions that expire",
    description: "Course communities with focused, ephemeral threads.",
  },
  {
    icon: Timer,
    title: "Your study toolkit",
    description: "Focus timer, task tracking, and a clean calendar view.",
  },
];

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const authSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleGetStarted = useCallback(() => {
    setShowAuth(true);
    setTimeout(() => {
      authSectionRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 100);
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
              <GraduationCap className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                StudyWindow
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                IIT Roorkee
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            onClick={handleGetStarted}
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 lg:py-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Your academic workspace at IIT Roorkee
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Courses, resources, and focused discussions — organised semester-wise, distraction-free.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="gap-2 bg-slate-900 px-6 py-6 text-base hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <feature.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-sm text-slate-500">
            IIT Roorkee emails only • No ads • No tracking • Built for academic focus
          </p>
        </div>
      </section>

      {/* Auth Section (Revealed on CTA click) */}
      <section
        ref={authSectionRef}
        className={`border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950 ${showAuth
            ? "opacity-100"
            : "pointer-events-none max-h-0 overflow-hidden opacity-0"
          } ${prefersReducedMotion ? "" : "transition-all duration-500"}`}
        aria-hidden={!showAuth}
      >
        <div className="mx-auto max-w-md px-6">
          <AuthCard />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} StudyWindow. Built for IIT Roorkee students.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// AUTH CARD COMPONENT
// ============================================
function AuthCard() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allowedDomain = getAllowedDomain();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithMagicLink(email);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We&apos;ve sent a sign-in link to{" "}
            <strong className="text-slate-900 dark:text-white">{email}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Ready to start?
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access your workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Something went wrong. Please try again.
            </p>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Google OAuth */}
          <Button
            type="button"
            className="w-full gap-3 bg-white py-5 text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-500">
            We only access your email for authentication.
          </p>

          {/* Separator */}
          <div className="relative py-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 dark:bg-slate-900">
              or
            </span>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLinkLogin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-700 dark:text-slate-300">
                Institute Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={`yourname${allowedDomain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full py-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send sign-in link
                </>
              )}
            </Button>
          </form>

          <p className="pt-2 text-center text-xs text-slate-400">
            Only <strong>{allowedDomain}</strong> emails are supported.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
