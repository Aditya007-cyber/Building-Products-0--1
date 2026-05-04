-- ============================================================
-- SEED: All 31 products from catalog.js
-- Run AFTER 001_initial_schema.sql
-- ============================================================

INSERT INTO products (id, name, type, price, image_url, description, vibe, tags, gender, source) VALUES

-- ============================================================
-- GOA / VACATION (beachy)
-- ============================================================
('p1', 'Tropical Print Resort Shirt', 'top', 45.00,
 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop',
 'A lightweight, vibrant tropical print shirt perfect for beach days and resort evenings.',
 'beachy', ARRAY['goa','vacation','beach','summer','floral','resort','relaxed'], 'men', 'local'),

('p2', 'Linen Drawstring Shorts', 'bottom', 35.00,
 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop',
 'Breathable linen shorts with a comfortable drawstring waist. Ideal for warm weather.',
 'beachy', ARRAY['goa','vacation','beach','summer','linen','casual','relaxed'], 'men', 'local'),

('p3', 'Classic Aviator Sunglasses', 'accessory', 120.00,
 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
 'Timeless aviator frames with UV400 protection. A versatile staple for any sunny destination.',
 'beachy', ARRAY['goa','vacation','beach','summer','accessories','sun'], 'unisex', 'local'),

('p13', 'Straw Sun Hat', 'accessory', 25.00,
 'https://images.unsplash.com/photo-1575428652377-a2d80b2273fd?q=80&w=600&auto=format&fit=crop',
 'A wide-brimmed straw hat for maximum sun protection with effortless beach style.',
 'beachy', ARRAY['goa','vacation','beach','summer','hat','sun'], 'women', 'local'),

('p14', 'Leather Sandals', 'shoes', 45.00,
 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=600&auto=format&fit=crop',
 'Handcrafted leather sandals with adjustable straps. Comfortable enough for all-day wear.',
 'beachy', ARRAY['goa','vacation','beach','summer','shoes','sandals'], 'unisex', 'local'),

-- ============================================================
-- OFFICE / FORMAL (professional)
-- ============================================================
('p4', 'Tailored Navy Blazer', 'top', 150.00,
 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
 'A sharp, structured navy blazer that commands authority in any professional setting.',
 'professional', ARRAY['office','formal','work','meeting','professional','smart'], 'men', 'local'),

('p5', 'Slim Fit Chinos', 'bottom', 65.00,
 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
 'Versatile slim-fit chinos in a neutral tone. Pairs perfectly with blazers or smart casual tops.',
 'professional', ARRAY['office','formal','work','meeting','professional','smart','pants'], 'men', 'local'),

('p6', 'Leather Oxford Shoes', 'shoes', 95.00,
 'https://images.unsplash.com/photo-1614252339460-e1c15f909181?q=80&w=600&auto=format&fit=crop',
 'Classic full-grain leather Oxford shoes. Polished, durable, and timeless.',
 'professional', ARRAY['office','formal','work','meeting','professional','leather','shoes'], 'men', 'local'),

-- ============================================================
-- WINTER / COZY (cozy)
-- ============================================================
('p7', 'Chunky Knit Sweater', 'top', 85.00,
 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?q=80&w=600&auto=format&fit=crop',
 'A thick, chunky-knit sweater in a warm neutral palette. Perfect for cold evenings.',
 'cozy', ARRAY['winter','cozy','cold','snow','knit','warm'], 'unisex', 'local'),

('p8', 'Dark Wash Denim Jeans', 'bottom', 70.00,
 'https://images.unsplash.com/photo-1542272604-780c8d52a5ce?q=80&w=600&auto=format&fit=crop',
 'Classic dark-wash denim with a modern slim cut. A wardrobe essential for any season.',
 'cozy', ARRAY['winter','cozy','casual','everyday','denim','jeans'], 'unisex', 'local'),

('p9', 'Fleece Lined Beanie', 'accessory', 25.00,
 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop',
 'Super-soft fleece-lined beanie to keep your head warm in the coldest weather.',
 'cozy', ARRAY['winter','cozy','cold','snow','hat','warm'], 'unisex', 'local'),

-- ============================================================
-- GIFTING / NEW MOM (comfort)
-- ============================================================
('p10', 'Luxurious Cashmere Robe', 'top', 190.00,
 'https://images.unsplash.com/photo-1616016624991-62d29486dc96?q=80&w=600&auto=format&fit=crop',
 'An indulgent cashmere robe that wraps you in warmth and luxury. The perfect gift.',
 'comfort', ARRAY['gift','mom','cozy','loungewear','luxury','comfort'], 'women', 'local'),

('p11', 'Silk Sleep Mask', 'accessory', 40.00,
 'https://images.unsplash.com/photo-1643900894564-9be1bd2724fa?q=80&w=600&auto=format&fit=crop',
 'A gentle silk sleep mask for uninterrupted rest. Hypoallergenic and ultra-soft.',
 'comfort', ARRAY['gift','mom','sleep','luxury','comfort','accessories'], 'women', 'local'),

('p12', 'Aromatherapy Candle Set', 'accessory', 55.00,
 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
 'A set of three premium soy wax candles with calming lavender, eucalyptus, and vanilla scents.',
 'comfort', ARRAY['gift','mom','home','relaxing','spa','comfort'], 'unisex', 'local'),

('p15', 'Plush Warm Slippers', 'shoes', 35.00,
 'https://images.unsplash.com/photo-1588893958284-814bfb24a350?q=80&w=600&auto=format&fit=crop',
 'Cloud-like memory foam slippers with a non-slip sole. Total comfort for home days.',
 'comfort', ARRAY['gift','mom','home','relaxing','shoes','comfort','warm'], 'women', 'local'),

