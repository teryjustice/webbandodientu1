async function loadFlashSaleProducts() {
  try {
    const res = await axios.get('http://localhost:5000/api/products?limit=10');
    const products = res.data;

    const slider = document.getElementById('flash-sale-slider');
    slider.innerHTML = '';

        products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'flash-sale-item';

    item.innerHTML = `
        <a href="product-detail.html?id=${p._id}" class="product-link">
        <img src="${p.image}" alt="${p.name}" />
        <div class="name">${p.name}</div>
        <div class="price">x.${p.price.toLocaleString('vi-VN')}đ</div>
        <div class="old-price">4.990.000đ</div>
        <div class="status">🔥 Đã bán: ${Math.floor(Math.random() * 50 + 10)}</div>
    </a>
  `;

    slider.appendChild(item);
    });
  } catch (err) {
    console.error('❌ Lỗi khi load flash sale:', err);
  }
}



document.addEventListener('DOMContentLoaded', loadFlashSaleProducts);
