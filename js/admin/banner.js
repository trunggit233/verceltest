// ============================================
// BANNER — banner.js
// ============================================

// ============ STAT CARDS ============

function loadStatCards(banners) {
  const active = banners.filter((b) => b.isActive).length;
  const inactive = banners.filter((b) => !b.isActive).length;

  document.getElementById("stat-total").textContent = banners.length;
  document.getElementById("stat-active").textContent = active;
  document.getElementById("stat-inactive").textContent = inactive;
}

// ============ LOAD DANH SÁCH ============

async function loadBanners(statusFilter = "") {
  const tbody = document.getElementById("bannersTable");
  tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Đang tải...</td></tr>`;

  try {
    const res = await apiFetch("/banners/admin");
    let banners = res.data || [];

    // Stat cards từ toàn bộ data
    loadStatCards(banners);

    // Filter ở frontend
    if (statusFilter === "active") banners = banners.filter((b) => b.isActive);
    if (statusFilter === "inactive")
      banners = banners.filter((b) => !b.isActive);

    if (!banners.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Không có banner nào</td></tr>`;
      return;
    }

    tbody.innerHTML = banners
      .map(
        (b) => `
            <tr>
                <td>
                    <img 
                        src="${b.imageUrl}" 
                        alt="${b.title || "Banner"}"
                        style="width:120px; height:60px; object-fit:cover; border-radius:6px;"
                        onerror="this.src='https://placehold.co/120x60?text=No+Image'"
                    >
                </td>
                <td>${b.title || "—"}</td>
                <td>
                    ${
                      b.targetLink
                        ? `<a href="${b.targetLink}" target="_blank" 
                             style="color:var(--green-primary);font-size:12px;">
                             ${b.targetLink.substring(0, 30)}...
                           </a>`
                        : "—"
                    }
                </td>
                <td>${positionBadge(b.position)}</td>
                <td>
                    <!-- Toggle bật/tắt nhanh không cần modal -->
                    <label class="toggle-switch">
                        <input 
                            type="checkbox" 
                            ${b.isActive ? "checked" : ""}
                            onchange="toggleStatus(${b.id}, ${b.isActive})"
                        >
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>${formatDate(b.createdAt)}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteBanner(${b.id}, '${b.title || "banner này"}')">
                        Xoá
                    </button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Lỗi tải dữ liệu</td></tr>`;
    console.error("loadBanners:", err);
  }
}

// ============ BADGE VỊ TRÍ ============

function positionBadge(position) {
  const map = {
    HERO: ["badge-info", "Banner chính"],
    SUB: ["badge-pending", "Banner phụ"],
    POPUP: ["badge-purple", "Popup"],
  };
  const [cls, label] = map[position] || ["badge-pending", position];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ============ TOGGLE BẬT/TẮT ============

async function toggleStatus(id, currentStatus) {
  try {
    await apiFetch(`/banners/admin/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ currentStatus }),
    });

    // Reload với filter hiện tại
    loadBanners(document.getElementById("filterStatus").value);
  } catch (err) {
    alert("Cập nhật thất bại!");
    console.error("toggleStatus:", err);
    // Reload lại để đưa toggle về trạng thái cũ
    loadBanners(document.getElementById("filterStatus").value);
  }
}

// ============ XOÁ BANNER ============

async function deleteBanner(id, title) {
  if (!confirm(`Bạn chắc chắn muốn xoá "${title}"?`)) return;

  try {
    await apiFetch(`/banners/admin/${id}`, { method: "DELETE" });
    loadBanners(document.getElementById("filterStatus").value);
  } catch (err) {
    alert("Xoá thất bại!");
    console.error("deleteBanner:", err);
  }
}

// ============ MODAL THÊM BANNER ============

function openAddModal() {
  resetForm();
  document.getElementById("modalAdd").classList.add("active");
}

function closeAddModal() {
  document.getElementById("modalAdd").classList.remove("active");
  resetForm();
}

function resetForm() {
  document.getElementById("inputTitle").value = "";
  document.getElementById("inputLink").value = "";
  document.getElementById("inputPosition").value = "HERO";
  document.getElementById("inputImage").value = "";
  document.getElementById("imagePreview").innerHTML =
    "<span>Chưa có ảnh</span>";
  document.getElementById("addError").textContent = "";
}

async function submitAdd() {
  const title = document.getElementById("inputTitle").value.trim();
  const link = document.getElementById("inputLink").value.trim();
  const position = document.getElementById("inputPosition").value;
  const image = document.getElementById("inputImage").files?.[0];
  const errorEl = document.getElementById("addError");
  const btnSubmit = document.getElementById("btnSubmitAdd");

  // Validate — ảnh bắt buộc
  if (!image) {
    errorEl.textContent = "Vui lòng chọn ảnh banner!";
    return;
  }

  errorEl.textContent = "";

  try {
    btnSubmit.textContent = "Đang thêm...";
    btnSubmit.disabled = true;

    // Dùng FormData vì có upload ảnh
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("targetLink", link);
    formData.append("position", position);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/banners/admin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Lỗi không xác định");

    closeAddModal();
    loadBanners();
  } catch (err) {
    errorEl.textContent = err.message || "Thêm banner thất bại!";
    console.error("submitAdd:", err);
  } finally {
    btnSubmit.textContent = "Thêm Banner";
    btnSubmit.disabled = false;
  }
}

// ============ PREVIEW ẢNH ============

function initImagePreview() {
  document.getElementById("inputImage").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById("imagePreview").innerHTML =
        `<img src="${ev.target.result}" alt="preview" 
                      style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  });
}

// ============ INIT ============

document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAdminAuth()) return;

  renderSidebar("marketing");
  startClock();

  // Modal
  document.getElementById("btnOpenAdd").addEventListener("click", openAddModal);
  document
    .getElementById("btnCloseAdd")
    .addEventListener("click", closeAddModal);
  document
    .getElementById("btnCancelAdd")
    .addEventListener("click", closeAddModal);
  document.getElementById("btnSubmitAdd").addEventListener("click", submitAdd);

  // Click ngoài modal
  document.getElementById("modalAdd").addEventListener("click", (e) => {
    if (e.target.id === "modalAdd") closeAddModal();
  });

  // Filter
  document.getElementById("filterStatus").addEventListener("change", (e) => {
    loadBanners(e.target.value);
  });

  initImagePreview();
  await loadBanners();
});
