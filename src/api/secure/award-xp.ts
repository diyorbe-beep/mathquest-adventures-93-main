import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Server-side Supabase client with service role key
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
    console.log('XP berish API chaqirildi');
    
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

    const { userId, lessonId, amount, source } = await request.json();
    
    console.log('XP berish parametrlari:', { userId, lessonId, amount, source });

    // Validate input
    if (!userId || !lessonId || !amount || amount <= 0 || amount > 100) {
      console.error('Noto\'g\'ri kirish parametrlari:', { userId, lessonId, amount });
      return Response.json({ success: false, error: 'Noto\'g\'ri kirish parametrlari' }, { status: 400 });
    }

    // Verify user matches token
    if (userId !== user.id) {
      return Response.json({ success: false, error: 'Foydalanuvchi mos kelmaydi' }, { status: 403 });
    }

    // Check daily XP limit
    const today = new Date().toISOString().split('T')[0];
    const { data: todayXP, error: xpError } = await supabaseAdmin
      .from('xp_logs')
      .select('amount')
      .eq('user_id', userId)
      .eq('source', source || 'lesson')
      .gte('created_at', today)
      .lt('created_at', new Date(Date.now() + 86400000).toISOString());
    
    if (xpError) {
      console.error('XP tekshiruv xatosi:', xpError);
      return Response.json({ 
        success: false, 
        error: 'Kunlik XP chegarasini tekshirib bo\'lmadi' 
      }, { status: 500 });
    }
    
    const totalToday = todayXP?.reduce((sum, log) => sum + log.amount, 0) || 0;
    const maxDailyXP = 1000;
    
    if (totalToday + amount > maxDailyXP) {
      return Response.json({ 
        success: false, 
        error: 'Kunlik XP chegarasi oshib ketdi' 
      }, { status: 429 });
    }
    
    // Get current stats
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('xp, level')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error('Profil olish xatosi:', profileError);
      return Response.json({ 
        success: false, 
        error: 'Foydalanuvchi profilini olish muvaffaqatsiz bo\'ldi' 
      }, { status: 500 });
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
      console.error('XP yangilash xatosi:', updateError);
      return Response.json({ 
        success: false, 
        error: 'XP ni yangilab bo\'lmadi' 
      }, { status: 500 });
    }
    
    // Log XP award
    const { error: logError } = await supabaseAdmin
      .from('xp_logs')
      .insert({
        user_id: userId,
        amount,
        source: source || 'lesson',
        lesson_id: lessonId
      });
    
    if (logError) {
      console.error('XP jurnal xatosi:', logError);
      // Don't fail the operation if logging fails
    }
    
    console.log('XP muvaffaqiyatli berildi:', { newLevel, newXP, userId });
    
    return Response.json({ 
      success: true, 
      newLevel, 
      newXP, 
      message: 'XP muvaffaqiyatli berildi' 
    });

  } catch (error) {
    console.error('XP berish API xatosi:', error);
    return Response.json({ 
      success: false, 
      error: 'Ichki server xatosi' 
    }, { status: 500 });
  }
}
