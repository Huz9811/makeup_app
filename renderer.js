// Global variables
let allProducts = [];
let cart = [];
let wishlist = [];
let compareItems = [];

// Fetch products from API
async function fetchProducts() {
    try {
        showLoadingSpinner();
        const response = await fetch('http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline');
        const data = await response.json();
        allProducts = data;
        displayProducts(data);
    } catch (error) {
        showToast('Error fetching products', 'error');
        console.error('Error:', error);
    } finally {
        hideLoadingSpinner();
    }
}

// Original core functions remain the same, with these enhancements:

// Modify price display in displayProducts
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card h-100 product-card animate__animated animate__fadeIn">
                <div class="position-relative">
                    <img src="${product.image_link}" 
                         class="card-img-top product-image" 
                         alt="${product.name}"
                         onerror="this.src='assets/placeholder.jpg'">
                    <span class="wishlist-badge ${wishlist.some(item => item.id === product.id) ? 'active' : ''}" 
                          onclick="toggleWishlist(${product.id}, this)">
                        <i class="far fa-heart"></i>
                    </span>
                    ${product.price < 10 ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">SALE!</span>' : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title text-truncate">${product.name}</h5>
                    <p class="card-text">
                        <span class="text-primary fw-bold">RM ${(product.price * 4.5).toFixed(2)}</span>
                    </p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showQuickView(${JSON.stringify(product)})">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Update price format in quick view modal
function showQuickView(product) {
    const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
    const content = document.getElementById('quick-view-content');
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image_link}" class="img-fluid" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h3>${product.name}</h3>
                <p class="text-muted">${product.category}</p>
                <h4>RM ${(product.price * 4.5).toFixed(2)}</h4>
                <p>${product.description}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    modal.show();
}

// Update cart total display
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * 4.5 * item.quantity;
        total += itemTotal;
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between align-items-center mb-2';
        itemElement.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>RM ${itemTotal.toFixed(2)}</span>
            <div class="btn-group">
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="updateCart(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });

    cartTotal.textContent = `RM ${total.toFixed(2)}`;
}

// All other original functions remain the same
// Quick View Modal
function showQuickView(product) {
    const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
    const content = document.getElementById('quick-view-content');
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image_link}" class="img-fluid" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h3>${product.name}</h3>
                <p class="text-muted">${product.category}</p>
                <h4>${product.price_sign}${product.price}</h4>
                <p>${product.description}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    modal.show();
}

// Add to Cart
function addToCart(productId) {
    const product = allProducts.find(item => item.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        showToast('Added to cart', 'success');
    }
}

// Update Cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between align-items-center mb-2';
        itemElement.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>${item.price_sign}${(item.price * item.quantity).toFixed(2)}</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button>
            <button class="btn btn-sm btn-secondary" onclick="updateCart(${item.id})">Update</button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    showToast('Removed from cart', 'info');
}

// Update Cart
function updateCart(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        const quantity = prompt('Enter new quantity:', product.quantity);
        if (quantity > 0) {
            product.quantity = quantity;
            updateCartUI();
            showToast('Cart updated', 'success');
        }
    }
}

// Toggle Wishlist
function toggleWishlist(productId, element) {
    const product = allProducts.find(item => item.id === productId);
    if (product) {
        const index = wishlist.findIndex(item => item.id === productId);
        if (index === -1) {
            wishlist.push(product);
            element.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            showToast('Added to wishlist', 'success');
        } else {
            wishlist.splice(index, 1);
            element.innerHTML = '<i class="far fa-heart"></i>';
            showToast('Removed from wishlist', 'info');
        }
        updateWishlistUI();
    }
}

// Update Wishlist UI
function updateWishlistUI() {
    const wishlistItems = document.getElementById('wishlist-items');
    wishlistItems.innerHTML = '';

    wishlist.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between align-items-center mb-2';
        itemElement.innerHTML = `
            <span>${item.name}</span>
            <button class="btn btn-sm btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>
            <button class="btn btn-sm btn-secondary" onclick="updateWishlist(${item.id})">Update</button>
            <button class="btn btn-sm btn-danger" onclick="removeFromWishlist(${item.id})">Remove</button>
        `;
        wishlistItems.appendChild(itemElement);
    });
}

// Remove from Wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    updateWishlistUI();
    showToast('Removed from wishlist', 'info');
}

// Update Wishlist
function updateWishlist(productId) {
    const product = wishlist.find(item => item.id === productId);
    if (product) {
        // Implement update wishlist logic here
        showToast('Wishlist updated', 'success');
    }
}

// Add to Compare
function addToCompare(product) {
    if (compareItems.length >= 3) {
        showToast('You can compare up to 3 items', 'warning');
        return;
    }
    if (!compareItems.some(item => item.id === product.id)) {
        compareItems.push(product);
        updateCompareBar();
        showToast('Added to compare', 'success');
    } else {
        showToast('Already in compare list', 'info');
    }
}

