import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/images', express.static(path.join('public/images')));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);


// Serve index.html as default
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Serve images manually (fallback for non-static hits)
app.get('/images/:name', (req, res) => {
  const pathToFile = `public/images/${req.params.name}`;
  if (fs.existsSync(pathToFile)) {
    return res.sendFile(path.resolve(pathToFile));
  } else {
    console.log('❌ Không tìm thấy ảnh:', pathToFile);
    return res.status(404).send('Không tìm thấy ảnh');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
