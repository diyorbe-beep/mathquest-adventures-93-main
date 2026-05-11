import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json, TablesInsert } from '@/integrations/supabase/types';

export const useActivityLog = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ action, metadata }: { action: string; metadata?: Json }) => {
      if (!user) return;
      const row: TablesInsert<'activity_logs'> = {
        user_id: user.id,
        action,
        metadata: metadata ?? null,
      };
      await supabase.from('activity_logs').insert(row);
    },
  });
};
