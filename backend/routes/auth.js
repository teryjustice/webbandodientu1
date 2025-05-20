// auth.js (ES Module)

import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Đảm bảo file User cũng là ES module

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });
    res.json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
