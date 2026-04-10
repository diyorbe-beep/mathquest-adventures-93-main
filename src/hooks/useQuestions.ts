import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyQuestionVariations } from '@/lib/questionVariations';

export const useQuestions = (lessonId?: string) => {
  return useQuery({
    queryKey: ['questions', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await (supabase as any)
        .from('questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Apply variations to questions
      const questionsWithVariations = applyQuestionVariations(data || []);
      
      return questionsWithVariations;
    },
  });
};

export const useSaveProgress = () => {
  return useQuery({
    queryKey: ['user_progress'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('user_progress')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });
};
