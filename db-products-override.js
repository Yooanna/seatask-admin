// ========== SUPABASE PRODUCTS OVERRIDE ==========
// This REPLACES products from Supabase while keeping cart working

(function() {
    
    // Helper function to update cart count anywhere on page
    function updateCartCountDisplay() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountSpan = document.getElementById('cartCount');
        if (cartCountSpan) {
            cartCountSpan.innerText = totalItems;
            console.log('Cart count updated to:', totalItems);
        }
        return totalItems;
    }
    
    // Helper function to update cart total
    function updateCartTotalDisplay() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) {
            cartTotalSpan.innerText = totalPrice.toFixed(2);
        }
        return totalPrice;
    }
    
    // Function to render cart modal content
    function renderCartModalContent() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsDiv = document.getElementById('cartItems');
        if (!cartItemsDiv) return;
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
            updateCartTotalDisplay();
            return;
        }
        
        cartItemsDiv.innerHTML = '';
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0eef5;';
            itemDiv.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight: 500;">${item.name}</div>
                    <div style="font-size: 13px; color: #1976a5;">RM ${item.price.toFixed(2)} each</div>
                    ${item.variation ? `<div style="font-size: 11px; color: #7a8e9c;">${item.variation.color ? `Color: ${item.variation.color}` : ''} ${item.variation.size ? `Size: ${item.variation.size}` : ''}</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="qty-btn" data-index="${index}" data-action="decr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-index="${index}" data-action="incr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">+</button>
                    <button class="qty-btn" data-index="${index}" data-action="remove" style="background:#ff6b6b; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; color:white;">🗑</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('#cartItems .qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                if (action === 'incr') {
                    cart[idx].quantity++;
                } else if (action === 'decr') {
                    cart[idx].quantity--;
                    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
                } else if (action === 'remove') {
                    cart.splice(idx, 1);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCountDisplay();
                updateCartTotalDisplay();
                renderCartModalContent(); // Re-render
            });
        });
        
        updateCartTotalDisplay();
    }
    
    // Override the cart icon click handler
    function fixCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        
        if (cartIcon && !cartIcon._fixed) {
            cartIcon._fixed = true;
            
            // Remove all existing listeners by cloning
            const newCartIcon = cartIcon.cloneNode(true);
            cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
            
            newCartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cart icon clicked');
                renderCartModalContent();
                if (cartModal) {
                    cartModal.style.display = 'flex';
                }
            });
            
            // Update global reference
            window.cartIcon = newCartIcon;
        }
    }
    
    // Main function to display products from Supabase
    async function displayProductsFromSupabase() {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '<div style="text-align:center; padding:50px;">Loading products...</div>';
        
        // Get products from Supabase
        let products = await supabaseDB.getProducts();
        
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<div style="text-align:center; padding:50px;">No products found. Please add products in Supabase.</div>';
            return;
        }
        
        // Get current filter/sort values
        let currentCategory = window.currentCategory || "all";
        let currentSort = window.currentSort || "default";
        
        let filtered = [...products];
        
        // Apply filters
        if (currentCategory !== "all") {
            filtered = filtered.filter(p => p.category === currentCategory);
        }
        
        // Apply sorting
        if (currentSort === "priceLowHigh") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (currentSort === "priceHighLow") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (currentSort === "nameAZ") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        productGrid.innerHTML = '';
        
        if (filtered.length === 0) {
            productGrid.innerHTML = '<div style="text-align:center; padding:50px;">No products in this category.</div>';
            return;
        }
        
        // Create product cards
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
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            
            card.addEventListener('click', (e) => { 
                if (!e.target.classList.contains('add-to-cart-btn')) { 
                    window.location.href = `product-detail.html?id=${product.id}`; 
                } 
            });
            
            productGrid.appendChild(card);
        });
        
        // Add event listeners to Add to Cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(btn => {
            // Clone and replace to remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                const id = parseInt(newBtn.getAttribute('data-id'));
                
                // Get product details
                const products = await supabaseDB.getProducts();
                const product = products.find(p => p.id === id);
                if (!product) return;
                
                // Get current cart from localStorage
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Check if product already in cart
                const existing = cart.find(item => item.id === id);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ 
                        id: product.id, 
                        name: product.name, 
                        price: product.price, 
                        quantity: 1 
                    });
                }
                
                // Save back to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count display
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                const cartCountSpan = document.getElementById('cartCount');
                if (cartCountSpan) cartCountSpan.innerText = totalItems;
                
                // Also update total in cart modal if open
                const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const cartTotalSpan = document.getElementById('cartTotal');
                if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
                
                // If cart modal is open, refresh its content
                const cartModal = document.getElementById('cartModal');
                if (cartModal && cartModal.style.display === 'flex') {
                    renderCartModalContent();
                }
                
                // Show success message
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.innerText = `${product.name} added to cart!`;
                    toast.style.opacity = '1';
                    toast.style.visibility = 'visible';
                    setTimeout(() => {
                        toast.style.opacity = '0';
                        toast.style.visibility = 'hidden';
                    }, 2000);
                }
                
                console.log('Cart now has', totalItems, 'items');
            });
        });
    }
    
    // Update cart count on page load
    function initCartOnLoad() {
        updateCartCountDisplay();
        fixCartIcon();
    }
    
    // Override the original displayProducts function
    function overrideDisplayProducts() {
        if (typeof window.displayProducts === 'function') {
            window.displayProducts = displayProductsFromSupabase;
            console.log('✅ Products loading from Supabase');
            
            // Load products immediately if page is ready
            if (document.readyState === 'complete') {
                displayProductsFromSupabase();
            }
        } else {
            setTimeout(overrideDisplayProducts, 500);
        }
    }
    
    // Override filters and sort
    function overrideFilters() {
        if (typeof window.initFilters === 'function') {
            const originalInitFilters = window.initFilters;
            window.initFilters = function() {
                originalInitFilters();
                
                // Re-attach filter events
                const catBtns = document.querySelectorAll('.cat-btn');
                const sortSelect = document.getElementById('sortSelect');
                
                catBtns.forEach(btn => {
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    newBtn.addEventListener('click', () => {
                        catBtns.forEach(b => b.classList.remove('active'));
                        newBtn.classList.add('active');
                        window.currentCategory = newBtn.getAttribute('data-category');
                        displayProductsFromSupabase();
                    });
                });
                
                if (sortSelect) {
                    const newSort = sortSelect.cloneNode(true);
                    sortSelect.parentNode.replaceChild(newSort, sortSelect);
                    newSort.addEventListener('change', (e) => {
                        window.currentSort = e.target.value;
                        displayProductsFromSupabase();
                    });
                }
            };
        }
    }
    
    // Also override the existing addToCart function from script.js to work with localStorage
    function overrideAddToCart() {
        if (typeof window.addToCart === 'function') {
            const originalAddToCart = window.addToCart;
            window.addToCart = function(productId) {
                // Use our localStorage-based add to cart
                const getProductsAndAdd = async () => {
                    const products = await supabaseDB.getProducts();
                    const product = products.find(p => p.id === productId);
                    if (!product) return;
                    
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existing = cart.find(item => item.id === productId);
                    if (existing) {
                        existing.quantity++;
                    } else {
                        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    updateCartCountDisplay();
                    updateCartTotalDisplay();
                    
                    const toast = document.getElementById('toast');
                    if (toast) {
                        toast.innerText = `${product.name} added to cart!`;
                        toast.style.opacity = '1';
                        toast.style.visibility = 'visible';
                        setTimeout(() => {
                            toast.style.opacity = '0';
                            toast.style.visibility = 'hidden';
                        }, 2000);
                    }
                };
                getProductsAndAdd();
            };
            console.log('✅ Add to cart overridden');
        } else {
            setTimeout(overrideAddToCart, 500);
        }
    }
    
    // Start everything
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initCartOnLoad();
            setTimeout(overrideDisplayProducts, 100);
            setTimeout(overrideFilters, 200);
            setTimeout(overrideAddToCart, 300);
        });
    } else {
        initCartOnLoad();
        setTimeout(overrideDisplayProducts, 100);
        setTimeout(overrideFilters, 200);
        setTimeout(overrideAddToCart, 300);
    }
})();