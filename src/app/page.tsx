import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Resource Hub",
    description:
      "Access past papers, lecture notes, video links, and professor contacts all in one place.",
    color: "bg-blue-500",
  },
  {
    icon: CalendarDays,
    title: "Smart Timetable",
    description:
      "Create and manage your weekly schedule with an intuitive grid-based interface.",
    color: "bg-green-500",
  },
  {
    icon: Clock,
    title: "Focus Timer",
    description:
      "Stay productive with a built-in Pomodoro timer designed for deep study sessions.",
    color: "bg-purple-500",
  },
  {
    icon: Users,
    title: "For IITR Students",
    description:
      "Exclusively for IIT Roorkee students with institute email authentication.",
    color: "bg-orange-500",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200/50 backdrop-blur-sm dark:border-slate-800/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 dark:text-white">
                StudyWindow
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                IIT Roorkee
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button variant="outline" className="gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Built for IITR Students
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
              Your Academic{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Access shared resources, manage your schedule, track tasks, and boost your
              productivity. Everything you need to excel at IIT Roorkee, in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg shadow-lg">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/80"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-24 rounded-3xl border border-slate-200/50 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white shadow-2xl">
            <div className="grid gap-8 text-center sm:grid-cols-3">
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="mt-1 text-blue-100">Resources Shared</div>
              </div>
              <div>
                <div className="text-4xl font-bold">1000+</div>
                <div className="mt-1 text-blue-100">Focus Sessions</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100%</div>
                <div className="mt-1 text-blue-100">For IITR Students</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 py-8 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} StudyWindow. Built with ❤️ for IIT Roorkee.
          </p>
        </div>
      </footer>
    </div>
  );
}
