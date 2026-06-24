const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true }, // refers to custom orderId e.g. SAN1001
  paymentId: { type: String, required: true }, // e.g. pay_OkJ2K28d...
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  method: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
