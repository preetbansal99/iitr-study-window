"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, Send, ArrowLeft, CheckCircle2 } from "lucide-react";

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
                    <path d="M16 2L4 28H10L12.5 22H19.5L22 28H28L16 2Z" fill="url(#gradient-contact)" />
                    <path d="M14 18L16 12L18 18H14Z" fill="white" />
                    <defs>
                        <linearGradient id="gradient-contact" x1="4" y1="2" x2="28" y2="28" gradientUnits="userSpaceOnUse">
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
                <Link href="/about" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">About</Link>
                <Link href="/contact" className="text-sm text-[#4285F4] font-medium">Contact</Link>
                <Link href="/login" className="text-sm text-white bg-[#121317] px-4 py-2 rounded-full hover:bg-[#2d2e33] transition-colors">
                    Sign In
                </Link>
            </nav>
        </div>
    );
}

// ============================================
// CONTACT PAGE
// ============================================
export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd send this to an API
        setSubmitted(true);
    };

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
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-[#45474D] hover:text-[#4285F4] transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1
                            className="text-4xl md:text-5xl font-light text-[#121317] mb-4"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            Get in Touch
                        </h1>
                        <p className="text-lg text-[#45474D] max-w-2xl mx-auto">
                            Have questions, feedback, or want to collaborate? We&apos;d love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 space-y-6">
                                <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                    Contact Information
                                </h2>

                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#4285F4]">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#6B7280]">Email us at</p>
                                            <a
                                                href="mailto:iitrstudywindow@gmail.com"
                                                className="text-[#121317] font-medium hover:text-[#4285F4] transition-colors"
                                            >
                                                iitrstudywindow@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-emerald-500">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#6B7280]">Location</p>
                                            <p className="text-[#121317]">IIT Roorkee, Uttarakhand</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#6B7280]">Response time</p>
                                            <p className="text-[#121317]">Within 24-48 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick note */}
                            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100">
                                <p className="text-sm text-[#45474D] leading-relaxed">
                                    💡 <strong>Tip:</strong> For faster responses, include your enrollment number in your email when asking about course-specific resources.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-[#121317] mb-2">Message Sent!</h3>
                                    <p className="text-[#6B7280]">We&apos;ll get back to you within 24-48 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-[#121317] mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#121317] mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formState.email}
                                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="your.email@iitr.ac.in"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#121317] mb-1.5">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formState.subject}
                                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="What's this about?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#121317] mb-1.5">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formState.message}
                                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                            placeholder="Tell us more..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full btn-antigravity flex items-center justify-center gap-2 rounded-xl bg-[#121317] px-6 py-4 text-white font-medium hover:bg-[#2d2e33] hover:shadow-lg transition-all"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Message
                                    </button>
                                </form>
                            )}
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
