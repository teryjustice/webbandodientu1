document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#featured-products')) {
    loadFeaturedProducts();
  }

  if (document.querySelector('#all-products')) {
    loadAllProducts();
  }
});

// Hàm lưu sản phẩm vào localStorage
function saveProductsToLocal(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// Hàm lấy sản phẩm từ localStorage
function getProductsFromLocal() {
  const data = localStorage.getItem('products');
  return data ? JSON.parse(data) : null;
}

// Hiển thị sản phẩm nổi bật (limit: 4)
async function loadFeaturedProducts() {
  const localProducts = getProductsFromLocal();

  if (localProducts && localProducts.length >= 4) {
    renderProducts(localProducts.slice(0, 4), '#featured-products');
  } else {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const products = response.data;
      saveProductsToLocal(products);
      renderProducts(products.slice(0, 4), '#featured-products');
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    }
  }
}

// Hiển thị toàn bộ sản phẩm (trang products.html)
async function loadAllProducts() {
  const localProducts = getProductsFromLocal();

  if (localProducts) {
    renderProducts(localProducts, '#all-products');
  } else {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const products = response.data;
      saveProductsToLocal(products);
      renderProducts(products, '#all-products');
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    }
  }
}

// Hàm render danh sách sản phẩm ra một container
function renderProducts(products, selector) {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Không tìm thấy phần tử ${selector}`);
    return;
  }
  container.innerHTML = '';
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.image && product.image.trim() !== '' ? product.image : 'http://localhost:5000/images/default.jpg'}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Giá: ${product.price.toLocaleString('vi-VN')} VNĐ</p>
      <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
    `;
    container.appendChild(productCard);
  });
}

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(productId) {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    let userId = user && (user._id || user.id || user.userId);
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
    console.error('Lỗi khi thêm vào giỏ hàng:', err);
    alert('Không thể thêm sản phẩm vào giỏ hàng');
  }
}
