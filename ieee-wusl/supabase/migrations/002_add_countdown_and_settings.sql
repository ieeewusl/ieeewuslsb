-- Migration 002: Add show_countdown column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS show_countdown BOOLEAN NOT NULL DEFAULT TRUE;

-- Insert default setting for spotlight section toggle
INSERT INTO public.site_settings (key, value, description)
VALUES ('show_spotlight_section', 'true', 'Whether to display the Hot Events spotlight section on the homepage')
ON CONFLICT (key) DO NOTHING;

