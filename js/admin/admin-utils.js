// ============ NHÓM 1: BẢO VỆ TRANG ============
// Chạy đầu tiên ở mọi trang admin
// Kiểm tra token + role, nếu không hợp lệ → đuổi về login

function checkAdminAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    window.location.href = "/views/auth/login.html";
    return null;
  }

  const parsedUser = JSON.parse(user);

  if (parsedUser.role !== "ADMIN") {
    alert("Bạn không có quyền truy cập!");
    window.location.href = "index.html";
    return null;
  }

  return parsedUser;
}

// ============ NHÓM 2: GỌI API ============
// Wrapper của fetch — tự động gắn token vào header
// Dùng ở mọi trang thay vì viết fetch + header lặp đi lặp lại

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}), // headers bổ sung nếu cần
    },
  });

  if (!res.ok) {
    const errData = await res.json();
    console.error("API error detail:", errData);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// ============ NHÓM 3: FORMAT DỮ LIỆU ============
// Biến dữ liệu thô từ DB thành dạng dễ đọc cho người dùng

// 32500000 → 32.500.000 ₫
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// 1000 -> 1.000
function formatNumber(num) {
  return new Intl.NumberFormat("vi-VN").format(num);
}

// Thời gian "2026-04-18T07:00:00Z" → "18/04/2026"
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ============ NHÓM 4: UI DÙNG CHUNG ============

// Đồng hồ realtime trên topbar
function startClock() {
  const el = document.getElementById("currentTime");
  if (!el) return;

  const update = () => {
    el.textContent = new Date().toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  update(); // chạy ngay lập tức, không chờ 1 giây
  setInterval(update, 1000); // sau đó cứ 1 giây chạy lại
}

// Chuyển status từ DB thành badge HTML màu sắc
// Ví dụ: 'PENDING' → <span class="badge badge-pending">Chờ xử lý</span>
function statusBadge(status) {
  const map = {
    PENDING: ["badge-pending", "Chờ xử lý"],
    PROCESSING: ["badge-info", "Đang xử lý"],
    SHIPPED: ["badge-info", "Đang giao"],
    DELIVERED: ["badge-success", "Đã giao"],
    CANCELLED: ["badge-danger", "Đã huỷ"],
    RETURNED: ["badge-purple", "Hoàn hàng"],
  };

  // Nếu status không có trong map -> dùng badge-panding làm mặc định
  const [cls, label] = map[status] || ["badge-pending", status];
  return `<span class="badge ${cls}">${label}</span>`;
}
