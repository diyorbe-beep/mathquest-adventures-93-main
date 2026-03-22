import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAchievements = () => {
  const { user } = useAuth();

  const allAchievements = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*');
      if (error) throw error;
      return data;
    },
  });

  const userAchievements = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return { allAchievements: allAchievements.data ?? [], userAchievements: userAchievements.data ?? [] };
};

export const useCheckAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ totalXp, lessonsCompleted, streakDays, perfectLessons }: {
      totalXp: number;
      lessonsCompleted: number;
      streakDays: number;
      perfectLessons: number;
    }) => {
      if (!user) return [];
      const { data: achievements } = await supabase.from('achievements').select('*');
      const { data: earned } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const earnedIds = new Set((earned ?? []).map(e => e.achievement_id));
      const newlyEarned: string[] = [];

      for (const a of achievements ?? []) {
        if (earnedIds.has(a.id)) continue;
        let qualifies = false;
        switch (a.requirement_type) {
          case 'total_xp': qualifies = totalXp >= a.requirement_value; break;
          case 'lessons_completed': qualifies = lessonsCompleted >= a.requirement_value; break;
          case 'streak_days': qualifies = streakDays >= a.requirement_value; break;
          case 'perfect_lessons': qualifies = perfectLessons >= a.requirement_value; break;
        }
        if (qualifies) {
          await supabase.from('user_achievements').insert({
            user_id: user.id,
            achievement_id: a.id,
          });
          newlyEarned.push(a.name);
        }
      }
      return newlyEarned;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_achievements', user?.id] });
    },
  });
};
