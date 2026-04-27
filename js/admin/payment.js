let updatingPaymentId = null;

// ============ BADGE PHƯƠNG THỨC ============
// Hiển thị tên phương thức thanh toán đẹp hơn

function methodBadge(method) {
  const map = {
    VNPAY: ["badge-info", "VNPay"],
    MOMO: ["badge-purple", "MoMo"],
    ZALOPAY: ["badge-blue", "ZaloPay"],
    CASH: ["badge-pending", "Tiền mặt"],
    BANK_TRANSFER: ["badge-success", "Chuyển khoản"],
  };
  const [cls, label] = map[method] || ["badge-pending", method];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ============ BADGE TRẠNG THÁI PAYMENT ============

function paymentStatusBadge(status) {
  const map = {
    PENDING: ["badge-pending", "Chờ xử lý"],
    COMPLETED: ["badge-success", "Hoàn thành"],
    CANCELLED: ["badge-danger", "Đã huỷ"],
  };
  const [cls, label] = map[status] || ["badge-pending", status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ============ STAT CARDS ============
// Tính từ data đã fetch — không cần gọi API thêm

function loadStatCards(payments) {
  // Tổng doanh thu - chỉ tính những giao dịch COMPLETED
  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const count = (status) => payments.filter((p) => p.status === status).length;

  document.getElementById("stat-total-revenue").textContent =
    formatPrice(totalRevenue);
  document.getElementById("stat-completed").textContent = count("COMPLETED");
  document.getElementById("stat-pending").textContent = count("PENDING");
  document.getElementById("stat-cancelled").textContent = count("CANCELLED");
}

// ============ LOAD DANH SÁCH ============

async function loadPayments(method = "", status = "") {
  const tbody = document.getElementById("paymentsTable");
  tbody.innerHTML = `<tr><td colspan="8" class="table-loading">Đang tải...</td></tr>`;

  try {
    const res = await apiFetch("/payments/admin/pay");
    let payments = res.data || [];

    // load stat cards từ toàn bộ data trước khi filter
    loadStatCards(payments);

    // Filter ở frontend - không cần gọi api thêm
    if (method) payments = payments.filter((p) => p.paymentMethod === method);
    if (status) payments = payments.filter((p) => p.status === status);

    if (!payments.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="table-loading">Không có giao dịch nào</td></tr>`;
      return;
    }

    tbody.innerHTML = payments
      .map(
        (p) => `
             <tr>
                <td><strong>#${p.id}</strong></td>
                <td>#${p.orderId}</td>
                <td>
                    <div>${p.order?.user?.fullName || "—"}</div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        ${p.order?.user?.email || ""}
                    </div>
                </td>
                <td style="font-weight:500; color:var(--green-primary);">
                    ${formatPrice(p.amount)}
                </td>
                <td>${methodBadge(p.paymentMethod)}</td>
                <td>${paymentStatusBadge(p.status)}</td>
                <td>${formatDate(p.createdAt)}</td>
                <td>
                    <button 
                        class="btn-action btn-edit" 
                        onclick="openStatusModal(${p.id}, ${p.orderId}, '${p.status}')"
                    >
                        Cập nhật
                    </button>
                </td>
            </tr>
            `,
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
    console.error("loadPayments: ", err);
  }
}

// Hàm submit gọi API PUT

// ============ MODAL ============

function openStatusModal(paymentId, orderId, currentStatus) {
  console.log("openStatusModal gọi với:", paymentId, orderId, currentStatus);

  updatingPaymentId = paymentId;

  document.getElementById("modalPaymentId").textContent = `${paymentId}`;
  document.getElementById("modalOrderId").textContent = `#${orderId}`;
  document.getElementById("selectStatus").value = currentStatus;
  document.getElementById("modalError").textContent = "";

  document.getElementById("modalStatus").classList.add("active");
}

function closeModal() {
  updatingPaymentId = null;
  document.getElementById("modalStatus").classList.remove("active");
}

async function submitStatus() {
  const status = document.getElementById("selectStatus").value;
  const errorEl = document.getElementById("modalError");
  const btnSubmit = document.getElementById("btnSubmitModal");

  try {
    btnSubmit.textContent = "Đang cập nhật...";
    btnSubmit.disabled = true;

    await apiFetch(`/payments/admin/${updatingPaymentId}/pay/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    closeModal();

    // Reload với filter hiện tại
    const method = document.getElementById("filterMethod").value;
    const filterStatus = document.getElementById("filterStatus").value;
    loadPayments(method, filterStatus);
  } catch (err) {
    errorEl.textContent = "Cập nhật thất bại. Vui lòng thử lại!";
    console.error("submitStatus:", err);
  } finally {
    btnSubmit.textContent = "Cập nhật";
    btnSubmit.disabled = false;
  }
}

// ============ INIT ============

document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAdminAuth()) return;

  renderSidebar("payment");
  startClock();

  // Gắn sự kiện modal
  document
    .getElementById("btnCloseModal")
    .addEventListener("click", closeModal);
  document
    .getElementById("btnCancelModal")
    .addEventListener("click", closeModal);
  document
    .getElementById("btnSubmitModal")
    .addEventListener("click", submitStatus);

  // Click re ngoài modal thì đóng
  document.getElementById("modalStatus").addEventListener("click", (e) => {
    if (e.target.id === "modalStatus") closeModal();
  });

  // Filter
  document.getElementById("filterMethod").addEventListener("change", (e) => {
    const status = document.getElementById("filterStatus").value;
    loadPayments(e.target.value, status);
  });

  document.getElementById("filterStatus").addEventListener("change", (e) => {
    const method = document.getElementById("filterMethod").value;
    loadPayments(method, e.target.value);
  });

  await loadPayments();
});
