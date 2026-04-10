import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SecureOperations } from '@/services/secureOperations';
import { useAuth } from '@/contexts/AuthContext';

type ShopItem = any;
type UserInventory = any;

export const useShop = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get shop items
  const { data: shopItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['shop_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get user inventory
  const { data: userInventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['user_inventory'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_inventory' as any)
        .select('*, shop_items(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ['user_stats'],
    queryFn: async () => {
      if (!user) return null;
      
      return await SecureOperations.getUserStats(user.id);
    },
    enabled: !!user
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      return await SecureOperations.purchaseItem(user.id, itemId, quantity);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['user_inventory'] });
        queryClient.invalidateQueries({ queryKey: ['user_stats'] });
        queryClient.invalidateQueries({ queryKey: ['coin_logs'] });
      }
    }
  });

  // Get item quantity in inventory
  const getItemQuantity = (itemId: string): number => {
    const item = userInventory?.find(inv => inv.item_id === itemId);
    return item?.quantity || 0;
  };

  // Check if user can afford item
  const canAfford = (price: number): boolean => {
    return (userStats?.coins || 0) >= price;
  };

  return {
    shopItems: shopItems || [],
    userInventory: userInventory || [],
    userStats,
    itemsLoading,
    inventoryLoading,
    purchaseMutation,
    getItemQuantity,
    canAfford
  };
};

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
