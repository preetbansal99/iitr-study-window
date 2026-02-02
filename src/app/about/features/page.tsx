"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft, BookOpen, Users, Clock, Shield,
    FileText, Download, Search, FolderOpen,
    MessageCircle, UserPlus, Share2,
    Timer, BarChart3, Target, CheckSquare,
    Lock, Calendar, CalendarDays, Table2,
    ChevronDown, ChevronUp, Bell, RefreshCw
} from "lucide-react";

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

            const progress = Math.max(0, 1 - distanceFromCenter / maxDistance);
            const newScale = 0.85 + progress * 0.15;
            const newOpacity = 0.6 + progress * 0.4;

            setScale(newScale);
            setOpacity(newOpacity);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

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
            canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
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
            mouseRef.current.y = e.clientY + window.scrollY;
        };
        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("scroll", () => {
            mouseRef.current.y = mouseRef.current.y;
        }, { passive: true });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouse = mouseRef.current;
            const repelRadius = 120;

            particlesRef.current.forEach((particle) => {
                const dx = mouse.x - particle.x;
                const dy = (mouse.y - window.scrollY) - particle.y;
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
// FEATURE SECTION COMPONENT
// ============================================
function FeatureSection({
    icon: Icon,
    title,
    tagline,
    features,
    color,
    howItWorks
}: {
    icon: React.ElementType;
    title: string;
    tagline: string;
    features: { icon: React.ElementType; title: string; detail: string }[];
    color: string;
    howItWorks: string[];
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <ScrollZoomSection>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200">
                {/* Header */}
                <div className={`p-6 ${color}`}>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-sm">
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-[#121317]" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                {title}
                            </h2>
                            <p className="text-sm text-[#45474D]">{tagline}</p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="p-6 border-t border-slate-100">
                    <div className="grid sm:grid-cols-2 gap-3">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-blue-50/50 transition-colors">
                                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-white flex items-center justify-center text-[#4285F4] shadow-sm">
                                    <feature.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#121317] text-sm">{feature.title}</h4>
                                    <p className="text-xs text-[#6B7280] leading-relaxed mt-0.5">{feature.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* How It Works */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[#4285F4] text-sm font-medium mt-5 hover:underline"
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExpanded ? "Hide" : "How to use"}
                    </button>

                    {isExpanded && (
                        <div className="mt-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                            <ol className="space-y-2">
                                {howItWorks.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-[#45474D]">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4285F4] text-white text-xs flex items-center justify-center font-medium mt-0.5">
                                            {idx + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </ScrollZoomSection>
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
                <Link href="/about" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">About</Link>
                <Link href="/about/features" className="text-sm text-[#4285F4] font-medium">Features</Link>
                <Link href="/contact" className="text-sm text-[#45474D] hover:text-[#4285F4] transition-colors">Contact</Link>
                <Link href="/login" className="text-sm text-white bg-[#121317] px-4 py-2 rounded-full hover:bg-[#2d2e33] transition-colors">
                    Sign In
                </Link>
            </nav>
        </div>
    );
}

// ============================================
// FEATURES PAGE
// ============================================
export default function FeaturesPage() {
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

            <main className="relative z-10 min-h-screen pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/about"
                        className="inline-flex items-center gap-2 text-sm text-[#45474D] hover:text-[#4285F4] transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to About
                    </Link>

                    {/* Hero Section */}
                    <ScrollZoomSection className="text-center mb-10">
                        <h1
                            className="text-3xl md:text-4xl font-light text-[#121317] mb-3"
                            style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}
                        >
                            What&apos;s on <span className="text-[#4285F4]">Study Window</span>
                        </h1>
                        <p className="text-[#6B7280] max-w-xl mx-auto">
                            Everything we&apos;ve built so far. More coming soon.
                        </p>
                    </ScrollZoomSection>

                    {/* Feature Sections */}
                    <div className="space-y-6">

                        {/* Resources */}
                        <FeatureSection
                            icon={BookOpen}
                            title="Resources"
                            tagline="Notes, PYQs, and videos sorted by semester"
                            color="bg-gradient-to-r from-blue-50 to-sky-50"
                            features={[
                                { icon: FolderOpen, title: "Organized by Semester", detail: "Find stuff for your current sem without digging" },
                                { icon: FileText, title: "Previous Year Papers", detail: "PYQs with solutions (when we have them)" },
                                { icon: Download, title: "Notes from Seniors", detail: "Handwritten and typed notes people have shared" },
                                { icon: Search, title: "Search", detail: "Filter by subject, type, or just search" },
                            ]}
                            howItWorks={[
                                "Log in with your @iitr.ac.in email",
                                "Go to Resources from the sidebar",
                                "Pick your branch and semester",
                                "Download what you need"
                            ]}
                        />

                        {/* Timetable */}
                        <FeatureSection
                            icon={Table2}
                            title="Weekly Timetable"
                            tagline="Add your classes, see your week at a glance"
                            color="bg-gradient-to-r from-indigo-50 to-violet-50"
                            features={[
                                { icon: CalendarDays, title: "Week View", detail: "Monday to Saturday, 8 AM to 7 PM grid" },
                                { icon: Bell, title: "Class Types", detail: "Lectures, tutorials, practicals — color coded" },
                                { icon: FolderOpen, title: "Room & Prof Info", detail: "Add room numbers and professor names" },
                                { icon: RefreshCw, title: "Schedule Overrides", detail: "When Saturday has Monday's classes, we handle it" },
                            ]}
                            howItWorks={[
                                "Go to Timetable from the dashboard",
                                "Click on any empty slot",
                                "Add subject, type, room, and time",
                                "It shows up on your dashboard too"
                            ]}
                        />

                        {/* Academic Calendar */}
                        <FeatureSection
                            icon={Calendar}
                            title="Academic Calendar"
                            tagline="IIT-R official holidays, exams, and breaks"
                            color="bg-gradient-to-r from-rose-50 to-pink-50"
                            features={[
                                { icon: CalendarDays, title: "Holidays", detail: "All official holidays so you know when to sleep in" },
                                { icon: FileText, title: "Exam Dates", detail: "Mid-sem and end-sem periods marked" },
                                { icon: RefreshCw, title: "Timetable Overrides", detail: "Compensatory classes (Monday on Saturday, etc.)" },
                                { icon: Bell, title: "Vacations", detail: "Mid-sem breaks and other vacations" },
                            ]}
                            howItWorks={[
                                "Go to Calendar from the sidebar",
                                "Browse by month — holidays show automatically",
                                "Your timetable entries appear on relevant days",
                                "Add your own events too (exams, deadlines)"
                            ]}
                        />

                        {/* Focus Timer */}
                        <FeatureSection
                            icon={Clock}
                            title="Focus Timer"
                            tagline="Track how long you actually study"
                            color="bg-gradient-to-r from-amber-50 to-orange-50"
                            features={[
                                { icon: Timer, title: "Pomodoro Timer", detail: "25/45/60 min sessions with breaks" },
                                { icon: Target, title: "Link to Tasks", detail: "Connect timer to what you're working on" },
                                { icon: BarChart3, title: "Session History", detail: "See how much you studied this week" },
                                { icon: CheckSquare, title: "Daily Stats", detail: "Track streaks and total hours" },
                            ]}
                            howItWorks={[
                                "Timer is on your dashboard",
                                "Pick a duration and optionally select a task",
                                "Hit start and focus",
                                "Take a break when it rings"
                            ]}
                        />

                        {/* Tasks */}
                        <FeatureSection
                            icon={CheckSquare}
                            title="Task List"
                            tagline="Keep track of assignments and deadlines"
                            color="bg-gradient-to-r from-emerald-50 to-green-50"
                            features={[
                                { icon: Target, title: "Priorities", detail: "Mark tasks as low, medium, or high priority" },
                                { icon: Calendar, title: "Due Dates", detail: "Set deadlines so you don't forget" },
                                { icon: BookOpen, title: "Link to Subjects", detail: "Connect tasks to specific courses" },
                                { icon: CheckSquare, title: "Quick Add", detail: "Add tasks right from the dashboard" },
                            ]}
                            howItWorks={[
                                "Tasks panel is on your dashboard",
                                "Click + to add a new task",
                                "Set priority and due date",
                                "Check off when done"
                            ]}
                        />

                        {/* Community */}
                        <FeatureSection
                            icon={Users}
                            title="Community"
                            tagline="Share resources and ask questions"
                            color="bg-gradient-to-r from-purple-50 to-fuchsia-50"
                            features={[
                                { icon: MessageCircle, title: "Discussions", detail: "Ask doubts, share tips, help others" },
                                { icon: Share2, title: "Resource Sharing", detail: "Upload notes for others to use" },
                                { icon: UserPlus, title: "Branch Channels", detail: "Talk to people in your department" },
                                { icon: FolderOpen, title: "Shared Folders", detail: "Community-curated study material" },
                            ]}
                            howItWorks={[
                                "Go to Community from the sidebar",
                                "Join your branch channel",
                                "Browse discussions or post your own",
                                "Share resources with the community"
                            ]}
                        />

                        {/* IIT-R Only */}
                        <FeatureSection
                            icon={Shield}
                            title="IITR Students Only"
                            tagline="Why we ask for your institute email"
                            color="bg-gradient-to-r from-slate-50 to-gray-100"
                            features={[
                                { icon: Lock, title: "Verified Access", detail: "Only @iitr.ac.in emails can sign up" },
                                { icon: Calendar, title: "Official Calendar", detail: "Synced with IIT Roorkee academic calendar" },
                                { icon: FolderOpen, title: "Department Resources", detail: "Materials specific to your branch" },
                                { icon: Users, title: "Your Batch", detail: "Connect with people in your year" },
                            ]}
                            howItWorks={[
                                "Sign in with Google using your IITR email",
                                "We detect your branch from your email",
                                "You get access to your department's resources",
                                "That's it — no verification needed"
                            ]}
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 text-center">
                        <div className="bg-[#121317] rounded-2xl p-8 text-white">
                            <h2 className="text-xl md:text-2xl font-light mb-3" style={{ fontFamily: "'Google Sans', 'Outfit', sans-serif" }}>
                                Try it out
                            </h2>
                            <p className="text-white/70 mb-5 text-sm max-w-md mx-auto">
                                Just sign in with your IITR email. It&apos;s free and takes 10 seconds.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[#121317] font-medium hover:shadow-lg transition-all text-sm"
                            >
                                Sign in with Google
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
