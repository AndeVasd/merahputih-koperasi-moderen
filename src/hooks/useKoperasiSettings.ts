import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KoperasiSettings {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  default_interest_rate: number;
  notifications_enabled: boolean;
  due_date_reminder: boolean;
  created_at: string;
  updated_at: string;
}

export function useKoperasiSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['koperasi-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('koperasi_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as KoperasiSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<KoperasiSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!settings?.id) throw new Error('Settings not found');

      const { data, error } = await supabase
        .from('koperasi_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data as KoperasiSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['koperasi-settings'] });
      toast.success('Pengaturan berhasil disimpan');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
