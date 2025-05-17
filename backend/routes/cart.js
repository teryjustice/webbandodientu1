const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Thêm sản phẩm vào giỏ hàng
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    await user.save();
    res.json({ message: 'Product added to cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy giỏ hàng
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.productId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;