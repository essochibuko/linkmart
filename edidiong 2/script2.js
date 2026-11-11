/* ==========================================================================
   LINKMART MARKETPLACE - CORE JAVASCRIPT LOGIC
   ========================================================================== */

// --- 1. INITIAL SAMPLE DATASET ---
const INITIAL_PRODUCTS = [
    {
        id: "prod-1",
        title: "Keychron K2 Wireless Mechanical Keyboard",
        url: "https://www.keychron.com/products/keychron-k2-wireless-mechanical-keyboard",
        category: "Electronics",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        description: "Compact 75% layout Bluetooth mechanical keyboard designed for Mac and Windows productivity.",
        likes: 42,
        createdAt: Date.now() - 86400000 * 5,
        comments: [
            { text: "Great build quality! Using blue switches for typing.", time: "2 days ago" },
            { text: "Battery life easily lasts 2 weeks on a single charge.", time: "1 day ago" }
        ]
    },
    {
        id: "prod-2",
        title: "Sony WH-1000XM5 Noise Canceling Headphones",
        url: "https://www.sony.com/electronics/headband-headphones/wh-1000xm5",
        category: "Electronics",
        price: 398.00,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        description: "Industry-leading noise cancellation with 8 microphones and Auto NC Optimizer.",
        likes: 89,
        createdAt: Date.now() - 86400000 * 3,
        comments: [
            { text: "Best active noise cancellation on the market.", time: "3 hours ago" }
        ]
    },
    {
        id: "prod-3",
        title: "Minimalist Matte Stainless Steel Water Bottle",
        url: "https://example.com/hydration-bottle",
        category: "Home & Living",
        price: 24.50,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
        description: "Double-wall vacuum insulated water bottle keeping beverages cold for up to 24 hours.",
        likes: 19,
        createdAt: Date.now() - 86400000 * 1,
        comments: []
    },
    {
        id: "prod-4",
        title: "Tailored Linen Casual Button-Down Shirt",
        url: "https://example.com/linen-shirt",
        category: "Fashion",
        price: 54.00,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
        description: "100% breathable organic linen shirt designed for comfortable everyday summer wear.",
        likes: 12,
        createdAt: Date.now() - 3600000 * 4,
        comments: []
    }
];

// --- 2. GLOBAL STATE ---
let products = [];
let activeCategory = "All";
let likedProductIds = new Set();
let isAdminLoggedIn = false;

// --- 3. APPLICATION INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromStorage();
    renderAllViews();
});

function loadProductsFromStorage() {
    const saved = localStorage.getItem("linkmart_products");
    if (saved) {
        try {
            products = JSON.parse(saved);
        } catch (e) {
            products = [...INITIAL_PRODUCTS];
        }
    } else {
        products = [...INITIAL_PRODUCTS];
        saveProductsToStorage();
    }
}

function saveProductsToStorage() {
    localStorage.setItem("linkmart_products", JSON.stringify(products));
}

// --- 4. NAVIGATION & TAB SWITCHING ---
function switchTab(tabId) {
    document.querySelectorAll(".tab-page").forEach(page => page.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add("active");
    }

    const navBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navBtn) {
        navBtn.classList.add("active");
    }

    // Close mobile drawer if open
    document.getElementById("navLinks").classList.remove("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileMenu() {
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("show");
}

// --- 5. RENDER FUNCTIONS ---
function renderAllViews() {
    renderFeaturedGrid();
    renderRecentGrid();
    filterProducts();
}

