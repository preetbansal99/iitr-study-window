"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Target, Sparkles, GraduationCap, Heart, Code, Lightbulb } from "lucide-react";

// ============================================
// PARTICLE BACKGROUND (Shared)
// ============================================
interface Particle {
    id: number;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    opacity: number;
    pulsePhase: number;
}

function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const colors = [
            "#4285F4", "#60A5FA", "#3B82F6", "#0EA5E9", "#10B981", "#FBBF24", "#F97316", "#93C5FD", "#6EE7B7",
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesRef.current = createParticles();
        };

        const createParticles = () => {
            const particles: Particle[] = [];
            const count = Math.floor((canvas.width * canvas.height) / 6000);

            for (let i = 0; i < count; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    id: i,
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 4 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    opacity: Math.random() * 0.5 + 0.3,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
            return particles;
        };

        resize();
        window.addEventListener("resize", resize);

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

        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouse = mouseRef.current;
            time += 0.02;

            ctx.strokeStyle = "rgba(66, 133, 244, 0.08)";
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const p1 = particlesRef.current[i];
                    const p2 = particlesRef.current[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 80) {
                        ctx.globalAlpha = (80 - distance) / 80 * 0.3;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            particlesRef.current.forEach((particle) => {
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 180;

                if (distance < maxDistance && distance > 0) {
                    const force = Math.pow((maxDistance - distance) / maxDistance, 2);
                    const angle = Math.atan2(dy, dx);
                    particle.x -= Math.cos(angle) * force * 6;
                    particle.y -= Math.sin(angle) * force * 6;
                } else {
                    particle.x += (particle.baseX - particle.x) * 0.03;
                    particle.y += (particle.baseY - particle.y) * 0.03;
                }

                particle.baseX += particle.speedX;
                particle.baseY += particle.speedY;

                if (particle.baseX < -10) particle.baseX = canvas.width + 10;
                if (particle.baseX > canvas.width + 10) particle.baseX = -10;
                if (particle.baseY < -10) particle.baseY = canvas.height + 10;
                if (particle.baseY > canvas.height + 10) particle.baseY = -10;

                const pulse = Math.sin(time + particle.pulsePhase) * 0.15 + 1;
                let glowMultiplier = 1;
                if (distance < maxDistance) {
                    glowMultiplier = 1 + (maxDistance - distance) / maxDistance * 0.8;
                }

                const size = particle.size * pulse * glowMultiplier;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity * glowMultiplier;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

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
// LOGO COMPONENT
// ============================================
function Logo() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-white/50 backdrop-blur-sm border-b border-slate-100">
            <Link href="/login" className="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z" fill="url(#gradient-about)" />
                    <path d="M14 18L16 12L18 18H14Z" fill="white" />
                    <defs>
                        <linearGradient id="gradient-about" x1="4" y1="2" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4285F4" />
                            <stop offset="1" stopColor="#0EA5E9" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="text-xl font-light tracking-tight" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                    <span className="text-[#4285F4] font-medium">Study</span>
                    <span className="text-[#121317]"> Window</span>
                </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
                <Link href="/about" className="text-sm text-[#4285F4] font-medium">About</Link>
                <Link href="/contact" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">Contact</Link>
                <Link href="/login" className="text-sm text-white bg-[#121317] px-4 py-2 rounded-full hover:bg-[#2d2e33] transition-colors">
                    Sign In
                </Link>
            </nav>
        </div>
    );
}

// ============================================
// VALUE CARD COMPONENT
// ============================================
function ValueCard({ icon: Icon, title, description, color }: {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-[#121317] mb-2" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                {title}
            </h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
                {description}
            </p>
        </div>
    );
}

// ============================================
// ABOUT PAGE
// ============================================
export default function AboutPage() {
    return (
        <>
            {/* Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    background: `
            radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(225,230,236,0.8) 100%),
            linear-gradient(to bottom, rgba(66, 133, 244, 0.05) 0%, transparent 30%, transparent 70%, rgba(14, 165, 233, 0.05) 100%)
          `,
                }}
            />

            <ParticleBackground />
            <Logo />

            <main className="relative z-10 min-h-screen pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-[#45474D] hover:text-[#4285F4] transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>

                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm text-[#4285F4] mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span>Built by students, for students</span>
                        </div>
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-light text-[#121317] mb-6"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            About <span className="text-[#4285F4]">Study Window</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#45474D] max-w-3xl mx-auto leading-relaxed">
                            We believe every IIT Roorkee student deserves easy access to quality study resources.
                            Study Window is our answer to scattered materials, lost notes, and endless searches.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4285F4]">
                                    <Target className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                    Our Mission
                                </h2>
                            </div>
                            <p className="text-[#45474D] leading-relaxed">
                                To create a centralized, organized, and accessible platform for all academic resources
                                at IIT Roorkee — making studying more efficient and collaborative.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                    Our Vision
                                </h2>
                            </div>
                            <p className="text-[#45474D] leading-relaxed">
                                A future where no student struggles to find quality study materials, where knowledge
                                is freely shared, and academic excellence is within everyone&apos;s reach.
                            </p>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="mb-16">
                        <div className="text-center mb-10">
                            <h2
                                className="text-2xl md:text-3xl font-light text-[#121317] mb-3"
                                style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                            >
                                What We Offer
                            </h2>
                            <p className="text-[#6B7280]">Everything you need for academic success</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <ValueCard
                                icon={BookOpen}
                                title="Curated Resources"
                                description="Notes, PYQs, tutorials, and reference materials organized by subject and semester."
                                color="bg-blue-50 text-[#4285F4]"
                            />
                            <ValueCard
                                icon={Users}
                                title="Community Hub"
                                description="Connect with peers, join study groups, and share knowledge across batches."
                                color="bg-purple-50 text-purple-500"
                            />
                            <ValueCard
                                icon={Lightbulb}
                                title="Smart Tools"
                                description="Focus timer, progress tracking, and productivity features to boost your studies."
                                color="bg-amber-50 text-amber-500"
                            />
                            <ValueCard
                                icon={Code}
                                title="Open Platform"
                                description="Contribute resources, suggest improvements, and help build the community."
                                color="bg-emerald-50 text-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 md:p-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-[#4285F4] mb-4">
                            <Heart className="h-5 w-5" />
                            <span className="text-sm font-medium">Built with love</span>
                        </div>
                        <h2
                            className="text-2xl md:text-3xl font-light text-[#121317] mb-4"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            Made by IIT Roorkee Students
                        </h2>
                        <p className="text-[#6B7280] max-w-2xl mx-auto mb-8 leading-relaxed">
                            Study Window is a community-driven initiative. We&apos;re a group of students who experienced
                            the challenges of finding good study materials firsthand — and decided to do something about it.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full bg-[#121317] px-6 py-3 text-white font-medium hover:bg-[#2d2e33] transition-all hover:shadow-lg"
                            >
                                Get in Touch
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-[#121317] font-medium hover:border-blue-200 hover:text-[#4285F4] transition-all"
                            >
                                Join the Platform
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>
        </>
    );
}
