document.addEventListener('DOMContentLoaded', () => {
  fetchFeaturedProducts();
});

async function fetchFeaturedProducts() {
  try {
    const response = await axios.get('http://localhost:5000/api/products', {
      params: { limit: 4 } // Giới hạn 4 sản phẩm nổi bật
    });
    const products = response.data;
    const productContainer = document.querySelector('#featured-products');
    productContainer.innerHTML = '';

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Giá: ${product.price.toLocaleString('vi-VN')} VNĐ</p>
        <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
      `;
      productContainer.appendChild(productCard);
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    document.querySelector('#featured-products').innerHTML = '<p>Lỗi khi tải sản phẩm</p>';
  }
}

async function addToCart(productId) {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      window.location.href = 'login.html';
      return;
    }
    await axios.post('http://localhost:5000/api/cart/add', {
      userId,
      productId,
      quantity: 1
    });
    alert('Sản phẩm đã được thêm vào giỏ hàng');
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Không thể thêm sản phẩm vào giỏ hàng');
  }
}