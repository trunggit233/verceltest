let revenueChartInstance = null;

// HÀM GỌI API CHÍNH & PHÂN PHỐI DỮ LIỆU

async function loadDashboardData() {
  try {
    // GỌI 1 LẦN DUY NHẤT VÀO API TỔNG HỢP (Chỉnh lại URL nếu API của bạn tên khác)
    const res = await apiFetch("/admin/db/dashboard");

    if (res && res.success) {
      const data = res.data;

      // Chia bài cho các hàm vẽ giao diện
      renderStatCards(data.stats);
      renderRevenueChart(data.chartData);
      renderRecentOrders(data.recentOrders);
      renderTopProducts(data.topSellingProducts);
    } else {
      console.error("Lỗi lấy data Dashboard:", res?.message);
    }
  } catch (err) {
    console.error("Lỗi kết nối Backend:", err);
  }
}

// ============ VẼ 4 THẺ THỐNG KÊ (STAT CARDS) ============

function renderStatCards(stats) {
  // Nếu không có HTML thì bỏ qua để khỏi báo lỗi
  const elUsers = document.getElementById("stat-users");
  const elProducts = document.getElementById("stat-products");
  const elOrders = document.getElementById("stat-orders");
  const elRevenue = document.getElementById("stat-revenue");

  if (elUsers) elUsers.textContent = formatNumber(stats.totalUsers);
  if (elProducts) elProducts.textContent = formatNumber(stats.totalProducts);
  if (elOrders) elOrders.textContent = formatNumber(stats.totalOrders);

  // Lưu ý: Đảm bảo bạn đã viết hàm formatPrice() ở file admin-utils.js nhé
  if (elRevenue) elRevenue.textContent = formatPrice(stats.totalRevenue);
}

// ============ VẼ BIỂU ĐỒ DOANH THU (CHART.JS) ============

function renderRevenueChart(chartData) {
  const ctx = document.getElementById("revenueCanvas");
  if (!ctx) return;

  // Tách dữ liệu từ mảng API trả về
  // Backend đang trả về: [{ date: "21-04", revenue: 1200000 }, ...]
  const labels = chartData.map((item) => item.date);
  const dataValues = chartData.map((item) => item.revenue);

  // Hủy biểu đồ cũ nếu đã tồn tại để vẽ cái mới đè lên
  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }

  revenueChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Doanh thu",
          data: dataValues,
          backgroundColor: "rgba(22, 163, 74, 0.8)",
          borderColor: "#16a34a", // Đã fix lỗi chính tả borderColer
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // Đã fix lỗi chính tả Plugin -> plugins
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => formatPrice(c.raw),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            // Đã fix lỗi chính tả tricks -> ticks
            callback: (v) => formatPrice(v),
          },
        },
        x: {
          grid: { display: false }, // Đã fix lỗi chính tả gird -> grid
        },
      },
    },
  });
}

// ============ VẼ BẢNG ĐƠN HÀNG GẦN ĐÂY ============

function renderRecentOrders(orders) {
  const tbody = document.getElementById("recentOrdersTable");
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="table-loading" style="text-align:center; padding:20px;">Chưa có đơn hàng nào</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">#${order.id}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${order.user?.fullName || order.user?.email || "Khách vãng lai"}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${formatPrice(order.totalAmount)}</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${renderStatusBadge(order.status)}</td>
        </tr>
    `,
    )
    .join("");
}

// Hàm phụ trợ để vẽ màu cho Trạng thái đơn hàng
function renderStatusBadge(status) {
  const badges = {
    PENDING:
      '<span style="background: #fef08a; color: #854d0e; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Chờ xử lý</span>',
    PROCESSING:
      '<span style="background: #bfdbfe; color: #1e3a8a; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Đang giao</span>',
    COMPLETED:
      '<span style="background: #bbf7d0; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Hoàn thành</span>',
    CANCELLED:
      '<span style="background: #fecaca; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Đã hủy</span>',
  };
  return (
    badges[status] ||
    `<span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${status}</span>`
  );
}

// VẼ BẢNG SẢN PHẨM BÁN CHẠY
function renderTopProducts(products) {
  const tbody = document.getElementById("topProductsTable");
  if (!tbody) return;

  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="table-loading" style="text-align:center; padding:20px;">Chưa có dữ liệu</td></tr>`;
    return;
  }

  tbody.innerHTML = products
    .map(
      (p) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">
                ${p.name}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${formatNumber(p.soldQuantity || 0)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(p.revenue || 0)}</td>
        </tr>
    `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Kiểm tra quyền - nếu không phải ADMIN thì dừng lại
  const user = checkAdminAuth();
  if (!user) return;

  // Render sidebar, highlight menu 'dashboard'
  renderSidebar("dashboard");

  // Chạy đồng hồ
  startClock();

  // Load tất cả data
  loadDashboardData();
});
