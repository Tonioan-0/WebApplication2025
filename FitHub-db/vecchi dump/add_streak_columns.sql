-- Add streak columns to app_user table
-- Run this script to add streak tracking fields

ALTER TABLE public.app_user 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_workouts_done INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS week_start_date DATE,
ADD COLUMN IF NOT EXISTS last_workout_date DATE;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_user';
