// Mock Fashion Catalog with Semantic Tags
const catalog = [
    // GOA / VACATION (beachy)
    { id: "p1", name: "Tropical Print Resort Shirt", type: "top", price: 45.00, image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop", tags: ["goa", "vacation", "beach", "summer", "floral", "resort", "relaxed", "men"], vibe: "beachy" },
    { id: "p2", name: "Linen Drawstring Shorts", type: "bottom", price: 35.00, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop", tags: ["goa", "vacation", "beach", "summer", "linen", "casual", "relaxed", "men"], vibe: "beachy" },
    { id: "p3", name: "Classic Aviator Sunglasses", type: "accessory", price: 120.00, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop", tags: ["goa", "vacation", "beach", "summer", "accessories", "sun", "unisex"], vibe: "beachy" },
    { id: "p13", name: "Straw Sun Hat", type: "accessory", price: 25.00, image: "https://images.unsplash.com/photo-1575428652377-a2d80b2273fd?q=80&w=600&auto=format&fit=crop", tags: ["goa", "vacation", "beach", "summer", "hat", "sun", "women"], vibe: "beachy" },
    { id: "p14", name: "Leather Sandals", type: "shoes", price: 45.00, image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=600&auto=format&fit=crop", tags: ["goa", "vacation", "beach", "summer", "shoes", "sandals", "unisex"], vibe: "beachy" },

    // OFFICE / FORMAL (professional)
    { id: "p4", name: "Tailored Navy Blazer", type: "top", price: 150.00, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop", tags: ["office", "formal", "work", "meeting", "professional", "smart", "men"], vibe: "professional" },
    { id: "p5", name: "Slim Fit Chinos", type: "bottom", price: 65.00, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop", tags: ["office", "formal", "work", "meeting", "professional", "smart", "pants", "men"], vibe: "professional" },
    { id: "p6", name: "Leather Oxford Shoes", type: "shoes", price: 95.00, image: "https://images.unsplash.com/photo-1614252339460-e1c15f909181?q=80&w=600&auto=format&fit=crop", tags: ["office", "formal", "work", "meeting", "professional", "leather", "shoes", "men"], vibe: "professional" },

    // WINTER / COZY (cozy)
    { id: "p7", name: "Chunky Knit Sweater", type: "top", price: 85.00, image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?q=80&w=600&auto=format&fit=crop", tags: ["winter", "cozy", "cold", "snow", "knit", "warm", "unisex"], vibe: "cozy" },
    { id: "p8", name: "Dark Wash Denim Jeans", type: "bottom", price: 70.00, image: "https://images.unsplash.com/photo-1542272604-780c8d52a5ce?q=80&w=600&auto=format&fit=crop", tags: ["winter", "cozy", "casual", "everyday", "denim", "jeans", "unisex"], vibe: "cozy" },
    { id: "p9", name: "Fleece Lined Beanie", type: "accessory", price: 25.00, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop", tags: ["winter", "cozy", "cold", "snow", "hat", "warm", "unisex"], vibe: "cozy" },

    // GIFTING / NEW MOM (comfort)
    { id: "p10", name: "Luxurious Cashmere Robe", type: "top", price: 190.00, image: "https://images.unsplash.com/photo-1616016624991-62d29486dc96?q=80&w=600&auto=format&fit=crop", tags: ["gift", "mom", "cozy", "loungewear", "luxury", "comfort", "women"], vibe: "comfort" },
    { id: "p11", name: "Silk Sleep Mask", type: "accessory", price: 40.00, image: "https://images.unsplash.com/photo-1643900894564-9be1bd2724fa?q=80&w=600&auto=format&fit=crop", tags: ["gift", "mom", "sleep", "luxury", "comfort", "accessories", "women"], vibe: "comfort" },
    { id: "p12", name: "Aromatherapy Candle Set", type: "accessory", price: 55.00, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop", tags: ["gift", "mom", "home", "relaxing", "spa", "comfort"], vibe: "comfort" },
    { id: "p15", name: "Plush Warm Slippers", type: "shoes", price: 35.00, image: "https://images.unsplash.com/photo-1588893958284-814bfb24a350?q=80&w=600&auto=format&fit=crop", tags: ["gift", "mom", "home", "relaxing", "shoes", "comfort", "warm", "women"], vibe: "comfort" },
    { id: "p16", name: "Gold Pendant Necklace", type: "jewelry", price: 120.00, image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?q=80&w=600&auto=format&fit=crop", tags: ["gift", "mom", "jewelry", "necklace", "luxury", "comfort", "women"], vibe: "comfort" },

    // TRADITIONAL WEAR (traditional)
    { id: "p17", name: "Men's Silk Blend Kurta", type: "top", price: 65.00, image: "https://images.unsplash.com/photo-1662057302482-127bcfeb5231?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "men", "wedding", "festival", "kurta"], vibe: "traditional" },
    { id: "p18", name: "Embroidered Nehru Jacket", type: "top", price: 85.00, image: "https://images.unsplash.com/photo-1583391733975-01e4a3cc18e9?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "men", "wedding", "festival", "jacket"], vibe: "traditional" },
    { id: "p19", name: "Traditional Leather Mojari", type: "shoes", price: 45.00, image: "https://images.unsplash.com/photo-1614252339460-e1c15f909181?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "men", "wedding", "shoes", "mojari"], vibe: "traditional" },
    { id: "p20", name: "Designer Georgette Saree", type: "dress", price: 150.00, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "women", "wedding", "festival", "saree"], vibe: "traditional" },
    { id: "p21", name: "Kundan Jewelry Set", type: "jewelry", price: 200.00, image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "women", "wedding", "jewelry", "kundan"], vibe: "traditional" },
    { id: "p22", name: "Embroidered Lehenga Choli", type: "dress", price: 250.00, image: "https://images.unsplash.com/photo-1583391733959-24a93fce18eb?q=80&w=600&auto=format&fit=crop", tags: ["traditional", "ethnic", "indian", "women", "wedding", "festival", "lehenga"], vibe: "traditional" },

    // RELAXED / HOME LOUNGEWEAR (loungewear)
    { id: "p23", name: "Men's Cotton Lounge Joggers", type: "bottom", price: 40.00, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop", tags: ["home", "relax", "loungewear", "pajamas", "comfort", "men", "pants"], vibe: "loungewear" },
    { id: "p24", name: "Oversized Cotton Tee", type: "top", price: 20.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop", tags: ["home", "relax", "loungewear", "pajamas", "comfort", "unisex", "tshirt"], vibe: "loungewear" },
    { id: "p25", name: "Women's Silk Pajama Set", type: "dress", price: 85.00, image: "https://images.unsplash.com/photo-1616016624991-62d29486dc96?q=80&w=600&auto=format&fit=crop", tags: ["home", "relax", "loungewear", "pajamas", "comfort", "women", "silk"], vibe: "loungewear" },
    { id: "p26", name: "Fluffy House Slippers", type: "shoes", price: 25.00, image: "https://images.unsplash.com/photo-1588893958284-814bfb24a350?q=80&w=600&auto=format&fit=crop", tags: ["home", "relax", "loungewear", "comfort", "women", "shoes", "slippers"], vibe: "loungewear" },

    // CASUAL EVERYDAY FASHION (casual)
    { id: "p27", name: "Men's Classic Denim Jacket", type: "top", price: 75.00, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop", tags: ["casual", "everyday", "fashion", "men", "denim", "jacket"], vibe: "casual" },
    { id: "p28", name: "Men's Graphic T-Shirt", type: "top", price: 25.00, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop", tags: ["casual", "everyday", "fashion", "men", "tshirt", "graphic"], vibe: "casual" },
    { id: "p29", name: "Unisex Canvas Sneakers", type: "shoes", price: 55.00, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop", tags: ["casual", "everyday", "fashion", "unisex", "shoes", "sneakers"], vibe: "casual" },
    { id: "p30", name: "Women's Summer Sundress", type: "dress", price: 45.00, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop", tags: ["casual", "everyday", "fashion", "women", "dress", "summer"], vibe: "casual" },
    { id: "p31", name: "Leather Tote Bag", type: "accessory", price: 80.00, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop", tags: ["casual", "everyday", "fashion", "women", "accessory", "bag", "tote"], vibe: "casual" }
];
