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

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.post('/coupon', protect, validateCoupon);
router.get('/myorders', protect, getMyOrders);
router.get('/track/:query', getOrderByTracking); // public tracking endpoint

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/status', protect, admin, updateOrderStatus);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;

