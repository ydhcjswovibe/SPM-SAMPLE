-- Add total_weeks column to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 4 NOT NULL;

-- Update existing classes to have 4 weeks
UPDATE public.classes SET total_weeks = 4 WHERE total_weeks IS NULL;
