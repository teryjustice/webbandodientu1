// Đăng nhập
async function login(event) {
  event.preventDefault();
  console.log(">> Login function is working");

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("🟡 Gửi login với:", email, password);

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log("✅ Response nhận được:", response);

    const data = await response.json();
    console.log("📦 Dữ liệu JSON trả về:", data);

    const successMsg = document.getElementById('loginSuccess');
    const errorMsg = document.getElementById('loginError');

    if (response.ok && data.user) {
      console.log("✅ Đăng nhập thành công, lưu localStorage");

      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        token: data.token
      }));

      successMsg.style.display = 'block';
      errorMsg.style.display = 'none';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      const message = data.message || 'Đăng nhập thất bại';
      console.warn("⚠️ Đăng nhập không thành công:", message);
      errorMsg.textContent = message;
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
    }

  } catch (err) {
    console.error("❌ Lỗi khi gửi request login:", err);
    const errorMsg = document.getElementById('loginError');
    errorMsg.textContent = 'Lỗi kết nối server';
    errorMsg.style.display = 'block';
    document.getElementById('loginSuccess').style.display = 'none';
  }
}


// Đăng ký
async function register(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  const errorMsg = document.getElementById('registerError');
  if (!username) {
    errorMsg.textContent = 'Vui lòng nhập họ tên.';
    errorMsg.style.display = 'block';
    return;
  }
  if (password !== confirmPassword) {
    errorMsg.textContent = 'Mật khẩu xác nhận không khớp';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    const successMsg = document.getElementById('registerSuccess');

    if (response.ok) {
      // Đăng ký thành công, tự động đăng nhập luôn
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.user) {
        localStorage.setItem('user', JSON.stringify({ ...loginData.user, token: loginData.token }));
        successMsg.textContent = 'Đăng ký thành công! Đang chuyển hướng...';
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        successMsg.textContent = 'Đăng ký thành công! Vui lòng đăng nhập.';
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
    } else {
      errorMsg.textContent = data.message || 'Đăng ký thất bại';
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
    }
  } catch (err) {
    errorMsg.textContent = err.message || 'Lỗi kết nối server';
    errorMsg.style.display = 'block';
    document.getElementById('registerSuccess').style.display = 'none';
  }
}

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem('user'));

  const userInfo = document.getElementById('userInfo');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');
  const accountLink = document.getElementById('accountLink');
  const adminLink = document.getElementById('adminLink');
  const loggedInContent = document.getElementById('loggedInContent');
  const notLoggedInContent = document.getElementById('notLoggedInContent');
  const accountUsername = document.getElementById('accountUsername');
  const accountEmail = document.getElementById('accountEmail');
  const orderHistory = document.getElementById('orderHistory');

  // ✅ Cách kiểm tra trang an toàn hơn
  const currentURL = window.location.href;
  const isLoginPage = currentURL.includes('login');
  const isRegisterPage = currentURL.includes('register');

  if (user) {
    if (userInfo) {
      userInfo.textContent = `Chào ${user.username || user.email}!`;
      userInfo.style.display = 'inline';
    }

    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
    if (accountLink) accountLink.style.display = 'inline';
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'inline' : 'none';

    if (loggedInContent) loggedInContent.style.display = 'block';
    if (notLoggedInContent) notLoggedInContent.style.display = 'none';

    if (accountUsername) accountUsername.textContent = user.username || 'Không có';
    if (accountEmail) accountEmail.textContent = user.email;
    if (orderHistory) {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orderHistory.innerHTML = orders.length
        ? orders.map(order => `<li>${order}</li>`).join('')
        : '<li>Chưa có đơn hàng nào.</li>';
    }
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline';
    if (registerLink) registerLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
    if (accountLink) accountLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';

    if (loggedInContent) loggedInContent.style.display = 'none';
    if (notLoggedInContent) notLoggedInContent.style.display = 'block';

    // ✅ Chỉ redirect nếu KHÔNG ở login/register
    if (!isLoginPage && !isRegisterPage) {
      alert('Vui lòng đăng nhập để tiếp tục!');
      window.location.href = 'login.html';
    }
  }
}

// Đăng xuất
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Tìm kiếm (demo)
function searchProducts() {
  const searchInput = document.getElementById('searchInput').value;
  alert(`Tìm kiếm: ${searchInput}`);
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) loginForm.addEventListener('submit', login);
  if (registerForm) registerForm.addEventListener('submit', register);
  checkLoginStatus();
});
