document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const container = document.getElementById('product-detail');

  if (!productId) {
    container.innerHTML = '<p>Không tìm thấy sản phẩm</p>';
    return;
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
    const product = res.data;

    container.innerHTML = `
      <h2>${product.name}</h2>
      <img src="${product.image}" alt="${product.name}" style="max-width:300px">
      <p><strong>Giá:</strong> ${product.price.toLocaleString('vi-VN')}đ</p>
      <p>${product.description}</p>
      <button onclick="addToCart('${product._id}')">Thêm vào giỏ</button>
    `;
  } catch (err) {
    console.error('❌ Lỗi khi tải chi tiết sản phẩm:', err);
    container.innerHTML = '<p>Không tìm thấy sản phẩm</p>';
  }
});

// Hàm thêm sản phẩm vào giỏ hàng (dùng chung với các trang khác)
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
