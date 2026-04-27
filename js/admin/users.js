const API_URL = `${API_BASE_URL}/admin/users`;

document.addEventListener("DOMContentLoaded", () => {
  const user = checkAdminAuth();
  if (!user) return;

  renderSidebar("users");

  startClock();

  loadUsers();
});

/**
 * 1. HÀM LẤY VÀ HIỂN THỊ DANH SÁCH NGƯỜI DÙNG
 */
async function loadUsers() {
  console.log("loadUsers bắt đầu chạy"); // dòng 1
  const tbody = document.getElementById("usersTable");
  const searchVal = document.getElementById("searchInput")?.value || "";
  const roleVal = document.getElementById("roleFilter")?.value || "ALL";
  console.log("searchVal:", searchVal, "roleVal:", roleVal); // dòng 5

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Đang tải dữ liệu...</td></tr>`;

  try {
    const result = await apiFetch(
      `/admin/users?search=${searchVal}&role=${roleVal}`,
    );

    if (!result.success) {
      alert("Lỗi từ server: " + result.message);
      return;
    }

    const users = result.data;
    let html = "";

    if (users.length === 0) {
      html = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có dữ liệu.</td></tr>`;
    } else {
      users.forEach((user) => {
        const avatar =
          user.avatarUrl ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        const date = new Date(user.createdAt).toLocaleDateString("vi-VN");

        // Badge cho Role
        const roleBadge =
          user.role === "ADMIN"
            ? `<span class="badge badge-danger">ADMIN</span>`
            : `<span class="badge badge-success">CUSTOMER</span>`;

        // Badge cho Trạng thái (isActive)
        const statusBadge = user.isActive
          ? `<span style="color: #28a745; font-weight: bold;">Hoạt động</span>`
          : `<span style="color: #dc3545; font-weight: bold;">Bị khóa</span>`;

        // Nút Khóa/Mở khóa (Đổi icon tùy theo trạng thái)
        const toggleIcon = user.isActive ? "🔒 Khóa" : "🔓 Mở khóa";
        const toggleColor = user.isActive ? "#dc3545" : "#28a745";

        html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px;">#${user.id}</td>
                        <td style="padding: 15px; display: flex; align-items: center; gap: 10px;">
                            <img src="${avatar}" alt="avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong>${user.fullName}</strong><br>
                                <small>${statusBadge}</small>
                            </div>
                        </td>
                        <td style="padding: 15px;">${user.email}</td>
                        <td style="padding: 15px;">${roleBadge}</td>
                        <td style="padding: 15px; color: #666;">${date}</td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="changeRole(${user.id}, '${user.role}')" class="btn-action btn-edit">
                                Đổi quyền
                            </button>
                            <button onclick="toggleStatus(${user.id}, ${user.isActive})" class="btn-action btn-delete">
                                ${toggleIcon}
                            </button>
                        </td>
                    </tr>
                `;
      });
    }
    tbody.innerHTML = html;
  } catch (error) {
    console.error("Lỗi fetch:", error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Không thể kết nối đến máy chủ.</td></tr>`;
  }
}

/**
 * 2. HÀM THAY ĐỔI QUYỀN (ROLE)
 */
async function changeRole(userId, currentRole) {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Không cho tự đổi quyền hoặc tự khóa chính mình
  if (currentUser.id === Number(userId)) {
    alert("Không thể thay đổi tài khoản đang đăng nhập!");
    return;
  }

  // Xác định role mới ngược lại với role hiện tại
  const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";

  // Hỏi xác nhận
  const isConfirm = confirm(
    `Bạn có chắc muốn đổi quyền người dùng này thành ${newRole} không?`,
  );
  if (!isConfirm) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const result = await response.json();

    if (result.success) {
      // Load lại bảng ngay lập tức để thấy thay đổi
      loadUsers();
    } else {
      alert("Lỗi:" + result.message);
    }
  } catch (error) {
    alert("Lỗi kết nối máy chủ");
  }
}

/**
 * 3. HÀM KHÓA / MỞ KHÓA TÀI KHOẢN (STATUS)
 */
async function toggleStatus(userId, currentStatus) {
  const actionText = currentStatus ? "KHÓA" : "MỞ KHÓA";
  const isConfirm = confirm(
    `Bạn có chắc chắn muốn ${actionText} tài khoản này không?`,
  );
  if (!isConfirm) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    const result = await response.json();

    if (result.success) {
      loadUsers();
    } else {
      alert("Lỗi: " + result.message);
    }
  } catch (error) {
    alert("Lỗi kết nối máy chủ");
  }
}
