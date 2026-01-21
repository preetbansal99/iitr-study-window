"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Mail, Loader2, CheckCircle2, User, BookOpen, Users, Calendar } from "lucide-react";
import { signInWithMagicLink, signInWithGoogle, getAllowedDomain } from "@/lib/auth";

// ============================================
// CURSOR TRACKING HOOK
// ============================================
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for touch device
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) return; // Throttle via RAF

    rafRef.current = requestAnimationFrame(() => {
      setPosition({ x: e.clientX, y: e.clientY });
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return { ...position, isTouch, prefersReducedMotion };
}

// ============================================
// CURSOR GRADIENT COMPONENT
// ============================================
function CursorGradient({ x, y, isVisible }: { x: number; y: number; isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.08), transparent 40%)`,
      }}
    />
  );
}

// ============================================
// FEATURE CARD COMPONENT
// ============================================
function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-5 w-5 text-white/80" />
      </div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </div>
  );
}

// ============================================
// LOGIN FORM COMPONENT
// ============================================
function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const { x, y, isTouch, prefersReducedMotion } = useMousePosition();
  const allowedDomain = getAllowedDomain();
  const showCursorEffects = !isTouch && !prefersReducedMotion;

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

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



  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-md border-slate-200 shadow-xl dark:border-slate-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We&apos;ve sent a magic link to <strong className="text-slate-900 dark:text-white">{email}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Click the link in your email to sign in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Cursor-follow gradient */}
      <CursorGradient x={x} y={y} isVisible={showCursorEffects} />

      {/* Left column - Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">StudyWindow</span>
        </div>

        {/* Main messaging */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Your study space at<br />IIT Roorkee
          </h1>
          <p className="text-lg text-white/70">
            Access courses, resources, and discussions — all in one place.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 space-y-2">
            <FeatureCard
              icon={BookOpen}
              title="Course Resources"
              description="PYQs, notes, and materials organized by semester"
            />
            <FeatureCard
              icon={Users}
              title="Course Communities"
              description="Discuss with classmates, ask questions"
            />
            <FeatureCard
              icon={Calendar}
              title="Academic Calendar"
              description="Never miss a deadline or exam"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-white/50">
          Built for IIT Roorkee students
        </p>
      </div>

      {/* Right column - Login card */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:w-1/2">
        {/* Background dim when card is hovered */}
        {showCursorEffects && (
          <div
            className={`pointer-events-none fixed inset-0 bg-black/5 transition-opacity duration-300 dark:bg-black/20 lg:left-1/2 ${isCardHovered ? 'opacity-100' : 'opacity-0'
              }`}
          />
        )}

        <Card
          className={`relative z-10 w-full max-w-md border-slate-200 shadow-lg transition-all duration-300 dark:border-slate-800 ${isCardHovered && showCursorEffects
            ? 'shadow-xl shadow-indigo-500/10 dark:shadow-indigo-400/5'
            : ''
            }`}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          <CardContent className="p-8">
            {/* Mobile logo */}
            <div className="mb-6 flex flex-col items-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                StudyWindow
              </h1>
              <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-400">
                Your study space at IIT Roorkee
              </p>
            </div>

            {/* Desktop header */}
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Error message - calm styling */}
            {error && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Something went wrong. Please try again.
                </p>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Google OAuth - primary action */}
              <Button
                type="button"
                className={`relative w-full gap-3 bg-white py-6 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${showCursorEffects ? 'hover:scale-[1.01]' : ''
                  }`}
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing you in...</span>
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

              {/* Trust microcopy */}
              <p className="text-center text-xs text-slate-500">
                We only access your email for authentication.
              </p>



              {/* Separator */}
              <div className="relative py-2">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 dark:bg-slate-950">
                  or use email
                </span>
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
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
                  <p className="text-xs text-slate-500">
                    Only <strong>{allowedDomain}</strong> emails allowed
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className={`w-full py-5 transition-all duration-200 ${showCursorEffects ? 'hover:scale-[1.01]' : ''
                    }`}
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
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>

              {/* Footer trust text */}
              <p className="pt-4 text-center text-xs text-slate-400">
                By signing in, you agree to access resources responsibly<br />
                and in accordance with IIT Roorkee guidelines.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE EXPORT
// ============================================
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
