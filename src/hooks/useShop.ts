import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ShopItem = Record<string, unknown>;
type UserInventory = Record<string, unknown>;

type ProfileStats = {
  xp: number;
  level: number;
  hearts: number;
  coins: number;
  streak_days: number;
  username: string | null;
};

export const useShop = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: shopItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['shop_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data ?? []) as unknown as ShopItem[];
    },
  });

  const { data: userInventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['user_inventory', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_inventory')
        .select('*, shop_items(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as unknown as UserInventory[];
    },
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ['user_stats', user?.id],
    queryFn: async (): Promise<ProfileStats | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level, hearts, coins, streak_days, username')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        xp: Number(data.xp ?? 0),
        level: Number(data.level ?? 1),
        hearts: Number(data.hearts ?? 0),
        coins: Number(data.coins ?? 0),
        streak_days: Number(data.streak_days ?? 0),
        username: data.username ?? null,
      };
    },
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!user) throw new Error('Foydalanuvchi tasdiqlanmagan');

      const idempotencyKey = `purchase_${user.id}_${itemId}_${Date.now()}`;

      const { data, error } = await supabase.rpc('process_marketplace_order', {
        p_items: [{ item_id: itemId, quantity }],
        p_idempotency_key: idempotencyKey,
      });

      if (error) throw new Error(error.message || 'Xarid amalga oshmadi');

      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.success) {
        throw new Error(row?.message || 'Xarid amalga oshmadi');
      }

      return row as {
        success: boolean;
        order_id?: string;
        message?: string;
        total_amount?: number;
        new_balance?: number;
        items_processed?: unknown;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      queryClient.invalidateQueries({ queryKey: ['coin_logs'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const getItemQuantity = (itemId: string): number => {
    const item = userInventory?.find((inv) => (inv as { item_id?: string }).item_id === itemId);
    return Number((item as { quantity?: number })?.quantity ?? 0);
  };

  const canAfford = (price: number): boolean => {
    return (userStats?.coins ?? 0) >= price;
  };

  return {
    shopItems: shopItems || [],
    userInventory: userInventory || [],
    userStats,
    itemsLoading,
    inventoryLoading,
    purchaseMutation,
    getItemQuantity,
    canAfford,
  };
};

export const useShopItems = () => {
  return useQuery({
    queryKey: ['shop_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase.rpc('purchase_shop_item', { p_item_id: itemId });
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
