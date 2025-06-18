// backend/routes/cart.js
import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';

const router = express.Router();

// Helper: kiểm tra ObjectId hợp lệ
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST: Thêm sản phẩm vào giỏ hàng
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    console.log('POST /cart/add:', { userId, productId, quantity }); // Log giá trị nhận được

    if (!userId || !productId) {
      console.log('❌ Thiếu userId hoặc productId:', { userId, productId });
      return res.status(400).json({ message: 'Thiếu userId hoặc productId' });
    }
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      console.log('❌ userId hoặc productId không hợp lệ:', { userId, productId });
      return res.status(400).json({ message: 'userId hoặc productId không hợp lệ', userId, productId });
    }

    // Sửa lại dùng new mongoose.Types.ObjectId
    const objectUserId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ userId: objectUserId });

    if (!cart) {
      cart = new Cart({
        userId: objectUserId,
        items: [{ productId, quantity: quantity || 1 }]
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ productId, quantity: quantity || 1 });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Đã thêm sản phẩm vào giỏ hàng' });
  } catch (err) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
    if (err && err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error('Field error:', key, err.errors[key].message);
      });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message, stack: err.stack });
  }
});

// GET: Lấy giỏ hàng theo userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: objectUserId }).populate('items.productId');
    if (!cart) return res.json([]);
    res.status(200).json(cart.items);
  } catch (err) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT: Cập nhật số lượng sản phẩm
router.put('/update', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ message: 'Thiếu thông tin hoặc số lượng không hợp lệ' });
    }
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: 'userId hoặc productId không hợp lệ' });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: objectUserId });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ message: 'Cập nhật số lượng thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật số lượng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// DELETE: Xoá sản phẩm khỏi giỏ hàng
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc productId' });
    }
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: 'userId hoặc productId không hợp lệ' });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: objectUserId });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: 'Đã xoá sản phẩm khỏi giỏ hàng' });
  } catch (err) {
    console.error('❌ Lỗi khi xoá sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// DELETE: Xoá sản phẩm khỏi giỏ hàng bằng cartItemId
router.delete('/remove-by-cartitemid', async (req, res) => {
  try {
    const { userId, cartItemId } = req.body;
    if (!userId || !cartItemId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc cartItemId' });
    }
    if (!isValidObjectId(userId) || !isValidObjectId(cartItemId)) {
      return res.status(400).json({ message: 'userId hoặc cartItemId không hợp lệ' });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: objectUserId });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);
    await cart.save();
    res.status(200).json({ message: 'Đã xoá sản phẩm khỏi giỏ hàng (cartItemId)' });
  } catch (err) {
    console.error('❌ Lỗi khi xoá sản phẩm (cartItemId):', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

export default router;
