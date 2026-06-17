require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const Coupon = require('./backend/models/Coupon');
const User = require('./backend/models/User');

const products = [
  {
    name: "Luxe Matte Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-red.jpg", "/assets/images/products/lipstick-alt.jpg"],
    description: "An ultra-creamy, intense pigment matte lipstick that delivers rich color in a single swipe while keeping lips hydrated with jojoba oil.",
    ingredients: ["Octyldodecanol", "Ricinus Communis (Castor) Seed Oil", "Jojoba Esters", "Candelilla Cera", "Tocopheryl Acetate"],
    benefits: ["12-hour long stay", "Non-drying velvet matte texture", "Infused with Vitamin E and Jojoba Oil"],
    howToUse: "Apply from the center of the upper lip to the outer edges. Glide across the entire bottom lip.",
    shades: [
      { name: "Crimson Silk", hex: "#9B111E" },
      { name: "Velvet Rose", hex: "#B76E79" },
      { name: "Peach Blossom", hex: "#E8C3BA" }
    ],
    price: 999,
    discountPrice: 799,
    gstPercent: 18,
    stock: 45,
    rating: 4.8,
    reviewsCount: 24
  },
  {
    name: "Glow-Radiance Liquid Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-glow.jpg"],
    description: "A breathable, medium-to-full coverage liquid foundation that blends seamlessly into the skin for a luminous, dew-like finish.",
    ingredients: ["Water", "Dimethicone", "Glycerin", "Hyaluronic Acid", "Titanium Dioxide", "Silica"],
    benefits: ["24-hour hydration", "Build-up coverage", "Protects against environmental stressors with SPF 20"],
    howToUse: "Pump a small amount onto a beauty sponge or brush. Apply to the center of your face and blend outward.",
    shades: [
      { name: "Ivory Glow", hex: "#F6E4D9" },
      { name: "Warm Honey", hex: "#E3C2AE" },
      { name: "Rich Amber", hex: "#C39D7D" }
    ],
    price: 1599,
    discountPrice: 1299,
    gstPercent: 18,
    stock: 32,
    rating: 4.6,
    reviewsCount: 18
  },
  {
    name: "Flawless HD Concealer",
    brand: "Sanique Cosmetics",
    category: "Concealers",
    images: ["/assets/images/products/concealer-matte.jpg"],
    description: "A creaseless, full-coverage concealer that instantly brightens dark circles, blurs blemishes, and corrects discoloration with a natural skin-like finish.",
    ingredients: ["Water", "Cyclopentasiloxane", "Glycerin", "Butylene Glycol", "Centella Asiatica Extract"],
    benefits: ["Creaseless all-day wear", "Waterproof and sweat-resistant", "Enriched with skin-soothing botanical extracts"],
    howToUse: "Dot concealer under the eyes, on dark spots, or around the nose. Blend using a brush or fingertips.",
    shades: [
      { name: "Light Sand", hex: "#F5DEC9" },
      { name: "Medium Beige", hex: "#E2BA96" },
      { name: "Deep Tan", hex: "#B88E6B" }
    ],
    price: 799,
    discountPrice: 599,
    gstPercent: 18,
    stock: 50,
    rating: 4.7,
    reviewsCount: 15
  },
  {
    name: "Silk Finish Face Powder",
    brand: "Sanique Cosmetics",
    category: "Face Powder",
    images: ["/assets/images/products/powder-silk.jpg"],
    description: "A micro-fine loose setting powder that locks in makeup for 16 hours, absorbs excess oil, and leaves a smooth, filter-like finish without flashbacks.",
    ingredients: ["Talc", "Zea Mays (Corn) Starch", "Zinc Stearate", "Kaolin", "Silica"],
    benefits: ["Controls shine & oil up to 16h", "Zero flashback in photos", "Smooths skin texture"],
    howToUse: "Press a powder puff into the powder, tap off excess, and press onto the skin, focusing on the T-zone.",
    shades: [
      { name: "Translucent", hex: "#FAF6F0" },
      { name: "Banana Glow", hex: "#F0E4B8" }
    ],
    price: 999,
    discountPrice: 799,
    gstPercent: 18,
    stock: 28,
    rating: 4.5,
    reviewsCount: 12
  },
  {
    name: "Rose Bloom Baked Blush",
    brand: "Sanique Cosmetics",
    category: "Blush",
    images: ["/assets/images/products/blush-rose.jpg"],
    description: "A highly pigmented, buildable baked blush that delivers a natural flush of rosy color with a subtle, healthy gold sheen.",
    ingredients: ["Mica", "Talc", "Macadamia Integrifolia Seed Oil", "Squalane", "Tocopherol"],
    benefits: ["Baked texture for silky blending", "Radiant shimmering finish", "Skin-loving oils keep skin glowing"],
    howToUse: "Sweep onto the apples of the cheeks and blend upward towards the temples.",
    shades: [
      { name: "Soft Coral", hex: "#F8A085" },
      { name: "Velvet Peach", hex: "#F4C2C2" }
    ],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 40,
    rating: 4.9,
    reviewsCount: 30
  },
  {
    name: "24K Liquid Gold Highlighter",
    brand: "Sanique Cosmetics",
    category: "Highlighter",
    images: ["/assets/images/products/highlighter-gold.jpg"],
    description: "An ultra-concentrated illuminating liquid highlighter that creates a molten gold, high-gloss shine on the high points of your face.",
    ingredients: ["Mica", "Glycerin", "Hydrogenated Polyisobutene", "Dimethicone", "Gold Particles"],
    benefits: ["Ultra-reflective metallic finish", "Multi-use (mix with foundation or apply directly)", "Water-resistant formula"],
    howToUse: "Apply a few drops directly to cheekbones, brow bones, and the bridge of your nose. Blend with fingers or a brush.",
    shades: [
      { name: "Champagne Gold", hex: "#E7CE9F" },
      { name: "Rose Gold Lustre", hex: "#D9A09F" }
    ],
    price: 1299,
    discountPrice: 999,
    gstPercent: 18,
    stock: 35,
    rating: 4.8,
    reviewsCount: 21
  },
  {
    name: "Ultra Precision Liquid Eyeliner",
    brand: "Sanique Cosmetics",
    category: "Eyeliner",
    images: ["/assets/images/products/eyeliner-black.jpg"],
    description: "An intense, smudge-proof, carbon black liquid eyeliner with a micro-fine felt tip for drawing precise graphic lines.",
    ingredients: ["Water", "Acrylates Copolymer", "Carbon Black", "Propylene Glycol", "Phenoxyethanol"],
    benefits: ["24-hour smudge-proof", "Micro-precision felt-tip brush", "Intense matte-black finish"],
    howToUse: "Trace along the upper lash line starting from the inner corner. Extend outwards to create a wing.",
    shades: [
      { name: "Carbon Black", hex: "#000000" }
    ],
    price: 599,
    discountPrice: 499,
    gstPercent: 18,
    stock: 60,
    rating: 4.7,
    reviewsCount: 19
  },
  {
    name: "Volume Max Lengthening Mascara",
    brand: "Sanique Cosmetics",
    category: "Mascara",
    images: ["/assets/images/products/mascara-volume.jpg"],
    description: "A lash-lifting mascara that creates dramatic volume and length without clumping, flaking, or smudging.",
    ingredients: ["Aqua", "Cera Alba", "Copernicia Cerifera Cera", "Stearic Acid", "Panthenol"],
    benefits: ["Instant 5x lash volume", "Hourglass brush separates every lash", "Flake-free formula enriched with Pro-Vitamin B5"],
    howToUse: "Wiggle the mascara brush from the root of the lashes to the tips. Layer for extra volume.",
    shades: [
      { name: "Midnight Black", hex: "#1A1A1A" }
    ],
    price: 799,
    discountPrice: 649,
    gstPercent: 18,
    stock: 45,
    rating: 4.6,
    reviewsCount: 14
  },
  {
    name: "Kohl Black Gel Kajal",
    brand: "Sanique Cosmetics",
    category: "Kajal",
    images: ["/assets/images/products/kajal-kohl.jpg"],
    description: "An ancient-inspired, modern-formulated deep black gel kajal pencil that glides like butter on the waterline.",
    ingredients: ["Cyclopentasiloxane", "Trimethylsiloxysilicate", "Ozokerite", "Argania Spinosa Kernel Oil"],
    benefits: ["Smudge-proof & waterproof up to 36 hours", "Enriched with pure Argan Oil", "Safe for sensitive eyes"],
    howToUse: "Apply gently along the lower waterline. For a smoky look, smudge with a brush immediately.",
    shades: [
      { name: "Pitch Black", hex: "#0D0D0D" }
    ],
    price: 399,
    discountPrice: 299,
    gstPercent: 18,
    stock: 75,
    rating: 4.8,
    reviewsCount: 40
  },
  {
    name: "Midnight Drama Eyeshadow Palette",
    brand: "Sanique Cosmetics",
    category: "Eyeshadow Palettes",
    images: ["/assets/images/products/palette-drama.jpg"],
    description: "A luxury 12-pan eyeshadow palette containing velvety mattes, molten metallics, and high-shine pressed glitters for stunning eye makeups.",
    ingredients: ["Talc", "Mica", "Magnesium Stearate", "Ethylhexyl Palmitate", "Polyethylene Terephthalate"],
    benefits: ["Intense color payoff", "Creamy, zero-fallout formula", "Highly blendable matte and glitter shades"],
    howToUse: "Apply lighter matte shades as a base, darker shades to the crease, and metallic shades to the center of the lid.",
    shades: [
      { name: "12-Pan Palette", hex: "#7E5B4B" }
    ],
    price: 2499,
    discountPrice: 1999,
    gstPercent: 18,
    stock: 20,
    rating: 4.9,
    reviewsCount: 16
  },
  {
    name: "Hydrating Gel Face Wash",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/skincare-facewash.jpg"],
    description: "A gentle, non-stripping gel cleanser that cleanses deep impurities while boosting skin moisture levels using Aloe Vera and Cucumber extracts.",
    ingredients: ["Aqua", "Cocamidopropyl Betaine", "Glycerin", "Aloe Barbadensis Leaf Juice", "Cucumber Extract"],
    benefits: ["Gently removes dirt & sebum", "Maintains natural skin moisture barrier", "Soothes irritated skin"],
    howToUse: "Wet your face. Squeeze a coin-sized amount onto palms, massage in circular motions, and rinse with cold water.",
    shades: [],
    price: 499,
    discountPrice: 399,
    gstPercent: 18,
    stock: 55,
    rating: 4.5,
    reviewsCount: 22
  },
  {
    name: "Vitamin C Glow Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/skincare-serum.jpg"],
    description: "A revolutionary 15% Vitamin C serum combined with Ferulic acid that visibly brightens hyperpigmentation and fights off free radicals.",
    ingredients: ["Aqua", "L-Ascorbic Acid (Vitamin C)", "Ferulic Acid", "Hyaluronic Acid", "Centella Extract"],
    benefits: ["Reduces dark spots & pigmentation", "Boosts collagen production", "Adds instant radiant skin glow"],
    howToUse: "Apply 3-4 drops onto a clean, dry face. Pat gently. Follow with a moisturizer and sunscreen.",
    shades: [],
    price: 1499,
    discountPrice: 1199,
    gstPercent: 18,
    stock: 30,
    rating: 4.8,
    reviewsCount: 35
  },
  {
    name: "Hydra-Dew Moisturizer",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/skincare-moisturizer.jpg"],
    description: "An oil-free, lightweight gel-cream moisturizer formulated with Ceramides and Hyaluronic acid that locks in moisture for 72 hours.",
    ingredients: ["Aqua", "Glycerin", "Sodium Hyaluronate", "Ceramide NP", "Squalane", "Niacinamide"],
    benefits: ["72-hour moisture lock", "Strengthens skin barrier", "Non-sticky, lightweight cream absorption"],
    howToUse: "Apply evenly to your face and neck after cleansing and serum application. Use morning and night.",
    shades: [],
    price: 999,
    discountPrice: 799,
    gstPercent: 18,
    stock: 40,
    rating: 4.7,
    reviewsCount: 27
  },
  {
    name: "Matte Fluid Sunscreen SPF 50",
    brand: "Sanique Cosmetics",
    category: "Sunscreens",
    images: ["/assets/images/products/skincare-sunscreen.jpg"],
    description: "An ultra-lightweight, broad-spectrum SPF 50 PA+++ fluid sunscreen that offers maximum sun defense without a white cast or greasy finish.",
    ingredients: ["Aqua", "Ethylhexyl Methoxycinnamate", "Zinc Oxide", "Salicylic Acid", "Green Tea Extract"],
    benefits: ["Broad-spectrum UVA & UVB protection", "Absorbs excess sebum for a matte finish", "No white cast, perfect under makeup"],
    howToUse: "Apply generously on face, neck, and exposed skin at least 15 minutes before stepping out.",
    shades: [],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 45,
    rating: 4.6,
    reviewsCount: 20
  },
  {
    name: "Ultimate Bridal Makeup Kit",
    brand: "Sanique Cosmetics",
    category: "Makeup Kits",
    images: ["/assets/images/products/kit-bridal.jpg"],
    description: "A curated premium vanity box containing our best-selling Luxe Lipstick, HD Concealer, Baked Blush, Eyeliner, Mascara, and the 24K Highlighter.",
    ingredients: ["Various items packaged in a luxury leather vanity box"],
    benefits: ["Complete premium makeup routine in one box", "Save 30% compared to buying items individually", "Includes luxury compact mirror"],
    howToUse: "Use components sequentially to create a complete bridal/festive makeup look.",
    shades: [],
    price: 4999,
    discountPrice: 3999,
    gstPercent: 18,
    stock: 15,
    rating: 4.9,
    reviewsCount: 11
  },
  {
    name: "Daily Glam Makeup Kit",
    brand: "Sanique Cosmetics",
    category: "Makeup Kits",
    images: ["/assets/images/products/kit-daily.jpg"],
    description: "A compact velvet pouch containing basic everyday essentials: Matte Lipstick, Kajal, Hydra-Dew Moisturizer, and SPF 50 Sunscreen.",
    ingredients: ["Set of 4 full-sized cosmetics in a reusable velvet cosmetic pouch"],
    benefits: ["Perfect for travel and daily touchups", "Great value packaging", "Includes all-day skin prep and cosmetic essentials"],
    howToUse: "Start with moisturizer and sunscreen for prep, then apply kajal and lipstick for a fresh daily look.",
    shades: [],
    price: 2999,
    discountPrice: 2499,
    gstPercent: 18,
    stock: 25,
    rating: 4.7,
    reviewsCount: 8
  }
];

