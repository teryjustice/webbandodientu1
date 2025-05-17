const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Lấy danh sách sản phẩm (hỗ trợ lọc và sắp xếp)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
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

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;