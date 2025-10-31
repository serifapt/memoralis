-- Update conversations status to support more states
-- Remove old status values and add new ones
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_status_check;

-- Add check constraint with new status values
ALTER TABLE conversations
ADD CONSTRAINT conversations_status_check 
CHECK (status IN ('aberta', 'resolvido'));

-- Set default to 'aberta'
ALTER TABLE conversations 
ALTER COLUMN status SET DEFAULT 'aberta';

-- Update any existing 'fechada' status to 'resolvido'
UPDATE conversations 
SET status = 'resolvido' 
WHERE status = 'fechada';

COMMENT ON COLUMN conversations.status IS 'Status da conversa: aberta (em aberto) ou resolvido (problema resolvido)';
