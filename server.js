const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./backend/config/db');

console.log("Mongo URI Loaded:", process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads for tracker
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/products', require('./backend/routes/productRoutes'));
app.use('/api/orders', require('./backend/routes/orderRoutes'));
app.use('/api/payments', require('./backend/routes/paymentRoutes'));
app.use('/api/ai', require('./backend/routes/aiRoutes'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to SPA or index.html for undefined routes in public
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sanique Cosmetics Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
