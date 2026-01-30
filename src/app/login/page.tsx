"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, Info, BookOpen, Users, Clock, Shield, Mail, ChevronRight } from "lucide-react";
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
  color: string;
  vx: number;
  vy: number;
  isBackground?: boolean;
  floatAngle?: number;
  floatSpeed?: number;
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

    // Colors for text particles
    const colors = [
      "#4285F4", "#60A5FA", "#3B82F6", "#0EA5E9", "#10B981",
      "#FBBF24", "#F97316", "#93C5FD", "#6EE7B7",
    ];

    // Light colors for background particles
    const bgColors = [
      "rgba(66, 133, 244, 0.12)",
      "rgba(96, 165, 250, 0.10)",
      "rgba(14, 165, 233, 0.08)",
      "rgba(16, 185, 129, 0.10)",
      "rgba(251, 191, 36, 0.08)",
    ];

    // Create background floating particles
    const createBackgroundParticles = () => {
      const bgParticles: Particle[] = [];
      const count = Math.floor((canvas.width * canvas.height) / 40000); // Very sparse

      for (let i = 0; i < count; i++) {
        bgParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: 0,
          targetY: 0,
          size: Math.random() * 4 + 2,
          color: bgColors[Math.floor(Math.random() * bgColors.length)],
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          isBackground: true,
          floatAngle: Math.random() * Math.PI * 2,
          floatSpeed: 0.002 + Math.random() * 0.003,
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

      // Determine text based on screen size
      const text = canvas.width < 600 ? "Study" : "Study";
      const fontSize = Math.min(canvas.width * 0.18, 200);

      // Draw text
      tempCtx.fillStyle = "#000";
      tempCtx.font = `bold ${fontSize}px "Outfit", sans-serif`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      // Position text higher - moved up to avoid overlap
      const textY = canvas.height * 0.22;
      tempCtx.fillText(text, canvas.width / 2, textY);

      // Sample pixels from text
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      const particles: Particle[] = [];

      // Larger gap for less density (more readable)
      const gap = Math.max(5, Math.floor(fontSize / 25));

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
              size: Math.random() * 2.5 + 1.5,
              color: colors[Math.floor(Math.random() * colors.length)],
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

      // Slower physics for text particles
      const repelRadius = 100;
      const friction = 0.92; // Higher = slower deceleration
      const springStrength = 0.025; // Lower = slower return
      const repelForce = 3; // Lower = gentler push

      // Draw background particles first (behind text)
      backgroundParticlesRef.current.forEach((particle) => {
        // Gentle floating motion
        particle.floatAngle = (particle.floatAngle || 0) + (particle.floatSpeed || 0.002);
        particle.x += Math.sin(particle.floatAngle) * 0.3 + particle.vx;
        particle.y += Math.cos(particle.floatAngle * 0.7) * 0.2 + particle.vy;

        // Wrap around screen
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Draw background particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Draw text particles
      particlesRef.current.forEach((particle) => {
        // Calculate distance to cursor
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Repel from cursor (slower)
        if (distance < repelRadius && distance > 0) {
          const force = (repelRadius - distance) / repelRadius;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * repelForce;
          particle.vy -= Math.sin(angle) * force * repelForce;
        }

        // Spring back to target position (slower)
        const toTargetX = particle.targetX - particle.x;
        const toTargetY = particle.targetY - particle.y;
        particle.vx += toTargetX * springStrength;
        particle.vy += toTargetY * springStrength;

        // Apply friction
        particle.vx *= friction;
        particle.vy *= friction;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Draw particle (simple circle, no glow/shadow)
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
// FEATURE CARD COMPONENT
// ============================================
function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-[#4285F4] transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
        {title}
      </h3>
      <p className="text-sm text-[#6B7280] leading-relaxed">
        {description}
      </p>
    </div>
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
    <div className="flex flex-col items-center gap-10 w-full max-w-4xl mx-auto">
      {/* Instructional Note */}
      <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm text-[#4285F4] backdrop-blur-sm animate-float-in">
        <Info className="h-4 w-4" />
        <span style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
          Login only with institute mail ID
        </span>
      </div>

      {/* Hero Section - positioned below the particle text */}
      <div className="text-center space-y-4 mt-32">
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

      {/* Sign in Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="btn-antigravity flex items-center gap-3 rounded-full bg-[#121317] px-10 py-5 text-lg text-white font-medium hover:bg-[#2d2e33] hover:shadow-xl disabled:opacity-50"
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

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
        <FeatureCard
          icon={BookOpen}
          title="Course Materials"
          description="Access organized notes, PYQs, and resources for all subjects"
        />
        <FeatureCard
          icon={Users}
          title="Community"
          description="Connect with peers, share knowledge, and collaborate"
        />
        <FeatureCard
          icon={Clock}
          title="Focus Timer"
          description="Track study sessions with built-in productivity tools"
        />
        <FeatureCard
          icon={Shield}
          title="IIT-R Exclusive"
          description="Curated content specifically for IITR students"
        />
      </div>

      {/* Trust text */}
      <p className="text-xs text-[#9CA3AF] text-center max-w-md">
        By signing in, you agree to access resources responsibly and in accordance with IIT Roorkee guidelines.
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
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z" fill="url(#gradient)" />
          <path d="M14 18L16 12L18 18H14Z" fill="white" />
          <defs>
            <linearGradient id="gradient" x1="4" y1="2" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4285F4" />
              <stop offset="1" stopColor="#0EA5E9" />
            </linearGradient>
          </defs>
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
