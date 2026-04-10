import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

export class MarketplaceService {
  /**
   * Processes a marketplace order with multiple items
   * Handles atomicity, stock, and idempotency on the server
   */
  static async checkout(items: CartItem[], idempotencyKey?: string) {
    const formattedItems = items.map(item => ({
      item_id: item.id,
      quantity: item.quantity
    }));

    try {
      const { data, error } = await supabase.rpc('process_marketplace_order', {
        p_items: formattedItems,
        p_idempotency_key: idempotencyKey
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Xaridni amalga oshirib bo\'lmadi');
      }

      return data as {
        success: boolean;
        order_id: string;
        total_amount: number;
        new_balance: number;
      };
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
      throw err;
    }
  }

  /**
   * Fetches shop items with vendor details
   */
  static async getShopItems() {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*, vendors(business_name, is_verified)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Fetches user orders
   */
  static async getUserOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, shop_items(name, icon))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
