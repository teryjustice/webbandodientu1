// Lấy giỏ hàng từ backend qua API
async function getCart() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user._id; // Chỉ lấy _id cho đồng nhất
  if (!userId) return [];

  try {
    const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
    return res.data || [];
  } catch (err) {
    console.error('❌ Lỗi lấy giỏ hàng:', err);
    return [];
  }
}

// Hiển thị giỏ hàng
async function displayCart() {
  const cartItems = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartDetails = document.getElementById('cart-details');
  const cart = await getCart();

  if (!cart || cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartDetails.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  cartDetails.style.display = 'block';
  cartItems.innerHTML = '';

  cart.forEach(item => {
    const product = item.productId;
    if (!product) {
      console.warn('Sản phẩm không tồn tại hoặc không lấy được thông tin:', item);
      // Nếu productId bị null, tự động xoá khỏi giỏ hàng
      if (item._id) removeItemByCartItemId(item._id);
      return; // Bỏ qua item lỗi
    }
    const quantity = item.quantity;
    const price = product.price;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${product.image || 'http://localhost:5000/images/default.jpg'}" alt="${product.name}">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p>Giá: ${price.toLocaleString('vi-VN')}đ</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateQuantity('${product._id}', ${quantity - 1})">-</button>
          <span>${quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity('${product._id}', ${quantity + 1})">+</button>
          <button class="remove-btn" onclick="removeItem('${product._id}')">Xoá</button>
        </div>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });

  updateTotal(cart);
}

// Cập nhật tổng tiền
function updateTotal(cart) {
  // Lọc ra các item hợp lệ có productId và productId.price
  const validItems = cart.filter(item => item.productId && typeof item.productId.price === 'number');
  const subtotal = validItems.reduce((sum, item) => sum + item.quantity * item.productId.price, 0);
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = `${subtotal.toLocaleString('vi-VN')}đ`;
  document.getElementById('shipping').textContent = `${shipping.toLocaleString('vi-VN')}đ`;
  document.getElementById('total').textContent = `${total.toLocaleString('vi-VN')}đ`;
}

// Sửa số lượng sản phẩm trong giỏ
async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) return;

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user._id;
  if (!userId) return;

  try {
    await axios.put(`http://localhost:5000/api/cart/update`, {
      userId,
      productId,
      quantity: newQuantity
    });
    displayCart();
  } catch (err) {
    console.error('❌ Lỗi cập nhật số lượng:', err);
  }
}

// Xoá sản phẩm khỏi giỏ
async function removeItem(productId) {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user._id;
  if (!userId) return;

  try {
    await axios.delete(`http://localhost:5000/api/cart/remove`, {
      data: { userId, productId }
    });
    displayCart();
  } catch (err) {
    console.error('❌ Lỗi xoá sản phẩm:', err);
  }
}

// Thêm hàm xoá item theo _id của cart item (dùng cho trường hợp productId null)
async function removeItemByCartItemId(cartItemId) {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user._id;
  if (!userId) return;

  try {
    await axios.delete(`http://localhost:5000/api/cart/remove-by-cartitemid`, {
      data: { userId, cartItemId }
    });
    displayCart();
  } catch (err) {
    console.error('❌ Lỗi xoá sản phẩm (cartItemId):', err);
  }
}

// Gửi đơn hàng
document.getElementById('checkout-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const cart = await getCart();
  if (!cart || cart.length === 0) return alert('Giỏ hàng trống');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user._id;
  if (!userId) return alert('Bạn chưa đăng nhập!');

  const order = {
    userId,
    fullname: document.getElementById('fullname').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    payment: document.getElementById('payment').value,
    items: cart.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity
    })),
    total: cart.reduce((sum, item) => sum + item.quantity * item.productId.price, 0) + 30000
  };

  try {
    const res = await axios.post('http://localhost:5000/api/orders', order);
    if (res.data.success) {
      document.getElementById('success-message').textContent = '🟢 Đặt hàng thành công!';
      document.getElementById('success-message').style.display = 'block';
      this.reset();
      displayCart();

      setTimeout(() => {
        window.location.href = 'account.html';
      }, 3000);
    } else {
      alert('Đặt hàng thất bại, thử lại sau!');
    }
  } catch (err) {
    console.error('❌ Lỗi đặt hàng:', err);
    alert('Có lỗi xảy ra khi đặt hàng.');
  }
});

// Bắt đầu
document.addEventListener('DOMContentLoaded', () => {
  displayCart();
});
