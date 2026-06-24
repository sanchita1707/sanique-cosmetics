require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const Coupon = require('./backend/models/Coupon');
const User = require('./backend/models/User');
const Order = require('./backend/models/Order');
const Payment = require('./backend/models/Payment');
const Counter = require('./backend/models/Counter');
const Review = require('./backend/models/Review');

const products = [
  // LIPSTICKS (10)
  {
    name: "Luxe Matte Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-red.jpg"],
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
    name: "Satin Silk Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-satin.jpg"],
    description: "Indulge in a weightless, luminous satin-finish lipstick that cushions your lips in comfort and vibrant color.",
    ingredients: ["Argan Oil", "Shea Butter", "Mica", "Castor Seed Oil", "Carnauba Wax"],
    benefits: ["Satin glowing finish", "Deep all-day hydration", "Smudge-resistant edges"],
    howToUse: "Glide directly onto bare lips for a soft, radiant satin glow.",
    shades: [
      { name: "Rouge Muse", hex: "#B22222" },
      { name: "Nude Elegance", hex: "#D2B48C" }
    ],
    price: 1199,
    discountPrice: 999,
    gstPercent: 18,
    stock: 35,
    rating: 4.7,
    reviewsCount: 15
  },
  {
    name: "Liquid Matte Lip Liquid",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-liquid.jpg"],
    description: "A transfer-proof, ultra-matte liquid lipstick that stays locked in place for 18 hours without cracking.",
    ingredients: ["Isododecane", "Trimethylsiloxysilicate", "Silica", "Dimethicone", "Pigment Red 57"],
    benefits: ["18-hour transfer-proof stay", "Zero weight on lips", "Intense pigment saturation"],
    howToUse: "Define lip contours with the applicator tip, then fill in with a thin, even layer.",
    shades: [
      { name: "Fearless Plum", hex: "#4A0E17" },
      { name: "Dusty Rose", hex: "#C08081" }
    ],
    price: 999,
    discountPrice: 799,
    gstPercent: 18,
    stock: 50,
    rating: 4.6,
    reviewsCount: 18
  },
  {
    name: "Velvet Glide Lip Balm",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-balm.jpg"],
    description: "A tint-in-balm that delivers standard nourishment, instant plumping, and a soft, buildable flush of color.",
    ingredients: ["Coconut Oil", "Beeswax", "Sweet Almond Oil", "Peppermint Extract", "Vitamin E"],
    benefits: ["Intense 24h hydration", "Natural lip tint look", "Soothes chapped lips"],
    howToUse: "Apply generously as needed throughout the day for soft, tinted lips.",
    shades: [
      { name: "Cherry Crush", hex: "#DE3163" },
      { name: "Berry Dew", hex: "#800020" }
    ],
    price: 599,
    discountPrice: 499,
    gstPercent: 18,
    stock: 60,
    rating: 4.5,
    reviewsCount: 12
  },
  {
    name: "Plumping Lip Gloss",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-gloss.jpg"],
    description: "Get fuller-looking lips with a high-shine, non-sticky gloss infused with refreshing marine collagen spheres.",
    ingredients: ["Polybutene", "Mineral Oil", "Capsicum Frutescens Resin", "Menthol", "Marine Collagen"],
    benefits: ["Instant volume & plumping", "Glass-like high shine", "Non-sticky comfort feel"],
    howToUse: "Wear alone or layer over your favorite matte lipstick for an instant gloss boost.",
    shades: [
      { name: "Clear Diamond", hex: "#FFFFFF" },
      { name: "Pink Topaz", hex: "#FFC0CB" }
    ],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 40,
    rating: 4.8,
    reviewsCount: 22
  },
  {
    name: "Hydra-Shine Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-shine.jpg"],
    description: "The comfort of a balm meets the pigment of a lipstick. A melting formula that drenches lips in moisture.",
    ingredients: ["Hyaluronic Acid", "Jojoba Esters", "Avocado Oil", "Candelilla Wax", "Iron Oxides"],
    benefits: ["Luminous high-shine finish", "Hyaluronic acid lock", "Medium buildable color"],
    howToUse: "Swipe twice onto bare lips for a melting, wet-look shine.",
    shades: [
      { name: "Coral Spark", hex: "#FF7F50" },
      { name: "Mocha Glow", hex: "#A0522D" }
    ],
    price: 1099,
    discountPrice: 899,
    gstPercent: 18,
    stock: 30,
    rating: 4.7,
    reviewsCount: 19
  },
  {
    name: "Metallic Shimmer Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-metallic.jpg"],
    description: "An statement-making metallic lipstick loaded with micro-pearl glitters for multidimensional runway shine.",
    ingredients: ["Synthetic Fluorphlogopite", "Mica", "Castor Oil", "Squalane", "Tocopherol"],
    benefits: ["Chroma metallic sparkle", "Creamy glide-on application", "Long-wearing glitter hold"],
    howToUse: "Glide on lips. Blending is not required; allow to dry to lock shimmer.",
    shades: [
      { name: "Copper Bronze", hex: "#CD7F32" },
      { name: "Ruby Sparkle", hex: "#E0115F" }
    ],
    price: 1299,
    discountPrice: 999,
    gstPercent: 18,
    stock: 25,
    rating: 4.4,
    reviewsCount: 10
  },
  {
    name: "Precision Lip Liner",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-liner.jpg"],
    description: "A retractable lip liner that defines lips with rich pigment and prevents lipstick from feathering or bleeding.",
    ingredients: ["Ozokerite", "Microcrystalline Wax", "Cocoa Butter", "Vitamin E", "Colorants"],
    benefits: ["Retractable precise tip", "Prevents feathering", "Matte long-wear formula"],
    howToUse: "Outline lips starting from the Cupid's bow. Shade in slightly before applying lipstick.",
    shades: [
      { name: "Rose Nude", hex: "#C8A2C8" },
      { name: "Deep Red", hex: "#8B0000" }
    ],
    price: 499,
    discountPrice: 399,
    gstPercent: 18,
    stock: 70,
    rating: 4.6,
    reviewsCount: 16
  },
  {
    name: "Rouge Velvet Lipstick",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-rouge.jpg"],
    description: "Our signature French-inspired deep red lipstick that offers a true matte finish with supreme velvet touch.",
    ingredients: ["Caprylic Triglyceride", "Kaolin", "Cera Alba", "Shea Butter", "Red 7 Lake"],
    benefits: ["French couture red", "True matte velvet touch", "Enriched with shea butter"],
    howToUse: "Apply onto exfoliated lips from the center outwards.",
    shades: [
      { name: "Parisian Red", hex: "#D6001C" }
    ],
    price: 1499,
    discountPrice: 1199,
    gstPercent: 18,
    stock: 30,
    rating: 4.9,
    reviewsCount: 30
  },
  {
    name: "Matte Drama Lip Crayon",
    brand: "Sanique Cosmetics",
    category: "Lipsticks",
    images: ["/assets/images/products/lipstick-crayon.jpg"],
    description: "A jumbo lip crayon that combines the convenience of a pencil with the impact of a rich matte lipstick.",
    ingredients: ["Cyclopentasiloxane", "Polyethylene", "Synthetic Beeswax", "Jojoba Seed Oil", "Titanium Dioxide"],
    benefits: ["Jumbo crayon ease", "10-hour smudge-free matte", "Built-in sharpener included"],
    howToUse: "Draw outline then fill inside. Smudge edges slightly if a blurred look is desired.",
    shades: [
      { name: "Berry Punch", hex: "#C71585" },
      { name: "Sandy Nude", hex: "#DEB887" }
    ],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 55,
    rating: 4.7,
    reviewsCount: 14
  },

  // FOUNDATIONS (6)
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
    name: "Velvet Matte Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-matte.jpg"],
    description: "A oil-controlling liquid foundation that gives a perfect matte finish without clogging pores or looking cakey.",
    ingredients: ["Water", "Isododecane", "Salicylic Acid", "Zinc PCA", "Mica", "Phenoxyethanol"],
    benefits: ["16h shine & oil control", "Medium breathable build", "Sweat and transfer-resistant"],
    howToUse: "Blend outward from the nose using a flat foundation brush.",
    shades: [
      { name: "Classic Sand", hex: "#F3D6C1" },
      { name: "Golden Beige", hex: "#DFB291" }
    ],
    price: 1499,
    discountPrice: 1199,
    gstPercent: 18,
    stock: 40,
    rating: 4.5,
    reviewsCount: 15
  },
  {
    name: "Hydrating Serum Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-serum.jpg"],
    description: "Infused with 5% Niacinamide and Hyaluronic serum. A foundation that treats your skin while providing coverage.",
    ingredients: ["Water", "Niacinamide", "Sodium Hyaluronate", "Squalane", "Zinc Oxide"],
    benefits: ["Brightens dark spots", "Feather-light skin tint feel", "Broad-spectrum SPF 30"],
    howToUse: "Apply a few drops directly onto skin and blend with clean fingertips.",
    shades: [
      { name: "Luminous Porcelain", hex: "#FDF5E6" },
      { name: "Natural Tan", hex: "#C68E65" }
    ],
    price: 1899,
    discountPrice: 1499,
    gstPercent: 18,
    stock: 25,
    rating: 4.8,
    reviewsCount: 20
  },
  {
    name: "HD Photogenic Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-hd.jpg"],
    description: "A full-coverage camera-ready foundation that utilizes light-diffusing particles to blur skin texture completely.",
    ingredients: ["Aqua", "Dimethicone Crosspolymer", "Kaolin", "Silica Silylate", "Alumina"],
    benefits: ["Maximum high-definition blur", "Zero flash-back technology", "Waterproof 24h wear"],
    howToUse: "Buff into skin with a dense kabuki brush using tapping motions.",
    shades: [
      { name: "Fair Light", hex: "#FFE4C4" },
      { name: "Deep Amber", hex: "#8B5A2B" }
    ],
    price: 1699,
    discountPrice: 1399,
    gstPercent: 18,
    stock: 30,
    rating: 4.7,
    reviewsCount: 16
  },
  {
    name: "Luminous Cushion Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-cushion.jpg"],
    description: "A premium travel-friendly compact cushion foundation that delivers a fresh dewy glow on the go.",
    ingredients: ["Aqua", "Centella Asiatica Extract", "Glycerin", "Zinc Oxide", "Titanium Dioxide"],
    benefits: ["Soothes red skin", "Luminous hydrated finish", "Includes rubicell premium puff"],
    howToUse: "Press the puff onto the cushion sponge. Gently pat across the face.",
    shades: [
      { name: "Dewy Beige", hex: "#F5F5DC" }
    ],
    price: 1999,
    discountPrice: 1599,
    gstPercent: 18,
    stock: 20,
    rating: 4.9,
    reviewsCount: 12
  },
  {
    name: "Matte Stick Foundation",
    brand: "Sanique Cosmetics",
    category: "Foundations",
    images: ["/assets/images/products/foundation-stick.jpg"],
    description: "A stick foundation that glides on like cream and sets to a soft matte powder finish. Multi-use as contour.",
    ingredients: ["Candelilla Wax", "Squalane", "Titanium Dioxide", "Silica", "Tocopherol"],
    benefits: ["Travel-friendly stick", "Dual-use (foundation & contour)", "Soft-focus powder finish"],
    howToUse: "Draw lines on forehead, cheeks, and chin. Blend out with a beauty sponge.",
    shades: [
      { name: "Warm Honey", hex: "#E3C2AE" },
      { name: "Deep Contour", hex: "#5C3A21" }
    ],
    price: 1299,
    discountPrice: 999,
    gstPercent: 18,
    stock: 45,
    rating: 4.4,
    reviewsCount: 10
  },

  // CONCEALERS (5)
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
    name: "Brightening Liquid Concealer",
    brand: "Sanique Cosmetics",
    category: "Concealers",
    images: ["/assets/images/products/concealer-liquid.jpg"],
    description: "Lightweight liquid concealer with micro-pearls that bounce light to erase signs of fatigue instantly.",
    ingredients: ["Aqua", "Mica", "Glycerin", "Licorice Root Extract", "Hyaluronic Acid"],
    benefits: ["Reflective brightening", "Hyaluronic moisturize", "Light-to-medium coverage"],
    howToUse: "Apply in a triangle shape under the eyes. Blend with a damp sponge.",
    shades: [
      { name: "Pearl Light", hex: "#FFF8DC" },
      { name: "Warm Honey", hex: "#E3C2AE" }
    ],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 40,
    rating: 4.6,
    reviewsCount: 18
  },
  {
    name: "Full Coverage Corrector Pot",
    brand: "Sanique Cosmetics",
    category: "Concealers",
    images: ["/assets/images/products/concealer-pot.jpg"],
    description: "A high-density cream corrector pot designed to neutralize strong discoloration like dark veins or scars.",
    ingredients: ["Caprylic Triglyceride", "Beeswax", "Zinc Oxide", "Kaolin", "Iron Oxides"],
    benefits: ["Max-density pigment", "Stays put on scars & spots", "Neutralizes blue undertones"],
    howToUse: "Dab a small amount with a ring finger. Press into target spot and set with loose powder.",
    shades: [
      { name: "Peach Corrector", hex: "#FFDAB9" },
      { name: "Orange Neutralizer", hex: "#FF8C00" }
    ],
    price: 699,
    discountPrice: 549,
    gstPercent: 18,
    stock: 35,
    rating: 4.5,
    reviewsCount: 12
  },
  {
    name: "Luminous Pen Concealer",
    brand: "Sanique Cosmetics",
    category: "Concealers",
    images: ["/assets/images/products/concealer-pen.jpg"],
    description: "A clickable click-pen concealer that dispenses fresh brightening emulsion, perfect for midday highlight touchups.",
    ingredients: ["Aqua", "Dimethicone", "Squalane", "Cucumber Extract", "Titanium Dioxide"],
    benefits: ["Click pen ease", "De-puffs under-eyes", "Sheer luminous texture"],
    howToUse: "Click base to release product. Brush onto brow bone and inner eye corner, tap to blend.",
    shades: [
      { name: "Luminous Rose", hex: "#FFE4E1" }
    ],
    price: 1099,
    discountPrice: 899,
    gstPercent: 18,
    stock: 28,
    rating: 4.8,
    reviewsCount: 22
  },
  {
    name: "Matte Finish Concealer Stick",
    brand: "Sanique Cosmetics",
    category: "Concealers",
    images: ["/assets/images/products/concealer-stick.jpg"],
    description: "A matte-finish spot concealer stick infused with Tea Tree oil to heal blemishes while concealing them.",
    ingredients: ["Castor Oil", "Tea Tree Leaf Oil", "Salicylic Acid", "Zinc Oxide", "Pigments"],
    benefits: ["Fights acne while covering", "Matte sweat-proof seal", "Precise spot touchups"],
    howToUse: "Dab directly onto active breakouts. Press edges gently with a clean finger to blend.",
    shades: [
      { name: "Acne Spot Medium", hex: "#DFB291" }
    ],
    price: 799,
    discountPrice: 649,
    gstPercent: 18,
    stock: 45,
    rating: 4.3,
    reviewsCount: 14
  },

  // FACE WASH (6)
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
    name: "Vitamin C Glow Cleanser",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/facewash-vitc.jpg"],
    description: "A refreshing foaming wash with Vitamin C beads that burst on skin to reveal a brighter, smoother complexion.",
    ingredients: ["Aqua", "Sodium Laureth Sulfate", "Ascorbic Acid (Vitamin C)", "Orange Peel Oil", "Citric Acid"],
    benefits: ["Brightens dull skin tone", "Provides mild exfoliation", "Invigorating citrus scent"],
    howToUse: "Massage foam onto damp face. Rinse thoroughly. Use every morning.",
    shades: [],
    price: 599,
    discountPrice: 499,
    gstPercent: 18,
    stock: 50,
    rating: 4.7,
    reviewsCount: 30
  },
  {
    name: "Salicylic Acne Clarifying Wash",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/facewash-acne.jpg"],
    description: "Formulated with 2% Salicylic acid. Cleanses deep inside pores, dissolves blackheads, and targets acne-causing bacteria.",
    ingredients: ["Aqua", "Salicylic Acid 2%", "Green Tea Extract", "Allantoin", "Glycerin"],
    benefits: ["Clears acne breakouts", "Dissolves blackheads & oil", "Calms red acne patches"],
    howToUse: "Massage onto oily areas for 60 seconds before rinsing. Use once daily.",
    shades: [],
    price: 649,
    discountPrice: 549,
    gstPercent: 18,
    stock: 40,
    rating: 4.6,
    reviewsCount: 28
  },
  {
    name: "Gentle Cream Cleanser",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/facewash-cream.jpg"],
    description: "A hydrating, soap-free milky cleanser designed specifically to comfort and restore dry or hypersensitive skin barriers.",
    ingredients: ["Aqua", "Cetearyl Alcohol", "Ceramide NP", "Colloidal Oatmeal", "Panthenol"],
    benefits: ["100% soap-free formula", "Restores damaged skin barrier", "Deeply moisturizing milk texture"],
    howToUse: "Massage onto dry or damp skin. Wipe off with cotton pad or rinse with warm water.",
    shades: [],
    price: 549,
    discountPrice: 449,
    gstPercent: 18,
    stock: 45,
    rating: 4.8,
    reviewsCount: 20
  },
  {
    name: "Brightening Foam Face Wash",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/facewash-foam.jpg"],
    description: "An instant self-foaming wash enriched with Licorice root extracts that targets pigmentation and brightens skin.",
    ingredients: ["Aqua", "Licorice Root Extract", "Mulberry Extract", "Coco-Glucoside", "Glycerin"],
    benefits: ["Instant luxurious airy foam", "Reduces uneven patches", "Gentle for daily use"],
    howToUse: "Pump twice. Apply directly to wet face. Rinse off immediately.",
    shades: [],
    price: 599,
    discountPrice: 499,
    gstPercent: 18,
    stock: 40,
    rating: 4.5,
    reviewsCount: 16
  },
  {
    name: "Organic Charcoal Detox Wash",
    brand: "Sanique Cosmetics",
    category: "Face Wash",
    images: ["/assets/images/products/facewash-charcoal.jpg"],
    description: "Activated bamboo charcoal wash that acts like an oil magnet to extract toxic heavy metals and pollution residues.",
    ingredients: ["Aqua", "Activated Charcoal Powder", "Tea Tree Oil", "Menthol", "Acrylates Copolymer"],
    benefits: ["Magnetic pollution pull", "Reduces excessive pore size", "Cooling fresh sensation"],
    howToUse: "Use in the evening to detoxify skin after exposure to pollution.",
    shades: [],
    price: 499,
    discountPrice: 399,
    gstPercent: 18,
    stock: 60,
    rating: 4.4,
    reviewsCount: 18
  },

  // SERUMS (8)
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
    name: "Hyaluronic Acid Hydration Booster",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-hyaluronic.jpg"],
    description: "An intensive booster containing 2.5% pure Hyaluronic acid across three molecular weights to quench dehydrated skin cells.",
    ingredients: ["Aqua", "Sodium Hyaluronate", "Hydrolyzed Hyaluronic Acid", "Panthenol", "Phenoxyethanol"],
    benefits: ["Plumps fine dehydration lines", "Locks moisture inside skin layers", "Silky non-sticky finish"],
    howToUse: "Apply to damp skin immediately after cleansing, then layer moisturizer to lock in hydration.",
    shades: [],
    price: 1299,
    discountPrice: 999,
    gstPercent: 18,
    stock: 45,
    rating: 4.7,
    reviewsCount: 22
  },
  {
    name: "Niacinamide Oil Control Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-niacinamide.jpg"],
    description: "10% Niacinamide combined with 1% Zinc PCA. Regulates sebum production, reduces redness, and minimizes open pores.",
    ingredients: ["Aqua", "Niacinamide 10%", "Zinc PCA 1%", "Aloe Juice", "Xanthan Gum"],
    benefits: ["Controls greasy T-zone shine", "Minimizes large open pores", "Soothes skin redness & bumps"],
    howToUse: "Apply 2-3 drops morning and evening before applying heavy creams.",
    shades: [],
    price: 1199,
    discountPrice: 899,
    gstPercent: 18,
    stock: 50,
    rating: 4.6,
    reviewsCount: 25
  },
  {
    name: "Retinol Anti-Aging Night Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-retinol.jpg"],
    description: "A stabilized 0.3% pure Retinol serum in skin-mimicking squalane that accelerates cellular turnover to treat wrinkles.",
    ingredients: ["Squalane", "Retinol 0.3%", "Caprylic Triglyceride", "Jojoba Oil", "BHT"],
    benefits: ["Smooths fine lines & wrinkles", "Boosts cell turnover rate", "Refines rough skin texture"],
    howToUse: "Apply 2 drops at night on dry skin. Begin usage 2 times a week, gradually increasing frequency.",
    shades: [],
    price: 1599,
    discountPrice: 1299,
    gstPercent: 18,
    stock: 35,
    rating: 4.8,
    reviewsCount: 29
  },
  {
    name: "Salicylic Blemish Control Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-salicylic.jpg"],
    description: "Pore-clearing liquid with 2% Salicylic acid and witch hazel. Combats blackheads, whiteheads, and oily congested skin.",
    ingredients: ["Aqua", "Salicylic Acid 2%", "Witch Hazel Extract", "Centella Extract", "Butylene Glycol"],
    benefits: ["Clears blackheads & congestion", "Reduces active pimple size", "Exfoliates dead skin cells"],
    howToUse: "Apply to target congested zones at night. Follow with a soothing barrier moisturizer.",
    shades: [],
    price: 1099,
    discountPrice: 899,
    gstPercent: 18,
    stock: 40,
    rating: 4.5,
    reviewsCount: 19
  },
  {
    name: "Peptide Skin Firming Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-peptide.jpg"],
    description: "A multi-peptide complex serum that mimics Botox-like actions to smooth skin texture and improve elasticity.",
    ingredients: ["Aqua", "Acetyl Hexapeptide-8", "Copper Tripeptide-1", "Glycerin", "Allantoin"],
    benefits: ["Restores skin firmness & bounce", "Target expression lines", "Deep hydration boost"],
    howToUse: "Pat 3 drops gently over face and neck. Can be used morning and night.",
    shades: [],
    price: 1699,
    discountPrice: 1399,
    gstPercent: 18,
    stock: 25,
    rating: 4.9,
    reviewsCount: 15
  },
  {
    name: "Advanced Skin Repair Gold Oil",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-goldoil.jpg"],
    description: "A luxury dry face oil loaded with pure 24K gold flakes and cold-pressed organic rosehip oil for a radiant glow.",
    ingredients: ["Rosehip Seed Oil", "Argan Oil", "Squalane", "24K Gold Flakes", "Tocopherol"],
    benefits: ["Intense luxury moisture", "Adds high-reflection golden glow", "Deeply nourishes dry skin patches"],
    howToUse: "Press 2 drops onto face as the final step of night routine, or mix with foundation for a dewy look.",
    shades: [],
    price: 1999,
    discountPrice: 1599,
    gstPercent: 18,
    stock: 20,
    rating: 4.9,
    reviewsCount: 21
  },
  {
    name: "Caffeine Under Eye Serum",
    brand: "Sanique Cosmetics",
    category: "Serums",
    images: ["/assets/images/products/serum-caffeine.jpg"],
    description: "5% Caffeine solution with EGCG from green tea. Reduces puffiness, fluid retention, and dark circles under eyes.",
    ingredients: ["Aqua", "Caffeine 5%", "EGCG (Green Tea)", "Hyaluronic Acid", "Phenoxyethanol"],
    benefits: ["Reduces morning eye puffiness", "Brightens dark eye circles", "Hydrates thin under-eye skin"],
    howToUse: "Massage a tiny drop under each eye morning and night using the cooling rollerball.",
    shades: [],
    price: 899,
    discountPrice: 699,
    gstPercent: 18,
    stock: 45,
    rating: 4.6,
    reviewsCount: 18
  },

  // MOISTURIZERS (6)
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
    name: "Ceramide Barrier Repair Cream",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/moisturizer-ceramide.jpg"],
    description: "A rich barrier repair cream with 5 essential ceramides, cholesterol, and oats to heal raw, peeling, or compromised skin.",
    ingredients: ["Aqua", "Ceramide EOP", "Ceramide AP", "Ceramide NP", "Cholesterol", "Colloidal Oatmeal"],
    benefits: ["Heals peeling, raw skin", "Replenishes skin barrier lipids", "Deep rich soothing hydration"],
    howToUse: "Warm cream between palms. Press gently onto face. Perfect for dry winters or post-peel recovery.",
    shades: [],
    price: 1199,
    discountPrice: 949,
    gstPercent: 18,
    stock: 35,
    rating: 4.8,
    reviewsCount: 23
  },
  {
    name: "Brightening Day Cream SPF 30",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/moisturizer-day.jpg"],
    description: "A non-greasy day moisturizer with Vitamin C and Alpha Arbutin that brightens skin tone while offering sun protection.",
    ingredients: ["Aqua", "Alpha Arbutin", "Ethylhexyl Methoxycinnamate", "Vitamin C", "Niacinamide"],
    benefits: ["Brightens uneven tone", "Light daily sun defense SPF 30", "Under-makeup prep cream"],
    howToUse: "Apply every morning as your final skincare step. Allow 2 minutes to absorb before starting makeup.",
    shades: [],
    price: 899,
    discountPrice: 749,
    gstPercent: 18,
    stock: 50,
    rating: 4.5,
    reviewsCount: 17
  },
  {
    name: "Overnight Recover Gel Cream",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/moisturizer-night.jpg"],
    description: "An intensive gel-cream mask containing melatonin and copper peptides that accelerates natural overnight skin repairs.",
    ingredients: ["Aqua", "Melatonin", "Copper Tripeptide-1", "Glycerin", "Allantoin", "Chamomile Extract"],
    benefits: ["Wakes up with rested glowing skin", "Accelerates overnight cell healing", "Calming chamomile aroma"],
    howToUse: "Apply a slightly thick layer at night as the final step of routine. Do not rinse off.",
    shades: [],
    price: 1299,
    discountPrice: 999,
    gstPercent: 18,
    stock: 38,
    rating: 4.9,
    reviewsCount: 22
  },
  {
    name: "Luminous Oil-Free Moisturizer",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/moisturizer-oilfree.jpg"],
    description: "An ultra-light watery gel that sinks in instantly, offering deep hydration with zero oil shine for acne-prone skin.",
    ingredients: ["Aqua", "Squalane", "Willow Bark Extract", "Hyaluronic Acid", "Zinc Lactate"],
    benefits: ["100% oil-free matte glow", "Sinks in under 10 seconds", "Contains willow bark to keep pores clear"],
    howToUse: "Smooth a pump over clean face. Ideal for humid summer climates.",
    shades: [],
    price: 949,
    discountPrice: 799,
    gstPercent: 18,
    stock: 45,
    rating: 4.6,
    reviewsCount: 15
  },
  {
    name: "Royal Saffron Face Cream",
    brand: "Sanique Cosmetics",
    category: "Moisturizers",
    images: ["/assets/images/products/moisturizer-saffron.jpg"],
    description: "A luxurious Ayurvedic-inspired cream containing pure Kashmiri saffron extract to brighten skin and add royal glow.",
    ingredients: ["Aqua", "Kashmiri Crocus Sativus (Saffron) Extract", "Sandalwood Oil", "Almond Oil", "Shea Butter"],
    benefits: ["Traditional Ayurvedic brightness", "Adds a rich royal radiance", "Fades dark spot discoloration"],
    howToUse: "Massage gently in upward strokes. Perfect for bridal prep routine.",
    shades: [],
    price: 1499,
    discountPrice: 1199,
    gstPercent: 18,
    stock: 30,
    rating: 4.9,
    reviewsCount: 25
  },

  // KAJAL & EYELINER (4)
  {
    name: "Ultra Precision Liquid Eyeliner",
    brand: "Sanique Cosmetics",
    category: "Kajal & Eyeliner",
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
    name: "Kohl Black Gel Kajal",
    brand: "Sanique Cosmetics",
    category: "Kajal & Eyeliner",
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
    name: "Waterproof Sketch Eyeliner",
    brand: "Sanique Cosmetics",
    category: "Kajal & Eyeliner",
    images: ["/assets/images/products/eyeliner-sketch.jpg"],
    description: "A pen-style sketch liner with a Japanese flexible brush tip that draws smooth, consistent lines with ease.",
    ingredients: ["Aqua", "Styrene Copolymer", "Iron Oxides", "Glycerin", "Alcohol"],
    benefits: ["Japanese flexible brush tip", "100% waterproof formula", "Rich matte carbon pigment"],
    howToUse: "Draw dashes along lash line, then connect them. Perfect for beginners.",
    shades: [
      { name: "Ink Black", hex: "#111111" }
    ],
    price: 699,
    discountPrice: 549,
    gstPercent: 18,
    stock: 50,
    rating: 4.6,
    reviewsCount: 14
  },
  {
    name: "Metallic Eye Definer Pencil",
    brand: "Sanique Cosmetics",
    category: "Kajal & Eyeliner",
    images: ["/assets/images/products/eyeliner-metallic.jpg"],
    description: "Creamy metallic pencil liner that highlights eyes with rich sapphire blue or emerald green jewel tones.",
    ingredients: ["Cyclomethicone", "Synthetic Wax", "Mica", "Silica", "Colorants"],
    benefits: ["High-impact jewel tones", "Ultra creamy smudgeable gel", "Waterproof 12-hour wear"],
    howToUse: "Glide along lash line. Smudge immediately with sponge tip for a jewel smokey eye.",
    shades: [
      { name: "Sapphire Sparkle", hex: "#0F52BA" },
      { name: "Emerald Glint", hex: "#50C878" }
    ],
    price: 499,
    discountPrice: 399,
    gstPercent: 18,
    stock: 45,
    rating: 4.5,
    reviewsCount: 11
  },

  // EYESHADOW PALETTES (5)
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
    name: "Sunset Glow Eyeshadow Palette",
    brand: "Sanique Cosmetics",
    category: "Eyeshadow Palettes",
    images: ["/assets/images/products/palette-sunset.jpg"],
    description: "Warm-toned 9-pan palette featuring terracotta mattes, copper shimmers, and metallic golds reflecting twilight skies.",
    ingredients: ["Mica", "Talc", "Dimethicone", "Zinc Stearate", "Boron Nitride"],
    benefits: ["Warm sun-kissed shades", "Satin smooth blending", "Highly compact travel size"],
    howToUse: "Use terracotta as transition, pack gold onto lid, and outline with deep bronze.",
    shades: [
      { name: "9-Pan Palette", hex: "#C7624B" }
    ],
    price: 2299,
    discountPrice: 1799,
    gstPercent: 18,
    stock: 25,
    rating: 4.8,
    reviewsCount: 14
  },
  {
    name: "Nude Silk Eyeshadow Palette",
    brand: "Sanique Cosmetics",
    category: "Eyeshadow Palettes",
    images: ["/assets/images/products/palette-nude.jpg"],
    description: "A luxury essential daily palette containing 9 flattering nudes, champagnes, and soft chocolate browns.",
    ingredients: ["Talc", "Kaolin", "Mica", "Squalane", "Tocopherol"],
    benefits: ["Everyday office-safe colors", "Ultra velvety touch powder", "Zero creasing all day"],
    howToUse: "Sweep soft brown over lid. Add a dab of champagne shimmer to the inner tear duct.",
    shades: [
      { name: "9-Pan Nude", hex: "#C8AD9E" }
    ],
    price: 1999,
    discountPrice: 1599,
    gstPercent: 18,
    stock: 30,
    rating: 4.7,
    reviewsCount: 18
  },
  {
    name: "Rose Gold Romance Palette",
    brand: "Sanique Cosmetics",
    category: "Eyeshadow Palettes",
    images: ["/assets/images/products/palette-rosegold.jpg"],
    description: "Unleash romantic glamour with 12 rose gold pigments, burgundy mattes, and sparkling diamond toppers.",
    ingredients: ["Mica", "Zea Mays Starch", "Zinc Stearate", "Synthetic Wax", "Pigment Violet 23"],
    benefits: ["Vibrant rose-gold gradients", "Intense metallic foil shades", "Long-lasting lock pigment"],
    howToUse: "Pack metallic foil shades with a wet brush onto lids for maximum chrome shine.",
    shades: [
      { name: "12-Pan Romance", hex: "#B76E79" }
    ],
    price: 2599,
    discountPrice: 2099,
    gstPercent: 18,
    stock: 18,
    rating: 4.9,
    reviewsCount: 22
  },
  {
    name: "Matte Neutral Eyeshadow Palette",
    brand: "Sanique Cosmetics",
    category: "Eyeshadow Palettes",
    images: ["/assets/images/products/palette-matte.jpg"],
    description: "An all-matte professional eye contour palette featuring 9 cool and warm brown contours for perfect definition.",
    ingredients: ["Talc", "Kaolin", "Magnesium Myristate", "Silica", "Titanium Dioxide"],
    benefits: ["100% premium matte powders", "Perfect eye contour definition", "Can be used as brow fillers"],
    howToUse: "Use a fluffy blending brush to map out contours and define brow lines.",
    shades: [
      { name: "9-Pan Matte", hex: "#8B7E74" }
    ],
    price: 1799,
    discountPrice: 1399,
    gstPercent: 18,
    stock: 22,
    rating: 4.6,
    reviewsCount: 12
  }
];

