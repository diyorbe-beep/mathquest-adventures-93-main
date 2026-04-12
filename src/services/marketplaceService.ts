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
   * Bir nechta mahsulotli bozor buyurtmasini qayta ishlaydi.
   * Server tomonida atomiklik, zaxira va idempotentlikni boshqaradi.
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
        if (import.meta.env.DEV) console.error('Xarid xatosi:', error);
        throw new Error(error.message || 'Xaridni amalga oshirib bo\'lmadi');
      }

      const res = Array.isArray(data) ? data[0] : data;
      return res;
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
      throw err;
    }
  }

  /**
   * Do'kon mahsulotlarini sotuvchi ma'lumotlari bilan oladi
   */
  static async getShopItems() {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Foydalanuvchi buyurtmalarini oladi
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
