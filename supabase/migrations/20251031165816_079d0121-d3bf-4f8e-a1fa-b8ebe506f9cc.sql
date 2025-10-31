-- Update the post_message_funeraria function to ensure it properly updates status
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
    -- Insert system message for reopening FIRST
    INSERT INTO messages (conversation_id, sender_id, sender_type, content, type, is_read)
    VALUES (p_conversation_id, p_sender_id, 'funeraria', '🔴 Conversa Reaberta', 'status', true);

    -- Update conversation status to open
    UPDATE conversations
    SET status = 'aberta', 
        last_message_at = now(),
        updated_at = now()
    WHERE id = p_conversation_id;

    -- Log for debugging
    RAISE NOTICE 'Conversation % reopened from resolvido to aberta', p_conversation_id;
  END IF;

  -- Insert the actual user message
  INSERT INTO messages (conversation_id, sender_id, sender_type, content, type)
  VALUES (p_conversation_id, p_sender_id, 'funeraria', p_content, 'text')
  RETURNING id INTO v_message_id;

  -- Update last_message_at regardless of status
  UPDATE conversations
  SET last_message_at = now(),
      updated_at = now()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;