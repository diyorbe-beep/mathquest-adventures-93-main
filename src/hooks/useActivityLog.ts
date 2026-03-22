import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useActivityLog = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ action, metadata = {} }: { action: string; metadata?: Record<string, unknown> }) => {
      if (!user) return;
      await supabase.from('activity_logs' as any).insert({
        user_id: user.id,
        action,
        metadata,
      } as any);
    },
  });
};
