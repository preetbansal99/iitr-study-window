"use client";

import { useEffect, useRef, useState } from "react";
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
            // Reduced particle count for better performance
            const count = Math.floor((canvas.width * canvas.height) / 12000);

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
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
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
            </Link>

            <nav className="hidden md:flex items-center gap-6">
                <Link href="/about" className="text-sm text-[#4285F4] font-medium">About</Link>
                <Link href="/about/features" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">Features</Link>
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
// SCROLL ZOOM SECTION COMPONENT
// ============================================
function ScrollZoomSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.85);
    const [opacity, setOpacity] = useState(0.6);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
            const maxDistance = windowHeight / 2 + rect.height / 2;

            // Calculate progress (0 = far, 1 = centered)
            const progress = Math.max(0, 1 - distanceFromCenter / maxDistance);

            // Scale from 0.85 to 1 for dramatic effect
            const newScale = 0.85 + progress * 0.15;
            // Opacity from 0.6 to 1
            const newOpacity = 0.6 + progress * 0.4;

            setScale(newScale);
            setOpacity(newOpacity);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            ref={sectionRef}
            className={className}
            style={{
                transform: `scale(${scale})`,
                opacity: opacity,
                transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                willChange: 'transform, opacity',
            }}
        >
            {children}
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
                            <span>Made by IITR students</span>
                        </div>
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-light text-[#121317] mb-6"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            About <span className="text-[#4285F4]">Study Window</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#45474D] max-w-3xl mx-auto leading-relaxed">
                            We got tired of asking seniors for notes, searching through dozens of WhatsApp groups,
                            and losing track of PYQs. So we built this.
                        </p>
                    </div>

                    {/* Why We Built This */}
                    <ScrollZoomSection className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4285F4]">
                                    <Target className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                    The Problem
                                </h2>
                            </div>
                            <p className="text-[#45474D] leading-relaxed">
                                Notes scattered across Google Drives. PYQs lost in WhatsApp forwards.
                                No central place to find what you need before exams.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                    Our Solution
                                </h2>
                            </div>
                            <p className="text-[#45474D] leading-relaxed">
                                One place for everything. Organized by semester and branch.
                                Plus a timetable, calendar, and timer to stay on track.
                            </p>
                        </div>
                    </ScrollZoomSection>

                    {/* What's Included */}
                    <ScrollZoomSection className="mb-16">
                        <div className="text-center mb-10">
                            <h2
                                className="text-2xl md:text-3xl font-light text-[#121317] mb-3"
                                style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                            >
                                What&apos;s Included
                            </h2>
                            <p className="text-[#6B7280]">The stuff we&apos;ve built so far</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <ValueCard
                                icon={BookOpen}
                                title="Resources"
                                description="Notes, PYQs, and videos sorted by semester and branch."
                                color="bg-blue-50 text-[#4285F4]"
                            />
                            <ValueCard
                                icon={Users}
                                title="Timetable"
                                description="Add your weekly schedule and see today's classes on the dashboard."
                                color="bg-indigo-50 text-indigo-500"
                            />
                            <ValueCard
                                icon={Lightbulb}
                                title="Timer & Tasks"
                                description="Pomodoro timer and a task list to track what you need to do."
                                color="bg-amber-50 text-amber-500"
                            />
                            <ValueCard
                                icon={Code}
                                title="Calendar"
                                description="IIT-R holidays, exam dates, and your personal events."
                                color="bg-emerald-50 text-emerald-500"
                            />
                        </div>

                        {/* Explore Features CTA */}
                        <div className="text-center mt-8">
                            <Link
                                href="/about/features"
                                className="inline-flex items-center gap-2 rounded-full border border-[#4285F4] text-[#4285F4] px-6 py-3 font-medium hover:bg-[#4285F4] hover:text-white transition-all"
                            >
                                <Sparkles className="h-4 w-4" />
                                Explore All Features
                            </Link>
                        </div>
                    </ScrollZoomSection>

                    {/* Team Section */}
                    <ScrollZoomSection>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 md:p-12 text-center hover:shadow-xl transition-shadow duration-300">
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
                    </ScrollZoomSection>
                </div>
            </main>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>
        </>
    );
}
