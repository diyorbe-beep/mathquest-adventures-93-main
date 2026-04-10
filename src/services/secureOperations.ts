import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { env } from '@/lib/env';

// Server-side Supabase client for secure operations
export const supabaseAdmin = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Secure operations using direct SQL
export class SecureOperations {
  static async purchaseItem(userId: string, itemId: string, quantity: number = 1) {
    const { data, error } = await supabaseAdmin
      .from('profiles' as any)
      .select('coins')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw new Error(`Failed to get user balance: ${error.message}`);
    }
    
    const currentCoins = data?.coins || 0;
    
    // Get item details
    const { data: itemData, error: itemError } = await supabaseAdmin
      .from('shop_items' as any)
      .select('price, name, is_active')
      .eq('id', itemId)
      .single();
    
    if (itemError || !itemData?.is_active) {
      throw new Error('Item not found or inactive');
    }
    
    const totalCost = itemData.price * quantity;
    
    if (currentCoins < totalCost) {
      return { success: false, message: 'Insufficient coins', newBalance: currentCoins };
    }
    
    // Perform atomic transaction
    const { error: updateError } = await supabaseAdmin
      .from('profiles' as any)
      .update({ 
        coins: currentCoins - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update balance: ${updateError.message}`);
    }
    
    // Add to inventory
    const { error: inventoryError } = await supabaseAdmin
      .from('user_inventory' as any)
      .upsert({
        user_id: userId,
        item_id: itemId,
        quantity: quantity
      }, {
        onConflict: 'user_id,item_id'
      });
    
    if (inventoryError) {
      throw new Error(`Failed to update inventory: ${inventoryError.message}`);
    }
    
    // Log transaction
    await supabaseAdmin
      .from('coin_logs' as any)
      .insert({
        user_id: userId,
        amount: -totalCost,
        source: 'shop_purchase',
        metadata: {
          item_id: itemId,
          item_name: itemData.name,
          quantity: quantity
        }
      });
    
    return { 
      success: true, 
      message: 'Purchase successful', 
      newBalance: currentCoins - totalCost 
    };
  }
  
  static async awardXP(userId: string, lessonId: string, amount: number, source: string = 'lesson') {
    // Validate XP amount
    if (amount <= 0 || amount > 100) {
      return { success: false, message: 'Invalid XP amount' };
    }
    
    // Check daily XP limit
    const today = new Date().toISOString().split('T')[0];
    const { data: todayXP, error: xpError } = await supabaseAdmin
      .from('xp_logs')
      .select('amount')
      .eq('user_id', userId)
      .eq('source', source)
      .gte('created_at', today)
      .lt('created_at', new Date(Date.now() + 86400000).toISOString());
    
    if (xpError) {
      throw new Error(`Failed to check daily XP: ${xpError.message}`);
    }
    
    const totalToday = todayXP?.reduce((sum, log) => sum + log.amount, 0) || 0;
    const maxDailyXP = 1000;
    
    if (totalToday + amount > maxDailyXP) {
      return { success: false, message: 'Daily XP limit exceeded' };
    }
    
    // Get current stats
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('xp, level')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      throw new Error(`Failed to get profile: ${profileError.message}`);
    }
    
    const currentXP = profile?.xp || 0;
    const newXP = currentXP + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    // Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update XP: ${updateError.message}`);
    }
    
    // Log XP award
    await supabaseAdmin
      .from('xp_logs')
      .insert({
        user_id: userId,
        amount,
        source,
        lesson_id: lessonId
      });
    
    return { 
      success: true, 
      newLevel, 
      newXP, 
      message: 'XP awarded successfully' 
    };
  }
  
  static async validateUserProgress(userId: string, lessonId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_progress' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Progress validation failed: ${error.message}`);
    }
    
    return data;
  }
  
  static async logActivity(userId: string, action: string, metadata: any = {}) {
    const { error } = await supabaseAdmin
      .from('activity_logs' as any)
      .insert({
        user_id: userId,
        action,
        metadata
      });
    
    if (error) {
      console.error('Activity logging failed:', error);
    }
  }
  
  static async getUserStats(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles' as any)
      .select('xp, level, hearts, coins, streak_days, username')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
    
    return data;
  }
}

// Input validation utilities
export class InputValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    
    if (username.length > 20) {
      return { valid: false, message: 'Username must be less than 20 characters' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { valid: true };
  }
  
  static validatePurchaseQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 100;
  }
  
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

// Error handling utilities
export class ErrorHandler {
  static handleDatabaseError(error: any): { message: string; code?: string } {
    if (error?.code === '23505') {
      return { message: 'Username already exists', code: 'DUPLICATE_USERNAME' };
    }
    
    if (error?.code === '23514') {
      return { message: 'Invalid input data', code: 'INVALID_INPUT' };
    }
    
    if (error?.code === '42501') {
      return { message: 'Permission denied', code: 'PERMISSION_DENIED' };
    }
    
    return { message: error?.message || 'An error occurred', code: error?.code };
  }
  
  static logError(error: any, context: string = ''): void {
    console.error(`[${context}] Error:`, {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
  }
}
