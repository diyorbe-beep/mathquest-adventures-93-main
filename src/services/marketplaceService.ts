import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

export interface MarketplaceOrderResult {
  success: boolean;
  order_id?: string;
  message?: string;
  total_amount?: number;
  new_balance?: number;
  items_processed?: any[];
}

export class MarketplaceService {
  /**
   * Bir nechta mahsulotli bozor buyurtmasini qayta ishlaydi.
   * Server tomonida atomiklik, zaxira va idempotentlikni boshqaradi.
   */
  static async checkout(items: CartItem[], idempotencyKey?: string): Promise<MarketplaceOrderResult> {
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
      .select(`
        *,
        vendors (
          id,
          business_name,
          is_verified,
          logo_url
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      if (import.meta.env.DEV) console.error('Shop items fetch error:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Foydalanuvchi buyurtmalarini oladi
   */
  static async getUserOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          shop_items(
            name, 
            icon,
            vendors (
              business_name,
              is_verified
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error('User orders fetch error:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Sotuvchi ma'lumotlarini oladi
   */
  static async getVendorInfo(vendorId: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Vendor info fetch error:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Barcha tasdiqlangan sotuvchilarni oladi
   */
  static async getVerifiedVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_verified', true)
      .order('business_name', { ascending: true });

    if (error) {
      if (import.meta.env.DEV) console.error('Verified vendors fetch error:', error);
      throw error;
    }
    
    return data;
  }
}
