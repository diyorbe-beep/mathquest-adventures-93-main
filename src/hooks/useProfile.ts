import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HEART_REGEN_MS } from '@/lib/heartRegen';

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
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
      // Log XP
      await supabase.from('xp_logs').insert({
        user_id: user.id,
        amount,
        source,
        lesson_id: lessonId,
      });
      // Update profile XP
      const currentXp = profileQuery.data?.xp ?? 0;
      const currentCoins = Number((profileQuery.data as any)?.coins ?? 0);
      const newXp = currentXp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ xp: newXp, level: newLevel, coins: currentCoins + amount })
        .eq('user_id', user.id);
      if (error) throw error;

      await (supabase as any).from('coin_logs').insert({
        user_id: user.id,
        amount,
        source: 'lesson_xp',
        metadata: { lesson_id: lessonId ?? null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  const loseHeart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const currentHearts = profileQuery.data?.hearts ?? 0;
      if (currentHearts <= 0) return;
      await supabase.from('hearts_logs').insert({
        user_id: user.id,
        change: -1,
        reason: 'wrong_answer',
      });
      const { error } = await supabase
        .from('profiles')
        .update({ hearts: currentHearts - 1 })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const regenerateHearts = useMutation({
    mutationFn: async () => {
      if (!user || !profileQuery.data) return;
      const lastRegen = new Date(profileQuery.data.hearts_last_regen).getTime();
      const now = Date.now();
      const regenStepsPassed = Math.floor((now - lastRegen) / HEART_REGEN_MS);
      const heartsToAdd = Math.min(regenStepsPassed, 5 - profileQuery.data.hearts);
      if (heartsToAdd > 0) {
        await supabase
          .from('profiles')
          .update({
            hearts: Math.min(profileQuery.data.hearts + heartsToAdd, 5),
            hearts_last_regen: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user || !profileQuery.data) return;
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = profileQuery.data.last_login_date;
      
      if (lastLogin === today) return; // Already logged in today
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastLogin === yesterdayStr 
        ? profileQuery.data.streak_days + 1 
        : 1;
      
      await supabase
        .from('profiles')
        .update({ streak_days: newStreak, last_login_date: today })
        .eq('user_id', user.id);
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
