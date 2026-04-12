import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Server-side Supabase client
const supabaseAdmin = createClient(
  env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export async function POST(request: Request) {
  try {
    console.log('Coin berish API chaqirildi');
    
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Ruxsatsiz so\'rov:', { authHeader });
      return Response.json({ success: false, error: 'Ruxsatsiz' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ success: false, error: 'Noto\'g\'ri token' }, { status: 401 });
    }

    const { userId, amount, source, lessonId } = await request.json();
    
    console.log('Coin berish parametrlari:', { userId, amount, source, lessonId });

    // Validate input
    if (!userId || !amount || amount <= 0 || amount > 1000) {
      console.error('Noto\'g\'ri kirish parametrlari:', { userId, amount });
      return Response.json({ success: false, error: 'Noto\'g\'ri kirish parametrlari' }, { status: 400 });
    }

    // Verify user matches token
    if (userId !== user.id) {
      return Response.json({ success: false, error: 'Foydalanuvchi mos kelmaydi' }, { status: 403 });
    }

    // Get current stats
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('coins')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error('Profil olish xatosi:', profileError);
      return Response.json({ 
        success: false, 
        error: 'Foydalanuvchi profilini olish muvaffaqatsiz bo\'ldi' 
      }, { status: 500 });
    }
    
    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;
    
    // Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Coin yangilash xatosi:', updateError);
      return Response.json({ 
        success: false, 
        error: 'Coinlarni yangilab bo\'lmadi' 
      }, { status: 500 });
    }
    
    // Log coin award
    const { error: logError } = await supabaseAdmin
      .from('coin_logs')
      .insert({
        user_id: userId,
        amount,
        source: source || 'lesson',
        lesson_id: lessonId,
        created_at: new Date().toISOString()
      });
    
    if (logError) {
      console.error('Coin jurnal xatosi:', logError);
      // Don't fail the operation if logging fails
    }
    
    console.log('Coinlar muvaffaqiyatli berildi:', { newCoins, userId, amount });
    
    return Response.json({ 
      success: true, 
      newCoins, 
      message: 'Coinlar muvaffaqiyatli berildi' 
    });

  } catch (error) {
    console.error('Coin berish API xatosi:', error);
    return Response.json({ 
      success: false, 
      error: 'Ichki server xatosi' 
    }, { status: 500 });
  }
}
