const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Dữ liệu mẫu
const products = [
  {
    name: 'Laptop Dell XPS 13',
    price: 25000000,
    description: 'Laptop cao cấp với màn hình 13 inch, CPU Intel i7',
    image: 'https://via.placeholder.com/150',
    category: 'Laptop',
    stock: 10
  },
  {
    name: 'iPhone 14 Pro',
    price: 30000000,
    description: 'Điện thoại thông minh với chip A16 Bionic',
    image: 'https://via.placeholder.com/150',
    category: 'Điện thoại',
    stock: 15
  },
  {
    name: 'Tai nghe AirPods Pro',
    price: 6000000,
    description: 'Tai nghe không dây với công nghệ chống ồn',
    image: 'https://via.placeholder.com/150',
    category: 'Âm thanh',
    stock: 20
  },
  {
    name: 'iPad Air 2023',
    price: 15000000,
    description: 'Máy tính bảng với chip M1, màn hình 10.9 inch',
    image: 'https://via.placeholder.com/150',
    category: 'Máy tính bảng',
    stock: 8
  }
];

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    cart: []
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    cart: []
  }
];

async function seed() {
  try {
    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    await User.deleteMany({});

    // Mã hóa mật khẩu người dùng
    const hashedUsers = await Promise.all(users.map(async user => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    })));

    // Thêm dữ liệu
    await Product.insertMany(products);
    await User.insertMany(hashedUsers);

    console.log('Data seeded successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

const Category = require('./models/Category');
const categories = [
  { name: 'Laptop', description: 'Các dòng laptop từ nhiều thương hiệu' },
  { name: 'Điện thoại', description: 'Điện thoại thông minh hiện đại' },
  { name: 'Phụ kiện', description: 'Phụ kiện điện tử chất lượng' },
  { name: 'Máy tính bảng', description: 'Máy tính bảng đa năng' },
  { name: 'Đồng hồ thông minh', description: 'Đồng hồ thông minh thời thượng' },
  { name: 'Âm thanh', description: 'Thiết bị âm thanh cao cấp' }
];
// Trong hàm seed()
await Category.deleteMany({});
await Category.insertMany(categories);

seed();