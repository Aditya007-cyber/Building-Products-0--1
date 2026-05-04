// ============================================================
// netlify/functions/session.js
// GET  /.netlify/functions/session?session_id=<uuid>  — restore session
// POST /.netlify/functions/session                    — create new session
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to emit an analytics event
async function emitEvent(sessionId, eventType, payload = {}) {
  await supabase.from('analytics_events').insert({
    session_id: sessionId,
    event_type: eventType,
    payload
  });
}

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // ---- GET: Restore an existing session ----
  if (event.httpMethod === 'GET') {
    const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
    if (!sessionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id is required' }) };
    }

    // Fetch session state
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Session not found' }) };
    }

    // Fetch last 20 messages for this session
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Fetch current cart
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('session_id', sessionId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        session,
        messages: messages || [],
        cart: cartItems || []
      })
    };
  }

  // ---- POST: Create a new session ----
  if (event.httpMethod === 'POST') {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({ current_vibe: null, shown_product_ids: [] })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create session' }) };
    }

    // Emit analytics event
    await emitEvent(session.id, 'session_started', { source: 'web' });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ session_id: session.id })
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
