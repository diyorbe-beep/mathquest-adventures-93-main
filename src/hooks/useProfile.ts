import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';
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

      // Kunlik XP chegarasini tekshirish
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLogs } = await supabase
        .from('xp_logs')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', today);

      const totalToday = todayLogs?.reduce((s, l) => s + l.amount, 0) ?? 0;
      if (totalToday + amount > 1000) {
        throw new Error('Kunlik XP chegarasi oshib ketdi');
      }

      // Profil yangilash
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('user_id', user.id)
        .single();

      const currentXp = profile?.xp ?? 0;
      const newXp = currentXp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // XP log yozish
      await supabase.from('xp_logs').insert({
        user_id: user.id,
        amount,
        source,
        lesson_id: lessonId || null,
      });

      return { success: true, newXp, newLevel };
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      const currentCoins = (profile as any)?.coins ?? 0;
      const newCoins = currentCoins + amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Coin log yozish
      await supabase.from('coin_logs' as any).insert({
        user_id: user.id,
        amount,
        source,
        metadata: lessonId ? { lesson_id: lessonId } : {},
      });

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

  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => {
      const p = profileRef.current;
      if (!p || p.hearts >= 5) return;
      if (!p.hearts_last_regen) return;
      const ms = getMsUntilNextHeart(p.hearts, p.hearts_last_regen);
      if (ms === 0 && !regenerateHearts.isPending) {
        regenerateHearts.mutate();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [user, regenerateHearts]);

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
