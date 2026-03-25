ALTER TABLE obituaries
  ADD COLUMN IF NOT EXISTS family_civil_status text,
  ADD COLUMN IF NOT EXISTS family_id_card text;