function createProductCardHTML(product) {
    const isLiked = likedProductIds.has(product.id);
    const formattedPrice = product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Free / Link';
    const safeTitle = escapeHTML(product.title);
    const safeDesc = escapeHTML(product.description);
    const safeImg = product.image || getFallbackImage(product.category);

    return `
        <div class="product-card">
            <div class="card-image-wrap" onclick="openProductModal('${product.id}')" style="cursor:pointer;">
                <img src="${safeImg}" alt="${safeTitle}" loading="lazy" onerror="this.src='${getFallbackImage(product.category)}'">
                <span class="card-badge">${escapeHTML(product.category)}</span>
            </div>
            <div class="card-body">
                <h3 onclick="openProductModal('${product.id}')" style="cursor:pointer;">${safeTitle}</h3>
                <p class="card-desc">${safeDesc}</p>
                <div class="card-footer">
                    <div class="card-price">${formattedPrice}</div>
                    <div class="card-btn-group">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${product.id}', this)">
                            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
                            <span>${product.likes || 0}</span>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="openProductModal('${product.id}')">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedGrid() {
    const container = document.getElementById("featuredGrid");
    if (!container) return;
    const sorted = [...products].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);
    container.innerHTML = sorted.map(createProductCardHTML).join("");
}

function renderRecentGrid() {
    const container = document.getElementById("recentGrid");
    if (!container) return;
    const sorted = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
    container.innerHTML = sorted.map(createProductCardHTML).join("");
}

// --- 6. SEARCH & CATEGORY FILTERING ---
function filterProducts() {
    const container = document.getElementById("exploreGrid");
    const noResults = document.getElementById("noResults");
    if (!container) return;

    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const sortVal = document.getElementById("sortSelect").value;

    let filtered = products.filter(p => {
        const matchesCategory = (activeCategory === "All") || (p.category === activeCategory);
        const matchesQuery = p.title.toLowerCase().includes(query) || 
                             p.description.toLowerCase().includes(query) ||
                             p.category.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });

    // Sorting Logic
    if (sortVal === "newest") {
        filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortVal === "popular") {
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortVal === "price-low") {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortVal === "price-high") {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (filtered.length === 0) {
        container.innerHTML = "";
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
        container.innerHTML = filtered.map(createProductCardHTML).join("");
    }
}

function setCategoryFilter(category, btnElement) {
    activeCategory = category;
    document.querySelectorAll("#categoryPills .pill").forEach(p => p.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    filterProducts();
}

function clearSearch() {
    document.getElementById("searchInput").value = "";
    filterProducts();
}

// --- 7. LIKE & INTERACTION LOGIC ---
function toggleLike(productId, btnElement) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (likedProductIds.has(productId)) {
        likedProductIds.delete(productId);
        prod.likes = Math.max(0, (prod.likes || 1) - 1);
    } else {
        likedProductIds.add(productId);
        prod.likes = (prod.likes || 0) + 1;
        showToast("Added to your liked items!");
    }

    saveProductsToStorage();
    renderAllViews();
}

// --- 8. AUTO METADATA FETCH SIMULATION ---
function autoFetchMetadata() {
    const urlInput = document.getElementById("productUrl");
    const fetchStatus = document.getElementById("fetchStatus");
    const url = urlInput.value.trim();

    if (!url) {
        showStatusBanner("Please enter a product URL first.", "info");
        return;
    }

    if (!isValidHttpUrl(url)) {
        showStatusBanner("Please enter a valid HTTPS URL (e.g. https://domain.com/item)", "info");
        return;
    }

    showStatusBanner("Extracting link details...", "info");

    // Extract basic domain for title prediction
    try {
        const parsed = new URL(url);
        const domain = parsed.hostname.replace("www.", "");
        
        setTimeout(() => {
            // Fill fields if empty
            const titleInput = document.getElementById("productTitle");
            if (!titleInput.value) {
                const rawPath = parsed.pathname.split("/").pop().replace(/[-_]/g, " ");
                titleInput.value = rawPath.length > 3 ? capitalizeWords(rawPath) : `Item from ${domain}`;
            }

            const descInput = document.getElementById("productDesc");
            if (!descInput.value) {
                descInput.value = `Curated product available on ${domain}. Direct link provided for website browsing.`;
            }

            showStatusBanner(`Successfully fetched domain details from ${domain}`, "success");
            updateLivePreview();
        }, 600);
    } catch (e) {
        showStatusBanner("Could not parse URL details. Please enter fields manually.", "info");
    }
}

function showStatusBanner(msg, type) {
    const banner = document.getElementById("fetchStatus");
    banner.className = `status-banner ${type}`;
    banner.textContent = msg;
    banner.classList.remove("hidden");
}

function updateLivePreview() {
    const title = document.getElementById("productTitle").value || "Product Name Preview";
    const category = document.getElementById("productCategory").value || "Electronics";
    const price = document.getElementById("productPrice").value;
    const img = document.getElementById("productImage").value || getFallbackImage(category);
    const desc = document.getElementById("productDesc").value || "Your product description will appear here as you type into the form fields above.";

    document.getElementById("prevTitle").textContent = title;
    document.getElementById("prevBadge").textContent = category;
    document.getElementById("prevPrice").textContent = price ? `$${parseFloat(price).toFixed(2)}` : "$0.00";
    document.getElementById("prevImg").src = img;
    document.getElementById("prevDesc").textContent = desc;
}

// --- 9. FORM SUBMISSION ---
function handleFormSubmit(event) {
    event.preventDefault();

    const url = document.getElementById("productUrl").value.trim();
    const title = document.getElementById("productTitle").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = document.getElementById("productPrice").value;
    const image = document.getElementById("productImage").value.trim();
    const description = document.getElementById("productDesc").value.trim();

    if (!isValidHttpUrl(url)) {
        alert("Security Warning: Only standard HTTP/HTTPS URLs are allowed.");
        return;
    }

    const newProduct = {
        id: "prod-" + Date.now(),
        title,
        url,
        category,
        price: price ? parseFloat(price) : null,
        image: image || getFallbackImage(category),
        description,
        likes: 1,
        createdAt: Date.now(),
        comments: []
    };

    products.unshift(newProduct);
    saveProductsToStorage();
    renderAllViews();

    // Reset Form
    document.getElementById("addProductForm").reset();
    document.getElementById("fetchStatus").classList.add("hidden");
    updateLivePreview();

    showToast("Product link published successfully!");
    switchTab("explore");
}

// --- 10. PRODUCT MODAL & COMMENTS ---
function openProductModal(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById("productModal");
    const container = document.getElementById("modalProductDetails");

    const formattedPrice = prod.price ? `$${parseFloat(prod.price).toFixed(2)}` : 'Free / Link';
    const commentsListHTML = (prod.comments && prod.comments.length > 0) 
        ? prod.comments.map(c => `
            <div class="comment-item">
                <div class="comment-meta">
                    <span>Community Visitor</span>
                    <span>${c.time}</span>
                </div>
                <div class="comment-text">${escapeHTML(c.text)}</div>
            </div>
          `).join("")
        : `<p style="font-size:0.85rem; color:var(--text-muted);">No comments yet. Start the conversation below!</p>`;

    container.innerHTML = `
        <div class="modal-product-layout">
            <div class="modal-image-wrap">
                <img src="${prod.image || getFallbackImage(prod.category)}" alt="${escapeHTML(prod.title)}">
            </div>
            <div class="modal-info">
                <h2>${escapeHTML(prod.title)}</h2>
                <div class="modal-price">${formattedPrice}</div>
                <p class="modal-desc">${escapeHTML(prod.description)}</p>

                <div class="modal-actions">
                    <a href="${escapeHTML(prod.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <i class="fa-solid fa-up-right-from-square"></i> Visit Website Page
                    </a>
                    <button class="btn btn-outline" onclick="shareProduct('${prod.id}')">
                        <i class="fa-solid fa-share-nodes"></i> Share Link
                    </button>
                </div>

                <div class="modal-comments-section">
                    <h3><i class="fa-solid fa-comments"></i> Community Comments (${prod.comments ? prod.comments.length : 0})</h3>
                    <div class="comments-list">${commentsListHTML}</div>

                    <form class="comment-form" onsubmit="submitComment(event, '${prod.id}')">
                        <input type="text" id="commentInput" placeholder="Write a comment..." required maxlength="200">
                        <button type="submit" class="btn btn-secondary btn-sm">Post</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
}

