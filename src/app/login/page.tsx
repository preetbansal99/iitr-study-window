"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, Mail, ChevronRight } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth";

// ============================================
// TEXT-FORMING PARTICLE SYSTEM
// ============================================
interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  baseSize?: number;
  color: string;
  colorIndex?: number;
  vx: number;
  vy: number;
  isBackground?: boolean;
  floatAngle?: number;
  floatSpeed?: number;
  opacity?: number;
  baseOpacity?: number;
}

function TextParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const backgroundParticlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Color palette for particles
    const particleColor = "rgba(124, 185, 232, 0.85)";
    const bgColors = [
      "rgba(124, 185, 232,", // Light blue
      "rgba(96, 165, 250,",  // Blue
      "rgba(59, 130, 246,",  // Bright blue
      "rgba(14, 165, 233,",  // Cyan blue
    ];

    // Create background floating particles with repelling effect
    const createBackgroundParticles = () => {
      const bgParticles: Particle[] = [];
      // More particles for denser look
      const count = Math.floor((canvas.width * canvas.height) / 12000);

      for (let i = 0; i < count; i++) {
        const baseSize = Math.random() * 2.5 + 1;
        const baseOpacity = Math.random() * 0.15 + 0.08;
        bgParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          size: baseSize,
          baseSize: baseSize,
          color: "",
          colorIndex: Math.floor(Math.random() * bgColors.length),
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          isBackground: true,
          floatAngle: Math.random() * Math.PI * 2,
          floatSpeed: 0.001 + Math.random() * 0.002,
          opacity: baseOpacity,
          baseOpacity: baseOpacity,
        });
      }
      backgroundParticlesRef.current = bgParticles;
    };

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createTextParticles();
      createBackgroundParticles();
    };

    // Sample points from text
    const createTextParticles = () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      // Professional text - "StudyWindow" for branding
      const text = canvas.width < 600 ? "SW" : "StudyWindow";
      const fontSize = canvas.width < 600
        ? Math.min(canvas.width * 0.25, 150)
        : Math.min(canvas.width * 0.12, 140);

      // Draw text with clean font
      tempCtx.fillStyle = "#000";
      tempCtx.font = `600 ${fontSize}px "Outfit", "Inter", system-ui, sans-serif`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      // Position text in upper portion
      const textY = canvas.height * 0.22;
      tempCtx.fillText(text, canvas.width / 2, textY);

      // Sample pixels from text
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      const particles: Particle[] = [];

      // Smaller gap = more particles for smoother text
      const gap = Math.max(3, Math.floor(fontSize / 35));

      for (let y = 0; y < tempCanvas.height; y += gap) {
        for (let x = 0; x < tempCanvas.width; x += gap) {
          const index = (y * tempCanvas.width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            particles.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              targetX: x,
              targetY: y,
              size: Math.random() * 1.2 + 1, // Smaller bubbles
              color: particleColor,
              vx: 0,
              vy: 0,
            });
          }
        }
      }

      particlesRef.current = particles;
    };

    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Physics settings
      const repelRadius = 120;
      const bgRepelRadius = 80;
      const friction = 0.92;
      const springStrength = 0.025;
      const repelForce = 3;

      // Draw background particles with repelling effect
      backgroundParticlesRef.current.forEach((particle) => {
        particle.floatAngle = (particle.floatAngle || 0) + (particle.floatSpeed || 0.002);

        // Calculate repelling from cursor
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bgRepelRadius && distance > 0) {
          const force = (bgRepelRadius - distance) / bgRepelRadius;
          const angle = Math.atan2(dy, dx);
          particle.x -= Math.cos(angle) * force * 4;
          particle.y -= Math.sin(angle) * force * 4;

          // Dynamic size increase when repelled
          particle.size = (particle.baseSize || 1.5) * (1 + force * 1.5);
          // Dynamic opacity increase when repelled
          particle.opacity = Math.min(0.5, (particle.baseOpacity || 0.1) * (1 + force * 3));
        } else {
          // Return to base size/opacity smoothly
          particle.size += ((particle.baseSize || 1.5) - particle.size) * 0.08;
          particle.opacity = (particle.opacity || 0.1) + ((particle.baseOpacity || 0.1) - (particle.opacity || 0.1)) * 0.08;
        }

        particle.x += Math.sin(particle.floatAngle) * 0.2 + particle.vx;
        particle.y += Math.cos(particle.floatAngle * 0.7) * 0.15 + particle.vy;

        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = bgColors[particle.colorIndex || 0] + (particle.opacity || 0.1) + ")";
        ctx.fill();
      });

      // Draw text particles
      particlesRef.current.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repelRadius && distance > 0) {
          const force = (repelRadius - distance) / repelRadius;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * repelForce;
          particle.vy -= Math.sin(angle) * force * repelForce;
        }

        const toTargetX = particle.targetX - particle.x;
        const toTargetY = particle.targetY - particle.y;
        particle.vx += toTargetX * springStrength;
        particle.vy += toTargetY * springStrength;

        particle.vx *= friction;
        particle.vy *= friction;

        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start after font loads
    document.fonts.ready.then(() => {
      createTextParticles();
      createBackgroundParticles();
      animate();
    });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
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

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

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

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-medium text-[#121317]">Signing you in...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      {/* Hero Section - pushed further down for more space */}
      <div className="text-center space-y-4 mt-72">
        <p
          className="text-lg md:text-xl text-[#45474D] font-light max-w-2xl mx-auto"
          style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
        >
          Your academic journey, elevated. Access courses, resources, and community — all in one place at IIT Roorkee.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {/* Get Started / Sign in Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="btn-antigravity flex items-center gap-3 rounded-full bg-[#121317] px-10 py-5 text-lg text-white font-medium hover:bg-[#2d2e33] hover:shadow-xl disabled:opacity-50 mt-4"
        style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Login Instruction */}
      <p className="text-sm text-[#6B7280]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
        Use your <span className="text-[#4285F4] font-medium">@iitr.ac.in</span> email to sign in
      </p>
    </div>
  );
}

