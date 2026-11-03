-- ============================================================
-- IEEE WUSL — Database Schema Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'administrator', 'editor');
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE event_category AS ENUM ('workshop', 'seminar', 'competition', 'social', 'webinar', 'conference', 'hackathon', 'other');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  role         user_role NOT NULL DEFAULT 'editor',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- COMMITTEE TERMS
-- ============================================================

CREATE TABLE public.committee_terms (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label        TEXT NOT NULL,           -- e.g. "2024/2025"
  start_year   INT NOT NULL,
  end_year     INT NOT NULL,
  is_current   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_committee_terms_updated_at
  BEFORE UPDATE ON public.committee_terms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TEAM MEMBERS
-- ============================================================

CREATE TABLE public.team_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       TEXT NOT NULL,
  role_title      TEXT NOT NULL,
  bio             TEXT,
  photo_url       TEXT,
  photo_path      TEXT,             -- Supabase Storage path
  email           TEXT,
  linkedin_url    TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  term_id         UUID REFERENCES public.committee_terms(id) ON DELETE SET NULL,
  status          publication_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_members_term_id ON public.team_members(term_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);

CREATE TRIGGER set_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CHAPTERS / AFFINITY GROUPS
-- ============================================================

CREATE TABLE public.chapters (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  short_desc      TEXT,
  description     TEXT,
  logo_url        TEXT,
  logo_path       TEXT,
  website_url     TEXT,
  founded_year    INT,
  status          publication_status NOT NULL DEFAULT 'draft',
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chapters_slug ON public.chapters(slug);
CREATE INDEX idx_chapters_status ON public.chapters(status);

CREATE TRIGGER set_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE public.events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  summary          TEXT,
  description      TEXT,
  category         event_category NOT NULL DEFAULT 'other',
  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ,
  venue            TEXT,
  is_online        BOOLEAN NOT NULL DEFAULT FALSE,
  meeting_url      TEXT,
  cover_url        TEXT,
  cover_path       TEXT,
  registration_url TEXT,
  organizer        TEXT,
  chapter_id       UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  status           publication_status NOT NULL DEFAULT 'draft',
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_at ON public.events(start_at DESC);
CREATE INDEX idx_events_chapter_id ON public.events(chapter_id);
CREATE INDEX idx_events_featured ON public.events(featured) WHERE status = 'published';

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- NEWS ARTICLES
-- ============================================================

CREATE TABLE public.news_articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  content         TEXT,               -- HTML from rich text editor
  cover_url       TEXT,
  cover_path      TEXT,
  author_name     TEXT,
  author_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status          publication_status NOT NULL DEFAULT 'draft',
  published_at    TIMESTAMPTZ,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_slug ON public.news_articles(slug);
CREATE INDEX idx_news_status ON public.news_articles(status);
CREATE INDEX idx_news_published_at ON public.news_articles(published_at DESC NULLS LAST);
CREATE INDEX idx_news_tags ON public.news_articles USING GIN(tags);

CREATE TRIGGER set_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-set published_at
CREATE OR REPLACE FUNCTION public.handle_news_publish()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_news_publish
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_news_publish();

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  description     TEXT,
  cover_url       TEXT,
  cover_path      TEXT,
  members         TEXT[],              -- Names as text array
  start_date      DATE,
  end_date        DATE,
  github_url      TEXT,
  demo_url        TEXT,
  chapter_id      UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  status          publication_status NOT NULL DEFAULT 'draft',
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- GALLERY ALBUMS
-- ============================================================

CREATE TABLE public.gallery_albums (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  cover_url       TEXT,
  cover_path      TEXT,
  event_id        UUID REFERENCES public.events(id) ON DELETE SET NULL,
  event_date      DATE,
  status          publication_status NOT NULL DEFAULT 'draft',
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_albums_slug ON public.gallery_albums(slug);
CREATE INDEX idx_gallery_albums_status ON public.gallery_albums(status);

CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- GALLERY IMAGES
-- ============================================================

CREATE TABLE public.gallery_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id        UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  alt_text        TEXT,
  caption         TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_images_album_id ON public.gallery_images(album_id);

CREATE TRIGGER set_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SITE SETTINGS (key-value store)
-- ============================================================

CREATE TABLE public.site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Default settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('hero_heading', '"Engineering Ideas. Creating Impact."', 'Hero section main heading'),
  ('hero_subheading', '"The IEEE Student Branch at Wayamba University of Sri Lanka — connecting engineers, driving innovation, and building the future of technology."', 'Hero section subheading'),
  ('hero_image_url', 'null', 'Hero background image URL'),
  ('contact_email', '"ieee.wusl@gmail.com"', 'Primary contact email'),
  ('contact_phone', 'null', 'Contact phone number'),
  ('social_linkedin', 'null', 'LinkedIn page URL'),
  ('social_facebook', 'null', 'Facebook page URL'),
  ('social_instagram', 'null', 'Instagram page URL'),
  ('social_twitter', 'null', 'Twitter/X page URL'),
  ('social_youtube', 'null', 'YouTube channel URL'),
  ('footer_tagline', '"Connecting Engineers. Driving Innovation."', 'Footer tagline'),
  ('university_name', '"Wayamba University of Sri Lanka"', 'University full name'),
  ('branch_founded', '"2010"', 'Year the branch was founded'),
  ('stat_members', 'null', 'Total member count (null to hide)'),
  ('stat_events', 'null', 'Total events count (null to hide)'),
  ('stat_projects', 'null', 'Total projects count (null to hide)'),
  ('stat_chapters', 'null', 'Number of chapters (null to hide)');

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = TRUE
      AND role IN ('super_admin', 'administrator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = TRUE
      AND role IN ('super_admin', 'administrator', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = TRUE
      AND role = 'super_admin'
  );
$$;

-- ============================================================
-- RLS POLICIES — PROFILES
-- ============================================================

-- Authenticated users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Super admin can read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_super_admin());

-- Users update their own profile (not role)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Super admin can update all profiles including role
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ============================================================
-- RLS POLICIES — COMMITTEE TERMS
-- ============================================================

CREATE POLICY "committee_terms_public_read" ON public.committee_terms
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "committee_terms_admin_write" ON public.committee_terms
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES — TEAM MEMBERS
-- ============================================================

CREATE POLICY "team_members_public_read" ON public.team_members
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "team_members_editor_read" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "team_members_editor_write" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "team_members_editor_update" ON public.team_members
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_above())
  WITH CHECK (
    CASE
      WHEN public.is_admin() THEN TRUE
      ELSE status != 'published' -- editors can't publish directly
    END
  );

CREATE POLICY "team_members_admin_delete" ON public.team_members
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — CHAPTERS
-- ============================================================

CREATE POLICY "chapters_public_read" ON public.chapters
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "chapters_editor_read_all" ON public.chapters
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "chapters_editor_write" ON public.chapters
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "chapters_editor_update" ON public.chapters
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "chapters_admin_delete" ON public.chapters
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — EVENTS
-- ============================================================

CREATE POLICY "events_public_read" ON public.events
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "events_editor_read_all" ON public.events
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "events_editor_write" ON public.events
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "events_editor_update" ON public.events
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "events_admin_delete" ON public.events
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — NEWS ARTICLES
-- ============================================================

CREATE POLICY "news_public_read" ON public.news_articles
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "news_editor_read_all" ON public.news_articles
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "news_editor_write" ON public.news_articles
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "news_editor_update" ON public.news_articles
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "news_admin_delete" ON public.news_articles
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — PROJECTS
-- ============================================================

CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "projects_editor_read_all" ON public.projects
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "projects_editor_write" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "projects_editor_update" ON public.projects
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "projects_admin_delete" ON public.projects
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — GALLERY ALBUMS
-- ============================================================

CREATE POLICY "gallery_albums_public_read" ON public.gallery_albums
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "gallery_albums_editor_read_all" ON public.gallery_albums
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "gallery_albums_editor_write" ON public.gallery_albums
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "gallery_albums_editor_update" ON public.gallery_albums
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "gallery_albums_admin_delete" ON public.gallery_albums
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — GALLERY IMAGES
-- ============================================================

CREATE POLICY "gallery_images_public_read" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gallery_albums ga
    WHERE ga.id = album_id AND ga.status = 'published'
  ));

