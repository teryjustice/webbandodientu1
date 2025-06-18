import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();


// GET tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục' });
  }
});

// POST - thêm mới danh mục
router.post('/', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const newCategory = new Category({ name, description, image });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm danh mục' });
  }
});

// PUT - cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
  }
});

// DELETE - xoá danh mục
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá danh mục' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá danh mục' });
  }
});

export default router;
