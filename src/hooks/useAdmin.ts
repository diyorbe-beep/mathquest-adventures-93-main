import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// --- Users ---
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUserRoles = () => {
  return useQuery({
    queryKey: ['admin_user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('*');
      if (error) throw error;
      return data as any[];
    },
  });
};

// --- Lessons ---
export const useAdminLessons = () => {
  return useQuery({
    queryKey: ['admin_lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, topics(name, icon)')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lesson: {
      title: string;
      topic_id: string;
      level_number: number;
      xp_reward: number;
      sort_order: number;
      description?: string;
    }) => {
      const { data, error } = await supabase.from('lessons').insert(lesson).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_lessons'] }),
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_lessons'] }),
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        title?: string;
        topic_id?: string;
        level_number?: number;
        xp_reward?: number;
        sort_order?: number;
        description?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_lessons'] }),
  });
};

// --- Questions ---
export const useAdminQuestions = (lessonId?: string) => {
  return useQuery({
    queryKey: ['admin_questions', lessonId],
    queryFn: async () => {
      let query = supabase.from('questions').select('*').order('sort_order');
      if (lessonId) query = query.eq('lesson_id', lessonId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (question: {
      lesson_id: string;
      question_text: string;
      question_type: string;
      options: string[];
      correct_answer: string;
      explanation?: string;
      difficulty: number;
      sort_order: number;
    }) => {
      const { data, error } = await supabase.from('questions').insert(question).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_questions'] }),
  });
};

export const useDeleteQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_questions'] }),
  });
};

export const useUpdateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        question_text?: string;
        question_type?: string;
        options?: string[];
        correct_answer?: string;
        explanation?: string;
        difficulty?: number;
        sort_order?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_questions'] }),
  });
};

export const useAdminLessonAnalytics = () => {
  return useQuery({
    queryKey: ['admin_lesson_analytics'],
    queryFn: async () => {
      const [{ data: lessons, error: lessonsError }, { data: progress, error: progressError }] = await Promise.all([
        supabase.from('lessons').select('id, title, xp_reward'),
        supabase
          .from('user_progress')
          .select('lesson_id, completed, best_accuracy, time_spent_seconds, xp_earned'),
      ]);

      if (lessonsError) throw lessonsError;
      if (progressError) throw progressError;

      const byLesson = new Map<string, {
        attempts: number;
        completed: number;
        accuracySum: number;
        timeSum: number;
        xpSum: number;
      }>();

      for (const row of progress ?? []) {
        const key = row.lesson_id;
        const current = byLesson.get(key) ?? { attempts: 0, completed: 0, accuracySum: 0, timeSum: 0, xpSum: 0 };
        current.attempts += 1;
        current.completed += row.completed ? 1 : 0;
        current.accuracySum += Number(row.best_accuracy ?? 0);
        current.timeSum += Number(row.time_spent_seconds ?? 0);
        current.xpSum += Number(row.xp_earned ?? 0);
        byLesson.set(key, current);
      }

      const rows = (lessons ?? []).map((lesson) => {
        const agg = byLesson.get(lesson.id) ?? { attempts: 0, completed: 0, accuracySum: 0, timeSum: 0, xpSum: 0 };
        const avgAccuracy = agg.attempts > 0 ? Math.round(agg.accuracySum / agg.attempts) : 0;
        const avgTimeSec = agg.attempts > 0 ? Math.round(agg.timeSum / agg.attempts) : 0;
        const completionRate = agg.attempts > 0 ? Math.round((agg.completed / agg.attempts) * 100) : 0;
        return {
          lessonId: lesson.id,
          title: lesson.title,
          xpReward: lesson.xp_reward,
          attempts: agg.attempts,
          completed: agg.completed,
          completionRate,
          avgAccuracy,
          avgTimeSec,
          totalXpEarned: agg.xpSum,
        };
      });

      return rows.sort((a, b) => b.attempts - a.attempts);
    },
  });
};

export const useAdminQuestionAnalytics = () => {
  return useQuery({
    queryKey: ['admin_question_analytics'],
    queryFn: async () => {
      const [{ data: questions, error: questionsError }, { data: lessons, error: lessonsError }] = await Promise.all([
        supabase.from('questions').select('id, lesson_id, question_type, difficulty'),
        supabase.from('lessons').select('id, title'),
      ]);

      if (questionsError) throw questionsError;
      if (lessonsError) throw lessonsError;

      const byType = new Map<string, number>();
      const byDifficulty = new Map<number, number>();
      const byLesson = new Map<string, number>();

      for (const q of questions ?? []) {
        byType.set(q.question_type, (byType.get(q.question_type) ?? 0) + 1);
        byDifficulty.set(q.difficulty, (byDifficulty.get(q.difficulty) ?? 0) + 1);
        byLesson.set(q.lesson_id, (byLesson.get(q.lesson_id) ?? 0) + 1);
      }

      const lessonTitleMap = new Map((lessons ?? []).map((l) => [l.id, l.title]));
      const topLessons = Array.from(byLesson.entries())
        .map(([lessonId, totalQuestions]) => ({
          lessonId,
          title: lessonTitleMap.get(lessonId) ?? 'Noma’lum dars',
          totalQuestions,
        }))
        .sort((a, b) => b.totalQuestions - a.totalQuestions);

      return {
        totalQuestions: (questions ?? []).length,
        byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
        byDifficulty: Array.from(byDifficulty.entries())
          .map(([difficulty, count]) => ({ difficulty, count }))
          .sort((a, b) => a.difficulty - b.difficulty),
        topLessons,
      };
    },
  });
};

// --- Analytics ---
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin_analytics'],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // DAU - users with activity today
      const { count: dau } = await supabase
        .from('activity_logs' as any)
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      // WAU - users with activity this week
      const { count: wau } = await supabase
        .from('activity_logs' as any)
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Total lessons completed
      const { count: lessonsCompleted } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);

      // Total questions
      const { count: totalQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Average accuracy
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('best_accuracy')
        .eq('completed', true);

      const avgAccuracy = progressData && progressData.length > 0
        ? Math.round(progressData.reduce((s, p) => s + Number(p.best_accuracy ?? 0), 0) / progressData.length)
        : 0;

      return {
        totalUsers: totalUsers ?? 0,
        dau: dau ?? 0,
        wau: wau ?? 0,
        lessonsCompleted: lessonsCompleted ?? 0,
        totalQuestions: totalQuestions ?? 0,
        avgAccuracy,
      };
    },
  });
};

export const useAssignRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from('user_roles' as any).insert({
        user_id: userId,
        role,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_user_roles'] }),
  });
};

export const useRemoveRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles' as any)
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_user_roles'] }),
  });
};
