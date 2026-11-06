export type UserRole = 'super_admin' | 'administrator' | 'editor'
export type PublicationStatus = 'draft' | 'published' | 'archived'
export type EventCategory = 'workshop' | 'seminar' | 'competition' | 'social' | 'webinar' | 'conference' | 'hackathon' | 'other'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CommitteeTerm {
  id: string
  label: string
  start_year: number
  end_year: number
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  full_name: string
  role_title: string
  bio: string | null
  photo_url: string | null
  photo_path: string | null
  email: string | null
  linkedin_url: string | null
  display_order: number
  is_active: boolean
  term_id: string | null
  status: PublicationStatus
  created_at: string
  updated_at: string
  committee_terms?: CommitteeTerm
}

export interface Chapter {
  id: string
  name: string
  slug: string
  short_desc: string | null
  description: string | null
  logo_url: string | null
  logo_path: string | null
  website_url: string | null
  founded_year: number | null
  status: PublicationStatus
  display_order: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  category: EventCategory
  start_at: string
  end_at: string | null
  venue: string | null
  is_online: boolean
  meeting_url: string | null
  cover_url: string | null
  cover_path: string | null
  registration_url: string | null
  organizer: string | null
  chapter_id: string | null
  status: PublicationStatus
  featured: boolean
  show_countdown?: boolean
  created_at: string
  updated_at: string
  chapters?: Chapter
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  cover_url: string | null
  cover_path: string | null
  author_name: string | null
  author_id: string | null
  status: PublicationStatus
  published_at: string | null
  featured: boolean
  tags: string[]
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Project {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  cover_url: string | null
  cover_path: string | null
  members: string[]
  start_date: string | null
  end_date: string | null
  github_url: string | null
  demo_url: string | null
  chapter_id: string | null
  status: PublicationStatus
  featured: boolean
  tags: string[]
  created_at: string
  updated_at: string
  chapters?: Chapter
}

export interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string | null
  cover_url: string | null
  cover_path: string | null
  event_id: string | null
  event_date: string | null
  status: PublicationStatus
  display_order: number
  created_at: string
  updated_at: string
  events?: Event
  gallery_images?: GalleryImage[]
}

export interface GalleryImage {
  id: string
  album_id: string
  url: string
  storage_path: string
  alt_text: string | null
  caption: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  key: string
  value: unknown
  description: string | null
  updated_at: string
  updated_by: string | null
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  profiles?: Profile
}

// Site settings typed value
export interface SiteSettings {
  hero_heading: string
  hero_subheading: string
  hero_image_url: string | null
  contact_email: string | null
  contact_phone: string | null
  social_linkedin: string | null
  social_facebook: string | null
  social_instagram: string | null
  social_twitter: string | null
  social_youtube: string | null
  footer_tagline: string
  university_name: string
  branch_founded: string
  stat_members: number | null
  stat_events: number | null
  stat_projects: number | null
  stat_chapters: number | null
  show_spotlight_section?: boolean
}

// Supabase DB type map
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] }
      committee_terms: { Row: CommitteeTerm; Insert: Partial<CommitteeTerm>; Update: Partial<CommitteeTerm>; Relationships: [] }
      team_members: { Row: TeamMember; Insert: Partial<TeamMember>; Update: Partial<TeamMember>; Relationships: [] }
      chapters: { Row: Chapter; Insert: Partial<Chapter>; Update: Partial<Chapter>; Relationships: [] }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event>; Relationships: [] }
      news_articles: { Row: NewsArticle; Insert: Partial<NewsArticle>; Update: Partial<NewsArticle>; Relationships: [] }
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project>; Relationships: [] }
      gallery_albums: { Row: GalleryAlbum; Insert: Partial<GalleryAlbum>; Update: Partial<GalleryAlbum>; Relationships: [] }
      gallery_images: { Row: GalleryImage; Insert: Partial<GalleryImage>; Update: Partial<GalleryImage>; Relationships: [] }
      site_settings: { Row: SiteSetting; Insert: Partial<SiteSetting>; Update: Partial<SiteSetting>; Relationships: [] }
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog>; Relationships: [] }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      publication_status: PublicationStatus
      event_category: EventCategory
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
