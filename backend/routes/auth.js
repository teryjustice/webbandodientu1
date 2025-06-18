// auth.js (ES Module)

import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Đảm bảo file User cũng là ES module

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên (username).' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // ✅ Trả về thông tin người dùng để frontend lưu
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user' // Mặc định nếu thiếu
      },
      token: 'mock-token' // Bạn có thể thay bằng JWT nếu cần
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LẤY THÔNG TIN USER THEO ID
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// CẬP NHẬT THÔNG TIN USER
router.put('/profile/:id', async (req, res) => {
  try {
    const update = {
      username: req.body.username,
      phone: req.body.phone,
      address: req.body.address,
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
