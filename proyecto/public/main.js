// Products Database
const products = [
    { id: 1, name: 'Manzana', emoji: '🍎', category: 'frutas', color: 'var(--color-frutas)', price: 2.5 },
    { id: 2, name: 'Leche', emoji: '🥛', category: 'lacteos', color: 'var(--color-lacteos)', price: 3.2 },
    { id: 3, name: 'Pan', emoji: '🍞', category: 'panaderia', color: 'var(--color-panaderia)', price: 1.8 },
    { id: 4, name: 'Plátano', emoji: '🍌', category: 'frutas', color: 'var(--color-frutas)', price: 1.5 },
    { id: 5, name: 'Queso', emoji: '🧀', category: 'lacteos', color: 'var(--color-lacteos)', price: 4.5 },
    { id: 6, name: 'Huevos', emoji: '🥚', category: 'lacteos', color: 'var(--color-lacteos)', price: 3.0 },
    { id: 7, name: 'Tomate', emoji: '🍅', category: 'frutas', color: 'var(--color-frutas)', price: 2.0 },
    { id: 8, name: 'Detergente', emoji: '🧴', category: 'limpieza', color: 'var(--color-limpieza)', price: 5.5 },
    { id: 9, name: 'Pollo', emoji: '🍗', category: 'carnes', color: 'var(--color-carnes)', price: 6.0 },
    { id: 10, name: 'Pasta', emoji: '🍝', category: 'despensa', color: 'var(--color-despensa)', price: 2.8 },
    { id: 11, name: 'Arroz', emoji: '🍚', category: 'despensa', color: 'var(--color-despensa)', price: 3.5 },
    { id: 12, name: 'Café', emoji: '☕', category: 'despensa', color: 'var(--color-despensa)', price: 4.0 },
    { id: 13, name: 'Zanahoria', emoji: '🥕', category: 'frutas', color: 'var(--color-frutas)', price: 1.8 },
    { id: 14, name: 'Pescado', emoji: '🐟', category: 'carnes', color: 'var(--color-carnes)', price: 7.5 },
    { id: 15, name: 'Yogurt', emoji: '🥛', category: 'lacteos', color: 'var(--color-lacteos)', price: 2.5 },
];

// App State
let cart = [];
let purchased = [];
let touchStartX = 0;
let touchStartY = 0;
let currentSwipeElement = null;

// Initialize App
function init() {
    loadFromStorage();
    renderProducts();
    renderCart();
    updateHeader();
}

// LocalStorage Functions
function loadFromStorage() {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedPurchased = localStorage.getItem('purchasedItems');

    if (savedCart) cart = JSON.parse(savedCart);
    if (savedPurchased) purchased = JSON.parse(savedPurchased);
}

function saveToStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    localStorage.setItem('purchasedItems', JSON.stringify(purchased));
}

// Render Products Grid
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('button');
        card.className = 'product-card';
        card.style.backgroundColor = product.color + '33';
        card.innerHTML = `
      <div class="product-emoji">${product.emoji}</div>
      <div>${product.name}</div>
    `;
        card.onclick = () => addToCart(product);
        grid.appendChild(card);
    });
}

// Add to Cart
function addToCart(product) {
    if (cart.find(item => item.id === product.id)) {
        showToast('¡Ya está en el carrito!');
        return;
    }

    cart.push(product);
    saveToStorage();
    renderCart();
    updateHeader();
    animateAddToCart();
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    purchased = purchased.filter(id => id !== productId);
    saveToStorage();
    renderCart();
    updateHeader();
}

// Mark as Purchased
function markAsPurchased(productId) {
    if (!purchased.includes(productId)) {
        purchased.push(productId);
        saveToStorage();
        renderCart();
        updateHeader();
        checkCompletion();
    }
}

// Render Cart
function renderCart() {
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Carrito vacío</p>
        <small>Agrega productos desde el panel de la izquierda</small>
      </div>
    `;
        document.getElementById('progress-container').style.display = 'none';
        return;
    }

    container.innerHTML = '';

    cart.forEach(item => {
        const isPurchased = purchased.includes(item.id);
        const cartItem = document.createElement('div');
        cartItem.className = `cart-item ${isPurchased ? 'purchased' : ''}`;
        cartItem.style.borderLeft = `4px solid ${item.color}`;
        cartItem.dataset.id = item.id;

        cartItem.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-actions">
        ${!isPurchased ? `<button class="btn btn-check" onclick="markAsPurchased(${item.id})">✓</button>` : ''}
        <button class="btn btn-delete" onclick="removeFromCart(${item.id})">🗑️</button>
      </div>
    `;

        // Add touch listeners for swipe
        cartItem.addEventListener('touchstart', handleTouchStart, { passive: false });
        cartItem.addEventListener('touchmove', handleTouchMove, { passive: false });
        cartItem.addEventListener('touchend', handleTouchEnd, { passive: false });

        container.appendChild(cartItem);
    });

    updateProgress();
}

// Touch Handlers for Swipe
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentSwipeElement = e.currentTarget;
    currentSwipeElement.classList.add('swiping');
}

function handleTouchMove(e) {
    if (!currentSwipeElement) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        currentSwipeElement.style.transform = `translateX(${deltaX}px)`;
    }
}

function handleTouchEnd(e) {
    if (!currentSwipeElement) return;

    const touchX = e.changedTouches[0].clientX;
    const deltaX = touchX - touchStartX;

    currentSwipeElement.style.transform = '';
    currentSwipeElement.classList.remove('swiping');

    const itemId = parseInt(currentSwipeElement.dataset.id);

    if (Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
            markAsPurchased(itemId);
        } else {
            removeFromCart(itemId);
        }
    }

    currentSwipeElement = null;
}

// Update Header
function updateHeader() {
    document.getElementById('cart-count').textContent = `${cart.length} producto${cart.length !== 1 ? 's' : ''}`;

    const totalCost = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;
}

// Update Progress
function updateProgress() {
    const container = document.getElementById('progress-container');

    if (cart.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    const percentage = (purchased.length / cart.length) * 100;
    document.getElementById('progress-text').textContent = `${purchased.length}/${cart.length}`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Check Completion
function checkCompletion() {
    if (cart.length > 0 && purchased.length === cart.length) {
        launchRocket();
    }
}

// Launch Rocket Animation
function launchRocket() {
    const rocket = document.getElementById('rocket');
    rocket.classList.remove('hidden');

    setTimeout(() => {
        rocket.classList.add('hidden');
        showToast('¡Compra completada! 🎉');
    }, 3000);
}

// Animate Add to Cart
function animateAddToCart() {
    const header = document.querySelector('.cart-icon');
    header.style.transform = 'scale(1.3)';
    setTimeout(() => {
        header.style.transform = 'scale(1)';
    }, 200);
}

// Toast Notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    z-index: 10000;
    animation: fadeInOut 2s ease-in-out;
  `;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}

// CSS Animation for Toast
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .cart-icon { transition: transform 0.2s; }
`;
document.head.appendChild(style);

// Initialize on load
init();

// Expose functions globally for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.markAsPurchased = markAsPurchased;