// Update Compare Bar
function updateCompareBar() {
    const compareBar = document.getElementById('compare-bar');
    const compareItemsContainer = document.getElementById('compare-items');
    compareItemsContainer.innerHTML = '';

    compareItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'compare-item';
        itemElement.innerHTML = `
            <img src="${item.image_link}" alt="${item.name}" width="50">
            <span>${item.name}</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromCompare(${item.id})">Remove</button>
        `;
        compareItemsContainer.appendChild(itemElement);
    });

    compareBar.style.display = compareItems.length > 0 ? 'block' : 'none';
}

// Remove from Compare
function removeFromCompare(productId) {
    compareItems = compareItems.filter(item => item.id !== productId);
    updateCompareBar();
    showToast('Removed from compare', 'info');
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class=" toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.removeChild(toast);
    });
}

// Show Loading Spinner
function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

// Hide Loading Spinner
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Filter and Sort Products
function filterAndSortProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('filter-select').value;
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    const sortBy = document.getElementById('sort-select').value;

    let filteredProducts = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) &&
               (category === '' || product.category === category) &&
               product.price >= minPrice &&
               product.price <= maxPrice;
    });

    if (sortBy === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayProducts(filteredProducts);
}

// Event Listeners
document.getElementById('search-input').addEventListener('input', filterAndSortProducts);
document.getElementById('filter-select').addEventListener('change', filterAndSortProducts);
document.getElementById('min-price').addEventListener('input', filterAndSortProducts);
document.getElementById('max-price').addEventListener('input', filterAndSortProducts);
document.getElementById('sort-select').addEventListener('change', filterAndSortProducts);

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

document.getElementById('cart-btn').addEventListener('click', () => {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
});

document.getElementById('wishlist-btn').addEventListener('click', () => {
    const wishlistModal = new bootstrap.Modal(document.getElementById('wishlistModal'));
    wishlistModal.show();
});

window.addEventListener('scroll', () => {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (window.pageYOffset > 100) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

document.getElementById('scroll-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    // Implement checkout logic here
    showToast('Checkout functionality coming soon!', 'info');
});

document.getElementById('compare-now').addEventListener('click', () => {
    if (compareItems.length < 2) {
        showToast('Select at least 2 items to compare', 'warning');
        return;
    }
    // Implement comparison logic here
    showToast('Comparison functionality coming soon!', 'info');
});

document.getElementById('clear-compare').addEventListener('click', () => {
    compareItems = [];
    updateCompareBar();
    showToast('Comparison list cleared', 'info');
});

// Quick Filter Badges
document.querySelectorAll('.filter-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        let filteredProducts = allProducts;

        if (filter === 'new') {
            filteredProducts = allProducts.filter(product => 
                new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            );
        } else if (filter === 'sale') {
            filteredProducts = allProducts.filter(product => 
                product.price_sign && product.price < 10
            );
        } else if (filter === 'trending') {
            // Implement trending logic here
            filteredProducts = allProducts.slice(0, 8); // Example: show first 8 products
        }

        displayProducts(filteredProducts);
    });
});

// Handle image loading errors
document.addEventListener('error', (e) => {
    if (e.target.tagName.toLowerCase() === 'img') {
        e.target.src = 'placeholder.jpg'; // Replace with actual placeholder image path
    }
}, true);

// Local Storage Management
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
}

function loadFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('cart');
        const savedWishlist = localStorage.getItem('wishlist');
        const savedCompareItems = localStorage.getItem('compareItems');

        if (savedCart) cart = JSON.parse(savedCart);
        if (savedWishlist) wishlist = JSON.parse(savedWishlist);
        if (savedCompareItems) compareItems = JSON.parse(savedCompareItems);

        updateCartUI();
        updateWishlistUI();
        updateCompareBar();
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Save data before page unload
window.addEventListener('beforeunload', saveToLocalStorage);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadFromLocalStorage();

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data -bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'b') { // Ctrl+B to toggle dark mode
        document.body.classList.toggle('dark-mode');
    }
    if (e.ctrlKey && e.key === '/') { // Ctrl+/ to focus search
        document.getElementById('search-input').focus();
        e.preventDefault();
    }
});

// Add responsive handling
window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        // Mobile view adjustments
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('col-6');
        });
    } else {
        // Desktop view adjustments
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('col-6');
        });
    }
});

// Manage Products functionality
function openManageProductsPage() {
    window.location.href = 'crud.html';
}

// Add event listener for the Manage Products button
document.addEventListener('DOMContentLoaded', () => {
    const manageProductsBtn = document.querySelector('a[href="crud.html"]');
    if (manageProductsBtn) {
        manageProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openManageProductsPage();
        });
    }
});

// Navigation to Wishlist and Cart pages
document.getElementById('wishlist-btn').addEventListener('click', () => {
    window.location.href = 'wishlist.html';
});

document.getElementById('cart-btn').addEventListener('click', () => {
    window.location.href = 'cart.html';
});

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        toggleWishlist,
        addToCompare,
        removeFromCompare,
        filterAndSortProducts,
        openManageProductsPage
    };
}