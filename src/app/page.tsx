"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  FolderArchive,
  MessageSquare,
  Timer,
  ArrowRight,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signInWithMagicLink, signInWithGoogle, getAllowedDomain } from "@/lib/auth";

// ============================================
// FEATURES DATA
// ============================================
const features = [
  {
    icon: BookOpen,
    title: "Structured courses",
    description: "Every branch, every semester — organised and accessible.",
  },
  {
    icon: FolderArchive,
    title: "Resources archive",
    description: "PYQs, lecture notes, and materials shared by seniors.",
  },
  {
    icon: MessageSquare,
    title: "Focused discussions",
    description: "Course communities with ephemeral, distraction-free threads.",
  },
  {
    icon: Timer,
    title: "Study toolkit",
    description: "Focus timer, task tracking, and calendar view.",
  },
];

// ============================================
// CURSOR GLOW HOOK (DESKTOP ONLY)
// ============================================
function useCursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsEnabled(!isTouch && !prefersReducedMotion);

    if (isTouch || prefersReducedMotion) return;

    let rafId: number;
    const handleMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { ...position, isEnabled };
}

// ============================================
// MAIN PAGE
// ============================================
export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  const { x, y, isEnabled: cursorEnabled } = useCursorGlow();

  const handleGetStarted = useCallback(() => {
    setShowAuth(true);
    setTimeout(() => {
      authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,99%)] text-[hsl(0,0%,9%)] dark:bg-[hsl(0,0%,7%)] dark:text-[hsl(0,0%,95%)]">
      {/* Cursor Glow - Nearly invisible */}
      {cursorEnabled && (
        <div
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(128,128,128,0.04), transparent 40%)`,
          }}
        />
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(0,0%,92%)] bg-[hsl(0,0%,99%)]/80 backdrop-blur-md dark:border-[hsl(0,0%,18%)] dark:bg-[hsl(0,0%,7%)]/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">StudyWindow</span>
            <span className="text-xs font-medium text-[hsl(0,0%,45%)] dark:text-[hsl(0,0%,55%)]">
              IITR
            </span>
          </div>
          <button
            onClick={handleGetStarted}
            className="text-sm font-medium text-[hsl(0,0%,45%)] transition-colors hover:text-[hsl(0,0%,9%)] dark:text-[hsl(0,0%,55%)] dark:hover:text-[hsl(0,0%,95%)]"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 lg:pt-32">
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
          Your academic workspace
          <br />
          <span className="text-[hsl(0,0%,45%)] dark:text-[hsl(0,0%,55%)]">at IIT Roorkee</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[hsl(0,0%,45%)] dark:text-[hsl(0,0%,55%)]">
          Courses, resources, and focused discussions — organised semester-wise, distraction-free.
        </p>
        <div className="mt-10">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="gap-2 rounded-full bg-[hsl(0,0%,9%)] px-6 py-6 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-[hsl(0,0%,15%)] dark:bg-[hsl(0,0%,95%)] dark:text-[hsl(0,0%,9%)] dark:hover:bg-[hsl(0,0%,85%)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[hsl(0,0%,92%)] bg-[hsl(0,0%,97%)] py-16 dark:border-[hsl(0,0%,18%)] dark:bg-[hsl(0,0%,9%)]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[hsl(0,0%,90%)] bg-white dark:border-[hsl(0,0%,20%)] dark:bg-[hsl(0,0%,12%)]">
                  <f.icon className="h-5 w-5 text-[hsl(0,0%,45%)] dark:text-[hsl(0,0%,55%)]" />
                </div>
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-1 text-sm text-[hsl(0,0%,45%)] dark:text-[hsl(0,0%,55%)]">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8">
        <p className="text-center text-sm text-[hsl(0,0%,50%)]">
          IIT emails only&nbsp;&nbsp;•&nbsp;&nbsp;No ads&nbsp;&nbsp;•&nbsp;&nbsp;Built for academic focus
        </p>
      </section>

      {/* Auth Section */}
      <section
        ref={authRef}
        className={`border-t border-[hsl(0,0%,92%)] bg-[hsl(0,0%,97%)] py-16 transition-all duration-500 dark:border-[hsl(0,0%,18%)] dark:bg-[hsl(0,0%,9%)] ${showAuth ? "opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0 py-0"
          }`}
      >
        <div className="mx-auto max-w-sm px-6">
          <AuthCard />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(0,0%,92%)] py-8 dark:border-[hsl(0,0%,18%)]">
        <p className="text-center text-xs text-[hsl(0,0%,50%)]">
          © {new Date().getFullYear()} StudyWindow. Built for IIT Roorkee.
        </p>
      </footer>
    </div>
  );
}

// ============================================
// AUTH CARD
// ============================================
function AuthCard() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const domain = getAllowedDomain();

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError((e as Error).message);
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
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

  if (success) {
    return (
      <Card className="border-[hsl(0,0%,90%)] bg-white shadow-sm dark:border-[hsl(0,0%,20%)] dark:bg-[hsl(0,0%,10%)]">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <div>
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-sm text-[hsl(0,0%,45%)]">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[hsl(0,0%,90%)] bg-white shadow-sm dark:border-[hsl(0,0%,20%)] dark:bg-[hsl(0,0%,10%)]">
      <CardContent className="p-6">
        <h2 className="text-center text-lg font-medium">Ready to begin?</h2>

        {error && (
          <div className="mt-4 rounded-lg border border-[hsl(0,0%,88%)] bg-[hsl(0,0%,96%)] p-3 text-sm text-[hsl(0,0%,35%)] dark:border-[hsl(0,0%,22%)] dark:bg-[hsl(0,0%,12%)]">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Google */}
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={isGoogleLoading}
            className="w-full gap-3 rounded-lg border border-[hsl(0,0%,88%)] bg-white py-5 text-sm font-medium text-[hsl(0,0%,15%)] shadow-none transition-colors hover:bg-[hsl(0,0%,96%)] dark:border-[hsl(0,0%,22%)] dark:bg-[hsl(0,0%,12%)] dark:text-[hsl(0,0%,90%)] dark:hover:bg-[hsl(0,0%,15%)]"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="text-center text-xs text-[hsl(0,0%,50%)]">
            We only access your email for authentication.
          </p>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[hsl(0,0%,90%)] dark:bg-[hsl(0,0%,20%)]" />
            <span className="text-xs text-[hsl(0,0%,50%)]">or</span>
            <div className="h-px flex-1 bg-[hsl(0,0%,90%)] dark:bg-[hsl(0,0%,20%)]" />
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-[hsl(0,0%,40%)]">
                Institute email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(0,0%,55%)]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you${domain}`}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              variant="outline"
              className="w-full py-5 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send sign-in link"
              )}
            </Button>
          </form>

          <p className="pt-2 text-center text-xs text-[hsl(0,0%,50%)]">
            Only <span className="font-medium">{domain}</span> emails supported.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
