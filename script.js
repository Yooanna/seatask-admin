// ========== GLOBAL VARIABLES ==========
let currentCategory = "all";
let currentSort = "default";

// ========== SUPABASE CONFIG ==========
const MAIN_SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const MAIN_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

// Get user ID
function getMainUserId() {
    let userId = localStorage.getItem('seatask_cart_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('seatask_cart_user_id', userId);
    }
    return userId;
}

const mainUserId = getMainUserId();
let currentCart = [];

// Load cart from Supabase
async function loadMainCart() {
    try {
        const response = await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${mainUserId}&select=*`, {
            headers: {
                'apikey': MAIN_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`
            }
        });
        currentCart = await response.json();
        updateMainCartUI();
        return currentCart;
    } catch (error) {
        console.error('Error loading cart:', error);
        currentCart = [];
        return [];
    }
}

// Update cart count display
function updateMainCartUI() {
    const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) cartCountSpan.innerText = totalItems;
    
    // Update total if cart modal is open
    const cartTotalSpan = document.getElementById('cartTotal');
    if (cartTotalSpan && document.getElementById('cartModal')?.style.display === 'flex') {
        const totalPrice = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.innerText = totalPrice.toFixed(2);
    }
}

// Add to cart using Supabase
async function addToCartMain(productId, productName, productPrice, quantity = 1, variation = null) {
    console.log('🛒 Adding to Supabase cart:', productName);
    
    const existingItem = currentCart.find(item => 
        item.product_id === productId && 
        JSON.stringify(item.variation) === JSON.stringify(variation)
    );
    
    try {
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items?id=eq.${existingItem.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': MAIN_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
        } else {
            await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items`, {
                method: 'POST',
                headers: {
                    'apikey': MAIN_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: mainUserId,
                    product_id: productId,
                    product_name: productName,
                    price: productPrice,
                    quantity: quantity,
                    variation: variation
                })
            });
        }
        
        await loadMainCart();
        
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = `${productName} added to cart!`;
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
            }, 2000);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// PRODUCTS from Supabase
async function displayMainProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '<div style="text-align:center; padding:50px;">Loading products...</div>';
    
    try {
        const response = await fetch(`${MAIN_SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': MAIN_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`
            }
        });
        let products = await response.json();
        
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<div style="text-align:center; padding:50px;">No products found.</div>';
            return;
        }
        
        let filtered = [...products];
        
        if (currentCategory !== "all") {
            filtered = filtered.filter(p => p.category === currentCategory);
        }
        
        if (currentSort === "priceLowHigh") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (currentSort === "priceHighLow") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (currentSort === "nameAZ") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        productGrid.innerHTML = '';
        
        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', product.id);
            card.innerHTML = `
                <div class="product-image-container">
                    <img class="product-card-img" src="${product.image_url}" alt="${product.name}" onerror="this.src='https://picsum.photos/id/1/400/400'">
                </div>
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                    <div class="product-rating">⭐ ${product.rating} / 5 (${product.review_count || 0})</div>
                    <div class="product-price">RM ${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                </div>
            `;
            
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart-btn')) {
                    window.location.href = `product-detail.html?id=${product.id}`;
                }
            });
            
            productGrid.appendChild(card);
        });
        
        // Attach add to cart events
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = parseInt(newBtn.getAttribute('data-id'));
                const name = newBtn.getAttribute('data-name');
                const price = parseFloat(newBtn.getAttribute('data-price'));
                await addToCartMain(id, name, price, 1, null);
            });
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<div style="text-align:center; padding:50px;">Error loading products.</div>';
    }
}

// Render cart modal from Supabase
async function renderMainCartModal() {
    await loadMainCart();
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    
    if (currentCart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) cartTotalSpan.innerText = '0.00';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    for (const item of currentCart) {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0eef5;';
        itemDiv.innerHTML = `
            <div style="flex:1;">
                <div style="font-weight: 500;">${item.product_name}</div>
                <div style="font-size: 13px; color: #1976a5;">RM ${item.price.toFixed(2)} each</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button class="cart-qty-btn" data-id="${item.id}" data-action="decr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">-</button>
                <span>${item.quantity}</span>
                <button class="cart-qty-btn" data-id="${item.id}" data-action="incr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">+</button>
                <button class="cart-qty-btn" data-id="${item.id}" data-action="remove" style="background:#ff6b6b; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; color:white;">🗑</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    }
    
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const action = btn.dataset.action;
            const item = currentCart.find(i => i.id === id);
            
            if (action === 'incr') {
                await updateCartItemMain(id, item.quantity + 1);
            } else if (action === 'decr') {
                if (item.quantity > 1) {
                    await updateCartItemMain(id, item.quantity - 1);
                } else {
                    await removeCartItemMain(id);
                }
            } else if (action === 'remove') {
                await removeCartItemMain(id);
            }
            await renderMainCartModal();
        });
    });
    
    const cartTotalSpan = document.getElementById('cartTotal');
    if (cartTotalSpan) cartTotalSpan.innerText = total.toFixed(2);
}

async function updateCartItemMain(id, newQuantity) {
    try {
        await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': MAIN_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        await loadMainCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeCartItemMain(id) {
    try {
        await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': MAIN_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`
            }
        });
        await loadMainCart();
    } catch (error) {
        console.error('Error removing item:', error);
    }
}

