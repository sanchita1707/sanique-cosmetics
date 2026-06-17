const Product = require('../models/Product');

// @desc    Get AI recommendation based on skin inputs
// @route   POST /api/ai/recommend
// @access  Public
const getAiRecommendations = async (req, res) => {
  const { skinType, skinTone, makeupPreference } = req.body;

  try {
    let recommendations = [];

    // Categorized matches
    if (skinType) {
      const typeLower = skinType.toLowerCase();
      if (typeLower === 'oily') {
        // Recommend matte items, gel cleansers, niacinamide/Vitamin C serum, sunscreens
        recommendations = await Product.find({
          $or: [
            { category: 'Serums', name: { $regex: 'Vitamin C', $options: 'i' } },
            { category: 'Sunscreens', name: { $regex: 'Matte', $options: 'i' } },
            { category: 'Face Wash', name: { $regex: 'Gel', $options: 'i' } },
            { category: 'Face Powder', name: { $regex: 'Translucent', $options: 'i' } }
          ]
        });
      } else if (typeLower === 'dry') {
        // Recommend hydration, hyaluronic, dewy foundations, cream blushes
        recommendations = await Product.find({
          $or: [
            { category: 'Moisturizers', name: { $regex: 'Dew', $options: 'i' } },
            { category: 'Foundations', name: { $regex: 'Glow', $options: 'i' } },
            { category: 'Serums' },
            { category: 'Makeup Kits', name: { $regex: 'Bridal', $options: 'i' } }
          ]
        });
      } else {
        // Combination/Normal: balance products
        recommendations = await Product.find({
          category: { $in: ['Moisturizers', 'Foundations', 'Lipsticks', 'Blush'] }
        }).limit(4);
      }
    } else {
      // Default: best sellers
      recommendations = await Product.find({ rating: { $gte: 4.7 } }).limit(4);
    }

    res.json({
      skinProfile: { skinType, skinTone, makeupPreference },
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process Beauty Quiz answers
// @route   POST /api/ai/quiz
// @access  Public
const processBeautyQuiz = async (req, res) => {
  const { answers } = req.body; // Array of answers/options selected

  try {
    // Determine skin goal based on answers
    // Let's mock a beauty profile recommendation
    let recommendedCategory = 'Serums';
    let routineSteps = [];

    if (answers && answers.includes('acne')) {
      recommendedCategory = 'Face Wash';
      routineSteps = ['Cleanse with Hydrating Gel Face Wash', 'Apply Vitamin C Glow Serum', 'Moisturize', 'Apply SPF 50 Sunscreen'];
    } else if (answers && answers.includes('anti-aging')) {
      recommendedCategory = 'Serums';
      routineSteps = ['Cleanse', 'Apply Vitamin C Glow Serum', 'Apply Hydra-Dew Moisturizer'];
    } else if (answers && answers.includes('glam')) {
      recommendedCategory = 'Makeup Kits';
      routineSteps = ['Prep with Hydra-Dew Moisturizer', 'Apply Glow-Radiance Foundation', 'Apply Luxe Matte Lipstick & Eyeshadow'];
    } else {
      routineSteps = ['Cleanse face', 'Apply Serum', 'Moisturize', 'Apply Sunscreen'];
    }

    const recommendedProducts = await Product.find({ category: recommendedCategory }).limit(3);

    res.json({
      routine: routineSteps,
      recommendedProducts,
      beautyTips: [
        "Drink at least 3 liters of water daily to maintain skin hydration.",
        "Double cleanse at night to fully remove makeup and sunscreen residues.",
        "Apply sunscreen indoors and outdoors every 3-4 hours."
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check ingredient safety details
// @route   POST /api/ai/check-ingredients
// @access  Public
const checkIngredients = async (req, res) => {
  const { ingredients } = req.body; // Array of ingredients

  try {
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients list must be an array of strings' });
    }

    // Safety classification catalog
    const database = {
      "water": { rating: "Safe", description: "Standard hydrating cosmetic solvent.", source: "Natural" },
      "aqua": { rating: "Safe", description: "Standard hydrating cosmetic solvent.", source: "Natural" },
      "glycerin": { rating: "Safe", description: "Strong humectant that draws water into the skin.", source: "Natural/Plant-Derived" },
      "hyaluronic acid": { rating: "Safe", description: "Holds up to 1000x its weight in water. Hydrating agent.", source: "Safe Biotech" },
      "sodium hyaluronate": { rating: "Safe", description: "Salt form of Hyaluronic Acid, easily penetrates skin.", source: "Safe Biotech" },
      "jojoba oil": { rating: "Safe", description: "Moisturizes and mimics skin's natural sebum.", source: "Organic" },
      "jojoba esters": { rating: "Safe", description: "Moisturizing emollient.", source: "Organic" },
      "tocopheryl acetate": { rating: "Safe", description: "Vitamin E derivative, potent antioxidant.", source: "Synthetic" },
      "tocopherol": { rating: "Safe", description: "Pure Vitamin E, highly nourishing.", source: "Natural" },
      "niacinamide": { rating: "Safe", description: "Vitamin B3, reduces redness, regulates oil, brightens.", source: "Safe Synthetic" },
      "l-ascorbic acid": { rating: "Safe", description: "Pure Vitamin C, highly active antioxidant and brightener.", source: "Natural" },
      "ferulic acid": { rating: "Safe", description: "Antioxidant that boosts Vitamin C effectiveness.", source: "Plant-Derived" },
      "titanium dioxide": { rating: "Safe", description: "Mineral physical sunscreen filter, non-irritating.", source: "Mineral" },
      "zinc oxide": { rating: "Safe", description: "Broad-spectrum physical sunscreen filter, highly soothing.", source: "Mineral" },
      "dimethicone": { rating: "Safe", description: "Silicone emollient, creates smooth texture barriers.", source: "Synthetic" },
      "talc": { rating: "Neutral", description: "Soft mineral absorber. Safe in cosmetics if asbestos-free.", source: "Mineral" },
      "fragrance": { rating: "Caution", description: "Can cause irritation in highly sensitive skin types.", source: "Synthetic/Natural" },
      "parabens": { rating: "Avoid", description: "Preservative. Often avoided due to endocrine concern debates.", source: "Chemical" },
      "phenoxyethanol": { rating: "Safe", description: "Gentle preservative, widely used in premium beauty.", source: "Safe Synthetic" }
    };

    const results = ingredients.map(ing => {
      const norm = ing.toLowerCase().trim();
      const match = database[norm] || {
        rating: "Safe",
        description: "Conditioning agent or pigment binder. Generally well-tolerated.",
        source: "Cosmetic Grade"
      };

      return {
        name: ing,
        rating: match.rating,
        description: match.description,
        source: match.source
      };
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAiRecommendations,
  processBeautyQuiz,
  checkIngredients
};
