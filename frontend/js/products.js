let currentPage = 1;
const productsPerPage = 6;
let prevPageBtn, nextPageBtn;

document.addEventListener('DOMContentLoaded', () => {
  console.log("🟢 DOM loaded, gọi fetchProducts()");
  fetchProducts();

  const user = JSON.parse(localStorage.getItem('user'));
  const adminSection = document.getElementById('adminProductActions');
  if (user?.role === 'admin' && adminSection) {
    adminSection.style.display = 'block';
  }

  prevPageBtn = document.getElementById('prev-page');
  nextPageBtn = document.getElementById('next-page');

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        fetchProducts();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      currentPage++;
      fetchProducts();
    });
  }

  const applyFilterBtn = document.getElementById('apply-filter');
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = 1;
      fetchProducts();
    });
  }

  // Xử lý bộ lọc sản phẩm
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      currentPage = 1;
      fetchProducts();
    });
  }
});

async function fetchProducts() {
  console.log("📦 fetchProducts được gọi");
  try {
    const category = document.getElementById('category')?.value || '';
    const priceRange = document.getElementById('price')?.value || '';
    const sort = document.getElementById('sort')?.value || '';

    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (priceRange === 'under_5m') {
      queryParams.append('minPrice', '0');
      queryParams.append('maxPrice', '5000000');
    } else if (priceRange === '5m_10m') {
      queryParams.append('minPrice', '5000000');
      queryParams.append('maxPrice', '10000000');
    } else if (priceRange === '10m_20m') {
      queryParams.append('minPrice', '10000000');
      queryParams.append('maxPrice', '20000000');
    } else if (priceRange === 'over_20m') {
      queryParams.append('minPrice', '20000000');
    }
    if (sort) queryParams.append('sort', sort);

    const response = await axios.get(`http://localhost:5000/api/products?${queryParams.toString()}`);
    const products = response.data;

    const start = (currentPage - 1) * productsPerPage;
    const paginated = products.slice(start, start + productsPerPage);

    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;
    productContainer.innerHTML = '';

    paginated.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('product-item');
      card.innerHTML = `
        <img src="${product.image && product.image.trim() !== '' ? product.image : 'http://localhost:5000/images/default.jpg'}" alt="${product.name}">
        <h4><a href="product-detail.html?id=${product._id}">${product.name}</a></h4>
        <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
        <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
      `;
      productContainer.appendChild(card);
    });

    const pageNumberElem = document.getElementById('page-number');
    if (pageNumberElem) pageNumberElem.textContent = currentPage;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = start + productsPerPage >= products.length;
  } catch (err) {
    console.error('❌ Lỗi khi tải sản phẩm:', err);
    const productContainer = document.getElementById('product-list');
    if (productContainer) {
      productContainer.innerHTML = '<p>Lỗi khi tải sản phẩm</p>';
    }
  }
}

// Thêm vào giỏ hàng
async function addToCart(productId) {
  const user = JSON.parse(localStorage.getItem('user'));
  // Kiểm tra userId hợp lệ
  if (!user || !user._id || !/^\w{24}$/.test(user._id)) {
    alert('Bạn cần đăng nhập lại để thêm sản phẩm vào giỏ hàng!');
    return;
  }
  // Kiểm tra productId hợp lệ
  if (!/^\w{24}$/.test(productId)) {
    alert('Mã sản phẩm không hợp lệ!');
    return;
  }
  try {
    const res = await axios.post('http://localhost:5000/api/cart/add', {
      userId: user._id,
      productId,
      quantity: 1
    });
    alert('Sản phẩm đã được thêm vào giỏ hàng');
  } catch (err) {
    // Hiển thị lỗi chi tiết nếu có
    if (err.response && err.response.data && err.response.data.message) {
      alert('Lỗi: ' + err.response.data.message);
    } else {
      alert('Không thể thêm sản phẩm vào giỏ hàng');
    }
    console.error('❌ Lỗi khi thêm sản phẩm vào giỏ hàng:', err?.response?.data || err);
  }
}

// Thêm hàm tìm kiếm sản phẩm
function searchProducts() {
  const searchInput = document.getElementById('searchInput');
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (!keyword) {
    fetchProducts(); // Hiển thị lại tất cả nếu không nhập gì
    return;
  }
  // Luôn tìm theo tên sản phẩm (không lọc theo category nữa)
  axios.get('http://localhost:5000/api/products')
    .then(res => {
      const products = res.data.filter(product =>
        product.name && product.name.toLowerCase().includes(keyword)
      );
      renderSearchedProducts(products);
    })
    .catch(err => {
      console.error('Lỗi khi tìm kiếm sản phẩm:', err);
    });
}

