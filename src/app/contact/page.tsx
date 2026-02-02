"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, ArrowLeft } from "lucide-react";

// ============================================
// REPELLING PARTICLE BACKGROUND
// ============================================
interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    baseSize: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    baseOpacity: number;
    colorIndex: number;
}

function RepellingParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Color palette for particles
        const colors = [
            "rgba(124, 185, 232,", // Light blue
            "rgba(96, 165, 250,",  // Blue
            "rgba(59, 130, 246,",  // Bright blue
            "rgba(14, 165, 233,",  // Cyan blue
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesRef.current = createParticles();
        };

        const createParticles = () => {
            const particles: Particle[] = [];
            // Even more particles for denser look
            const count = Math.floor((canvas.width * canvas.height) / 4000);

            for (let i = 0; i < count; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const baseSize = Math.random() * 2.5 + 1;
                const baseOpacity = Math.random() * 0.15 + 0.08;
                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    baseSize,
                    size: baseSize,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    opacity: baseOpacity,
                    baseOpacity,
                    colorIndex: Math.floor(Math.random() * colors.length),
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

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouse = mouseRef.current;
            const repelRadius = 120;

            particlesRef.current.forEach((particle) => {
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < repelRadius && distance > 0) {
                    const force = (repelRadius - distance) / repelRadius;
                    const angle = Math.atan2(dy, dx);
                    particle.x -= Math.cos(angle) * force * 4;
                    particle.y -= Math.sin(angle) * force * 4;

                    // Dynamic size increase when repelled
                    particle.size = particle.baseSize * (1 + force * 1.5);
                    // Dynamic opacity increase when repelled
                    particle.opacity = Math.min(0.5, particle.baseOpacity * (1 + force * 3));
                } else {
                    particle.x += (particle.baseX - particle.x) * 0.03;
                    particle.y += (particle.baseY - particle.y) * 0.03;
                    // Return to base size/opacity smoothly
                    particle.size += (particle.baseSize - particle.size) * 0.08;
                    particle.opacity += (particle.baseOpacity - particle.opacity) * 0.08;
                }

                particle.baseX += particle.speedX;
                particle.baseY += particle.speedY;

                if (particle.baseX < -10) particle.baseX = canvas.width + 10;
                if (particle.baseX > canvas.width + 10) particle.baseX = -10;
                if (particle.baseY < -10) particle.baseY = canvas.height + 10;
                if (particle.baseY > canvas.height + 10) particle.baseY = -10;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = colors[particle.colorIndex] + particle.opacity + ")";
                ctx.fill();
            });

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
                    <rect x="4" y="8" width="18" height="32" rx="2" stroke="#7CB9E8" strokeWidth="2.5" fill="none" />
                    <text x="13" y="20" fill="#7CB9E8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="system-ui">S</text>
                    <text x="13" y="32" fill="#7CB9E8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="system-ui">W</text>
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
                <Link href="/about" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">About</Link>
                <Link href="/about/features" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">Features</Link>
                <Link href="/contact" className="text-sm text-[#4285F4] font-medium">Contact</Link>
                <Link href="/login" className="text-sm text-white bg-[#121317] px-4 py-2 rounded-full hover:bg-[#2d2e33] transition-colors">
                    Sign In
                </Link>
            </nav>
        </div>
    );
}

// ============================================
// CONTACT PAGE - SIMPLIFIED
// ============================================
export default function ContactPage() {
    return (
        <>
            {/* Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    background: `radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(225,230,236,0.8) 100%)`,
                }}
            />

            <RepellingParticleBackground />
            <Logo />

            <main className="relative z-10 min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
                <div className="max-w-md w-full">
                    {/* Back Link */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-[#45474D] hover:text-[#4285F4] transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1
                            className="text-3xl md:text-4xl font-light text-[#121317] mb-3"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            Contact Us
                        </h1>
                        <p className="text-[#6B7280]">
                            We&apos;d love to hear from you
                        </p>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 space-y-6">
                        {/* Email */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#4285F4]">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">Email</p>
                                <a
                                    href="mailto:iitrstudywindow@gmail.com"
                                    className="text-[#121317] font-medium hover:text-[#4285F4] transition-colors"
                                >
                                    iitrstudywindow@gmail.com
                                </a>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Location */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">Location</p>
                                <p className="text-[#121317] font-medium">IIT Roorkee, Uttarakhand</p>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Response Time */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">Response Time</p>
                                <p className="text-[#121317] font-medium">Within 24-48 hours</p>
                            </div>
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
