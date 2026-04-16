// Shop System Integration Tests
// Tests the complete vendor-item relationship and marketplace functionality

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceService } from '@/services/marketplaceService';

describe('Shop System Integration', () => {
  let testUserId: string;
  let testVendorId: string;
  let testItemId: string;

  beforeEach(async () => {
    // Create test user
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'test-shop@example.com',
      password: 'testpassword123',
      options: {
        data: { username: 'testshopuser' }
      }
    });

    if (userError) throw userError;
    testUserId = userData.user?.id!;
    
    // Create test profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        username: 'testshopuser',
        coins: 1000,
        hearts: 5,
        level: 1,
        xp: 0,
        streak_days: 0
      });

    if (profileError) throw profileError;

    // Create test vendor
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: testUserId,
        business_name: 'Test Shop',
        description: 'Test shop for integration testing',
        is_verified: true
      })
      .select()
      .single();

    if (vendorError) throw vendorError;
    testVendorId = vendorData.id;

    // Create test shop item
    const { data: itemData, error: itemError } = await supabase
      .from('shop_items')
      .insert({
        name: 'Test Item',
        description: 'Test item for integration testing',
        price: 100,
        stock_quantity: 10,
        category: 'general',
        icon: 'test',
        is_active: true,
        sort_order: 1,
        vendor_id: testVendorId
      })
      .select()
      .single();

    if (itemError) throw itemError;
    testItemId = itemData.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await supabase.from('orders').delete().eq('user_id', testUserId);
    await supabase.from('order_items').delete().eq('order_id', testUserId);
    await supabase.from('user_inventory').delete().eq('user_id', testUserId);
    await supabase.from('coin_logs').delete().eq('user_id', testUserId);
    await supabase.from('shop_items').delete().eq('id', testItemId);
    await supabase.from('vendors').delete().eq('id', testVendorId);
    await supabase.from('profiles').delete().eq('user_id', testUserId);
    
    // Delete test user
    await supabase.auth.admin.deleteUser(testUserId);
  });

  describe('Vendor-Item Relationships', () => {
    it('should properly link shop items to vendors', async () => {
      const items = await MarketplaceService.getShopItems();
      
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      
      const testItem = items.find(item => item.id === testItemId);
      expect(testItem).toBeDefined();
      expect(testItem?.vendors).toBeDefined();
      expect(testItem?.vendors?.id).toBe(testVendorId);
      expect(testItem?.vendors?.business_name).toBe('Test Shop');
      expect(testItem?.vendors?.is_verified).toBe(true);
    });

    it('should fetch vendor information correctly', async () => {
      const vendor = await MarketplaceService.getVendorInfo(testVendorId);
      
      expect(vendor).toBeDefined();
      expect(vendor.id).toBe(testVendorId);
      expect(vendor.business_name).toBe('Test Shop');
      expect(vendor.is_verified).toBe(true);
    });

    it('should list verified vendors', async () => {
      const vendors = await MarketplaceService.getVerifiedVendors();
      
      expect(vendors).toBeDefined();
      expect(vendors.length).toBeGreaterThan(0);
      
      const testVendor = vendors.find(v => v.id === testVendorId);
      expect(testVendor).toBeDefined();
      expect(testVendor?.is_verified).toBe(true);
    });
  });

  describe('Marketplace Order Processing', () => {
    it('should process a valid order successfully', async () => {
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 2,
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_${Date.now()}`
      );

      expect(result.success).toBe(true);
      expect(result.order_id).toBeDefined();
      expect(result.total_amount).toBe(200);
      // Note: message property not returned by current function implementation
    });

    it('should reject orders with insufficient coins', async () => {
      // Update user to have insufficient coins
      await supabase
        .from('profiles')
        .update({ coins: 50 })
        .eq('user_id', testUserId);

      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 1,
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_insufficient_${Date.now()}`
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Tangalar yetarli emas');
    });

    it('should handle idempotency correctly', async () => {
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 1,
        icon: 'test'
      }];

      const idempotencyKey = `test_idempotent_${Date.now()}`;

      // First order
      const result1 = await MarketplaceService.checkout(cartItems, idempotencyKey);
      expect(result1.success).toBe(true);

      // Second order with same key
      const result2 = await MarketplaceService.checkout(cartItems, idempotencyKey);
      expect(result2.success).toBe(true);
      expect(result2.order_id).toBe(result1.order_id);
      expect(result2.message).toBe('Buyurtma allaqachon qayta ishlangan');
    });

    it('should reject orders for inactive items', async () => {
      // Deactivate the test item
      await supabase
        .from('shop_items')
        .update({ is_active: false })
        .eq('id', testItemId);

      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 1,
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_inactive_${Date.now()}`
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Mahsulot topilmadi yoki faol emas');
    });

    it('should handle stock constraints correctly', async () => {
      // Update item to have limited stock
      await supabase
        .from('shop_items')
        .update({ stock_quantity: 1 })
        .eq('id', testItemId);

      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 5, // More than available stock
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_stock_${Date.now()}`
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Mahsulot zaxirasi yetarli emas');
    });
  });

  describe('User Orders and Inventory', () => {
    it('should track user orders correctly', async () => {
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 2,
        icon: 'test'
      }];

      // Place order
      await MarketplaceService.checkout(
        cartItems,
        `test_order_tracking_${Date.now()}`
      );

      // Get user orders
      const orders = await MarketplaceService.getUserOrders();
      
      expect(orders).toBeDefined();
      expect(orders.length).toBeGreaterThan(0);
      
      const testOrder = orders.find(order => order.user_id === testUserId);
      expect(testOrder).toBeDefined();
      expect(testOrder?.total_amount).toBe(200);
      expect(testOrder?.status).toBe('completed');
    });

    it('should update user inventory after purchase', async () => {
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 3,
        icon: 'test'
      }];

      // Place order
      await MarketplaceService.checkout(
        cartItems,
        `test_order_inventory_${Date.now()}`
      );

      // Check inventory
      const { data: inventory, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', testUserId)
        .eq('item_id', testItemId)
        .single();

      expect(error).toBeNull();
      expect(inventory).toBeDefined();
      expect(inventory?.quantity).toBe(3);
      expect(inventory?.acquired_from).toBe('purchase');
    });

    it('should deduct coins correctly', async () => {
      const initialCoins = 1000;
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: 3,
        icon: 'test'
      }];

      // Place order
      await MarketplaceService.checkout(
        cartItems,
        `test_order_coins_${Date.now()}`
      );

      // Check updated coins
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(profile?.coins).toBe(initialCoins - 300);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid item IDs gracefully', async () => {
      const cartItems = [{
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Item',
        price: 100,
        quantity: 1,
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_invalid_${Date.now()}`
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Mahsulot topilmadi yoki faol emas');
    });

    it('should handle negative quantities', async () => {
      const cartItems = [{
        id: testItemId,
        name: 'Test Item',
        price: 100,
        quantity: -1,
        icon: 'test'
      }];

      const result = await MarketplaceService.checkout(
        cartItems,
        `test_order_negative_${Date.now()}`
      );

      expect(result.success).toBe(false);
    });
  });
});
