const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: "Sanique Cosmetics" },
  category: { type: String, required: true },
  images: [{ type: String }], // Array of paths or premium visual hashes
  description: { type: String, required: true },
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  howToUse: { type: String, default: "" },
  shades: [{
    name: { type: String },
    hex: { type: String }
  }],
  price: { type: Number, required: true }, // MRP in INR
  discountPrice: { type: Number }, // Discount price in INR
  gstPercent: { type: Number, default: 18 }, // GST rate (standard 18%)
  stock: { type: Number, required: true, default: 10 },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
