const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products with query parameters (search, category, sorting, price filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, rating, sortBy } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Search query (name, description, ingredients)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query builder
    let apiQuery = Product.find(query);

    // Sorting options
    if (sortBy) {
      if (sortBy === 'price-low') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sortBy === 'price-high') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sortBy === 'rating') {
        apiQuery = apiQuery.sort({ rating: -1 });
      } else if (sortBy === 'newest') {
        apiQuery = apiQuery.sort({ createdAt: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 }); // default to newest
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product (Admin Only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, brand, category, images, description, ingredients, benefits, howToUse, shades, price, discountPrice, stock } = req.body;

    const product = new Product({
      name,
      brand: brand || "Sanique Cosmetics",
      category,
      images: images || ["/assets/images/products/placeholder.jpg"],
      description,
      ingredients: ingredients || [],
      benefits: benefits || [],
      howToUse: howToUse || "",
      shades: shades || [],
      price,
      discountPrice,
      stock
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product (Admin Only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, brand, category, images, description, ingredients, benefits, howToUse, shades, price, discountPrice, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.images = images || product.images;
      product.description = description || product.description;
      product.ingredients = ingredients || product.ingredients;
      product.benefits = benefits || product.benefits;
      product.howToUse = howToUse || product.howToUse;
      product.shades = shades || product.shades;
      product.price = price || product.price;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
      product.stock = stock !== undefined ? stock : product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({
        userId: req.user._id,
        productId: product._id
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by you' });
      }

      const review = new Review({
        userId: req.user._id,
        userName: req.user.name,
        productId: product._id,
        rating: Number(rating),
        comment
      });

      await review.save();

      // Recalculate average product rating
      const reviews = await Review.find({ productId: product._id });
      product.reviewsCount = reviews.length;
      product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review submitted successfully', review });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews
};
