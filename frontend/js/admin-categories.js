document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    alert('Chỉ admin mới có quyền truy cập trang này!');
    window.location.href = 'index.html';
    return;
  }

  fetchCategories();

  document.getElementById('add-category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;

    try {
      await axios.post('http://localhost:5000/api/categories', { name, description, image });
      alert('Thêm thành công!');
      fetchCategories();
      e.target.reset();
    } catch (err) {
      alert('Lỗi khi thêm danh mục');
      console.error(err);
    }
  });
});

async function fetchCategories() {
  try {
    const res = await axios.get('http://localhost:5000/api/categories');
    const list = document.getElementById('category-list');
    list.innerHTML = '';

    res.data.forEach(cat => {
      const item = document.createElement('div');
      item.innerHTML = `
        <h4>${cat.name}</h4>
        <p>${cat.description || ''}</p>
        <img src="${cat.image || ''}" alt="" style="width:100px" />
        <button onclick="deleteCategory('${cat._id}')">Xoá</button>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error('Lỗi lấy danh mục:', err);
  }
}

async function deleteCategory(id) {
  if (!confirm('Bạn có chắc muốn xoá?')) return;
  try {
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
    fetchCategories();
  } catch (err) {
    console.error('Lỗi xoá:', err);
  }
}
