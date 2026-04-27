let updatingOrderId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Kiểm tra quyền admin
  const user = checkAdminAuth();
  if (!user) return;

  renderSidebar("shipping");

  startClock();

  initSearchAndFilter();

  loadShipments();

  statusBadge();
});

/**
 * Khởi tạo sự kiện Tìm kiếm (Debounce) và Lọc
 */
function initSearchAndFilter() {
  let debounceTime;
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  // Lắng nghe sự kiện gõ phím
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTime);
    debounceTime = setTimeout(() => {
      loadShipments(e.target.value, statusFilter.value);
    }, 400);
  });

  // Lắng nghe sự kiện chọn Dropdown trạng thái
  statusFilter.addEventListener("change", (e) => {
    loadShipments(searchInput.value, e.target.value);
  });
}

/**
 * Tải danh sách Vận chuyển từ API
 */
async function loadShipments(search = "", status = "") {
  const tbody = document.getElementById("shipmentsTable");
  tbody.innerHTML = `<tr><td colspan="6" class="table-loading">Đang tải...</td></tr>`;

  try {
    // Build query string (Tương lai sẽ viết API GET hỗ trợ search/status)
    // Hiện tại cứ gọi API lấy danh sách orders/shipments
    let url = `/shipments/admin/shipments`; // Giả định Route
    if (search || status) {
      url += `?search=${search}&status=${status}`;
    }

    const res = await apiFetch(url);
    let shipments = res.data || [];

    if (!shipments.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Không tìm thấy dữ liệu vận chuyển nào.</td></tr>`;
      return;
    }

    // Render bảng dữ liệu
    tbody.innerHTML = shipments
      .map((s) => {
        const carrierText =
          s.carrier || '<span style="color:#999;">Chưa cập nhật</span>';
        const trackingText =
          s.trackingNumber || '<span style="color:#999;">—</span>';

        // Xử lý thời gian hiển thị (Ưu tiên hiện ngày Giao thành công nếu có)
        const timeDisplay = s.delivereAt
          ? formatDate(s.delivereAt)
          : s.shippedAt
            ? formatDate(s.shippedAt)
            : "—";

        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px;"><strong>#${s.orderId}</strong></td>
            <td style="padding: 15px;">${carrierText}</td>
            <td style="padding: 15px; font-family: monospace; color: #3b82f6;">${trackingText}</td>
            <td style="padding: 15px;">${statusBadge(s.status)}</td>
            <td style="padding: 15px; color: #666;">${timeDisplay}</td>
            <td style="padding: 15px;">
                <button class="btn-action btn-edit"" 
                    onclick="openShipmentModal(${s.orderId}, '${s.carrier || ""}', '${s.trackingNumber || ""}', '${s.status}')">
                    Cập nhật
                </button>
            </td>
         </tr>
          `;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-loading">Lỗi tải dữ liệu. Vui lòng thử lại!</td></tr>`;
    console.error("Lỗi loadShipments:", err);
  }
}

/**
 * Gửi dữ liệu cập nhật lên Backend
 */
async function submitShipmentUpdate() {
  console.log("ĐÃ BẤM NÚT LƯU THAY ĐỔI!");
  const carrier = document.getElementById("inputCarrier").value.trim();
  const trackingNumber = document.getElementById("inputTracking").value.trim();
  const status = document.getElementById("selectShipmentStatus").value;

  const errorEl = document.getElementById("formError");
  const btnSubmit = document.getElementById("btnSubmitModal");

  if (!updatingOrderId) {
    alert("Lỗi: Không tìm thấy ID đơn hàng đang cập nhật!");
    return;
  }

  try {
    btnSubmit.textContent = "Đang Lưu...";
    btnSubmit.disabled = true;
    errorEl.display = "none";

    console.log(`Đang gọi API cập nhật cho đơn #${updatingOrderId}...`);

    const res = await apiFetch(
      `/shipments/admin/orders/${updatingOrderId}/shipment`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // <--- DÒNG SINH TỬ NẰM Ở ĐÂY
        },
        body: JSON.stringify({
          carrier: carrier,
          trackingNumber: trackingNumber,
          status: status,
        }),
      },
    );

    console.log("Kết quả từ Server:", res);
    alert("Cập nhật thành công!");

    closeShipmentModal();
    loadShipments(
      document.getElementById("searchInput").value,
      document.getElementById("statusFilter").value,
    );

    if (typeof loadShipments === "function") {
      loadShipments();
    } else {
      window.location.reload(); // Cách "nông dân" nếu không gọi được loadShipments
    }
  } catch (err) {
    errorEl.textContent =
      err.message || "Cập nhật thất bại. Vui lòng kiểm tra lại!";
    errorEl.display = "block";
    console.error("Lỗi submitShipmentUpdate:", err);
  } finally {
    btnSubmit.textContent = "Lưu thay đổi";
    btnSubmit.disabled = false;
  }
}

// Gắn thẳng vào window để chống ghi đè và chống cache
window.openShipmentModal = function (orderId, carrier, tracking, status) {
  console.log("🚀 CHÀO BUỔI SÁNG! ĐÃ KẾT NỐI THÀNH CÔNG JS VÀ HTML!");

  const elOrderId = document.getElementById("modalOrderId");
  const elCarrier = document.getElementById("inputCarrier");
  const elTracking = document.getElementById("inputTracking");
  const elStatus = document.getElementById("selectShipmentStatus");
  const elModal = document.getElementById("shipmentModal");

  // Nếu vẫn không tìm thấy, báo lỗi ngay
  if (!elCarrier) {
    alert(
      "Thẻ inputCarrier vẫn đang tàng hình! Hãy kiểm tra cache trình duyệt.",
    );
    return;
  }

  // Gán dữ liệu (An toàn tuyệt đối)
  updatingOrderId = orderId;
  if (elOrderId) elOrderId.textContent = `#${orderId}`; // Bỏ dấu thăng nếu trong HTML bạn đã ghi cứng
  elCarrier.value = carrier && carrier !== "null" ? carrier : "";
  elTracking.value = tracking && tracking !== "null" ? tracking : "";
  elStatus.value = status;

  // Tắt thông báo lỗi cũ (nếu có)
  const errorEl = document.getElementById("formError");
  if (errorEl) errorEl.textContent = "";

  // Bật Modal (Thêm class active vào thẻ modal-overlay)
  elModal.classList.add("active");
};

window.closeShipmentModal = function () {
  document.getElementById("shipmentModal").classList.remove("active");
};
