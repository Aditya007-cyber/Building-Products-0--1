// ============================================================
// netlify/functions/chat-intent.js  (REPLACED)
// POST /.netlify/functions/chat-intent
//
// Body: { session_id: string, message: string }
//
// Pipeline:
//  1. Load session context from Supabase
//  2. Emit intent_parsed analytics event
//  3. Send to Gemini Flash for intent extraction (JSON)
//  4. Query Supabase products by vibe/gender/type, exclude shown
//  5. Build diverse bundle (up to 3 products)
//  6. Persist messages + update session
//  7. Emit bundle_shown analytics event
//  8. Return { response_text, bundle }
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ---- Analytics helper ----
async function emitEvent(sessionId, eventType, payload = {}) {
  await supabase.from('analytics_events').insert({
    session_id: sessionId,
    event_type: eventType,
    payload
  });
}

// ---- Gemini intent extraction ----
async function extractIntent(userMessage, conversationHistory) {
  const systemPrompt = `You are Lumina, an expert AI fashion stylist for a fashion-only shopping app.
Your job is to parse the user's message and the conversation history to understand their fashion intent.

Respond ONLY with a valid JSON object — no markdown, no explanation:
{
  "vibe": "beachy|professional|cozy|comfort|traditional|loungewear|casual",
  "gender_filter": "men|women|unisex|null",
  "type_filter": "top|bottom|shoes|accessory|dress|jewelry|null",
  "is_follow_up": true|false,
  "response_text": "A warm, friendly 1-2 sentence response confirming what you are curating for the user."
}

Rules:
- "vibe" must be exactly one of the 7 options listed.
- "is_follow_up" is true if the user is adding to / refining an existing session (e.g. "add some shoes", "show me more").
- If the intent is unclear, pick the closest vibe and set response_text to gently guide the user.
- "response_text" should feel personal, enthusiastic, and fashion-forward.`;

  // Build messages array for Gemini
  const contents = [];

  // Add system context as first user turn
  contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
  contents.push({ role: 'model', parts: [{ text: 'Understood. I am ready to parse fashion intent and respond only in JSON.' }] });

  // Add conversation history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add current user message
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Gemini API error:', JSON.stringify(data));
    throw new Error('Gemini API call failed');
  }

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty Gemini response');

  return JSON.parse(raw);
}

// ---- Bundle generator: picks up to 3 diverse products ----
function buildBundle(products) {
  const bundle = [];
  const usedTypes = new Set();

  for (const product of products) {
    if (!usedTypes.has(product.type)) {
      bundle.push(product);
      usedTypes.add(product.type);
    }
    if (bundle.length >= 3) break;
  }

  // If we don't have 3, fill from remaining regardless of type
  if (bundle.length < 3) {
    const bundleIds = new Set(bundle.map(p => p.id));
    for (const product of products) {
      if (!bundleIds.has(product.id)) {
        bundle.push(product);
        bundleIds.add(product.id);
      }
      if (bundle.length >= 3) break;
    }
  }

  return bundle;
}

// ---- Main handler ----
exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let session_id, message;
  try {
    ({ session_id, message } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!session_id || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id and message are required' }) };
  }

  try {
    // ---- Step 1: Load session context ----
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Session not found' }) };
    }

    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10);

    // ---- Step 2: Emit intent_parsed event ----
    await emitEvent(session_id, 'intent_parsed', { message: message.substring(0, 200) });

    // ---- Step 3: Extract intent with Gemini ----
    let intent;
    try {
      intent = await extractIntent(message, recentMessages || []);
    } catch (e) {
      // Graceful fallback if Gemini fails
      console.error('Gemini error, using fallback:', e.message);
      intent = {
        vibe: session.current_vibe || 'casual',
        gender_filter: null,
        type_filter: null,
        is_follow_up: !!(session.current_vibe),
        response_text: "Let me find something great for you! Here's what I've curated:"
      };
    }

    const targetVibe = intent.vibe || session.current_vibe || 'casual';
    const shownIds = session.shown_product_ids || [];

    // ---- Step 4: Query products ----
    let query = supabase
      .from('products')
      .select('*')
      .eq('vibe', targetVibe)
      .eq('in_stock', true);

    // Filter by gender if specified (also allow unisex)
    if (intent.gender_filter && intent.gender_filter !== 'null') {
      query = query.in('gender', [intent.gender_filter, 'unisex']);
    }

    // Filter by type if specified
    if (intent.type_filter && intent.type_filter !== 'null') {
      query = query.eq('type', intent.type_filter);
    }

    // Exclude already shown products
    if (shownIds.length > 0) {
      query = query.not('id', 'in', `(${shownIds.join(',')})`);
    }

    const { data: availableProducts, error: productsError } = await query.limit(20);

    if (productsError) {
      console.error('Products query error:', productsError);
    }

    let bundle = [];
    let responseText = intent.response_text;

    if (!availableProducts || availableProducts.length === 0) {
      responseText = "I've shown you all the great options for this look! Try asking for a different vibe or say 'add shoes' to explore more. 👠";
    } else {
      bundle = buildBundle(availableProducts);
    }

    // ---- Step 5: Persist messages ----
    await supabase.from('messages').insert([
      { session_id, role: 'user', content: message, bundle_ids: [] },
      { session_id, role: 'assistant', content: responseText, bundle_ids: bundle.map(p => p.id) }
    ]);

    // ---- Step 6: Update session state ----
    const newShownIds = [...shownIds, ...bundle.map(p => p.id)];
    await supabase
      .from('sessions')
      .update({ current_vibe: targetVibe, shown_product_ids: newShownIds })
      .eq('id', session_id);

    // ---- Step 7: Emit bundle_shown analytics event ----
    if (bundle.length > 0) {
      await emitEvent(session_id, 'bundle_shown', {
        vibe: targetVibe,
        bundle_size: bundle.length,
        product_ids: bundle.map(p => p.id)
      });
    }

    // ---- Step 8: Return response ----
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response_text: responseText, bundle })
    };

  } catch (error) {
    console.error('chat-intent handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
