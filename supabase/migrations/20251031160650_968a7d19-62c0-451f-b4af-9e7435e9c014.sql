-- Enable DELETE on conversations table for admins
-- This allows admins to delete conversations

CREATE POLICY "Admins can delete conversations"
ON conversations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));