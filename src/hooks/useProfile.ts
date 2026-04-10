import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HEART_REGEN_MS } from '@/lib/heartRegen';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type XpLog = TablesInsert<'xp_logs'>;
type HeartsLog = TablesInsert<'hearts_logs'>;
type CoinLog = TablesInsert<'coin_logs'>;

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { username?: string; avatar_id?: number }) => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const addXp = useMutation({
    mutationFn: async ({ amount, source, lessonId }: { amount: number; source: string; lessonId?: string }) => {
      if (!user) throw new Error('Tasdiqlanmagan');
      
      const { data, error } = await (supabase as any).rpc('award_xp', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
        p_amount: amount,
        p_source: source
      });
      
      if (error) throw error;
      
      const res = Array.isArray(data) ? data[0] : data;
      if (res && !res.success) throw new Error(res.message);
      
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['coin_logs'] });
      queryClient.invalidateQueries({ queryKey: ['xp_logs'] });
    },
  });

  const loseHeart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const { data, error } = await (supabase as any).rpc('spend_heart', {
        p_user_id: user.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hearts_logs'] });
    },
  });

  const regenerateHearts = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await (supabase as any).rpc('regen_hearts_secure', {
        p_user_id: user.id,
        p_regen_ms: HEART_REGEN_MS
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await (supabase as any).rpc('update_streak_secure', {
        p_user_id: user.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile: profileQuery.data,
    loading: profileQuery.isLoading,
    updateProfile,
    addXp,
    loseHeart,
    regenerateHearts,
    updateStreak,
  };
};
