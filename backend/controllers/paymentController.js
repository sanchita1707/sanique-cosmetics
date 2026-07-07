const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize Razorpay
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  return {
    instance: new Razorpay({
      key_id,
      key_secret
    }),
    key_id,
    key_secret
  };
};

// ===============================
// Create Razorpay Order
// POST /api/payments/razorpay/order
// ===============================
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    const { instance, key_id } = getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      keyId: key_id,
      order
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===============================
// Verify Razorpay Payment
// POST /api/payments/razorpay/verify
// ===============================
const verifyRazorpayPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      orderId,
      method
    } = req.body;

    const { key_secret } = getRazorpayInstance();

    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed"
      });
    }

    // Save Payment
    const payment = await Payment.create({
      orderId,
      paymentId: razorpay_payment_id,
      amount,
      method,
      status: "Paid"
    });

    // Update Order
    const order = await Order.findOne({ orderId });

    if (order) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
      payment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// ===============================
// Get All Payments
// GET /api/payments
// ===============================
const getAllPayments = async (req, res) => {

  try {

    const payments = await Payment.find({})
      .sort({ createdAt: -1 });

    res.status(200).json(payments);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getAllPayments
};