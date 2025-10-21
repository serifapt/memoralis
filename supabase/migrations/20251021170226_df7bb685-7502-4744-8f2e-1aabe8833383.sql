-- Fix: Add INSERT policy to profiles table to allow user registration
-- This allows authenticated users to create their own profile during signup
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);