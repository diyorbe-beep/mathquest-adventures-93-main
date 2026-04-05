import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HEART_REGEN_MS } from '@/lib/heartRegen';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type XpLog = TablesInsert<'xp_logs'>;
type HeartsLog = TablesInsert<'hearts_logs'>;

// Extended profile type with coins (assuming coins should be added to the table)
type ProfileWithCoins = Profile & {
  coins?: number;
};

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
      
      // Log XP
      const xpLogData: XpLog = {
        user_id: user.id,
        amount,
        source,
        lesson_id: lessonId || null,
      };
      await supabase.from('xp_logs').insert(xpLogData);
      
      // Update profile XP with proper type handling
      const currentXp = profileQuery.data?.xp ?? 0;
      const currentCoins = (profileQuery.data as ProfileWithCoins)?.coins ?? 0;
      const newXp = currentXp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          xp: newXp, 
          level: newLevel,
          // Note: coins field should be added to the database schema
          ...(typeof (profileQuery.data as ProfileWithCoins)?.coins === 'number' && {
            coins: currentCoins + amount
          })
        })
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Only log coins if the field exists in the database
      // Note: coin_logs table should be added to the database schema
      if (typeof (profileQuery.data as ProfileWithCoins)?.coins === 'number') {
        // TODO: Implement coin logging when coin_logs table is created
        console.log('Coin logging:', { userId: user.id, amount, source: 'lesson_xp', lessonId: lessonId ?? null });
      }
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
      
      const heartsLogData: HeartsLog = {
        user_id: user.id,
        change: -1,
        reason: 'wrong_answer',
      };
      
      await supabase.from('hearts_logs').insert(heartsLogData);
      
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