const coupons = [
  { code: "SANIQUE10", discountType: "percentage", value: 10, minPurchase: 500, expiryDate: new Date("2027-12-31"), active: true },
  { code: "FESTIVE500", discountType: "fixed", value: 500, minPurchase: 2500, expiryDate: new Date("2027-12-31"), active: true },
  { code: "GLOW20", discountType: "percentage", value: 20, minPurchase: 1500, expiryDate: new Date("2027-12-31"), active: true }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sanique-cosmetics');
    console.log("Database connected for seeding...");

    // Clear existing
    try {
      await Product.collection.drop();
    } catch (e) {
      console.log("Products collection did not exist to drop. Clearing instead.");
      await Product.deleteMany({});
    }
    await Coupon.deleteMany({});
    console.log("Existing products and coupons cleared.");

    // Seed Products
    await Product.insertMany(products);
    console.log(`${products.length} Products seeded successfully.`);

    // Seed Coupons
    await Coupon.insertMany(coupons);
    console.log(`${coupons.length} Coupons seeded successfully.`);

    // Check if admin user exists, else seed one
    const adminExists = await User.findOne({ email: 'admin@sanique.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: "Sanique Admin",
        email: "admin@sanique.com",
        password: "adminpassword123", // Pre-save hook hashes this
        mobile: "9999999999",
        loyaltyPoints: 500,
        vipLevel: "Platinum",
        isAdmin: true
      });
      await adminUser.save();
      console.log("Admin user seeded (admin@sanique.com / adminpassword123)");
    }

    // Seed a test customer
    const userExists = await User.findOne({ email: 'sanchita@sanique.com' });
    if (!userExists) {
      const normalUser = new User({
        name: "Sanchita Sharma",
        email: "sanchita@sanique.com",
        password: "password123",
        mobile: "9876543210",
        loyaltyPoints: 120,
        vipLevel: "Bronze",
        address: {
          street: "102 Luxury Towers, Golf Course Road",
          city: "Gurugram",
          state: "Haryana",
          zipCode: "122002",
          country: "India"
        }
      });
      await normalUser.save();
      console.log("Customer user seeded (sanchita@sanique.com / password123)");
    }

    mongoose.disconnect();
    console.log("Seeding complete. Connection closed.");
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
