const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sanique_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      mobile,
      loyaltyPoints: 100 // Welcome points
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
        vipLevel: user.vipLevel,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
        vipLevel: user.vipLevel,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address.street,
          city: req.body.address.city || user.address.city,
          state: req.body.address.state || user.address.state,
          zipCode: req.body.address.zipCode || user.address.zipCode,
          country: req.body.address.country || user.address.country
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        address: updatedUser.address,
        isAdmin: updatedUser.isAdmin,
        loyaltyPoints: updatedUser.loyaltyPoints,
        vipLevel: updatedUser.vipLevel,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage Skincare Routine
// @route   POST /api/auth/routine
// @access  Private
const updateRoutine = async (req, res) => {
  const { routine } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.routine = routine;
      await user.save();
      res.json({ message: 'Skincare routine updated successfully', routine: user.routine });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Skincare Progress log
// @route   POST /api/auth/skin-tracker
// @access  Private
const addSkinProgressLog = async (req, res) => {
  const { image, notes, skinCondition } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.skinTracker.push({
        image, // Base64 visual representation
        notes,
        skinCondition,
        date: new Date()
      });
      await user.save();
      res.status(201).json({ message: 'Progress log saved successfully', skinTracker: user.skinTracker });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const index = user.wishlist.indexOf(productId);
      if (index > -1) {
        user.wishlist.splice(index, 1);
        await user.save();
        res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
      } else {
        user.wishlist.push(productId);
        await user.save();
        res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin Only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  updateRoutine,
  addSkinProgressLog,
  toggleWishlist,
  getAllUsers
};

