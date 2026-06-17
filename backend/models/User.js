const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "India" }
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  loyaltyPoints: { type: Number, default: 0 },
  vipLevel: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
  routine: [{
    day: { type: String }, // e.g., "Monday"
    morning: [{ type: String }],
    night: [{ type: String }]
  }],
  skinTracker: [{
    date: { type: Date, default: Date.now },
    image: { type: String }, // Base64 or local image URL
    notes: { type: String },
    skinCondition: { type: String }
  }],
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
