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
    const events = await request.json();

    // Validate input
    if (!Array.isArray(events)) {
      return Response.json({ 
        success: false, 
        error: 'Events must be an array' 
      }, { status: 400 });
    }

    // Process each event
    const processedEvents = events.map(event => ({
      ...event,
      created_at: new Date(event.timestamp).toISOString(),
      processed_at: new Date().toISOString()
    }));

    // Store in database (assuming analytics_events table exists)
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(processedEvents);

    if (error) {
      console.error('Analytics events storage error:', error);
      return Response.json({ 
        success: false, 
        error: 'Failed to store events' 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Events stored successfully',
      count: processedEvents.length
    });

  } catch (error) {
    console.error('Analytics events API error:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
