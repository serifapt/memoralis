ALTER TABLE obituaries
  ADD COLUMN IF NOT EXISTS family_niss text,
  ADD COLUMN IF NOT EXISTS family_iban text,
  ADD COLUMN IF NOT EXISTS family_naturalidade text,
  ADD COLUMN IF NOT EXISTS family_birth_date date;