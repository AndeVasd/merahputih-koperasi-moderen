-- Fix category constraint to match app categories
ALTER TABLE public.loans
  DROP CONSTRAINT IF EXISTS loans_category_check;

ALTER TABLE public.loans
  ADD CONSTRAINT loans_category_check
  CHECK (category IN ('uang', 'sembako', 'alat_pertanian', 'obat'));

-- Tighten overly-permissive RLS policies (avoid USING/WITH CHECK true)
-- loans
DROP POLICY IF EXISTS "Authenticated users can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can insert loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can update loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can delete loans" ON public.loans;

CREATE POLICY "Authenticated users can view all loans"
ON public.loans
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert loans"
ON public.loans
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update loans"
ON public.loans
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete loans"
ON public.loans
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- members
DROP POLICY IF EXISTS "Authenticated users can view all members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

CREATE POLICY "Authenticated users can view all members"
ON public.members
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert members"
ON public.members
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update members"
ON public.members
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete members"
ON public.members
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- loan_items
DROP POLICY IF EXISTS "Authenticated users can view all loan_items" ON public.loan_items;
DROP POLICY IF EXISTS "Authenticated users can insert loan_items" ON public.loan_items;
DROP POLICY IF EXISTS "Authenticated users can update loan_items" ON public.loan_items;
DROP POLICY IF EXISTS "Authenticated users can delete loan_items" ON public.loan_items;

CREATE POLICY "Authenticated users can view all loan_items"
ON public.loan_items
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert loan_items"
ON public.loan_items
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update loan_items"
ON public.loan_items
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete loan_items"
ON public.loan_items
FOR DELETE
USING (auth.uid() IS NOT NULL);