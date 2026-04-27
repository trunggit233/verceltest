// Biến lưu trạng thái toàn trang
// Dùng để phân biệt đang thêm mới hay đang sửa
let editingProductId = null;

// ============ LOAD DANH MỤC ============
// Dùng để đổ vào <select> filter và form modal

async function loadCategories() {
    try {
        const res = await apiFetch('/categories');
        const categories = res.data || [];

        // Đổ vào select filter trên bảng
        const filterSelect = document.getElementById('filterCategory');

        // Đổ vào select trong modal form
        const inputSelect = document.getElementById('inputCategory');

        categories.forEach(cat => {
            // Tạo option rồi append vào cả hai select
            filterSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            inputSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

    } catch (err) {
        console.error('loadCategories:', err);
    }
}

// ============ LOAD DANH SÁCH SẢN PHẨM ============

async function loadProducts(search = '', categoryId = '') {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Đang tải...</td></tr>`;

    try {
        
        const params = new URLSearchParams();
        if (search)     params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);
        // Xây query string từ filter
        // ví dụ: ?search=iphone&categoryId=2
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await apiFetch(`/products${query}`);
        const products = res.data || [];
        console.log(products[0]);

        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Không có sản phẩm nào</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>
                    <img 
                        src="${p.images?.[0]?.url || 'https://placehold.co/48x48?text=No'}" 
                        alt="${p.name}"
                        style="width:48px;height:48px;object-fit:cover;border-radius:6px;"
                    >
                </td>
                <td>${p.name}</td>
                <td>${p.category?.name || '—'}</td>
                <td>${formatPrice(p.price)}</td>
                <td>${formatNumber(p.stock ?? 0)}</td>
                <td>${formatDate(p.createdAt)}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="openEditModal(${p.id})">Sửa</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${p.id}, '${p.name}')">Xoá</button>
                </td>
            </tr>
            `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
        console.error('loadProducts:', err);
    }
}

// ============ MODAL ============

function openAddModal() {
    // Reset trạng thái - đang thêm mới
    editingProductId = null;

    // Đổi tiêu đề modal
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm';

    // Xóa dữ liệu cũ trong form
    resetForm();

    // Hiện modal
    document.getElementById('modalOverlay').classList.add('active');
}

async function openEditModal(id) {
    // Lưu id đang sửa 
    editingProductId = id;

    document.getElementById('modalTitle').textContent = 'Sửa sản phẩm';
    document.getElementById('modalOverlay').classList.add('active');

    try {
        // fetch chi tiết sản phẩm rồi điền vào form
        const res = await apiFetch(`/products/${id}`);
        const p = res.data || res;

        document.getElementById('inputName').value = p.name || '';
        document.getElementById('inputPrice').value = p.price || '';
        document.getElementById('inputStock').value = p.stock || '';
        document.getElementById('inputDescription').value = p.description || '';
        document.getElementById('inputCategory').value = p.categoryId || '';

        // Hiện ảnh hiện tại nếu có
        if (p.images?.[0]?.url) {
            document.getElementById('imagePreview').innerHTML = 
            `<img src="${p.p.images?.[0]?.url}" alt="preview">`;
        }

    } catch (err) {
        console.error('openEditModal:', err);
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    resetForm();
}

function resetForm() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputPrice').value = '';
    document.getElementById('inputStock').value = '';
    document.getElementById('inputDescription').value = '';
    document.getElementById('inputCategory').value = '';
    document.getElementById('inputImage').value = '';
    document.getElementById('imagePreview').innerHTML = '<span>Chưa có ảnh</span>';
    document.getElementById('formError').textContent = '';
}

// ============ SUBMIT FORM (THÊM / SỬA) ============

async function submitForm() {
    // Lấy dữ liệu từ form
    const name        = document.getElementById('inputName').value.trim();
    const price       = document.getElementById('inputPrice').value;
    const stock       = document.getElementById('inputStock').value;
    const description = document.getElementById('inputDescription').value.trim();
    const categoryId  = document.getElementById('inputCategory').value;
    const imageFile   = document.getElementById('inputImage').files[0];
    const errorEl     = document.getElementById('formError');

    // Validate
    if (!name || !price || !stock || !categoryId) {
        errorEl.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc!';
        return;
    }

    errorEl.textContent = '';

    try {
        const btnSubmit = document.getElementById('btnSubmitModal');
        btnSubmit.textContent = 'Đang lưu...';
        btnSubmit.disabled = true;

        // Dùng FormData vì có upload ảnh
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        formData.append('categoryId', categoryId);
        if (imageFile) formData.append('image', imageFile);

        const token = localStorage.getItem('token');


        // Phân biệt thêm mới hay sửa bằng editingProductId
        const url = editingProductId
            ? `${API_BASE_URL}/products/${editingProductId}`
            : `${API_BASE_URL}/products`;
            const method = editingProductId ? 'PUT' : 'POST';

    
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                // Không set Content-Type để trình duyệt tự set boundary cho FormData
                body: formData,
            });
            
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Lỗi không xác định');

            // Thành công -> đóng modal, reload bảng
            closeModal();
            loadProducts();


    } catch (err) {
        document.getElementById('formError').textContent = friendlyError(err.message);
        console.error('[submitForm] Chi tiết lỗi:', err);
    } finally {
        const btnSubmit = document.getElementById('btnSubmitModal');
        btnSubmit.textContent = 'Lưu sản phẩm';
        btnSubmit.disabled = false;
    }
}