('p16', 'Gold Pendant Necklace', 'jewelry', 120.00,
 'https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?q=80&w=600&auto=format&fit=crop',
 'A delicate 18K gold-plated pendant necklace. Minimal, elegant, and meaningful.',
 'comfort', ARRAY['gift','mom','jewelry','necklace','luxury','comfort'], 'women', 'local'),

-- ============================================================
-- TRADITIONAL WEAR (traditional)
-- ============================================================
('p17', 'Men''s Silk Blend Kurta', 'top', 65.00,
 'https://images.unsplash.com/photo-1662057302482-127bcfeb5231?q=80&w=600&auto=format&fit=crop',
 'A finely crafted silk blend kurta with subtle embroidery at the collar. Perfect for festivals.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','festival','kurta'], 'men', 'local'),

('p18', 'Embroidered Nehru Jacket', 'top', 85.00,
 'https://images.unsplash.com/photo-1583391733975-01e4a3cc18e9?q=80&w=600&auto=format&fit=crop',
 'A richly embroidered Nehru jacket to layer over a kurta for a regal, complete look.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','festival','jacket'], 'men', 'local'),

('p19', 'Traditional Leather Mojari', 'shoes', 45.00,
 'https://images.unsplash.com/photo-1614252339460-e1c15f909181?q=80&w=600&auto=format&fit=crop',
 'Handcrafted leather Mojari with intricate embroidery. A traditional must-have for weddings.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','shoes','mojari'], 'men', 'local'),

('p20', 'Designer Georgette Saree', 'dress', 150.00,
 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
 'An elegant georgette saree with intricate border work. Grace and tradition in every fold.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','festival','saree'], 'women', 'local'),

('p21', 'Kundan Jewelry Set', 'jewelry', 200.00,
 'https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?q=80&w=600&auto=format&fit=crop',
 'A stunning Kundan necklace and earring set. The perfect complement to any ethnic outfit.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','jewelry','kundan'], 'women', 'local'),

('p22', 'Embroidered Lehenga Choli', 'dress', 250.00,
 'https://images.unsplash.com/photo-1583391733959-24a93fce18eb?q=80&w=600&auto=format&fit=crop',
 'A vibrant, heavily embroidered lehenga choli. The centrepiece of any celebration wardrobe.',
 'traditional', ARRAY['traditional','ethnic','indian','wedding','festival','lehenga'], 'women', 'local'),

-- ============================================================
-- HOME LOUNGEWEAR (loungewear)
-- ============================================================
('p23', 'Men''s Cotton Lounge Joggers', 'bottom', 40.00,
 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
 'Ultra-soft cotton joggers with an elasticated waist. The ultimate comfort at home.',
 'loungewear', ARRAY['home','relax','loungewear','pajamas','comfort','pants'], 'men', 'local'),

('p24', 'Oversized Cotton Tee', 'top', 20.00,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
 'A generously oversized 100% cotton tee. Breathable, soft, and perfect for days in.',
 'loungewear', ARRAY['home','relax','loungewear','pajamas','comfort','tshirt'], 'unisex', 'local'),

('p25', 'Women''s Silk Pajama Set', 'dress', 85.00,
 'https://images.unsplash.com/photo-1616016624991-62d29486dc96?q=80&w=600&auto=format&fit=crop',
 'A luxurious silk pajama set that feels incredible against the skin. Lounge in style.',
 'loungewear', ARRAY['home','relax','loungewear','pajamas','comfort','silk'], 'women', 'local'),

('p26', 'Fluffy House Slippers', 'shoes', 25.00,
 'https://images.unsplash.com/photo-1588893958284-814bfb24a350?q=80&w=600&auto=format&fit=crop',
 'Super-fluffy indoor slippers that feel like walking on clouds. Non-slip sole.',
 'loungewear', ARRAY['home','relax','loungewear','comfort','shoes','slippers'], 'women', 'local'),

-- ============================================================
-- CASUAL EVERYDAY (casual)
-- ============================================================
('p27', 'Men''s Classic Denim Jacket', 'top', 75.00,
 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop',
 'A versatile classic denim jacket. Layer it over anything for instant casual cool.',
 'casual', ARRAY['casual','everyday','fashion','denim','jacket'], 'men', 'local'),

('p28', 'Men''s Graphic T-Shirt', 'top', 25.00,
 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
 'A bold graphic tee in 100% cotton. Express your style with every wear.',
 'casual', ARRAY['casual','everyday','fashion','tshirt','graphic'], 'men', 'local'),

('p29', 'Unisex Canvas Sneakers', 'shoes', 55.00,
 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop',
 'Timeless canvas sneakers with a vulcanised rubber sole. Goes with everything.',
 'casual', ARRAY['casual','everyday','fashion','shoes','sneakers'], 'unisex', 'local'),

('p30', 'Women''s Summer Sundress', 'dress', 45.00,
 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop',
 'A flowy, lightweight sundress with a flattering silhouette. Perfect for warm, sunny days.',
 'casual', ARRAY['casual','everyday','fashion','dress','summer'], 'women', 'local'),

('p31', 'Leather Tote Bag', 'accessory', 80.00,
 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop',
 'A spacious genuine leather tote with inner pockets. Style meets everyday functionality.',
 'casual', ARRAY['casual','everyday','fashion','accessory','bag','tote'], 'women', 'local')

ON CONFLICT (id) DO NOTHING;
