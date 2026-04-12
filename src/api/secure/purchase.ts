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

    const { userId, itemId, quantity, idempotencyKey } = await request.json();

    // Validate input
    if (!userId || !itemId || !quantity || quantity <= 0 || quantity > 100) {
      return Response.json({ success: false, error: 'Noto\'g\'ri kirish parametrlari' }, { status: 400 });
    }

    // Verify user matches token
    if (userId !== user.id) {
      return Response.json({ success: false, error: 'Foydalanuvchi mos kelmaydi' }, { status: 403 });
    }

    // Process purchase using RPC function
    const { data, error } = await supabaseAdmin.rpc('process_marketplace_order', {
      p_items: [{ item_id: itemId, quantity }],
      p_idempotency_key: idempotencyKey
    });

    if (error) {
      console.error('Xarid xatosi:', error);
      return Response.json({ 
        success: false, 
        error: `Xarid muvaffaqatsiz bo\'ldi: ${error.message}` 
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: 'Xarid muvaffaqiyatli',
      newBalance: data?.new_balance
    });

  } catch (error) {
    console.error('Xarid API xatosi:', error);
    return Response.json({ 
      success: false, 
      error: 'Ichki server xatosi' 
    }, { status: 500 });
  }
}
