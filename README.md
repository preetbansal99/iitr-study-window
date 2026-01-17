# StudyWindow - IIT Roorkee

Your academic command center at IIT Roorkee. A comprehensive student productivity and resource platform modeled for IITR students.

![StudyWindow](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E)

## 🚀 Features

### 📚 Resource Hub
- **Past Year Papers** - Access PDFs of previous exams
- **Lecture Notes** - Shared notes from students
- **Video Links** - NPTEL/YouTube educational content
- **Professor Directory** - Contact information and office hours

### 📅 Study Command Center
- **Weekly Timetable** - Visual grid from 8 AM to 7 PM with 1-hour slots
- **Focus Timer** - Pomodoro-style timer with customizable durations
- **Task Manager** - Quick to-do list with completion tracking
- **Integrated Calendar** - Monthly view combining timetable and events

### 🔐 Authentication
- **Institute Email Only** - Restricted to `@abc.iit.ac.in` domain
- **Magic Link** - Passwordless email authentication
- **Google OAuth** - Quick sign-in with Google (domain restricted)

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Utils**: date-fns

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studywindow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
   
   Then fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@iitr.ac.in
   ```

4. **Set up the database**
   
   Go to your Supabase SQL Editor and run the contents of `supabase/schema.sql`.
   This will create all necessary tables, policies, and triggers.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── resources/        # Resource hub
│   │   ├── timetable/        # Weekly timetable
│   │   ├── calendar/         # Monthly calendar
│   │   └── settings/         # User settings
│   ├── auth/callback/        # OAuth callback handler
│   ├── login/               # Login page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   ├── layout/              # Layout components (sidebar, nav)
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase/            # Supabase client configurations
│   ├── auth.ts              # Authentication utilities
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
├── stores/
│   ├── timer-store.ts       # Pomodoro timer state
│   └── task-store.ts        # Task management state
└── middleware.ts            # Route protection middleware
```

## 🗄 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | Extended user profiles (branch, year, etc.) |
| `resources` | Shared academic resources (notes, papers, links) |
| `timetable` | Weekly recurring schedule entries |
| `tasks` | Personal to-do items |
| `events` | One-off calendar events (exams, meetings) |

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only read/write their own data
- Resources are visible to all authenticated users
- Automatic profile creation on signup via trigger

## 🎨 UI/UX

- **Theme**: Clean, academic, minimal with blue/slate palette
- **Navigation**: Sidebar on desktop, hamburger menu on mobile
- **Responsive**: Mobile-first design with scrollable timetable
- **Accessibility**: Built with shadcn/ui for ARIA compliance

## 🔧 Configuration

### Email Domain Restriction

Update the allowed domain in `.env.local`:
```env
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@iitr.ac.in
```

### Timer Settings

Default Pomodoro settings (customizable in Settings):
- Focus: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes
- Sessions until long break: 4

## 📝 License

This project is built for educational purposes for IIT Roorkee students.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

Built with ❤️ for IIT Roorkee students
