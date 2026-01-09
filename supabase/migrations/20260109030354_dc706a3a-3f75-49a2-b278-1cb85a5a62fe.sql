-- Add columns for non-member borrowers
ALTER TABLE public.loans 
  ADD COLUMN IF NOT EXISTS borrower_name TEXT,
  ADD COLUMN IF NOT EXISTS borrower_nik TEXT,
  ADD COLUMN IF NOT EXISTS borrower_phone TEXT,
  ADD COLUMN IF NOT EXISTS borrower_address TEXT;

-- Make member_id nullable to allow non-member borrowers
ALTER TABLE public.loans 
  ALTER COLUMN member_id DROP NOT NULL;