const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Counter = require('../models/Counter');
const PDFDocument = require('pdfkit');

// Helper to generate tracking number
const generateTrackingNo = () => {
  return 'SQ' + Math.floor(10000000 + Math.random() * 90000000) + 'IN';
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, redeemPoints, customerName, email, phone } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No products in order items' });
    }

    let subtotal = 0;
    let totalGst = 0;
    const finalProducts = [];

    // Verify stock and calculate cost
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      const basePrice = product.discountPrice || product.price;
      const lineTotal = basePrice * item.quantity;
      subtotal += lineTotal;

      const gstRate = product.gstPercent || 18;
      const gstAmount = Math.round(lineTotal * (gstRate / 100));
      totalGst += gstAmount;

      finalProducts.push({
        productId: product._id,
        name: product.name,
        price: basePrice,
        quantity: item.quantity,
        shade: item.shade || ""
      });
    }

    let discountApplied = 0;
    // Handle coupon code
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, active: true });
      if (coupon && coupon.expiryDate > new Date() && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === 'percentage') {
          discountApplied = Math.round((subtotal * coupon.value) / 100);
        } else {
          discountApplied = coupon.value;
        }
      }
    }

    let loyaltyPointsRedeemedAmount = 0;
    const user = await User.findById(req.user._id);

    // Handle loyalty point redemption
    if (redeemPoints && redeemPoints > 0) {
      const maxRedeem = Math.min(user.loyaltyPoints, subtotal - discountApplied);
      if (maxRedeem > 0) {
        loyaltyPointsRedeemedAmount = maxRedeem;
        user.loyaltyPoints -= maxRedeem;
      }
    }

    const finalAmount = Math.max(0, subtotal - discountApplied - loyaltyPointsRedeemedAmount);

    // Credit loyalty points to user (10% of final amount in points, 1 point = 1 INR)
    const pointsEarned = Math.round(finalAmount * 0.10);
    user.loyaltyPoints += pointsEarned;

    // Update VIP level
    if (user.loyaltyPoints > 1000) {
      user.vipLevel = "Platinum";
    } else if (user.loyaltyPoints > 500) {
      user.vipLevel = "Gold";
    } else if (user.loyaltyPoints > 200) {
      user.vipLevel = "Silver";
    } else {
      user.vipLevel = "Bronze";
    }
    await user.save();

    // Auto-increment custom orderId sequence (SAN1001, SAN1002...)
    const counter = await Counter.findOneAndUpdate(
      { id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const customOrderId = `SAN${counter.seq}`;
    const generatedTracking = generateTrackingNo();

    // Format shipping address to string if it is an object
    let formattedAddress = shippingAddress;
    if (typeof shippingAddress === 'object') {
      formattedAddress = `${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.zipCode || ''}`;
    }

    // Create Order object
    const order = new Order({
      orderId: customOrderId,
      userId: req.user._id,
      customerName: customerName || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.mobile || "9999999999",
      shippingAddress: formattedAddress,
      products: finalProducts,
      subtotal,
      gst: totalGst,
      discount: discountApplied + loyaltyPointsRedeemedAmount,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : (paymentMethod === 'Razorpay' ? 'Pending' : 'Paid'),
      orderStatus: paymentMethod === 'COD' ? 'Confirmed' : (paymentMethod === 'Razorpay' ? 'Pending' : 'Confirmed'),
      trackingId: generatedTracking,
      
      // Compatibility fields
      amount: finalAmount,
      discountApplied,
      loyaltyRedeemed: loyaltyPointsRedeemedAmount,
      trackingNumber: generatedTracking
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('products.productId', 'name brand images');
    if (order) {
      // Authorize order owner or admin
      if (order.userId && order.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access to order history' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order status by public query (OrderID or TrackingID)
// @route   GET /api/orders/track/:query
// @access  Public
const getOrderByTracking = async (req, res) => {
  try {
    const { query } = req.params;
    const order = await Order.findOne({
      $or: [
        { orderId: query },
        { trackingId: query },
        { trackingNumber: query }
      ]
    }).populate('products.productId', 'name brand images');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'No matching order found for this Order ID or Tracking ID.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId', 'name brand images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'id name email')
      .populate('products.productId', 'name brand price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status & tracking status (Admin Only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = req.body.status || order.orderStatus;
      if (req.body.paymentStatus) {
        order.paymentStatus = req.body.paymentStatus;
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon code
// @route   POST /api/orders/coupon
// @access  Private
const validateCoupon = async (req, res) => {
  const { code, amount } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (amount < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} is required for this coupon` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((amount * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discountAmount: discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download order invoice as PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('products.productId', 'name brand price gstPercent');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize order owner or admin
    if (order.userId && order.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.orderId || order.trackingId}.pdf`);
    doc.pipe(res);

    // Document styling - Brand Color Accent: Rose Gold (#B76E79) and Charcoal (#2C2C2C)
    const brandColor = '#B76E79';
    const darkGrey = '#2C2C2C';

    // Title / Header
    doc.fillColor(brandColor).fontSize(24).font('Helvetica-Bold').text('SANIQUE COSMETICS', 50, 50);
    doc.fontSize(10).font('Helvetica-Oblique').text('Premium Luxury Skincare & Makeup', 50, 78);
    
    doc.fillColor(darkGrey).fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(9).font('Helvetica').text(`Invoice No: INV-${order.orderId || order._id.toString().substring(0, 8).toUpperCase()}`, 400, 70, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 83, { align: 'right' });
    doc.text(`Order ID: ${order.orderId || 'N/A'}`, 400, 96, { align: 'right' });
    doc.text(`Tracking ID: ${order.trackingId || order.trackingNumber || 'N/A'}`, 400, 109, { align: 'right' });

    doc.moveTo(50, 125).lineTo(550, 125).strokeColor('#E0E0E0').stroke();

    // Addresses
    doc.fontSize(10).font('Helvetica-Bold').text('Billed To:', 50, 140);
    doc.font('Helvetica').text(order.customerName || (order.userId ? order.userId.name : 'Valued Customer'), 50, 155);
    doc.text(order.email || (order.userId ? order.userId.email : ''), 50, 170);
    doc.text(`Phone: ${order.phone || (order.userId ? order.userId.mobile : '')}`, 50, 185);

    doc.font('Helvetica-Bold').text('Ship To:', 300, 140);
    doc.font('Helvetica');
    if (typeof order.shippingAddress === 'object') {
      doc.text(order.customerName || (order.userId ? order.userId.name : 'Valued Customer'), 300, 155);
      doc.text(order.shippingAddress.street || '', 300, 170);
      doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.zipCode || ''}`, 300, 185);
      doc.text('India', 300, 200);
    } else {
      doc.text(order.customerName || (order.userId ? order.userId.name : 'Valued Customer'), 300, 155);
      doc.text(order.shippingAddress || '', 300, 170, { width: 250 });
    }

    doc.moveTo(50, 225).lineTo(550, 225).strokeColor('#E0E0E0').stroke();

    // Table Header
    let y = 245;
    doc.font('Helvetica-Bold').fillColor(brandColor);
    doc.text('Item Description', 50, y, { width: 220 });
    doc.text('Qty', 270, y, { width: 40, align: 'center' });
    doc.text('Price (INR)', 320, y, { width: 70, align: 'right' });
    doc.text('GST %', 400, y, { width: 50, align: 'center' });
    doc.text('Total (INR)', 470, y, { width: 80, align: 'right' });

    doc.moveTo(50, 260).lineTo(550, 260).strokeColor(brandColor).lineWidth(1.5).stroke();

    // Table Items
    y = 275;
    doc.font('Helvetica').fillColor(darkGrey).lineWidth(0.5);

    let calcSubtotal = 0;
    for (const item of order.products) {
      const pName = item.name || (item.productId ? item.productId.name : 'Unknown Product');
      const shadeText = item.shade ? ` (Shade: ${item.shade})` : '';
      const pPrice = item.price;
      const gst = item.productId ? (item.productId.gstPercent || 18) : 18;
      const lineTotal = pPrice * item.quantity;
      calcSubtotal += lineTotal;

      doc.text(`${pName}${shadeText}`, 50, y, { width: 220 });
      doc.text(item.quantity.toString(), 270, y, { width: 40, align: 'center' });
      doc.text(`Rs. ${pPrice.toLocaleString('en-IN')}`, 320, y, { width: 70, align: 'right' });
      doc.text(`${gst}%`, 400, y, { width: 50, align: 'center' });
      doc.text(`Rs. ${lineTotal.toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });

      y += 25;
      doc.moveTo(50, y - 5).lineTo(550, y - 5).strokeColor('#F0F0F0').stroke();
    }

    // Calculations Summary
    y += 10;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 350, y, { width: 110, align: 'right' });
    doc.font('Helvetica').text(`Rs. ${order.subtotal ? order.subtotal.toLocaleString('en-IN') : calcSubtotal.toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });

    y += 20;
    doc.font('Helvetica-Bold');
    doc.text('GST (Included):', 350, y, { width: 110, align: 'right' });
    doc.font('Helvetica').text(`Rs. ${order.gst ? order.gst.toLocaleString('en-IN') : Math.round(calcSubtotal * 0.18).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });

    if (order.discount > 0 || order.discountApplied > 0) {
      y += 20;
      doc.font('Helvetica-Bold').fillColor('#E05D5D');
      doc.text('Discount Applied:', 350, y, { width: 110, align: 'right' });
      doc.font('Helvetica').text(`- Rs. ${(order.discount || order.discountApplied || 0).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });
    }

    y += 25;
    doc.moveTo(320, y - 5).lineTo(550, y - 5).strokeColor(brandColor).stroke();

    doc.font('Helvetica-Bold').fontSize(12).fillColor(brandColor);
    doc.text('Grand Total:', 350, y, { width: 110, align: 'right' });
    doc.text(`Rs. ${(order.totalAmount || order.amount).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });

    // Payment Information
    y += 40;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(darkGrey);
    doc.text('Payment Information:', 50, y);
    doc.font('Helvetica').fontSize(9).text(`Payment Method: ${order.paymentMethod}`, 50, y + 15);
    doc.text(`Status: ${order.paymentStatus}`, 50, y + 27);

    // Terms / Footer
    doc.moveTo(50, y + 55).lineTo(550, y + 55).strokeColor('#E0E0E0').stroke();
    doc.fontSize(8).fillColor('#888888');
    doc.text('Thank you for choosing Sanique Cosmetics - Luxury Beauty & Skincare.', 50, y + 70, { align: 'center' });
    doc.text('This is a computer-generated tax invoice and does not require a physical signature.', 50, y + 83, { align: 'center' });
    doc.text('For queries, contact support@sanique.com', 50, y + 95, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrderByTracking,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  validateCoupon,
  downloadInvoice
};