CREATE POLICY "gallery_images_editor_read_all" ON public.gallery_images
  FOR SELECT TO authenticated USING (public.is_editor_or_above());

CREATE POLICY "gallery_images_editor_write" ON public.gallery_images
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_above());

CREATE POLICY "gallery_images_editor_update" ON public.gallery_images
  FOR UPDATE TO authenticated USING (public.is_editor_or_above()) WITH CHECK (public.is_editor_or_above());

CREATE POLICY "gallery_images_admin_delete" ON public.gallery_images
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- RLS POLICIES — SITE SETTINGS
-- ============================================================

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES — AUDIT LOGS
-- ============================================================

CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_super_admin());

CREATE POLICY "audit_logs_service_insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ============================================================
-- SEED DATA (Development / Demo)
-- ============================================================

-- Committee Term
INSERT INTO public.committee_terms (label, start_year, end_year, is_current) VALUES
  ('2024/2025', 2024, 2025, TRUE);

-- Chapters
INSERT INTO public.chapters (name, slug, short_desc, status, display_order) VALUES
  ('Computer Society', 'computer-society', 'Advancing knowledge of computer science and engineering.', 'published', 1),
  ('Robotics and Automation Society', 'robotics-automation', 'Exploring intelligent systems and automation.', 'published', 2),
  ('Women in Engineering', 'women-in-engineering', 'Empowering women in engineering and technology.', 'published', 3),
  ('Power and Energy Society', 'power-energy', 'Driving innovation in sustainable energy systems.', 'published', 4);
