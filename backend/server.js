const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});