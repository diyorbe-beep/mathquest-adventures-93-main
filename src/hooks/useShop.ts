import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useShopItems = () => {
  return useQuery({
    queryKey: ['shop_items'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
};

export const useCoinBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['coin_balance', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return Number(data?.coins ?? 0);
    },
  });
};

export const useUserInventory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user_inventory', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('user_inventory')
        .select('item_id, quantity')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as { item_id: string; quantity: number }[];
    },
  });
};

export const usePurchaseShopItem = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('Tasdiqlanmagan');
      const { data, error } = await (supabase as any).rpc('purchase_shop_item', { p_item_id: itemId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.success) throw new Error(row?.message ?? 'Sotib olishda xatolik');
      return row as { success: boolean; message: string; new_balance: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coin_balance', user?.id] });
      qc.invalidateQueries({ queryKey: ['user_inventory', user?.id] });
      qc.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};
