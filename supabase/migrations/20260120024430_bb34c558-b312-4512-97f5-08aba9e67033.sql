-- Drop existing update policy for koperasi_settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.koperasi_settings;

-- Create new policy allowing authenticated users to update settings
CREATE POLICY "Authenticated users can update settings" 
  ON public.koperasi_settings 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);