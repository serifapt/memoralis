-- Add type column to messages table to differentiate system messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'text';

-- Add check constraint for valid message types
ALTER TABLE public.messages 
ADD CONSTRAINT messages_type_check 
CHECK (type IN ('text', 'status'));

-- Create function to post message from funeraria
-- If conversation is resolved, it reopens it and adds system message
CREATE OR REPLACE FUNCTION public.post_message_funeraria(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
  v_message_id uuid;
BEGIN
  -- Get current conversation status
  SELECT status INTO v_current_status
  FROM conversations
  WHERE id = p_conversation_id;

  -- If conversation is resolved, reopen it and add system message
  IF v_current_status = 'resolvido' THEN
    -- Update conversation status to open
    UPDATE conversations
    SET status = 'aberta', last_message_at = now()
    WHERE id = p_conversation_id;

    -- Insert system message for reopening
    INSERT INTO messages (conversation_id, sender_id, sender_type, content, type, is_read)
    VALUES (p_conversation_id, p_sender_id, 'funeraria', '🔴 Conversa Reaberta', 'status', true);
  END IF;

  -- Insert the actual user message
  INSERT INTO messages (conversation_id, sender_id, sender_type, content, type)
  VALUES (p_conversation_id, p_sender_id, 'funeraria', p_content, 'text')
  RETURNING id INTO v_message_id;

  -- Update last_message_at
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

-- Create function to resolve conversation (admin only)
CREATE OR REPLACE FUNCTION public.resolve_conversation_admin(
  p_conversation_id uuid,
  p_admin_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
BEGIN
  -- Update conversation status to resolved
  UPDATE conversations
  SET status = 'resolvido', last_message_at = now()
  WHERE id = p_conversation_id;

  -- Insert system message for resolution
  INSERT INTO messages (conversation_id, sender_id, sender_type, content, type, is_read)
  VALUES (p_conversation_id, p_admin_id, 'admin', '🟢 Problema Resolvido', 'status', true)
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.post_message_funeraria TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_conversation_admin TO authenticated;