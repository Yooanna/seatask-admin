// ========== SHARED CART MANAGER ==========
// Single source of truth for cart across all pages

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCartGlobal(productId, productName, productPrice, quantity = 1, variation = null) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => 
        item.id === productId && JSON.stringify(item.variation) === JSON.stringify(variation)
    );
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity,
            variation: variation
        });
    }
    
    saveCart(cart);
    updateAllCartCounts();
    return cart;
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateAllCartCounts();
    return cart;
}

function updateCartQuantity(index, newQuantity) {
    let cart = getCart();
    if (newQuantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQuantity;
    }
    saveCart(cart);
    updateAllCartCounts();
    return cart;
}

function getCartTotalCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotalPrice() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateAllCartCounts() {
    const totalCount = getCartTotalCount();
    const allCartCountElements = document.querySelectorAll('#cartCount');
    allCartCountElements.forEach(el => {
        if (el) el.innerText = totalCount;
    });
}

function clearCart() {
    saveCart([]);
    updateAllCartCounts();
}

function getCartForDisplay() {
    return getCart();
}

function initCartDisplay() {
    updateAllCartCounts();
}

window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateAllCartCounts();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartDisplay);
} else {
    initCartDisplay();
}