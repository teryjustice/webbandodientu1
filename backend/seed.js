import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Product from './models/Product.js';
import User from './models/User.js';
import Category from './models/Category.js';
import 'dotenv/config';

// Kết nối MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Seed admin và user
async function seed() {
  await User.deleteMany({});
  // ...existing code...

  // Tạo admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin'
  });

  // Tạo user thường
  const userPassword = await bcrypt.hash('user123', 10);
  await User.create({
    username: 'user',
    email: 'user@example.com',
    password: userPassword,
    role: 'user'
  });

  console.log('Seeded admin and user accounts');
}

// Chạy seeding
async function run() {
  await connectDB();
  await seed();
}

run().catch(console.error);