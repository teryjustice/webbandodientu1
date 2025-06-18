import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// 🔸 Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const { userId, fullname, phone, address, payment, items } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      orderItems.push({
        product: product._id,
        quantity: item.quantity || 1,
        price: product.price
      });
    }

    const totalAmount = orderItems.reduce((sum, i) => sum + i.quantity * i.price, 0);

    const newOrder = new Order({
      userId,
      fullname,
      phone,
      address,
      payment,
      items: orderItems,
      totalAmount,
      status: 'Chờ xác nhận'
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('❌ Lỗi khi tạo đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// 🔸 Lấy lịch sử đơn hàng theo userId
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.product');
    res.json(orders);
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

export default router;