function closeProductModal() {
    document.getElementById("productModal").classList.add("hidden");
}

function submitComment(event, productId) {
    event.preventDefault();
    const input = document.getElementById("commentInput");
    const text = input.value.trim();

    if (!text) return;

    const prod = products.find(p => p.id === productId);
    if (prod) {
        if (!prod.comments) prod.comments = [];
        prod.comments.push({
            text,
            time: "Just now"
        });
        saveProductsToStorage();
        openProductModal(productId); // Refresh modal view
        showToast("Comment posted!");
    }
}

function shareProduct(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (navigator.share) {
        navigator.share({
            title: prod.title,
            text: `Check out ${prod.title} on LinkMart!`,
            url: prod.url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(prod.url);
        showToast("Product URL copied to clipboard!");
    }
}

// --- 11. ADMIN DASHBOARD MODAL ---
function openAdminModal() {
    document.getElementById("adminModal").classList.remove("hidden");
}

function closeAdminModal() {
    document.getElementById("adminModal").classList.add("hidden");
}

function loginAdmin() {
    const pass = document.getElementById("adminPassInput").value;
    if (pass === "admin123") {
        isAdminLoggedIn = true;
        document.getElementById("adminLoginForm").classList.add("hidden");
        document.getElementById("adminDashboard").classList.remove("hidden");
        renderAdminDashboard();
    } else {
        alert("Incorrect administrator password. Try: admin123");
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById("adminLoginForm").classList.remove("hidden");
    document.getElementById("adminDashboard").classList.add("hidden");
    document.getElementById("adminPassInput").value = "";
}

function renderAdminDashboard() {
    document.getElementById("totalProductsCount").textContent = products.length;
    document.getElementById("totalReportsCount").textContent = "0";

    const tableBody = document.getElementById("adminProductsTable");
    tableBody.innerHTML = products.map(p => `
        <tr>
            <td><strong>${escapeHTML(p.title)}</strong></td>
            <td>${escapeHTML(p.category)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join("");
}

function deleteProduct(productId) {
    if (confirm("Are you sure you want to remove this product listing?")) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage();
        renderAdminDashboard();
        renderAllViews();
        showToast("Listing deleted.");
    }
}

function resetToDefaultData() {
    if (confirm("Reset marketplace data back to initial default items?")) {
        products = [...INITIAL_PRODUCTS];
        saveProductsToStorage();
        renderAdminDashboard();
        renderAllViews();
        showToast("Data reset to default.");
    }
}

// --- 12. HELPER UTILITIES ---
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

function getFallbackImage(category) {
    switch (category) {
        case "Electronics":
            return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
        case "Fashion":
            return "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80";
        case "Beauty & Personal Care":
            return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
        case "Home & Living":
            return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80";
        case "Software & Digital":
            return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80";
        default:
            return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}