const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getOrderByTracking,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  validateCoupon,
  downloadInvoice
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// Create Order / Get All Orders (Admin)
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

// Coupon Validation
router.post('/coupon', protect, validateCoupon);

// User Orders
router.get('/myorders', protect, getMyOrders);

// Public Order Tracking
router.get('/track/:query', getOrderByTracking);

// Get Single Order
router.route('/:id')
  .get(protect, getOrderById);

// Update Order Status (Admin)
router.put('/:id/status', protect, admin, updateOrderStatus);

// Invoice Download (Public for Demo)
router.get('/:id/invoice', downloadInvoice);

module.exports = router;