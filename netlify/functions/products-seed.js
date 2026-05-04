// ============================================================
// netlify/functions/products-seed.js
// POST /.netlify/functions/products-seed
//
// Admin-only endpoint. Fetches from FakeStore API (fashion categories only),
// maps to our product schema, and upserts into Supabase products table.
//
// Security: requires X-Admin-Secret header matching ADMIN_SECRET env var.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Maps FakeStore category → our vibe + gender
function mapFakeStoreProduct(rp) {
  let vibe = 'casual';
  let gender = 'unisex';
  let tags = [rp.category, 'fakestore'];

  if (rp.category === "men's clothing") { vibe = 'professional'; gender = 'men'; tags.push('men', 'office', 'formal'); }
  if (rp.category === "women's clothing") { vibe = 'casual'; gender = 'women'; tags.push('women', 'casual', 'everyday'); }
  if (rp.category === "jewelery") { vibe = 'comfort'; gender = 'women'; tags.push('jewelry', 'gift', 'women'); }

  return {
    id: `fake_${rp.id}`,
    name: rp.title.substring(0, 100),
    type: rp.category === 'jewelery' ? 'jewelry' : (rp.category.includes('clothing') ? 'top' : 'accessory'),
    price: rp.price,
    image_url: rp.image,
    description: rp.description.substring(0, 500),
    vibe,
    tags,
    gender,
    source: 'fakestore',
    in_stock: true
  };
}

exports.handler = async function(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  // Admin secret check
  const secret = event.headers['x-admin-secret'];
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // Fetch FakeStore API — fashion categories only
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('FakeStore API request failed');
    const allProducts = await response.json();

    const fashionCategories = ["men's clothing", "women's clothing", "jewelery"];
    const fashionProducts = allProducts.filter(p => fashionCategories.includes(p.category));
    const mapped = fashionProducts.map(mapFakeStoreProduct);

    const { data, error } = await supabase
      .from('products')
      .upsert(mapped, { onConflict: 'id', ignoreDuplicates: false })
      .select('id');

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, seeded: data.length, message: `Successfully seeded ${data.length} FakeStore fashion products.` })
    };
  } catch (error) {
    console.error('Seed error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Seeding failed', details: error.message }) };
  }
};
