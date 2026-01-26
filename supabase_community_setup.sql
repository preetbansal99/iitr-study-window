-- =====================================================
-- STUDYWINDOW COMMUNITY FEATURE - COMPLETE SQL SETUP
-- =====================================================
-- This script DROPS existing tables and creates fresh ones.
-- Run this in Supabase SQL Editor.
-- =====================================================

-- =====================================================
-- 0. DROP EXISTING TABLES (clean slate)
-- =====================================================
-- Order matters due to foreign keys
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Communities table (channels for discussions)
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'branch' CHECK (type IN ('general', 'branch', 'course')),
    reference_id TEXT, -- 'ee', 'cse', 'EEC-206', etc.
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Threads table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Replies table
CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    parent_reply_id UUID REFERENCES replies(id),
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    upvotes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Upvotes table
CREATE TABLE upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('thread', 'reply')),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(item_id, item_type, user_id)
);

-- Memberships table (optional, for channel membership)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, community_id)
);

-- =====================================================
-- 2. CREATE INDEXES (skip if already exist)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_threads_community ON threads(community_id);
CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_thread ON replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_item ON upvotes(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON upvotes(user_id);

-- =====================================================
-- 3. SEED BRANCH COMMUNITIES
-- =====================================================
INSERT INTO communities (name, type, reference_id, description) VALUES
    ('Electrical Engineering', 'branch', 'ee', 'EE branch discussions and resources'),
    ('Computer Science', 'branch', 'cse', 'CSE branch discussions and resources'),
    ('Electronics & Communication', 'branch', 'ece', 'ECE branch discussions'),
    ('Mechanical Engineering', 'branch', 'me', 'ME branch discussions'),
    ('Civil Engineering', 'branch', 'ce', 'CE branch discussions'),
    ('Chemical Engineering', 'branch', 'che', 'Chemical Engineering discussions'),
    ('Biotechnology', 'branch', 'bt', 'Biotechnology discussions'),
    ('Architecture', 'branch', 'arch', 'Architecture discussions'),
    ('General Discussion', 'general', 'general', 'Cross-branch discussions for all students');

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES (drop and recreate to avoid conflicts)
-- =====================================================

-- COMMUNITIES POLICIES
DROP POLICY IF EXISTS "communities_select" ON communities;
DROP POLICY IF EXISTS "communities_admin" ON communities;

CREATE POLICY "communities_select" ON communities 
    FOR SELECT USING (true);

CREATE POLICY "communities_admin" ON communities 
    FOR ALL USING (auth.email() = 'preet_b@ee.iitr.ac.in');

-- THREADS POLICIES
DROP POLICY IF EXISTS "threads_select" ON threads;
DROP POLICY IF EXISTS "threads_insert" ON threads;
DROP POLICY IF EXISTS "threads_update" ON threads;
DROP POLICY IF EXISTS "threads_delete" ON threads;

CREATE POLICY "threads_select" ON threads 
    FOR SELECT USING (true);

CREATE POLICY "threads_insert" ON threads 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "threads_update" ON threads 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "threads_delete" ON threads 
    FOR DELETE USING (auth.uid() = user_id OR auth.email() = 'preet_b@ee.iitr.ac.in');

-- REPLIES POLICIES
DROP POLICY IF EXISTS "replies_select" ON replies;
DROP POLICY IF EXISTS "replies_insert" ON replies;
DROP POLICY IF EXISTS "replies_delete" ON replies;

CREATE POLICY "replies_select" ON replies 
    FOR SELECT USING (true);

CREATE POLICY "replies_insert" ON replies 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "replies_delete" ON replies 
    FOR DELETE USING (auth.uid() = user_id OR auth.email() = 'preet_b@ee.iitr.ac.in');

-- UPVOTES POLICIES
DROP POLICY IF EXISTS "upvotes_select" ON upvotes;
DROP POLICY IF EXISTS "upvotes_manage" ON upvotes;

CREATE POLICY "upvotes_select" ON upvotes 
    FOR SELECT USING (true);

CREATE POLICY "upvotes_manage" ON upvotes 
    FOR ALL USING (auth.uid() = user_id);

-- MEMBERSHIPS POLICIES
DROP POLICY IF EXISTS "memberships_select" ON memberships;
DROP POLICY IF EXISTS "memberships_manage" ON memberships;

CREATE POLICY "memberships_select" ON memberships 
    FOR SELECT USING (true);

CREATE POLICY "memberships_manage" ON memberships 
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. VERIFICATION QUERY
-- =====================================================
-- Run this to verify setup worked:
SELECT 
    'communities' as table_name, 
    count(*) as row_count 
FROM communities
UNION ALL
SELECT 'threads', count(*) FROM threads
UNION ALL
SELECT 'replies', count(*) FROM replies;

-- =====================================================
-- DONE! If no errors, your community feature is ready.
-- =====================================================
