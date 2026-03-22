import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'student' | 'parent';

export const useRoles = () => {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user_roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id);
      if (error) throw error;
      return ((data ?? []) as any[]).map(r => r.role as AppRole);
    },
    enabled: !!user,
  });

  return {
    roles,
    isAdmin: roles.includes('admin'),
    isParent: roles.includes('parent'),
    isStudent: roles.includes('student'),
    isLoading,
  };
};
