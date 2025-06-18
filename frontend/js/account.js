// Kiểm tra đăng nhập và khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo(user._id);
    loadOrderHistory(user._id);
});

// Load thông tin người dùng
async function loadUserInfo(userId) {
    try {
        const response = await axios.get(`http://localhost:5000/api/auth/profile/${userId}`);
        const user = response.data;

        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
    } catch (error) {
        showError('Không thể tải thông tin người dùng');
        console.error('Error loading user info:', error);
    }
}

// Cập nhật thông tin cá nhân
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value
    };

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    try {
        await axios.put(`http://localhost:5000/api/auth/profile/${user._id}`, formData);
        showSuccess('Cập nhật thông tin thành công');
    } catch (error) {
        showError('Không thể cập nhật thông tin');
        console.error('Error updating profile:', error);
    }
});

// Load lịch sử đơn hàng
async function loadOrderHistory(userId) {
    try {
        const response = await axios.get(`http://localhost:5000/api/orders/${userId}`);
        const orders = response.data;
        console.log("🧾 Orders từ server:", orders);
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
            return;
        }

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Mã đơn hàng: ${order._id}</span>
                    <span class="order-date">Ngày đặt: ${new Date(order.createdAt).toLocaleDateString()}</span>
                    <span class="order-status">Trạng thái: ${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => {
                        let imageUrl = 'images/default.jpg';
                        if (item.product?.image) {
                            // Nếu là đường dẫn tuyệt đối (http/https), giữ nguyên, còn lại ghép /images/
                            if (item.product.image.startsWith('http')) {
                                imageUrl = item.product.image;
                            } else {
                                imageUrl = 'images/' + item.product.image;
                            }
                        }
                        return `
                            <div class="order-item-detail">
                                <img src="${imageUrl}" alt="${item.product?.name || 'Sản phẩm'}" class="order-item-image">
                                <div class="order-item-info">
                                    <h4><a href="product-detail.html?id=${item.product?._id}" target="_blank">${item.product?.name || 'Sản phẩm'}</a></h4>
                                    <p>Số lượng: ${item.quantity}</p>
                                    <p>Giá: ${(item.price || 0).toLocaleString('vi-VN')}đ</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="order-total">
                    <strong>Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')}đ</strong>
                </div>
            `;
            ordersList.appendChild(orderElement);
        });
    } catch (error) {
        showError('Không thể tải lịch sử đơn hàng');
        console.error('Error loading order history:', error);
    }
}

// Hiển thị thông báo thành công
function showSuccess(message) {
    const successMessage = document.getElementById('success-message');
    if (!successMessage) return;
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Hiển thị thông báo lỗi
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}
