-- Sentinel AI Supabase migration
-- Run this file in Supabase SQL editor (copy/paste).

-- 0) Enable extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'user',
  trust_score integer NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Community reports table
CREATE TABLE IF NOT EXISTS public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  title text,
  area text,
  severity text,
  photo_url text,
  image_url text,
  reporter text,
  endorsements integer DEFAULT 0,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  trust_score integer NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (verification_status IN ('pending','verified','rejected'))
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_community_reports_user_id ON public.community_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON public.community_reports (created_at);
CREATE INDEX IF NOT EXISTS idx_community_reports_category ON public.community_reports (category);
CREATE INDEX IF NOT EXISTS idx_community_reports_verification_status ON public.community_reports (verification_status);
CREATE INDEX IF NOT EXISTS idx_community_reports_lat_lon ON public.community_reports (latitude, longitude);

-- 4) updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to tables
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_community_reports ON public.community_reports;
CREATE TRIGGER set_updated_at_community_reports
  BEFORE UPDATE ON public.community_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) Automatic profile creation on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  preferred_name text;
  the_email text;
BEGIN
  -- user metadata may be stored in user_metadata or raw_user_meta_data depending on Supabase version
  preferred_name := COALESCE(NEW.user_metadata::json->>'full_name', NEW.raw_user_meta_data::json->>'full_name', NEW.email);
  the_email := NEW.email;

  INSERT INTO public.profiles (id, full_name, email, role, trust_score)
  VALUES (NEW.id, COALESCE(preferred_name, ''), the_email, 'user', 50)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (fires when a new auth user is created)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 6) Enable Row Level Security and policies

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own profile
CREATE POLICY IF NOT EXISTS "Profiles: select own" ON public.profiles
  FOR SELECT USING ( auth.uid() = id );

-- Allow users to INSERT their own profile (auth.uid() must equal the id being inserted)
CREATE POLICY IF NOT EXISTS "Profiles: insert own" ON public.profiles
  FOR INSERT WITH CHECK ( auth.uid() = id );

-- Allow users to UPDATE their own profile but prevent changing role or trust_score
-- The WITH CHECK ensures the NEW.role and NEW.trust_score equal the existing stored values (owner cannot change them)
CREATE POLICY IF NOT EXISTS "Profiles: update own restricted" ON public.profiles
  FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND trust_score = (SELECT trust_score FROM public.profiles WHERE id = auth.uid())
  );

-- COMMUNITY_REPORTS RLS
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT community reports
CREATE POLICY IF NOT EXISTS "CommunityReports: select authenticated" ON public.community_reports
  FOR SELECT USING ( auth.role() = 'authenticated' );

-- Allow authenticated users to INSERT reports where user_id = auth.uid()
CREATE POLICY IF NOT EXISTS "CommunityReports: insert own" ON public.community_reports
  FOR INSERT WITH CHECK ( auth.uid() = user_id AND auth.role() = 'authenticated' );

-- Allow owners to UPDATE their own reports but prevent changing verification_status or trust_score
CREATE POLICY IF NOT EXISTS "CommunityReports: update own restricted" ON public.community_reports
  FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK (
    auth.uid() = user_id
    AND verification_status = (SELECT verification_status FROM public.community_reports WHERE id = NEW.id)
    AND trust_score = (SELECT trust_score FROM public.community_reports WHERE id = NEW.id)
  );

-- Allow owners to DELETE their own reports
CREATE POLICY IF NOT EXISTS "CommunityReports: delete own" ON public.community_reports
  FOR DELETE USING ( auth.uid() = user_id );

-- Note: Administrators or backend processes using the service_role key bypass RLS and can update verification_status/trust_score.

-- 7) Storage bucket for report images
-- Attempt to create a public bucket named 'report-photos'. If the storage extension is available, this will create the bucket.
-- If this statement fails, create the bucket using the Supabase UI (Storage > Create new bucket) and mark it Public.

-- Create bucket (public) - may succeed in SQL editor depending on Supabase configuration
SELECT storage.create_bucket('report-photos', true);

-- Storage policies guidance (run in SQL editor if you want to create policies for authenticated uploads):
-- The storage schema has a table storage.objects. Below is an example policy allowing authenticated users to insert objects into the report-photos bucket.
-- Uncomment and run if your Supabase project exposes storage.objects to SQL policy creation.

-- CREATE POLICY IF NOT EXISTS "Allow authenticated to insert into report-photos" ON storage.objects
--   FOR INSERT USING ( auth.role() = 'authenticated' )
--   WITH CHECK ( bucket_id = 'report-photos' AND auth.role() = 'authenticated' );

-- End of migration

-- Helpful queries for verification:
-- SELECT * FROM public.profiles LIMIT 5;
-- SELECT * FROM public.community_reports ORDER BY created_at DESC LIMIT 5;

-- End
