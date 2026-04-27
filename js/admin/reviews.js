document.addEventListener("DOMContentLoaded", () => {
  const user = checkAdminAuth();
  if (!user) return;

  renderSidebar("reviews");
  startClock();

  loadReviewDashboard();
});

async function loadReviewDashboard(queryString = "") {
  try {
    const res = await apiFetch(`/reviews/admin/dashboard${queryString}`);
    console.log("2️⃣ DATA TỪ BACKEND:", res ? res.data : "Lỗi không có data");

    const tbody = document.getElementById("reviewsTable");

    if (res && res.success) {
      const { stats, reviews } = res.data;

      // Đổ dữ liệu thống kê
      document.getElementById("statTotal").textContent = stats.totalReviews;
      document.getElementById("statAverage").textContent =
        `${stats.averageRating} / 5.0`;

      // Tính số review 1 và 2 sao
      let badReviewsCount = 0;
      if (stats.breakDown && Array.isArray(stats.breakDown)) {
        stats.breakDown.forEach((item) => {
          const stars = Number(item.rating);
          if (stars === 1 || stars === 2) {
            const count =
              item._count && item._count.id ? item._count.id : item._count || 0;
            badReviewsCount += count;
          }
        });
      }
      document.getElementById("statBadReviews").textContent = badReviewsCount;

      // Vẽ bảng
      tbody.innerHTML = "";
      if (reviews.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px;">Chưa có đánh giá nào.</td></tr>`;
        return;
      }

      reviews.forEach((review) => {
        // Tạo chuỗi ngôi sao
        const starsHTML =
          "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

        // Trạng thái và nút bấm tương ứng
        const isActive = review.status === "ACTIVE";
        const statusBadge = isActive
          ? `<span class="status-badge active">Hiển thị</span>`
          : `<span class="status-badge hidden">Đã Ẩn</span>`;

        const actionBtn = isActive
          ? `<button class="btn-toggle-status btn-hide" onclick="toggleStatus(${review.id}, 'HIDDEN')">X Ẩn</button>`
          : `<button class="btn-toggle-status btn-show" onclick="toggleStatus(${review.id}, 'ACTIVE')">✓ Mở Hiện</button>`;

        // Lấy ảnh sản phẩm
        const prodImg =
          review.product.images && review.product.images.length > 0
            ? review.product.images[0].url
            : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
                        <td>
                        <div class="user-info">
                            <strong>${review.user.fullName}</strong>
                            <small style="color: #888;">${review.user.email}</small>
                        </div>
                    </td>
                    <td>
                        <div class="product-info" style="display: flex; align-items: center; gap: 10px;">
                            ${prodImg ? `<img src="${prodImg}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">` : ""}
                            <span class="product-name">${review.product.name}</span>
                        </div>
                    </td>
                    <td>
                        <div class="stars">${starsHTML}</div>
                        <div class="review-comment">"${review.comment || "Không có nội dung"}"</div>
                        <small style="color: #aaa;">${new Date(review.createdAt).toLocaleDateString("vi-VN")}</small>
                    </td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                    `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Lỗi từ Server: ${res.message}</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi:", error);
    document.getElementById("reviewsTable").innerHTML =
      `<tr><td colspan="5" style="color:red; text-align:center;">Lỗi Hệ thống!</td></tr>`;
  }
}

// Chạy khi admin bấm nút lọc

function applyFilters() {
  const rating = document.getElementById("filterRating").value;
  const status = document.getElementById("filterStatus").value;
  const search = document.getElementById("filterSearch").value;

  // Tạo bảng để chứa các điều kiện
  const queryParams = [];
  if (rating !== "ALL") queryParams.push(`rating=${rating}`);
  if (status !== "ALL") queryParams.push(`status=${status}`);
  if (search.trim() !== "")
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);

  // Nối thành chuỗi (Ví dụ: ?rating=1&status=ACTIVE)
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  // Gọi lại hàm load với bộ lọc mới
  loadReviewDashboard(queryString);
}

// Hàm xử lý khi bấm nút Ẩn/Hiện
async function toggleStatus(reviewId, newStatus) {
  // Xác nhận trước khi làm
  const actionName = newStatus === "HIDDEN" ? "ẨN" : "HIỂN THỊ";
  if (!confirm(`Bạn có chắc muốn ${actionName} đánh giá này không?`)) return;

  try {
    const res = await apiFetch(`/reviews/admin/${reviewId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res && res.success) {
      alert("Thành công!");
      loadReviewDashboard();
    } else {
      alert("Lỗi: " + res.message);
    }
  } catch (error) {
    alert("Lỗi hệ thống: " + error.message);
  }
}
