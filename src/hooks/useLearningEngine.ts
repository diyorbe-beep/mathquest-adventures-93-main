import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const useSkillMastery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['skill_mastery', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('skill_mastery')
        .select('*, topics(name, icon)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
};

export const useReviewDueCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['review_due_count', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await (supabase as any)
        .from('review_queue')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', user.id)
        .lte('due_at', new Date().toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
};

export const useReviewQuestions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['review_questions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('review_queue')
        .select('id, question_id, interval_days, ease_factor, repetitions, questions(*)')
        .eq('user_id', user.id)
        .lte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
};

export const useLogQuestionAttempt = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      questionId,
      topicId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      difficulty,
      questionType,
      timeSpentSeconds,
    }: {
      lessonId: string;
      questionId: string;
      topicId?: string | null;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      difficulty: number;
      questionType: string;
      timeSpentSeconds: number;
    }) => {
      if (!user) return;

      await (supabase as any).from('question_attempts').insert({
        user_id: user.id,
        lesson_id: lessonId,
        question_id: questionId,
        topic_id: topicId ?? null,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        difficulty,
        question_type: questionType,
        time_spent_seconds: timeSpentSeconds,
      });

      if (topicId) {
        const { data: existing } = await (supabase as any)
          .from('skill_mastery')
          .select('*')
          .eq('user_id', user.id)
          .eq('topic_id', topicId)
          .maybeSingle();

        const currentScore = Number(existing?.mastery_score ?? 0);
        const attempts = Number(existing?.attempts ?? 0) + 1;
        const correctCount = Number(existing?.correct_count ?? 0) + (isCorrect ? 1 : 0);
        const delta = isCorrect ? 6 + Math.max(0, difficulty - 1) : -8;
        const masteryScore = clamp(currentScore + delta, 0, 100);

        if (existing?.id) {
          await (supabase as any)
            .from('skill_mastery')
            .update({
              mastery_score: masteryScore,
              attempts,
              correct_count: correctCount,
              last_practiced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await (supabase as any).from('skill_mastery').insert({
            user_id: user.id,
            topic_id: topicId,
            mastery_score: masteryScore,
            attempts,
            correct_count: correctCount,
            last_practiced_at: new Date().toISOString(),
          });
        }
      }

      const { data: queueRow } = await (supabase as any)
        .from('review_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      const now = new Date();
      if (!isCorrect) {
        // Wrong answers return quickly: 10 minutes.
        const dueAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
        if (queueRow?.id) {
          await (supabase as any)
            .from('review_queue')
            .update({
              due_at: dueAt,
              interval_days: 1,
              ease_factor: clamp(Number(queueRow.ease_factor ?? 2.5) - 0.2, 1.3, 3),
              repetitions: 0,
              last_result: false,
              updated_at: now.toISOString(),
            })
            .eq('id', queueRow.id);
        } else {
          await (supabase as any).from('review_queue').insert({
            user_id: user.id,
            question_id: questionId,
            due_at: dueAt,
            interval_days: 1,
            ease_factor: 2.3,
            repetitions: 0,
            last_result: false,
          });
        }
      } else if (queueRow?.id) {
        // Correct review pushes interval forward.
        const prevInterval = Math.max(1, Number(queueRow.interval_days ?? 1));
        const ef = clamp(Number(queueRow.ease_factor ?? 2.5) + 0.05, 1.3, 3);
        const repetitions = Number(queueRow.repetitions ?? 0) + 1;
        const nextInterval = repetitions <= 1 ? 1 : Math.round(prevInterval * ef);
        const dueAt = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000).toISOString();

        await (supabase as any)
          .from('review_queue')
          .update({
            due_at: dueAt,
            interval_days: nextInterval,
            ease_factor: ef,
            repetitions,
            last_result: true,
            updated_at: now.toISOString(),
          })
          .eq('id', queueRow.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skill_mastery', user?.id] });
      qc.invalidateQueries({ queryKey: ['review_due_count', user?.id] });
    },
  });
};

export const useSavePlacementResult = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
      correct,
      total,
    }: {
      topicId?: string | null;
      correct: number;
      total: number;
    }) => {
      if (!user) return;
      const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
      await (supabase as any).from('placement_results').insert({
        user_id: user.id,
        topic_id: topicId ?? null,
        correct_answers: correct,
        total_answers: total,
        score_percent: scorePercent,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skill_mastery', user?.id] });
    },
  });
};
