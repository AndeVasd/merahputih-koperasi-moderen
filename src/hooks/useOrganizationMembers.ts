import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrganizationMember {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  member_type: 'pengurus' | 'pengawas';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberInput {
  name: string;
  position: string;
  photo_url?: string | null;
  member_type: 'pengurus' | 'pengawas';
  sort_order?: number;
}

export function useOrganizationMembers() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMembers((data || []) as OrganizationMember[]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching organization members:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, memberId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberId}-${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      toast.error('Gagal mengupload foto');
      return null;
    }
  };

  const addMember = async (member: OrganizationMemberInput, photoFile?: File) => {
    try {
      // Get max sort_order for the member type
      const existingMembers = members.filter(m => m.member_type === member.member_type);
      const maxOrder = existingMembers.length > 0 
        ? Math.max(...existingMembers.map(m => m.sort_order)) 
        : 0;

      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          name: member.name,
          position: member.position,
          member_type: member.member_type,
          sort_order: member.sort_order ?? maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photo if provided
      if (photoFile && data) {
        const photoUrl = await uploadPhoto(photoFile, data.id);
        if (photoUrl) {
          await supabase
            .from('organization_members')
            .update({ photo_url: photoUrl })
            .eq('id', data.id);
        }
      }

      toast.success('Anggota organisasi berhasil ditambahkan');
      await fetchMembers();
      return data;
    } catch (err: any) {
      toast.error('Gagal menambahkan anggota: ' + err.message);
      throw err;
    }
  };

  const updateMember = async (id: string, member: Partial<OrganizationMemberInput>, photoFile?: File) => {
    try {
      let photoUrl = member.photo_url;

      // Upload new photo if provided
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile, id);
      }

      const { data, error } = await supabase
        .from('organization_members')
        .update({
          name: member.name,
          position: member.position,
          ...(photoUrl !== undefined && { photo_url: photoUrl }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Data anggota berhasil diperbarui');
      await fetchMembers();
      return data;
    } catch (err: any) {
      toast.error('Gagal memperbarui anggota: ' + err.message);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Anggota berhasil dihapus');
      await fetchMembers();
    } catch (err: any) {
      toast.error('Gagal menghapus anggota: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const pengurus = members.filter(m => m.member_type === 'pengurus');
  const pengawas = members.filter(m => m.member_type === 'pengawas');

  return {
    members,
    pengurus,
    pengawas,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}
