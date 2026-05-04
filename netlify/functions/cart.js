// ============================================================
// netlify/functions/cart.js
// GET  /.netlify/functions/cart?session_id=<uuid>  — get cart
// POST /.netlify/functions/cart                    — add item or bundle
// DELETE /.netlify/functions/cart                  — remove item
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function emitEvent(sessionId, eventType, payload = {}) {
  await supabase.from('analytics_events').insert({ session_id: sessionId, event_type: eventType, payload });
}

exports.handler = async function(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // GET: Fetch cart with product details
  if (event.httpMethod === 'GET') {
    const session_id = event.queryStringParameters?.session_id;
    if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
    const { data: items, error } = await supabase
      .from('cart_items').select('id, size, added_at, product:products(id, name, type, price, image_url, description, vibe)')
      .eq('session_id', session_id).order('added_at', { ascending: true });
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to fetch cart' }) };
    const cart = (items || []).map(item => ({ cartItemId: item.id, selectedSize: item.size, ...item.product }));
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    return { statusCode: 200, headers, body: JSON.stringify({ cart, total: Number(total.toFixed(2)), count: cart.length }) };
  }

  // POST: Add single item or entire bundle
  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
    const { session_id, product_id, size = 'M', product_ids, action } = body;
    if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };

    // Add entire bundle
    if (action === 'bundle' && Array.isArray(product_ids) && product_ids.length > 0) {
      const rows = product_ids.map(pid => ({ session_id, product_id: pid, size }));
      const { error } = await supabase.from('cart_items').upsert(rows, { onConflict: 'session_id,product_id,size', ignoreDuplicates: true });
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to add bundle' }) };
      const { data: products } = await supabase.from('products').select('id, price, vibe').in('id', product_ids);
      const totalValue = (products || []).reduce((sum, p) => sum + Number(p.price), 0);
      await emitEvent(session_id, 'bundle_accepted', { product_ids, bundle_size: product_ids.length, total_value: Number(totalValue.toFixed(2)), vibe: products?.[0]?.vibe });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, added: product_ids.length }) };
    }

    // Add single item
    if (!product_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'product_id required' }) };
    const { error } = await supabase.from('cart_items').upsert({ session_id, product_id, size }, { onConflict: 'session_id,product_id,size', ignoreDuplicates: true });
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to add item' }) };
    const { data: product } = await supabase.from('products').select('name, price, vibe, type').eq('id', product_id).single();
    await emitEvent(session_id, 'item_added', { product_id, product_name: product?.name, price: product?.price, vibe: product?.vibe, type: product?.type, size });
    return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
  }

  // DELETE: Remove item
  if (event.httpMethod === 'DELETE') {
    let body;
    try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
    const { session_id, cart_item_id } = body;
    if (!session_id || !cart_item_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id and cart_item_id required' }) };
    const { error } = await supabase.from('cart_items').delete().eq('id', cart_item_id).eq('session_id', session_id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to remove item' }) };
    await emitEvent(session_id, 'item_removed', { cart_item_id });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
