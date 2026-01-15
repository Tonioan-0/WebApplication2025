-- Create blacklist table for banned users
CREATE TABLE IF NOT EXISTS public.blacklist (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    email VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    banned_by BIGINT REFERENCES app_user(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON public.blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_email ON public.blacklist(email);

-- Verify the table was created
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'blacklist';
