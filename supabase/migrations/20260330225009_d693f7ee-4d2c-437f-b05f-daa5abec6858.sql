-- 1. Delete ceremony events for the duplicate Libertina record
DELETE FROM ceremony_events WHERE obituary_id = 'b7f6a19d-4bb9-4f39-a947-e21165eaab44';

-- 2. Delete the duplicate Libertina obituary record
DELETE FROM obituaries WHERE id = 'b7f6a19d-4bb9-4f39-a947-e21165eaab44';

-- 3. Move locality values to freguesia and set locality to 'Arcos de Valdevez' for the 31 remaining imported records
UPDATE obituaries
SET freguesia = locality,
    locality = 'Arcos de Valdevez'
WHERE funeraria_id = '1dd8e1e1-2c91-49f9-a1b0-1faa7dc4b55d'
  AND created_at >= '2026-03-30'
  AND id != 'b7f6a19d-4bb9-4f39-a947-e21165eaab44';