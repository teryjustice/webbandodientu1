// Cho login.html
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('userId', response.data.userId);
    alert('Đăng nhập thành công');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Đăng nhập thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
  }
});

// Cho register.html
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert('Mật khẩu không khớp');
    return;
  }

  try {
    await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
    alert('Đăng ký thành công, vui lòng đăng nhập');
    window.location.href = 'login.html';
  } catch (err) {
    alert('Đăng ký thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
  }
});