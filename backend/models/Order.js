const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g. SAN1001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true }, // flexible: can be object or string
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    shade: { type: String, default: "" }
  }],
  subtotal: { type: Number, required: true },
  gst: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // COD, UPI, Razorpay
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  orderStatus: { type: String, enum: ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"], default: "Pending" },
  trackingId: { type: String, unique: true }, // e.g. SQ...IN or SAN-TRK...
  
  // Compatibility fields (to avoid breaking any legacy code)
  amount: { type: Number },
  discountApplied: { type: Number, default: 0 },
  loyaltyRedeemed: { type: Number, default: 0 },
  trackingNumber: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

