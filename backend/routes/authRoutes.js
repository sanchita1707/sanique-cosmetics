const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  updateRoutine,
  addSkinProgressLog,
  toggleWishlist
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/routine', protect, updateRoutine);
router.post('/skin-tracker', protect, addSkinProgressLog);
router.post('/wishlist', protect, toggleWishlist);

module.exports = router;
