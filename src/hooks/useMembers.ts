import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbMember {
  id: string;
  name: string;
  nik: string;
  address: string | null;
  phone: string | null;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface MemberInput {
  name: string;
  nik: string;
  address?: string;
  phone?: string;
}

export function useMembers() {
  const [members, setMembers] = useState<DbMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: MemberInput) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert({
          name: member.name,
          nik: member.nik,
          address: member.address || null,
          phone: member.phone || null,
        })
        .select()
        .single();

      if (error) throw error;
      setMembers((prev) => [data, ...prev]);
      toast.success('Anggota baru berhasil ditambahkan');
      return data;
    } catch (err: any) {
      toast.error('Gagal menambahkan anggota: ' + err.message);
      throw err;
    }
  };

  const updateMember = async (id: string, member: MemberInput) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update({
          name: member.name,
          nik: member.nik,
          address: member.address || null,
          phone: member.phone || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
      toast.success('Data anggota berhasil diperbarui');
      return data;
    } catch (err: any) {
      toast.error('Gagal memperbarui anggota: ' + err.message);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);

      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Anggota berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus anggota: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers((prev) => [payload.new as DbMember, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMembers((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as DbMember) : m))
            );
          } else if (payload.eventType === 'DELETE') {
            setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}
