// ============================================================
// netlify/functions/checkout.js  (REPLACES process-checkout.js)
// POST /.netlify/functions/checkout
//
// Body: { session_id, phone, name, address }
//
// Pipeline:
//  1. Emit checkout_started analytics event
//  2. Fetch cart items with product details
//  3. Create orders row (JSONB snapshot, payment_method: 'mock')
//  4. Generate WhatsApp wa.me URL
//  5. Delete cart_items for session
//  6. Emit order_placed analytics event
//  7. Return { order_id, whatsapp_url, total_amount }
//
// Stripe stub is commented out — uncomment + add STRIPE_SECRET_KEY to go live
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function emitEvent(sessionId, eventType, payload = {}) {
  await supabase.from('analytics_events').insert({ session_id: sessionId, event_type: eventType, payload });
}

exports.handler = async function(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { session_id, phone, name, address } = body;
  if (!session_id || !phone || !name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id, phone, and name are required' }) };
  }

  try {
    // Step 1: Emit checkout_started
    await emitEvent(session_id, 'checkout_started', { phone_prefix: phone.substring(0, 3) });

    // Step 2: Fetch cart with full product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, size, product:products(id, name, type, price, image_url, vibe)')
      .eq('session_id', session_id);

    if (cartError || !cartItems || cartItems.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cart is empty or not found' }) };
    }

    // Build order items snapshot
    const orderItems = cartItems.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      type: item.product.type,
      price: item.product.price,
      image_url: item.product.image_url,
      vibe: item.product.vibe,
      size: item.size
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.price), 0);

    // Step 3: Create order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        session_id,
        items: orderItems,
        total_amount: Number(totalAmount.toFixed(2)),
        phone,
        shipping_name: name,
        shipping_address: address || '',
        status: 'confirmed',
        payment_method: 'mock',
        whatsapp_sent: false
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create order' }) };
    }

    // Step 4: Generate WhatsApp URL
    let waMsg = `*🛍️ Order Confirmation — Lumina AI*\n\n`;
    waMsg += `Hi ${name}! Your order is confirmed.\n\n`;
    orderItems.forEach(item => {
      waMsg += `• ${item.name} (Size: ${item.size}) — $${Number(item.price).toFixed(2)}\n`;
    });
    waMsg += `\n*Total: $${totalAmount.toFixed(2)}*\n\nThank you for shopping with Lumina! Your items will be shipped soon. 🚀`;

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;

    // Update whatsapp_sent flag
    await supabase.from('orders').update({ whatsapp_sent: true }).eq('id', order.id);

    // Step 5: Clear cart
    await supabase.from('cart_items').delete().eq('session_id', session_id);

    // Step 6: Emit order_placed analytics
    await emitEvent(session_id, 'order_placed', {
      order_id: order.id,
      total_amount: Number(totalAmount.toFixed(2)),
      item_count: orderItems.length,
      vibes: [...new Set(orderItems.map(i => i.vibe))],
      payment_method: 'mock'
    });

    // Step 7: Return
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order_id: order.id,
        whatsapp_url: whatsappUrl,
        total_amount: Number(totalAmount.toFixed(2)),
        item_count: orderItems.length,
        success: true
      })
    };

    // ============================================================
    // STRIPE STUB (Phase 2 — uncomment and add STRIPE_SECRET_KEY)
    // ============================================================
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const lineItems = orderItems.map(item => ({
    //   price_data: {
    //     currency: 'usd',
    //     product_data: { name: item.name, images: [item.image_url] },
    //     unit_amount: Math.round(Number(item.price) * 100)
    //   },
    //   quantity: 1
    // }));
    // const stripeSession = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: lineItems,
    //   mode: 'payment',
    //   success_url: `${process.env.SITE_URL}/success?order_id=${order.id}`,
    //   cancel_url: `${process.env.SITE_URL}/`
    // });
    // await supabase.from('orders').update({ stripe_session_id: stripeSession.id, payment_method: 'stripe' }).eq('id', order.id);
    // return { statusCode: 200, headers, body: JSON.stringify({ stripe_url: stripeSession.url, order_id: order.id }) };

  } catch (error) {
    console.error('Checkout handler error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Checkout failed', details: error.message }) };
  }
};
