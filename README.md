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
- **Institute Email Only** - Restricted to `*@*.iitr.ac.in` format (e.g., `abc_d@ee.iitr.ac.in`)
- **Magic Link** - Passwordless email authentication
- **Google OAuth** - Quick sign-in with Google (domain restricted)

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Utils**: date-fns

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/studywindow.git
cd studywindow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp env.example .env.local

# 4. Add your Supabase credentials to .env.local

# 5. Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

> ⚠️ **Note**: Without Supabase configuration, the app runs in Demo Mode where timetable and calendar data won't persist.

---

## 🌐 Hosting & Deployment

### Option 1: Vercel (Recommended)

Vercel provides the simplest deployment experience for Next.js apps.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **"New Project"** → Import your repository
   - Add environment variables (see below)
   - Click **Deploy**

3. **Environment Variables** (Add in Vercel Dashboard → Settings → Environment Variables)
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@iitr.ac.in
   ```

### Option 2: Netlify

1. Install the Netlify adapter:
   ```bash
   npm install @netlify/plugin-nextjs
   ```

2. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. Deploy via Netlify Dashboard or CLI

### Option 3: Self-Hosted (VPS)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone https://github.com/YOUR_USERNAME/studywindow.git
cd studywindow
npm install
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "studywindow" -- start
pm2 save && pm2 startup
```

Use Nginx as a reverse proxy for production.

---

## 🔧 Supabase Setup (Required for Full Functionality)

The timetable and calendar features require Supabase to persist data.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** → Choose name, password, and region
3. Wait for initialization (~2 minutes)

### Step 2: Get Your Credentials

Navigate to **Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key

### Step 3: Set Up the Database

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/schema.sql` from this repo
3. Paste and click **Run**

This creates the following tables:
| Table | Description |
|-------|-------------|
| `users` | Extended user profiles (branch, year, etc.) |
| `resources` | Shared academic resources (notes, papers, links) |
| `timetable` | Weekly recurring schedule entries |
| `tasks` | Personal to-do items |
| `events` | One-off calendar events (exams, meetings) |

### Step 4: Configure Environment

Create/update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@iitr.ac.in
```

### Step 5: Configure Authentication

In Supabase Dashboard → **Authentication → Settings**:
1. Set **Site URL** to your deployment URL
2. Add **Redirect URLs**: `https://yourdomain.com/auth/callback`
3. For Google OAuth: Enable in **Providers → Google**

---

## 📤 Uploading Resources

The current resources section uses static curriculum data. To enable dynamic uploads:

### Enable Supabase Storage

1. Create a storage bucket called `resources` in Supabase Dashboard → Storage
2. Add storage policies:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload files"
   ON storage.objects FOR INSERT
   WITH CHECK (auth.role() = 'authenticated');
   
   -- Allow public read
   CREATE POLICY "Public can read resources"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'resources');
   ```

3. Implement an upload component that:
   - Uploads files to Supabase Storage
   - Inserts metadata into the `resources` table
   - Links the file URL to the database record

---

## 🛠 Development Guide

### Adding a New Page

1. Create `src/app/(dashboard)/your-feature/page.tsx`:
   ```tsx
   export default function YourFeaturePage() {
     return (
       <div className="p-4 lg:p-8">
         <h1 className="text-2xl font-bold">Your New Feature</h1>
       </div>
     );
   }
   ```

2. Add to sidebar navigation in `src/components/layout/sidebar.tsx`

### Adding Database Tables

1. Add schema to `supabase/schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.your_table (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
       title TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own data"
   ON public.your_table FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. Add TypeScript types to `src/lib/types.ts`

### Project Structure

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
│   ├── login/                # Login page
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Sidebar, navigation
│   ├── resources/            # Resource components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/             # Database client
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── stores/                   # Zustand state stores
```

---

## 🐛 Troubleshooting

### Demo Mode Active
**Symptom**: Data doesn't save, console shows "Running in DEMO MODE"  
**Solution**: Configure Supabase environment variables

### Authentication Errors
**Symptom**: "Invalid email domain" or login fails  
**Solution**: Check `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` matches your email

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📋 Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🎨 UI/UX

- **Theme**: Clean, academic, minimal with blue/slate palette
- **Navigation**: Sidebar on desktop, hamburger menu on mobile
- **Responsive**: Mobile-first design with scrollable timetable
- **Accessibility**: Built with shadcn/ui for ARIA compliance

---

## 📚 Resources

| Resource | Link |
|----------|------|
| Next.js Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com) |

---

## 📝 License

This project is built for educational purposes for IIT Roorkee students.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

Built with ❤️ for IIT Roorkee students
