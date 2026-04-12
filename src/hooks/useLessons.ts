import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { applyQuestionVariations } from '@/lib/questionVariations';

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });
};

export const useLessons = (topicId?: string) => {
  return useQuery({
    queryKey: ['lessons', topicId],
    queryFn: async () => {
      let query = supabase.from('lessons').select('*').order('sort_order');
      if (topicId) query = query.eq('topic_id', topicId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useQuestions = (lessonId?: string) => {
  return useQuery({
    queryKey: ['questions', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('sort_order');
      if (error) throw error;
      
      // Apply variations (permutations, commutative property, etc.)
      return applyQuestionVariations(data || []);
    },
    enabled: !!lessonId,
  });
};

export const useUserProgress = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user_progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSaveProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      correct,
      total,
      completed,
      xpEarned,
      timeSpentSeconds = 0,
    }: {
      lessonId: string;
      correct: number;
      total: number;
      completed: boolean;
      xpEarned: number;
      timeSpentSeconds?: number;
    }) => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const accuracy = total > 0 ? Number(((correct / total) * 100).toFixed(2)) : 0;
      
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            correct_answers: correct,
            total_answers: total,
            completed,
            best_accuracy: Math.max(accuracy, Number(existing.best_accuracy ?? 0)),
            time_spent_seconds: (existing.time_spent_seconds ?? 0) + timeSpentSeconds,
            xp_earned: existing.xp_earned + xpEarned,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            correct_answers: correct,
            total_answers: total,
            completed,
            best_accuracy: accuracy,
            xp_earned: xpEarned,
            time_spent_seconds: timeSpentSeconds,
            completed_at: completed ? new Date().toISOString() : null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_progress', user?.id] });
    },
  });
};
