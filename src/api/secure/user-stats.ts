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
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Ruxsatsiz' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ success: false, error: 'Noto\'g\'ri token' }, { status: 401 });
    }

    const { userId } = await request.json();

    // Validate input
    if (!userId) {
      return Response.json({ success: false, error: 'Foydalanuvchi ID talab qilinadi' }, { status: 400 });
    }

    // Verify user matches token
    if (userId !== user.id) {
      return Response.json({ success: false, error: 'Foydalanuvchi mos kelmaydi' }, { status: 403 });
    }

    // Get user stats
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('xp, level, hearts, coins, streak_days, username')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Foydalanuvchi statistikasini olish xatosi:', error);
      return Response.json({ 
        success: false, 
        error: 'Foydalanuvchi statistikasini olish muvaffaqatsiz bo\'ldi' 
      }, { status: 500 });
    }
    
    return Response.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Foydalanuvchi statistikasi API xatosi:', error);
    return Response.json({ 
      success: false, 
      error: 'Ichki server xatosi' 
    }, { status: 500 });
  }
}
