// ============================================
// ORDERS — orders.js
// ============================================

// Lưu id đơn hàng đang cập nhật trạng thái
let updatingOrderId = null;


// ============ LOAD STAT CARDS ============
// Đếm số đơn theo từng trạng thái

function loadStatCards(orders) {
    // Không cần gọi API thêm — đếm từ data đã có
    const count = (status) => orders.filter(o => o.status === status).length;

    document.getElementById('stat-pending').textContent    = count('PENDING');
    document.getElementById('stat-processing').textContent = count('PROCESSING');
    document.getElementById('stat-delivered').textContent  = count('DELIVERED');
    document.getElementById('stat-cancelled').textContent  = count('CANCELLED');
    document.getElementById('stat-returned').textContent   = count('RETURNED');
}


// ============ LOAD DANH SÁCH ĐƠN HÀNG ============

async function loadOrders(status = '') {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Đang tải...</td></tr>`;

    try {
        const res = await apiFetch('/orders/admin/orders');
        let orders = res.data || [];

        // Load stat cards từ toàn bộ data trước khi filter
        loadStatCards(orders);

        // Filter theo trạng thái nếu có chọn
        if (status) {
            orders = orders.filter(o => o.status === status);
        }

        if (!orders.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Không có đơn hàng nào</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div>${order.user?.fullName || '—'}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${order.user?.email || ''}</div>
                </td>
                <td>${order.items?.length || 0} sản phẩm</td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td>${statusBadge(order.status)}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="openDetailModal(${order.id})">
                        Chi tiết
                    </button>
                    <button class="btn-action btn-edit" onclick="openStatusModal(${order.id}, '${order.status}')">
                        Trạng thái
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
        console.error('loadOrders:', err);
    }
}


// ============ MODAL CẬP NHẬT TRẠNG THÁI ============

function openStatusModal(orderId, currentStatus) {
    updatingOrderId = orderId;

    // Hiện id đơn hàng trong modal
    document.getElementById('statusOrderId').textContent = `#${orderId}`;

    // Set trạng thái hiện tại vào select
    document.getElementById('selectStatus').value = currentStatus;

    document.getElementById('statusError').textContent = '';
    document.getElementById('modalStatus').classList.add('active');
}

function closeStatusModal() {
    updatingOrderId = null;
    document.getElementById('modalStatus').classList.remove('active');
}

async function submitStatus() {
    const status   = document.getElementById('selectStatus').value;
    const errorEl  = document.getElementById('statusError');
    const btnSubmit = document.getElementById('btnSubmitStatus');

    try {
        btnSubmit.textContent = 'Đang cập nhật...';
        btnSubmit.disabled    = true;

        await apiFetch(`/orders/admin/orders/${updatingOrderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });

        closeStatusModal();
        loadOrders(document.getElementById('filterStatus').value);

    } catch (err) {
        errorEl.textContent = 'Cập nhật thất bại. Vui lòng thử lại!';
        console.error('submitStatus:', err);
    } finally {
        btnSubmit.textContent = 'Cập nhật';
        btnSubmit.disabled    = false;
    }
}


// ============ MODAL CHI TIẾT ĐƠN HÀNG ============

async function openDetailModal(orderId) {
    document.getElementById('detailOrderId').textContent = `#${orderId}`;
    document.getElementById('detailContent').innerHTML   = `<p class="table-loading">Đang tải...</p>`;
    document.getElementById('modalDetail').classList.add('active');

    try {
        const res   = await apiFetch(`/orders/${orderId}`);
        const order = res.data || res;

        document.getElementById('detailContent').innerHTML = `

            <!-- THÔNG TIN KHÁCH HÀNG -->
            <div class="detail-section">
                <h3 class="detail-label">Khách hàng</h3>
                <p>${order.user?.fullName || '—'}</p>
                <p style="color:var(--text-muted);font-size:12px;">${order.user?.email || ''}</p>
            </div>

            <!-- TRẠNG THÁI + NGÀY ĐẶT -->
            <div class="detail-row">
                <div class="detail-section">
                    <h3 class="detail-label">Trạng thái</h3>
                    ${statusBadge(order.status)}
                </div>
                <div class="detail-section">
                    <h3 class="detail-label">Ngày đặt</h3>
                    <p>${formatDate(order.createdAt)}</p>
                </div>
            </div>

            <!-- DANH SÁCH SẢN PHẨM -->
            <div class="detail-section">
                <h3 class="detail-label">Sản phẩm</h3>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>SL</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items?.map(item => `
                            <tr>
                                <td>${item.product?.name || '—'}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${item.quantity}</td>
                                <td>${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('') || ''}
                    </tbody>
                </table>
            </div>

            <!-- TỔNG TIỀN -->
            <div style="text-align:right; padding:12px 0; border-top:1px solid var(--card-border); margin-top:8px;">
                <span style="font-size:14px; color:var(--text-secondary);">Tổng tiền: </span>
                <span style="font-size:16px; font-weight:600; color:var(--green-primary);">
                    ${formatPrice(order.totalAmount)}
                </span>
            </div>
        `;

    } catch (err) {
        document.getElementById('detailContent').innerHTML = `<p class="table-loading">Lỗi tải dữ liệu</p>`;
        console.error('openDetailModal:', err);
    }
}

function closeDetailModal() {
    document.getElementById('modalDetail').classList.remove('active');
}


// ============ INIT ============

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAdminAuth()) return;

    renderSidebar('orders');
    startClock();

    // Gắn sự kiện modal trạng thái
    document.getElementById('btnCloseStatus').addEventListener('click',  closeStatusModal);
    document.getElementById('btnCancelStatus').addEventListener('click', closeStatusModal);
    document.getElementById('btnSubmitStatus').addEventListener('click', submitStatus);

    // Gắn sự kiện modal chi tiết
    document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);

    // Click ra ngoài modal thì đóng
    document.getElementById('modalStatus').addEventListener('click', (e) => {
        if (e.target.id === 'modalStatus') closeStatusModal();
    });
    document.getElementById('modalDetail').addEventListener('click', (e) => {
        if (e.target.id === 'modalDetail') closeDetailModal();
    });

    // Filter theo trạng thái
    document.getElementById('filterStatus').addEventListener('change', (e) => {
        loadOrders(e.target.value);
    });

    await loadOrders();
});