// ============ XOÁ SẢN PHẨM ============

async function deleteProduct(id, name) {
    // Xác nhận trước khi xóa
    if (!confirm(`Bạn chắc chắn muốn xóa "${name}"?`)) return;


    try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        // Xóa thành công -> reload bảng
        loadProducts();

    } catch (err) {
        alert('Xóa thất bại: ' + err.message);
        console.error('deleteProduct:', err);
    }
}

// ============ PREVIEW ẢNH TRƯỚC KHI UPLOAD ============

function initImagePreview() {
    document.getElementById('inputImage').addEventListener('change', (e) => {
       
        const file = e.target.files?.[0];
        if (!file) return;

        // Đọc file thành URL tạm để preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('imagePreview').innerHTML = 
            `<img src="${ev.target.result}" alt="preview">`;
        };
        reader.readAsDataURL(file);
    });
}

// ============ SEARCH + FILTER ============

function initSearchAndFilter() {
    let debounceTime;

    // Debounce search - chờ 400ms sau khi gõ mới gọi API
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(debounceTime);
        debounceTime = setTimeout(() => {
            const categoryId = document.getElementById('filterCategory').value;
            loadProducts(e.target.value, categoryId);
        }, 400);
    });

    // Filter theo danh mục - gọi API ngay khi chọn
    document.getElementById('filterCategory').addEventListener('change', (e) => {
        const search = document.getElementById('searchInput').value;
        loadProducts(search, e.target.value);
    });
}

// Hàm Dịch lỗi
function friendlyError(message) {
    const errorMap = {
        'length is not defined':     'Lỗi xử lý ảnh. Vui lòng thử lại!',
        'Không tìm thấy sản phẩm':   'Sản phẩm không tồn tại!',
        'Danh mục không tồn tại':    'Danh mục không hợp lệ!',
        'Invalid value':             'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!',
    };

    // Tìm key nào khớp với message
    const key = Object.keys(errorMap).find(k => message?.includes(k));
    return key ? errorMap[key] : 'Có lỗi xảy ra. Vui lòng thử lại!';
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAdminAuth();
    if (!user) return;

    renderSidebar('products');
    startClock();

    // Gắn sự kiện các nút
    document.getElementById('btnOpenAdd').addEventListener('click', openAddModal);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('btnCancelModal').addEventListener('click', closeModal);
    document.getElementById('btnSubmitModal').addEventListener('click', submitForm);

    // Click ra ngoài modal thì đóng
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });

    initImagePreview();
    initSearchAndFilter();

    // Load data
    await Promise.all([
        loadCategories(),
        loadProducts(),
    ]);

});