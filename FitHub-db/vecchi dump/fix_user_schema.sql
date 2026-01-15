-- Fix missing column in app_user table
-- This column is required by the backend code (User.java / UserRepository.java)
-- but was missing from the provided dump files.

ALTER TABLE public.app_user 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_user' AND column_name = 'is_public';
