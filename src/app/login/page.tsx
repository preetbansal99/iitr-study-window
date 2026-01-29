"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Menu, X } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth";

// ============================================
// PARTICLE SYSTEM
// ============================================
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Colors matching Antigravity aesthetic (no purple)
    const colors = [
      "#4285F4", // Blue
      "#60A5FA", // Light Blue
      "#3B82F6", // Bright Blue
      "#0EA5E9", // Sky Blue
      "#10B981", // Green
      "#FBBF24", // Yellow
      "#F97316", // Orange
    ];

    // Initialize particles
    const createParticles = () => {
      const particles: Particle[] = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000); // Density

      for (let i = 0; i < count; i++) {
        particles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Twinkle effect
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: "transparent" }}
    />
  );
}

// ============================================
// TYPING ANIMATION
// ============================================
function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorColor, setCursorColor] = useState("#4285F4");

  const cursorColors = ["#4285F4", "#60A5FA", "#3B82F6", "#0EA5E9", "#10B981"];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  // Cursor blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, []);

  // Cursor color cycle
  useEffect(() => {
    let colorIndex = 0;
    const colorInterval = setInterval(() => {
      colorIndex = (colorIndex + 1) % cursorColors.length;
      setCursorColor(cursorColors[colorIndex]);
    }, 800);

    return () => clearInterval(colorInterval);
  }, []);

  return (
    <span className={className}>
      {displayedText}
      <span
        className="inline-block ml-1 transition-opacity duration-100"
        style={{
          opacity: cursorVisible ? 1 : 0,
          backgroundColor: cursorColor,
          width: "3px",
          height: "1em",
          verticalAlign: "middle",
          borderRadius: "1px",
        }}
      />
    </span>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Antigravity "A" Icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z"
              fill="url(#gradient)"
            />
            <path d="M14 18L16 12L18 18H14Z" fill="white" />
            <defs>
              <linearGradient
                id="gradient"
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
          <span
            className="text-xl font-light tracking-tight"
            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
          >
            <span className="text-[#4285F4] font-medium">Study</span>
            <span className="text-[#121317]"> Window</span>
          </span>
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-[#45474D]" />
          ) : (
            <Menu className="h-5 w-5 text-[#45474D]" />
          )}
        </button>
      </header>

      {/* Full-screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-6 md:right-12 flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-[#45474D]" />
          </button>
          <nav className="flex flex-col items-center gap-6 text-2xl font-light text-[#121317]">
            <a href="#" className="hover:text-[#4285F4] transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-[#4285F4] transition-colors">
              Resources
            </a>
            <a href="#" className="hover:text-[#4285F4] transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-[#4285F4] transition-colors">
              Download
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

// ============================================
// LOGIN FORM COMPONENT
// ============================================
function LoginForm() {
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

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
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-medium text-[#121317]">
          Signing you in...
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Hero Text with Typing Animation */}
      <div className="text-center">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-light text-[#121317] leading-tight mb-4"
          style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
        >
          <TypingText text="Experience liftoff with the next-generation study platform" />
        </h1>
        <p
          className="text-lg text-[#45474D] font-light max-w-2xl mx-auto"
          style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
        >
          Access courses, resources, and community — all in one place at IIT Roorkee.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm text-[#45474D] shadow-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Primary: Sign in with Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="flex items-center gap-3 rounded-full bg-[#121317] px-8 py-4 text-white font-medium transition-all duration-200 hover:bg-[#2d2e33] hover:shadow-lg disabled:opacity-50"
          style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
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
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Secondary: Learn More */}
        <button
          className="flex items-center gap-2 rounded-full bg-[#E1E6EC] px-8 py-4 text-[#121317] font-medium transition-all duration-200 hover:bg-[#d1d5db] hover:shadow-md"
          style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
        >
          Learn more
        </button>
      </div>

      {/* Trust text */}
      <p className="text-xs text-[#9CA3AF] text-center max-w-md">
        By signing in, you agree to access resources responsibly and in accordance with IIT Roorkee guidelines.
      </p>
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
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
        </div>
      }
    >
      {/* Background with blue edge vignette */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(225,230,236,0.8) 100%),
            linear-gradient(to bottom, rgba(66, 133, 244, 0.05) 0%, transparent 30%, transparent 70%, rgba(139, 92, 246, 0.05) 100%)
          `,
        }}
      />

      {/* Particle animation */}
      <ParticleBackground />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <LoginForm />
      </main>

      {/* Google Sans Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>
    </Suspense>
  );
}