const coupons = [
  { code: "SANIQUE10", discountType: "percentage", value: 10, minPurchase: 500, expiryDate: new Date("2027-12-31"), active: true },
  { code: "FESTIVE500", discountType: "fixed", value: 500, minPurchase: 2500, expiryDate: new Date("2027-12-31"), active: true },
  { code: "GLOW20", discountType: "percentage", value: 20, minPurchase: 1500, expiryDate: new Date("2027-12-31"), active: true }
];

const customerData = [
  { name: "Sanchita Sharma", email: "sanchita@sanique.com", password: "password123", mobile: "9876543210", loyaltyPoints: 120, vipLevel: "Bronze", street: "102 Luxury Towers, Golf Course Road", city: "Gurugram", state: "Haryana", zipCode: "122002" },
  { name: "Priya Patel", email: "priya@sanique.com", password: "password123", mobile: "9911223344", loyaltyPoints: 600, vipLevel: "Gold", street: "22 Sterling Flats", city: "Mumbai", state: "Maharashtra", zipCode: "400001" },
  { name: "Rahul Singh", email: "rahul@sanique.com", password: "password123", mobile: "9822334455", loyaltyPoints: 250, vipLevel: "Silver", street: "H-45 Rajouri Garden", city: "New Delhi", state: "Delhi", zipCode: "110027" },
  { name: "Sneha Reddy", email: "sneha@sanique.com", password: "password123", mobile: "9733445566", loyaltyPoints: 1200, vipLevel: "Platinum", street: "504 Jubilee Hills", city: "Hyderabad", state: "Telangana", zipCode: "500033" },
  { name: "Amit Verma", email: "amit@sanique.com", password: "password123", mobile: "9644556677", loyaltyPoints: 80, vipLevel: "Bronze", street: "12 B-Block, Gomti Nagar", city: "Lucknow", state: "Uttar Pradesh", zipCode: "226010" },
  { name: "Pooja Mehta", email: "pooja@sanique.com", password: "password123", mobile: "9555667788", loyaltyPoints: 850, vipLevel: "Gold", street: "C-902 Signature High", city: "Ahmedabad", state: "Gujarat", zipCode: "380015" },
  { name: "Rohan Gupta", email: "rohan@sanique.com", password: "password123", mobile: "9466778899", loyaltyPoints: 310, vipLevel: "Silver", street: "Plot 89, Sector 21", city: "Noida", state: "Uttar Pradesh", zipCode: "201301" },
  { name: "Divya Nair", email: "divya@sanique.com", password: "password123", mobile: "9377889900", loyaltyPoints: 140, vipLevel: "Bronze", street: "Floor 3, Skyline Villa", city: "Kochi", state: "Kerala", zipCode: "682020" },
  { name: "Vikram Malhotra", email: "vikram@sanique.com", password: "password123", mobile: "9288990011", loyaltyPoints: 950, vipLevel: "Gold", street: "45 Boat Club Road", city: "Pune", state: "Maharashtra", zipCode: "411001" },
  { name: "Neha Kapoor", email: "neha@sanique.com", password: "password123", mobile: "9199001122", loyaltyPoints: 1300, vipLevel: "Platinum", street: "10B Alipore Road", city: "Kolkata", state: "West Bengal", zipCode: "700027" }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sanique-cosmetics');
    console.log("Database connected for seeding...");

    // Clear existing
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Counter.deleteMany({});
    await Review.deleteMany({});
    console.log("Existing collections cleared.");

    // Initialize sequence counter
    await Counter.create({ id: 'orderId', seq: 1000 });

    // Seed Products
    const seededProducts = await Product.insertMany(products);
    console.log(`${seededProducts.length} Products seeded successfully.`);

    // Seed Coupons
    await Coupon.insertMany(coupons);
    console.log(`${coupons.length} Coupons seeded successfully.`);

    // Seed Admin
    const adminUser = new User({
      name: "Sanique Admin",
      email: "admin@sanique.com",
      password: "adminpassword123",
      mobile: "9999999999",
      loyaltyPoints: 500,
      vipLevel: "Platinum",
      isAdmin: true
    });
    await adminUser.save();
    console.log("Admin user seeded (admin@sanique.com / adminpassword123)");

    // Seed Customers
    const seededUsers = [];
    for (const c of customerData) {
      const user = new User({
        name: c.name,
        email: c.email,
        password: c.password,
        mobile: c.mobile,
        loyaltyPoints: c.loyaltyPoints,
        vipLevel: c.vipLevel,
        address: {
          street: c.street,
          city: c.city,
          state: c.state,
          zipCode: c.zipCode,
          country: "India"
        }
      });
      const savedUser = await user.save();
      seededUsers.push(savedUser);
    }
    console.log(`${seededUsers.length} Customers seeded successfully.`);

    // Seed Orders (10 orders)
    // 1 Delivered, 1 Shipped, 1 Packed, 1 Confirmed, others Confirmed/Delivered/Pending/Cancelled
    const orderStatuses = [
      "Delivered",     // SAN1001
      "Shipped",       // SAN1002
      "Packed",        // SAN1003
      "Confirmed",     // SAN1004
      "Delivered",     // SAN1005
      "Shipped",       // SAN1006
      "Packed",        // SAN1007
      "Confirmed",     // SAN1008
      "Pending",       // SAN1009
      "Cancelled"      // SAN1010
    ];

    const paymentStatuses = [
      "Paid",          // SAN1001
      "Paid",          // SAN1002
      "Paid",          // SAN1003
      "Paid",          // SAN1004
      "Paid",          // SAN1005
      "Paid",          // SAN1006
      "Paid",          // SAN1007
      "Paid",          // SAN1008
      "Pending",       // SAN1009
      "Failed"         // SAN1010
    ];

    const paymentMethods = [
      "Razorpay",
      "Razorpay",
      "Razorpay",
      "Razorpay",
      "UPI",
      "Razorpay",
      "Razorpay",
      "UPI",
      "COD",
      "Razorpay"
    ];

    for (let i = 0; i < 10; i++) {
      const user = seededUsers[i];
      const prod1 = seededProducts[i % seededProducts.length];
      const prod2 = seededProducts[(i + 1) % seededProducts.length];

      const p1Price = prod1.discountPrice || prod1.price;
      const p2Price = prod2.discountPrice || prod2.price;

      const subtotal = (p1Price * 1) + (p2Price * 2);
      const gst = Math.round(subtotal * 0.18);
      const totalAmount = subtotal;

      const trackingId = 'SQ' + (12345678 + i) + 'IN';
      const orderId = `SAN${1001 + i}`;

      const orderProducts = [
        {
          productId: prod1._id,
          name: prod1.name,
          price: p1Price,
          quantity: 1,
          shade: prod1.shades && prod1.shades.length > 0 ? prod1.shades[0].name : "Default"
        },
        {
          productId: prod2._id,
          name: prod2.name,
          price: p2Price,
          quantity: 2,
          shade: prod2.shades && prod2.shades.length > 0 ? prod2.shades[0].name : "Default"
        }
      ];

      const order = new Order({
        orderId,
        userId: user._id,
        customerName: user.name,
        email: user.email,
        phone: user.mobile,
        shippingAddress: `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.zipCode}`,
        products: orderProducts,
        subtotal,
        gst,
        discount: 0,
        totalAmount,
        paymentMethod: paymentMethods[i],
        paymentStatus: paymentStatuses[i],
        orderStatus: orderStatuses[i],
        trackingId,
        createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000), // sequential historical dates
        
        // Compatibility fields
        amount: totalAmount,
        discountApplied: 0,
        loyaltyRedeemed: 0,
        trackingNumber: trackingId
      });

      const savedOrder = await order.save();

      // Seed Payment details corresponding to this order
      const payment = new Payment({
        orderId: savedOrder.orderId,
        paymentId: `pay_test_${100000 + i}`,
        amount: totalAmount,
        status: paymentStatuses[i],
        method: paymentMethods[i],
        createdAt: savedOrder.createdAt
      });
      await payment.save();

      // Seed Product Review for prod1
      const review = new Review({
        userId: user._id,
        userName: user.name,
        productId: prod1._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 rating
        comment: `Absolutely loved this product! Highly recommend. Standard formulation and luxury feel.`,
        createdAt: savedOrder.createdAt
      });
      await review.save();
    }

    console.log("Seeded 10 orders, payments and reviews successfully.");

    // Re-calculate ratings for all products based on seeded reviews
    for (const prod of seededProducts) {
      const reviews = await Review.find({ productId: prod._id });
      if (reviews.length > 0) {
        prod.reviewsCount = reviews.length;
        prod.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await prod.save();
      }
    }
    console.log("Updated product ratings and reviews count.");

    mongoose.disconnect();
    console.log("Seeding complete. Connection closed.");
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
