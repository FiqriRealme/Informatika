// Sidebar Elements
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");

// Search Elements
const searchContainer = document.getElementById("search-container");
const searchBtn = document.getElementById("search-btn");

// Toggle Sidebar
function toggleSidebar() {
  if (sidebar.style.left === "-250px") {
    sidebar.style.left = "0px";
    mainContent.style.marginLeft = "250px";
  } else {
    sidebar.style.left = "-250px";
    mainContent.style.marginLeft = "0px";
  }
}

// Event: Klik menu toggle
menuToggle.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleSidebar();
});

// Klik luar sidebar: otomatis tutup
document.addEventListener("click", function (e) {
  if (
    sidebar.style.left === "0px" &&
    !sidebar.contains(e.target) &&
    e.target !== menuToggle
  ) {
    sidebar.style.left = "-250px";
    mainContent.style.marginLeft = "0px";
  }
});

// Event: Klik tombol search
searchBtn.addEventListener("click", function (e) {
  e.stopPropagation();

  // Ganti button search menjadi input
  searchContainer.innerHTML = `
    <input type="text" id="search-input" placeholder="Cari..." class="form-control form-control-sm" />
  `;

  const searchInput = document.getElementById("search-input");

  setTimeout(() => {
    searchInput.classList.add("active");
    searchInput.focus();
  }, 10);
});

// Klik luar search input: balikin ke tombol
document.addEventListener("click", function (e) {
  const searchInput = document.getElementById("search-input");
  if (searchInput && !searchContainer.contains(e.target)) {
    searchContainer.innerHTML = `
      <button id="search-btn" class="btn btn-outline-light">
        <i class="bi bi-search"></i>
      </button>
    `;

    // Re-attach event search button
    document
      .getElementById("search-btn")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        searchContainer.innerHTML = `
        <input type="text" id="search-input" placeholder="Cari..." class="form-control form-control-sm" />
      `;
        const searchInput = document.getElementById("search-input");
        setTimeout(() => {
          searchInput.classList.add("active");
          searchInput.focus();
        }, 10);
      });
  }
});
