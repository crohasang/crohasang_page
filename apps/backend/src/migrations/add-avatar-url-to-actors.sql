-- Add avatar_url column to actors table for remote actor profile pictures
ALTER TABLE actors ADD COLUMN avatar_url TEXT NULL AFTER url;