// Hàm render kết quả tìm kiếm
function renderSearchedProducts(products) {
  const productContainer = document.getElementById('product-list');
  if (!productContainer) return;
  productContainer.innerHTML = '';
  if (products.length === 0) {
    productContainer.innerHTML = '<p>Không tìm thấy sản phẩm phù hợp.</p>';
    return;
  }
  const user = JSON.parse(localStorage.getItem('user'));
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-item');
    card.innerHTML = `
      <img src="${product.image && product.image.trim() !== '' ? product.image : 'http://localhost:5000/images/default.jpg'}" alt="${product.name}">
      <h4><a href="product-detail.html?id=${product._id}">${product.name}</a></h4>
      <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
      <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
      ${user && user.role === 'admin' ? `<button class="edit-btn" onclick="openEditProductModal('${product._id}')">Sửa</button>` : ''}
    `;
    productContainer.appendChild(card);
  });
}

// Thêm nút sửa cho admin khi render sản phẩm bình thường
function renderProductsWithEdit(products) {
  const productContainer = document.getElementById('product-list');
  if (!productContainer) return;
  productContainer.innerHTML = '';
  const user = JSON.parse(localStorage.getItem('user'));
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-item');
    card.innerHTML = `
      <img src="${product.image && product.image.trim() !== '' ? product.image : 'http://localhost:5000/images/default.jpg'}" alt="${product.name}">
      <h4><a href="product-detail.html?id=${product._id}">${product.name}</a></h4>
      <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
      <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
      ${user && user.role === 'admin' ? `<button class="edit-btn" onclick="openEditProductModal('${product._id}')">Sửa</button>` : ''}
    `;
    productContainer.appendChild(card);
  });
}

// Hàm mở modal sửa sản phẩm
function openEditProductModal(productId) {
  axios.get(`http://localhost:5000/api/products/${productId}`)
    .then(res => {
      const product = res.data;
      showEditProductModal(product);
    })
    .catch(err => {
      alert('Không thể lấy thông tin sản phẩm để sửa');
      console.error(err);
    });
}

// Hàm hiển thị modal sửa sản phẩm
function showEditProductModal(product) {
  let modal = document.getElementById('editProductModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editProductModal';
    modal.innerHTML = `
      <div class="modal-content" style="background:#fff;padding:20px;max-width:400px;margin:40px auto;border-radius:8px;box-shadow:0 2px 8px #0002;position:relative;">
        <span id="closeEditModal" style="position:absolute;top:8px;right:12px;cursor:pointer;font-size:20px;">&times;</span>
        <h3>Sửa sản phẩm</h3>
        <form id="editProductForm">
          <input type="hidden" name="_id" value="${product._id}">
          <div><label>Tên:</label><input type="text" name="name" value="${product.name || ''}" required></div>
          <div><label>Giá:</label><input type="number" name="price" value="${product.price || 0}" required></div>
          <div><label>Ảnh:</label><input type="text" name="image" value="${product.image || ''}"></div>
          <div><label>Danh mục:</label><input type="text" name="category" value="${product.category || ''}"></div>
          <div><label>Mô tả:</label><textarea name="description">${product.description || ''}</textarea></div>
          <button type="submit">Lưu</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.querySelector('input[name="_id"]').value = product._id;
    modal.querySelector('input[name="name"]').value = product.name || '';
    modal.querySelector('input[name="price"]').value = product.price || 0;
    modal.querySelector('input[name="image"]').value = product.image || '';
    modal.querySelector('input[name="category"]').value = product.category || '';
    modal.querySelector('textarea[name="description"]').value = product.description || '';
    modal.style.display = 'block';
  }
  modal.style.display = 'block';
  document.getElementById('closeEditModal').onclick = function() {
    modal.style.display = 'none';
  };
  document.getElementById('editProductForm').onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    axios.put(`http://localhost:5000/api/products/${data._id}`, data)
      .then(() => {
        alert('Cập nhật sản phẩm thành công!');
        modal.style.display = 'none';
        fetchProducts();
      })
      .catch(err => {
        alert('Lỗi khi cập nhật sản phẩm!');
        console.error(err);
      });
  };
}
