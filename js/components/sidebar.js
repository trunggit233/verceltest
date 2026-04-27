function renderSidebar(activePage) {
  // Lấy thông tin user từ localStronge để hiển thị tên/avatar
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const avatarHTML = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : (user.fullName || "A")[0].toUpperCase();

  // Nhét toàn bộ HTML sidebar vào thẻ <aside id="sidebar">
  // activePage dùng để highlight menu đang active
  // ví dụ: activePage = 'dashboard' → thêm class 'active' vào menu Tổng quan
  document.getElementById("sidebar").innerHTML = `
    <div class="sidebar-brand">
            <span class="brand-smart">Smart</span><span class="brand-cart">Cart</span>
            <span class="sidebar-label">Quản trị</span>
        </div>

        <div class="sidebar-user">
            <div class="user-avatar">${avatarHTML}</div>
            <div class="user-info">
                <p class="user-name">${user.fullName || "Admin"}</p>
                <p class="user-role">${user.role || "ADMIN"}</p>
            </div>
        </div>

        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item ${activePage === "dashboard" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/></svg></span>
                Tổng quan
            </a>
            <a href="products.html" class="nav-item ${activePage === "products" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-640v440h560v-440H640v320l-160-80-160 80v-320H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm184 80v190l80-40 80 40v-190H400Zm-200 0h560-560Z"/></svg></span>
                Sản phẩm
            </a>
            <a href="orders.html" class="nav-item ${activePage === "orders" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m691-150 139-138-42-42-97 95-39-39-42 43 81 81ZM240-600h480v-80H240v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40ZM120-80v-680q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v267q-19-9-39-15t-41-9v-243H200v562h243q5 31 15.5 59T486-86l-6 6-60-60-60 60-60-60-60 60-60-60-60 60Zm120-200h203q3-21 9-41t15-39H240v80Zm0-160h284q38-37 88.5-58.5T720-520H240v80Zm-40 242v-562 562Z"/></svg></span>
                Quản lý Đơn hàng
            </a>
            <a href="users.html" class="nav-item ${activePage === "users" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/></svg></span>
                Quản lý Người dùng
            </a>
            <div class="nav-divider"></div>
            <a href="payment.html" class="nav-item ${activePage === "payment" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm179-80h442L480-830 259-720ZM80-120v-80h482q2 21 5 40.5t9 39.5H80Zm600-310v-130h80v90l-80 40ZM800 0q-69-17-114.5-79.5T640-218v-102l160-80 160 80v102q0 76-45.5 138.5T800 0Zm-29-120 139-138-42-42-97 95-39-39-42 43 81 81ZM259-720h442-442Z"/></svg></span>
                Quản lý thanh toán
            </a>
            <a href="shipment.html" class="nav-item ${activePage === "shipping" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M155-195q-35-35-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35q-50 0-85-35Zm113.5-56.5Q280-263 280-280t-11.5-28.5Q257-320 240-320t-28.5 11.5Q200-297 200-280t11.5 28.5Q223-240 240-240t28.5-11.5ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm628.5 108.5Q760-263 760-280t-11.5-28.5Q737-320 720-320t-28.5 11.5Q680-297 680-280t11.5 28.5Q703-240 720-240t28.5-11.5ZM680-440h170l-90-120h-80v120ZM360-540Z"/></svg></span>
                Vận chuyển
            </a>
            <a href="cart.html" class="nav-item ${activePage === "cart" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-600v-120H320v-80h120v-120h80v120h120v80H520v120h-80ZM223.5-103.5Q200-127 200-160t23.5-56.5Q247-240 280-240t56.5 23.5Q360-193 360-160t-23.5 56.5Q313-80 280-80t-56.5-23.5Zm400 0Q600-127 600-160t23.5-56.5Q647-240 680-240t56.5 23.5Q760-193 760-160t-23.5 56.5Q713-80 680-80t-56.5-23.5ZM40-800v-80h131l170 360h280l156-280h91L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68.5-39t-1.5-79l54-98-144-304H40Z"/></svg></span>
                Giỏ hàng
            </a>
            <a href="reviews.html" class="nav-item ${activePage === "reviews" ? "active" : ""}">
                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m363-390 117-71 117 71-31-133 104-90-137-11-53-126-53 126-137 11 104 90-31 133ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/></svg></span>
                Reviews
            </a>
            <div class="nav-group">
                <a href="#" class="nav-item ${activePage === "marketing" ? "active" : ""}" onclick="toggleMarketingMenu(event, this)">
                    <div class="drop">
                        <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640H240v640Zm40-80h400L542-420l-92 120-62-80-108 140Zm-40 80v-640 640Z"/></svg></span>
                        Giao diện & marketing
                    </div>
                    <span class="submenu-arrow">▼</span>
                </a>

                <div class="marketing-submenu">
                    <a href="/admin/featuredProducts.html" class="featured-products">
                    <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#e3e3e3"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg></span>
                    Sản phẩm nổi bật</a>
                    <a href="/views/admin/banner.html" class="banners ${activePage === "banners" ? "active" : ""}">
                    <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#e3e3e3"><path d="M720-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-600 40q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h560q33 0 56.5 23.5T760-760v200h-80v-80H120v440h520v80H120Zm0-600h560v-40H120v40Zm0 0v-40 40Z"/></svg></span>
                    Quản lý Banner</a>
                    <a href="/admin/coupons.html" class="coupons">
                    <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#e3e3e3"><path d="m368-320 112-84 110 84-42-136 112-88H524l-44-136-44 136H300l110 88-42 136ZM160-160q-33 0-56.5-23.5T80-240v-135q0-11 7-19t18-10q24-8 39.5-29t15.5-47q0-26-15.5-47T105-556q-11-2-18-10t-7-19v-135q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v135q0 11-7 19t-18 10q-24 8-39.5 29T800-480q0 26 15.5 47t39.5 29q11 2 18 10t7 19v135q0 33-23.5 56.5T800-160H160Zm0-80h640v-102q-37-22-58.5-58.5T720-480q0-43 21.5-79.5T800-618v-102H160v102q37 22 58.5 58.5T240-480q0 43-21.5 79.5T160-342v102Zm320-240Z"/></svg></span>
                    Voucher / Giảm giá</a>
                </div>
            </div>

            <div class="nav-divider"></div>
            <a href="#" class="nav-item nav-logout" id="logoutBtn">
                <span class="nav-icon">⏻</span> Đăng xuất
            </a>
        </nav>
    `;

  // Gắn sự kiện sai khi HTML đã được iject vào DOM
  // Phải làm sau inject vì trước đó là #logoutBtn chưa tồn tại
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../views/auth/login.html";
  });

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../views/auth/login.html";
  });

  // GẮN SỰ KIỆN CLICK CHO NÚT HAMBURGER (Không dùng DOMContentLoaded nữa)
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");

  if (toggleBtn && sidebar) {
    // Để an toàn (tránh bị gắn sự kiện nhiều lần nếu gọi hàm 2 lần), ta có thể gán thẳng hàm vào onclick
    toggleBtn.onclick = () => {
      sidebar.classList.toggle("collapsed");
      if (mainContent) {
        mainContent.classList.toggle("expanded");
      }
    };
  }
}

function toggleMarketingMenu(event, element) {
  event.preventDefault(); // Chặn hành vi load trang của thẻ a

  // Tìm menu con nằm dưới thẻ a
  const submenu = element.nextElementSibling;
  const arrow = element.querySelector(".submenu-arrow");

  // Bật tắt trạng thái hiển thị
  submenu.classList.toggle("show");
  arrow.classList.toggle("rotate");
}
