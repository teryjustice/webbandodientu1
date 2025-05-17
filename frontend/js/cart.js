document.addEventListener('DOMContentLoaded', () => {
  fetchCart();
  document.getElementById('checkout').addEventListener('click', () => {
    alert('Chức năng thanh toán đang được phát triển!');
  });
});

async function fetchCart() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      document.querySelector('#cart-empty').style.display = 'block';
      document.querySelector('#cart-details').style.display = 'none';
      return;
    }

    const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
    const cart = response.data;
    const cartContainer = document.querySelector('#cart-items');
    cartContainer.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.productId.price * item.quantity;
      total += itemTotal;
      const cartItem = document.createElement('div');
      cartItem.innerHTML = `
        <p>${item.productId.name} - ${item.quantity} x ${item.productId.price.toLocaleString('vi-VN')} VNĐ = ${itemTotal.toLocaleString('vi-VN')} VNĐ</p>
      `;
      cartContainer.appendChild(cartItem);
    });

    document.querySelector('#subtotal').textContent = total.toLocaleString('vi-VN') + 'đ';
    document.querySelector('#total').textContent = total.toLocaleString('vi-VN') + 'đ';
    document.querySelector('#cart-empty').style.display = cart.length ? 'none' : 'block';
    document.querySelector('#cart-details').style.display = cart.length ? 'block' : 'none';
  } catch (err) {
    console.error('Error fetching cart:', err);
    document.querySelector('#cart-empty').style.display = 'block';
    document.querySelector('#cart-details').style.display = 'none';
  }
}