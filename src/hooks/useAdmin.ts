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