// ============================================
// LOGO COMPONENT
// ============================================
function Logo() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left window panel with S */}
          <rect x="4" y="8" width="18" height="32" rx="2" stroke="#7CB9E8" strokeWidth="2.5" fill="none" />
          <text x="13" y="20" fill="#7CB9E8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="system-ui">S</text>
          <text x="13" y="32" fill="#7CB9E8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="system-ui">W</text>
          {/* Right window panel (open door effect) */}
          <path d="M26 8 L42 12 L42 36 L26 40 Z" stroke="#7CB9E8" strokeWidth="2.5" fill="none" />
          <line x1="34" y1="15" x2="38" y2="16" stroke="#7CB9E8" strokeWidth="2" />
          <line x1="34" y1="32" x2="38" y2="33" stroke="#7CB9E8" strokeWidth="2" />
        </svg>
        <span className="text-xl font-light tracking-tight" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
          <span className="text-[#4285F4] font-medium">Study</span>
          <span className="text-[#121317]"> Window</span>
        </span>
      </div>

      {/* Quick Links */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/about" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
          About
        </Link>
        <Link href="/about/features" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
          Features
        </Link>
        <Link href="/contact" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
          Contact
        </Link>
      </nav>
    </div>
  );
}

// ============================================
// FOOTER COMPONENT
// ============================================
function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <span>© 2026 Study Window</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Made for IIT Roorkee</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-[#6B7280] hover:text-[#4285F4] transition-colors flex items-center gap-1">
            About Us <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/contact" className="text-sm text-[#6B7280] hover:text-[#4285F4] transition-colors flex items-center gap-1">
            <Mail className="h-4 w-4" /> Contact
          </Link>
        </div>
      </div>
    </footer>
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
      {/* Background with gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 60%, rgba(240,245,250,0.95) 100%)
          `,
        }}
      />

      {/* Text-forming particle animation */}
      <TextParticleBackground />

      {/* Logo with nav */}
      <Logo />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-28">
        <LoginForm />
      </main>

      {/* Footer */}
      <Footer />

      {/* Google Sans Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
      `}</style>
    </Suspense>
  );
}
