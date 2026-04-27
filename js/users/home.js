// =============================================
// UTILITIES
// =============================================

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// =============================================
// HEADER - LOGIN / LOGOUT
// =============================================

function renderHeader() {
  const authLinks = document.querySelector('.auth-links');
  const user = getUser();

  if (user) {
    authLinks.innerHTML = `
      <strong>${user.fullName || user.email}</strong>|
      <a href="#" id="logoutBtn">Đăng xuất</a>
    `;
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    });
  } else {
    authLinks.innerHTML = `
      <a href="./views/auth/register.html">Đăng ký</a> |
      <a href="./views/auth/login.html">Đăng nhập</a>
    `;
  }
}

// =============================================
// BANNER - Static (chưa có API)
// =============================================

function renderBanners() {
  const mainBanner = document.getElementById('main-banner');
  const subBanners = document.getElementById('sub-banners');

  // Placeholder cho đến khi có API banner
  mainBanner.innerHTML = `
    <div class="banner-placeholder">
      <img src="https://placehold.co/800x300?text=Main+Banner" alt="Main Banner" style="width:100%;border-radius:8px;">
    </div>
  `;

  subBanners.innerHTML = `
    <div class="banner-placeholder">
      <img src="https://placehold.co/390x140?text=Banner+1" alt="Banner 1" style="width:100%;border-radius:8px;">
    </div>
    <div class="banner-placeholder">
      <img src="https://placehold.co/390x140?text=Banner+2" alt="Banner 2" style="width:100%;border-radius:8px;">
    </div>
  `;
}

// =============================================
// CATEGORIES
// =============================================

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Lỗi khi tải danh mục');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('fetchCategories:', err);
    return [];
  }
}

function renderCategories(categories) {
  const container = document.getElementById('category-list');

  if (!categories.length) {
    container.innerHTML = `<p>Không có danh mục nào.</p>`;
    return;
  }

  container.innerHTML = categories.map(cat => `
    <div class="category-item" onclick="filterByCategory('${cat.id}')">
      <div class="category-icon">
        ${cat.imageUrl
          ? `<img src="${cat.imageUrl}" alt="${cat.name}">`
          : '🗂️'}
      </div>
      <p class="category-name">${cat.name}</p>
    </div>
  `).join('');
}

// =============================================
// PRODUCTS
// =============================================

async function fetchProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Lỗi khi tải sản phẩm');
    const data = await res.json();
    // Hỗ trợ cả { data: [...] } và [...]
    return Array.isArray(data) ? data : (data.data || data.products || []);
  } catch (err) {
    console.error('fetchProducts:', err);
    return [];
  }
}

function renderProductCard(product) {
  return `
    <div class="product-card" onclick="window.location.href='./views/product/detail.html?id=${product.id}'">
      <div class="product-image">
        <img src="${product.imageUrl || product.images?.[0] || 'https://placehold.co/200x200?text=No+Image'}" 
             alt="${product.name}"
             onerror="this.src='https://placehold.co/200x200?text=No+Image'">
      </div>
      <div class="product-info">
        <p class="product-name">${product.name}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        ${product.originalPrice
          ? `<p class="product-original-price">${formatPrice(product.originalPrice)}</p>`
          : ''}
      </div>
    </div>
  `;
}

// Top search - lấy sản phẩm sắp xếp theo lượt xem/bán
async function renderTopSearch() {
  const container = document.getElementById('top-search-list');
  container.innerHTML = `<p class="loading">Đang tải...</p>`;

  const products = await fetchProducts({ limit: 10, sort: 'sold' });

  if (!products.length) {
    container.innerHTML = `<p>Không có sản phẩm nào.</p>`;
    return;
  }

  container.innerHTML = products.map(renderProductCard).join('');
}

// Gợi ý hôm nay - lấy sản phẩm ngẫu nhiên / mới nhất
async function renderDailySuggest() {
  const container = document.getElementById('daily-sucggest-list');
  container.innerHTML = `<p class="loading">Đang tải...</p>`;

  const products = await fetchProducts({ limit: 20, sort: 'newest' });

  if (!products.length) {
    container.innerHTML = `<p>Không có sản phẩm nào.</p>`;
    return;
  }

  container.innerHTML = products.map(renderProductCard).join('');
}

// =============================================
// SEARCH BAR
// =============================================

function initSearch() {
  const searchInput = document.getElementById('searchInput');

  let debounceTimer;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `./views/product/search.html?q=${encodeURIComponent(keyword)}`;
      }
    }
  });

  // Debounce live search (tuỳ chọn)
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const keyword = searchInput.value.trim();
      if (keyword.length >= 2) {
        const results = await fetchProducts({ search: keyword, limit: 5 });
        // TODO: hiển thị dropdown gợi ý nếu cần
        console.log('Live search results:', results);
      }
    }, 400);
  });
}

// =============================================
// FILTER BY CATEGORY (khi click danh mục)
// =============================================

async function filterByCategory(categoryId) {
  const container = document.getElementById('daily-sucggest-list');
  container.innerHTML = `<p class="loading">Đang lọc...</p>`;

  // Scroll xuống section gợi ý
  document.querySelector('.daily-sucggest-section').scrollIntoView({ behavior: 'smooth' });

  const products = await fetchProducts({ categoryId, limit: 20 });

  if (!products.length) {
    container.innerHTML = `<p>Không có sản phẩm trong danh mục này.</p>`;
    return;
  }

  container.innerHTML = products.map(renderProductCard).join('');
}

// =============================================
// INIT - Chạy khi trang load
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  renderBanners();
  initSearch();

  // Fetch song song để nhanh hơn
  const [categories] = await Promise.all([
    fetchCategories(),
    renderTopSearch(),
    renderDailySuggest(),
  ]);

  renderCategories(categories);
});