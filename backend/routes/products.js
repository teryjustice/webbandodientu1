// products.js (ES Module)

import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// POST: Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    const product = new Product({ name, description, price, image, category });
    await product.save();
    res.status(201).json(product); // Trả về object sản phẩm vừa tạo
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
});

// GET: Lấy danh sách sản phẩm với lọc & sắp xếp
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, limit } = req.query;
    let query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    if (sort === 'price_desc') sortOption.price = -1;
    if (sort === 'name_asc') sortOption.name = 1;

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 0);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET: Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

export default router;
