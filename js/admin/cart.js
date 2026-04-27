document.addEventListener("DOMContentLoaded", () => {
  const user = checkAdminAuth();
  if (!user) return;

  // Gọi hàm render sidebar
  renderSidebar("cart");

  startClock();

  // load dữ liệu
  loadCartDashboard();
});

async function loadCartDashboard() {
  try {
    // Gọi API backend
    const res = await apiFetch("/ad/cart/admin/dashboard");

    console.log("🕵️ DỮ LIỆU TỪ API THẬT TRẢ VỀ LÀ:", res);

    if (res && res.success) {
      const { stats, leaderboard } = res.data;

      // Đổ dữ liệu vào 3 thẻ thống kê
      document.getElementById("statActive").textContent = stats.activeCarts;
      document.getElementById("statAbandoned").textContent =
        stats.abandonedCarts;
      document.getElementById("statConversion").textContent =
        `${stats.conversionRate}%`;

      // Đổ dữ liệu vào bảng xếp hạng
      const tbody = document.getElementById("leaderboardTable");
      tbody.innerHTML = ""; // Xóa chữ đang tải

      if (leaderboard.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            <div style="padding: 40px 20px; text-align: center; color: #888; font-size: 1.1rem; background: #fafafa; border-radius: 8px; margin-top: 10px;">
                                🛒 Hiện tại chưa có khách hàng nào thêm sản phẩm vào giỏ.
                            </div>
                        </td>
                    </tr>`;
        return;
      }

      leaderboard.forEach((item, index) => {
        // Tạo cái cúp vàng cho top 1, bạc top 2, đồng top 3
        let rankIcon = `#${index + 1}`;
        if (index === 0) rankIcon = "🥇 #1";
        if (index === 1) rankIcon = "🥈 #2";
        if (index === 2) rankIcon = "🥉 #3";

        const priceFormatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.price);
        const imgTag = item.image
          ? `<img src="${item.image}" alt="img" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;">`
          : `<div style="width: 40px; height: 40px; background: #eee; border-radius: 5px;"></div>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td style="font-weight: bold; font-size: 1.1rem;">${rankIcon}</td>
                    <td style="display: flex; align-items: center; gap: 15px;">
                        ${imgTag}
                        <span style="font-weight: 500;">${item.name}</span>
                    </td>
                    <td style="color: #e53935; font-weight: bold;">${priceFormatted}</td>
                    <td>
                        <span style="background: #e3f2fd; color: #1976d2; padding: 5px 12px; border-radius: 20px; font-weight: bold;">
                            ${item.totalInCarts}
                        </span>
                    </td>
                `;
        tbody.appendChild(tr);
      });
    } else {
      // THÊM ĐOẠN NÀY ĐỂ BẮT LỖI TỪ BACKEND
      const tbody = document.getElementById("leaderboardTable");
      tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; font-weight:bold;">
                Lỗi từ Server: ${res.message}
            </td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi load Dashboard Giỏ hàng:", error);
    document.getElementById("leaderboardTable").innerHTML =
      `<tr><td colspan="4" style="color:red; text-align:center;">Lỗi: ${error.message}</td></tr>`;
  }
}
