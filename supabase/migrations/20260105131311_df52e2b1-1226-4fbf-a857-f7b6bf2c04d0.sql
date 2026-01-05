
-- Drop existing restrictive DELETE policies
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can delete loan_items" ON public.loan_items;

-- Create new DELETE policies for authenticated users
CREATE POLICY "Authenticated users can delete members" 
ON public.members 
FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete loans" 
ON public.loans 
FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete loan_items" 
ON public.loan_items 
FOR DELETE 
TO authenticated
USING (true);
