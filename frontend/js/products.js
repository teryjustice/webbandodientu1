let currentPage = 1;
const productsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  // Lấy category từ query string (nếu có)
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  if (category) {
    document.getElementById('category').value = category;
  }

  document.getElementById('apply-filter').addEventListener('click', () => {
    currentPage = 1;
    fetchProducts();
  });
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts();
    }
  });
  document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchProducts();
  });
  fetchProducts();
});

async function fetchProducts() {
  try {
    const category = document.getElementById('category').value;
    const priceRange = document.getElementById('price').value;
    const sort = document.getElementById('sort').value;

    let minPrice, maxPrice;
    if (priceRange === 'under_5m') { minPrice = 0; maxPrice = 5000000; }
    if (priceRange === '5m_10m') { minPrice = 5000000; maxPrice = 10000000; }
    if (priceRange === '10m_20m') { minPrice = 10000000; maxPrice = 20000000; }
    if (priceRange === 'over_20m') { minPrice = 20000000; }

    const response = await axios.get('http://localhost:5000/api/products', {
      params: { category, minPrice, maxPrice, sort }
    });
    const products = response.data;
    const productContainer = document.querySelector('#product-list');
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

    document.getElementById('page-number').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = products.length < productsPerPage;
  } catch (err) {
    console.error('Error fetching products:', err);
    document.querySelector('#product-list').innerHTML = '<p>Lỗi khi tải sản phẩm</p>';
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