// Initialize modals
function initMainModals() {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const cartIcon = document.getElementById('cartIcon');
    
    if (cartIcon) {
        const newCartIcon = cartIcon.cloneNode(true);
        cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
        
        newCartIcon.addEventListener('click', async () => {
            await renderMainCartModal();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }
    
    const closeBtn = document.querySelector('#cartModal .close');
    const closeCheckout = document.querySelector('#checkoutModal .close-checkout');
    const continueBtn = document.getElementById('continueShoppingBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (closeBtn) closeBtn.addEventListener('click', () => { if (cartModal) cartModal.style.display = 'none'; });
    if (closeCheckout) closeCheckout.addEventListener('click', () => { if (checkoutModal) checkoutModal.style.display = 'none'; });
    if (continueBtn) continueBtn.addEventListener('click', () => { if (cartModal) cartModal.style.display = 'none'; });
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            await loadMainCart();
            if (currentCart.length === 0) {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.innerText = 'Cart is empty! Add items first.';
                    toast.style.opacity = '1';
                    toast.style.visibility = 'visible';
                    setTimeout(() => {
                        toast.style.opacity = '0';
                        toast.style.visibility = 'hidden';
                    }, 2000);
                }
                return;
            }
            if (cartModal) cartModal.style.display = 'none';
            if (checkoutModal) checkoutModal.style.display = 'flex';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (cartModal && e.target === cartModal) cartModal.style.display = 'none';
        if (checkoutModal && e.target === checkoutModal) checkoutModal.style.display = 'none';
    });
}

// Checkout handler
function initMainCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) {
        setTimeout(initMainCheckout, 500);
        return;
    }
    
    const newForm = checkoutForm.cloneNode(true);
    checkoutForm.parentNode.replaceChild(newForm, checkoutForm);
    
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        await loadMainCart();
        
        if (currentCart.length === 0) {
            alert('Cart is empty!');
            return;
        }
        
        const totalAmount = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const fullName = document.querySelector('[name="fullName"]')?.value || 'Guest';
        const email = document.querySelector('[name="email"]')?.value || '';
        const phone = document.querySelector('[name="phone"]')?.value || '';
        const address = document.querySelector('[name="address"]')?.value || '';
        const paymentMethod = document.querySelector('[name="paymentMethod"]')?.value || 'Cash on Delivery';
        
        try {
            // Save order
            const orderResponse = await fetch(`${MAIN_SUPABASE_URL}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': MAIN_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_number: orderNumber,
                    user_id: mainUserId,
                    user_name: fullName,
                    user_email: email,
                    user_phone: phone,
                    delivery_address: address,
                    payment_method: paymentMethod,
                    total_amount: totalAmount,
                    status: 'completed',
                    created_at: new Date().toISOString()
                })
            });
            
            const savedOrder = await orderResponse.json();
            
            if (savedOrder && savedOrder[0]) {
                const orderItems = currentCart.map(item => ({
                    order_id: savedOrder[0].id,
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity
                }));
                
                await fetch(`${MAIN_SUPABASE_URL}/rest/v1/order_items`, {
                    method: 'POST',
                    headers: {
                        'apikey': MAIN_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderItems)
                });
            }
            
            // Clear cart
            await fetch(`${MAIN_SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${mainUserId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': MAIN_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${MAIN_SUPABASE_ANON_KEY}`
                }
            });
            
            await loadMainCart();
            
            alert('Order placed successfully! Order #: ' + orderNumber);
            
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) checkoutModal.style.display = 'none';
            newForm.reset();
            
            const cartModal = document.getElementById('cartModal');
            if (cartModal && cartModal.style.display === 'flex') {
                cartModal.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error placing order: ' + error.message);
        }
    });
}

// Initialize filters
function initMainFilters() {
    const catBtns = document.querySelectorAll('.cat-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            displayMainProducts();
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            displayMainProducts();
        });
    }
}

// Hero buttons
function initMainHeroButtons() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    const viewCartBtn = document.getElementById('viewCartBtn');
    const productsSection = document.getElementById('products-section');
    const cartModal = document.getElementById('cartModal');
    
    if (shopNowBtn && productsSection) {
        shopNowBtn.addEventListener('click', () => productsSection.scrollIntoView({ behavior: 'smooth' }));
    }
    
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', async () => {
            await renderMainCartModal();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }
}

// Force GIF loop
function forceGifLoop() {
    const gifElement = document.querySelector('.hero-background-gif');
    if (!gifElement) return;
    setInterval(() => {
        const currentSrc = gifElement.src;
        const timestamp = new Date().getTime();
        gifElement.src = currentSrc.split('?')[0] + '?t=' + timestamp;
    }, 4000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
    await displayMainProducts();
    initMainModals();
    initMainFilters();
    initMainHeroButtons();
    initMainCheckout();
    await loadMainCart();
    forceGifLoop();
});