import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { getMsUntilNextHeart } from '@/lib/heartRegen';

type Profile = Tables<'profiles'>;

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
    mutationFn: async ({ amount, source = 'dars', lessonId }: { amount: number; source?: string; lessonId?: string }) => {
      if (!user) throw new Error('Tasdiqlanmagan');
      if (!lessonId) throw new Error('lessonId talab qilinadi');

      // Route through the server-side RPC which enforces the daily cap,
      // validates the amount, and writes xp_logs atomically.
      const { data, error } = await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
        p_amount: amount,
        p_source: source,
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.success) {
        throw new Error(result?.message ?? 'XP berishda xatolik');
      }

      return { success: true, newXp: result.new_xp, newLevel: result.new_level };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['xp_logs'] });
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('XP berishda xatolik:', error);
    },
  });

  const addCoins = useMutation({
    mutationFn: async ({ amount, source = 'dars', lessonId }: { amount: number; source?: string; lessonId?: string }) => {
      if (!user) throw new Error('Tasdiqlanmagan');

      // Clamp to a reasonable per-lesson maximum to prevent runaway coin awards.
      const MAX_COINS_PER_AWARD = 500;
      const safeAmount = Math.min(Math.max(1, Math.round(amount)), MAX_COINS_PER_AWARD);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      const currentCoins = Number(profileData?.coins ?? 0);
      const newCoins = currentCoins + safeAmount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Coin log yozish
      const row: TablesInsert<'coin_logs'> = {
        user_id: user.id,
        amount: safeAmount,
        source,
        lesson_id: lessonId ?? null,
        metadata: lessonId ? { lesson_id: lessonId } : null,
      };
      await supabase.from('coin_logs').insert(row);

      return { success: true, newCoins };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['coin_logs'] });
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('Coin berishda xatolik:', error);
    },
  });

  const loseHeart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const { data, error } = await supabase.rpc('spend_heart', {
        p_user_id: user.id,
        p_reason: 'dars'
      });
      if (error) throw error;
      // RPC returns an array with one row: { success, new_hearts, message }
      const result = Array.isArray(data) ? data[0] : data;
      return result as { success: boolean; new_hearts: number; message: string };
    },
    onSuccess: (result) => {
      // Optimistically update the cached profile so the countdown timer starts
      // immediately without waiting for a full refetch.
      if (result?.success) {
        queryClient.setQueryData<Profile | null>(['profile', user?.id], (old) => {
          if (!old) return old;
          return {
            ...old,
            hearts: result.new_hearts,
            // Reset regen timestamp to now so the 15-min countdown starts from this moment.
            hearts_last_regen: new Date().toISOString(),
          };
        });
      }
      // Still invalidate to sync with the real DB value.
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hearts_logs'] });
    },
  });

  const regenerateHearts = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.rpc('regen_hearts_secure', {
        p_user_id: user.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const profileRef = useRef<Profile | null | undefined>(undefined);
  profileRef.current = profileQuery.data;
  const regenPendingRef = useRef(false);
  regenPendingRef.current = regenerateHearts.isPending;
  const regenMutate = regenerateHearts.mutate;

  // Smart timer: schedules regen exactly when the next heart is due.
  // Re-schedules automatically whenever the profile data changes (e.g. after each regen).
  useEffect(() => {
    if (!user) return;

    const p = profileRef.current;
    if (!p || p.hearts >= 5 || !p.hearts_last_regen) return;

    const ms = getMsUntilNextHeart(p.hearts, p.hearts_last_regen);
    if (ms === null) return;

    // Already overdue — call regen immediately.
    if (ms === 0) {
      if (!regenPendingRef.current) regenMutate();
      return;
    }

    // Schedule to fire exactly when the next heart is ready (+ 300ms buffer for clock drift).
    const id = window.setTimeout(() => {
      if (!regenPendingRef.current) regenMutate();
    }, ms + 300);

    return () => window.clearTimeout(id);
  // profileQuery.data changes after every successful regen, which re-schedules the next one.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileQuery.data]);

  // Re-check immediately when the user returns to the tab after being away.
  useEffect(() => {
    if (!user) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const p = profileRef.current;
      if (!p || p.hearts >= 5 || !p.hearts_last_regen) return;
      const ms = getMsUntilNextHeart(p.hearts, p.hearts_last_regen);
      if (ms === 0 && !regenPendingRef.current) {
        regenMutate();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, regenMutate]);

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.rpc('update_streak_secure', {
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
    addCoins,
    loseHeart,
    regenerateHearts,
    updateStreak,
  };
};
