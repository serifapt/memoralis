-- Enable DELETE on messages table for message owners
-- This allows users to delete their own messages

-- Create policy to allow users to delete their own messages
CREATE POLICY "Users can delete own messages" 
ON messages 
FOR DELETE
USING (auth.uid() = sender_id);

-- Admins can also delete any message
CREATE POLICY "Admins can delete all messages" 
ON messages 
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
