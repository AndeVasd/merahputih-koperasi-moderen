-- Create organization_members table for pengurus and pengawas
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  member_type TEXT NOT NULL CHECK (member_type IN ('pengurus', 'pengawas')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view organization members"
ON public.organization_members
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert organization members"
ON public.organization_members
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update organization members"
ON public.organization_members
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete organization members"
ON public.organization_members
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.organization_members (name, position, member_type, sort_order) VALUES
('Adi Wardana', 'Ketua', 'pengurus', 1),
('Fayzal Kurnia Jaya', 'Wakil Ketua Bidang Usaha', 'pengurus', 2),
('Alfiyana', 'Wakil Ketua Bidang Anggota', 'pengurus', 3),
('Ahmad Sodik', 'Sekretaris', 'pengurus', 4),
('Santi Okta Fitri', 'Bendahara', 'pengurus', 5),
('Abdullah', 'Ketua', 'pengawas', 1),
('Riston Ari Tonang', 'Anggota', 'pengawas', 2),
('Hamdani', 'Anggota', 'pengawas', 3);

-- Create storage bucket for organization photos
INSERT INTO storage.buckets (id, name, public) VALUES ('organization-photos', 'organization-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view organization photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-photos');

CREATE POLICY "Authenticated users can upload organization photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organization-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update organization photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'organization-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete organization photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'organization-photos' AND auth.uid() IS NOT NULL);