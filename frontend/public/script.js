// ========== GLOBAL VARIABLES ==========
let cart = [];
let currentCategory = "all";
let currentSort = "default";

// ========== PRODUCT DATABASE WITH DETAILS ==========
const products = [
    { 
        id: 1, 
        name: "Premium Cotton T-Shirt", 
        category: "Shirt", 
        price: 79.00, 
        rating: 4.8, 
        image: "https://img.freepik.com/premium-photo/blue-cotton-tshirt-with-luxury-design-tshirt-mockup_677428-1057.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Original",
        origin: "Made in Malaysia",
        material: "100% Organic Cotton",
        description: "Premium quality cotton t-shirt with SeaTask logo. Breathable, soft, and perfect for daily wear. Features reinforced stitching and eco-friendly packaging.",
        care: "Machine wash cold. Do not bleach. Tumble dry low."
    },
    { 
        id: 5, 
        name: "Adjustable Baseball Cap", 
        category: "Hat", 
        price: 29.00, 
        rating: 4.5, 
        image: "https://tse1.mm.bing.net/th/id/OIP.ti9ujzBZ9gwzAkfr34i6mgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Original",
        origin: "Made in Vietnam",
        material: "Cotton Blend",
        description: "Classic baseball cap with embroidered SeaTask logo. Adjustable strap fits all sizes. UV protection and breathable mesh back.",
        care: "Spot clean only. Air dry."
    },
    { 
        id: 2, 
        name: "Compact Travel Umbrella", 
        category: "Accessories", 
        price: 45.00, 
        rating: 4.6, 
        image: "https://m.media-amazon.com/images/I/412DN-c2swL._AC_SL1500_.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Travel Gear",
        origin: "Made in China",
        material: "Fiberglass + Pongee Fabric",
        description: "Ultra-compact travel umbrella that fits in any bag. Windproof design with auto open/close button. UV protection coating.",
        care: "Air dry after use. Do not force close."
    },
    { 
        id: 4, 
        name: "Insulated Water Bottle", 
        category: "Accessories", 
        price: 35.00, 
        rating: 4.7, 
        image: "https://i5.walmartimages.com/seo/40oz-Insulated-Water-Bottles-2-Leak-Proof-Lids-Spout-Lid-Straw-Lid-Wide-Mouth-Sport-Bottle-Straw-Stainless-Steel-Powder-Coated-Flask-Double-Walled-Va_596521a9-6a7c-46e7-9b4d-23a9b9e550e8.4d4eaa5fb8ff569a4ba540b3024479e0.jpeg?odnHeight=424&odnWidth=424&odnBg=FFFFFF?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Hydration",
        origin: "Made in Malaysia",
        material: "18/8 Stainless Steel",
        description: "Double-walled insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Leakproof lid included. BPA-free.",
        care: "Hand wash recommended. Dishwasher safe top rack."
    },
    { 
        id: 7, 
        name: "Gym Bag", 
        category: "Accessories", 
        price: 59.00, 
        rating: 4.6, 
        image: "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841547?rik=xGxnzlspY6%2fW8Q&riu=http%3a%2f%2fwww.allfashionbags.com%2fwp-content%2fuploads%2f2019%2f09%2fNylon-Waterproof-Gym-Bag.jpg&ehk=y5bLVWyZTb27NakEHYGZJdQjSNpBj%2fKn%2bJUtQvj1bhE%3d&risl=&pid=ImgRaw&r=0?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Sports",
        origin: "Made in Vietnam",
        material: "Waterproof Nylon",
        description: "Spacious gym bag with separate shoe compartment. Water-resistant material. Adjustable shoulder strap and padded handles.",
        care: "Wipe clean with damp cloth. Air dry."
    },
    { 
        id: 3, 
        name: "Bluetooth Speaker", 
        category: "Electronics", 
        price: 129.00, 
        rating: 4.9, 
        image: "https://wonderfulengineering.com/wp-content/uploads/2022/11/10-Best-Portable-Bluetooth-Speaker9-1024x1024.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Audio",
        origin: "Designed in Malaysia, Made in China",
        material: "ABS Plastic + Silicone",
        description: "Portable Bluetooth speaker with 20-hour battery life. IPX7 waterproof rating. Deep bass and crystal clear sound. TWS pairing for stereo sound.",
        care: "Charge with included USB-C cable. Keep away from extreme heat."
    },
    { 
        id: 6, 
        name: "Wireless Earbuds", 
        category: "Electronics", 
        price: 89.00, 
        rating: 4.7, 
        image: "https://m.media-amazon.com/images/I/610OFtgRe7L.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Audio",
        origin: "Designed in Malaysia, Made in China",
        material: "ABS Plastic",
        description: "True wireless earbuds with charging case. 30-hour total battery life. Touch controls. Built-in microphone for calls.",
        care: "Clean ear tips regularly. Charge case every 2 weeks."
    },
    { 
        id: 8, 
        name: "Smart Watch Band", 
        category: "Electronics", 
        price: 49.00, 
        rating: 4.4, 
        image: "https://m.media-amazon.com/images/I/716X7VCEaeL._AC_SL1500_.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Accessories",
        origin: "Made in Malaysia",
        material: "Medical Grade Silicone",
        description: "Comfortable smartwatch band compatible with most 22mm watches. Breathable design with stainless steel buckle.",
        care: "Wipe with damp cloth. Avoid prolonged sun exposure."
    },
    { 
        id: 9, 
        name: "Carbon Fiber Badminton Racket", 
        category: "Badminton", 
        price: 159.00, 
        rating: 4.9, 
        image: "https://cdn.store-assets.com/s/964873/i/49661033.jpg?width=1024?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Sports",
        origin: "Made in Malaysia",
        material: "Carbon Fiber + Graphite",
        description: "Professional-grade badminton racket with carbon fiber frame. Lightweight (78g) with maximum tension support. Ideal for intermediate to advanced players.",
        care: "Keep in protective bag. Avoid extreme temperatures."
    },
    { 
        id: 10, 
        name: "Durable Shuttlecock (6pcs)", 
        category: "Badminton", 
        price: 25.00, 
        rating: 4.6, 
        image: "https://genesissports.co.ke/wp-content/uploads/2023/09/58e97e_f6f8a231e7cb427da7d80d6a4e636f36mv2.webp?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Sports",
        origin: "Made in Malaysia",
        material: "Goose Feather + Cork Base",
        description: "Premium goose feather shuttlecocks with natural cork base. Consistent flight performance. Pack of 6 shuttlecocks.",
        care: "Store in cool dry place. Use shuttlecock conditioner for longevity."
    },
    { 
        id: 11, 
        name: "Badminton Training Bag", 
        category: "Badminton", 
        price: 69.00, 
        rating: 4.7, 
        image: "https://badminton-shop.fr/wp-content/uploads/2025/09/Hundred-Trailblazer-Bag-White-Badmintontaske.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Sports",
        origin: "Made in Vietnam",
        material: "Polyester + Mesh",
        description: "Professional badminton bag with space for 2 rackets, shoes, and accessories. Ventilated shoe compartment and padded shoulder straps.",
        care: "Spot clean with mild detergent. Air dry."
    },
    { 
        id: 12, 
        name: "Professional Badminton Net", 
        category: "Badminton", 
        price: 89.00, 
        rating: 4.8, 
        image: "https://myoutdoorsports.co.uk/wp-content/uploads/2022/04/buy-badminton-net-online.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        brand: "SeaTask Sports",
        origin: "Made in Malaysia",
        material: "Polyethylene + Steel Cable",
        description: "Regulation-size badminton net with steel cable reinforcement. Weather-resistant material. Easy setup with carry bag included.",
        care: "Store dry. Clean with soft brush."
    }
];

// ========== SHOW TOAST ==========
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1976a5; color: white; padding: 12px 24px; border-radius: 40px; z-index: 1100; opacity: 0; visibility: hidden; transition: 0.3s;`;
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.visibility = 'visible';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.visibility = 'hidden';
    }, 2000);
}

// ========== UPDATE CART UI ==========
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) cartCountSpan.innerText = totalItems;
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotalSpan = document.getElementById('cartTotal');
    if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
}

// ========== RENDER CART MODAL ==========
function renderCartModal() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
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
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            if (action === 'incr') {
                cart[idx].quantity++;
            } else if (action === 'decr') {
                cart[idx].quantity--;
                if (cart[idx].quantity <= 0) cart.splice(idx, 1);
            } else if (action === 'remove') {
                cart.splice(idx, 1);
            }
            updateCartUI();
            renderCartModal();
        });
    });
}

// ========== ADD TO CART ==========
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

// ========== PRODUCT DETAILS MODAL ==========
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let detailsModal = document.getElementById('productDetailsModal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.id = 'productDetailsModal';
        detailsModal.className = 'modal';
        detailsModal.innerHTML = `
            <div class="modal-content product-details-content">
                <span class="close-details">&times;</span>
                <div class="product-details-container">
                    <div class="product-details-image">
                        <img id="detailsImage" src="" alt="">
                    </div>
                    <div class="product-details-info">
                        <h2 id="detailsName"></h2>
                        <div class="details-category" id="detailsCategory"></div>
                        <div class="details-rating" id="detailsRating"></div>
                        <div class="details-price" id="detailsPrice"></div>
                        <div class="details-brand">
                            <strong>🏷️ Brand:</strong> <span id="detailsBrand"></span>
                        </div>
                        <div class="details-origin">
                            <strong>📍 Origin:</strong> <span id="detailsOrigin"></span>
                        </div>
                        <div class="details-material">
                            <strong>🧵 Material:</strong> <span id="detailsMaterial"></span>
                        </div>
                        <div class="details-description">
                            <strong>📝 Description:</strong><br>
                            <span id="detailsDescription"></span>
                        </div>
                        <div class="details-care">
                            <strong>🧼 Care Instructions:</strong><br>
                            <span id="detailsCare"></span>
                        </div>
                        <button class="btn-add-details" id="detailsAddToCart">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(detailsModal);
        
        const closeBtn = detailsModal.querySelector('.close-details');
        closeBtn.addEventListener('click', () => {
            detailsModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.style.display = 'none';
            }
        });
    }
    
    document.getElementById('detailsImage').src = product.image;
    document.getElementById('detailsName').innerText = product.name;
    document.getElementById('detailsCategory').innerHTML = `📂 ${product.category}`;
    document.getElementById('detailsRating').innerHTML = `⭐ ${product.rating} / 5`;
    document.getElementById('detailsPrice').innerHTML = `RM ${product.price.toFixed(2)}`;
    document.getElementById('detailsBrand').innerText = product.brand || "SeaTask Original";
    document.getElementById('detailsOrigin').innerText = product.origin || "Made in Malaysia";
    document.getElementById('detailsMaterial').innerText = product.material || "Premium Quality";
    document.getElementById('detailsDescription').innerText = product.description || "High quality product from SeaTask Marketplace.";
    document.getElementById('detailsCare').innerText = product.care || "Follow standard care instructions.";
    
    const detailsAddBtn = document.getElementById('detailsAddToCart');
    const newBtn = detailsAddBtn.cloneNode(true);
    detailsAddBtn.parentNode.replaceChild(newBtn, detailsAddBtn);
    newBtn.addEventListener('click', () => {
        addToCart(product.id);
        detailsModal.style.display = 'none';
    });
    
    detailsModal.style.display = 'flex';
}

// ========== DISPLAY PRODUCTS ==========
function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
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
                <img class="product-card-img" src="${product.image}" alt="${product.name}" onerror="this.src='https://picsum.photos/id/1/400/400'">
            </div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-rating">⭐ ${product.rating} / 5</div>
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
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            addToCart(id);
        });
    });
}

// ========== FORCE GIF TO LOOP FOREVER ==========
function forceGifLoop() {
    const gifElement = document.querySelector('.hero-background-gif');
    if (!gifElement) return;
    setInterval(() => {
        const currentSrc = gifElement.src;
        const timestamp = new Date().getTime();
        gifElement.src = currentSrc.split('?')[0] + '?t=' + timestamp;
    }, 4000);
}

// ========== MODALS ==========
function initModals() {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            renderCartModal();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }
    const closeBtn = document.querySelector('.close');
    const closeCheckout = document.querySelector('.close-checkout');
    const continueBtn = document.getElementById('continueShoppingBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => {
        if (cartModal) cartModal.style.display = 'none';
    });
    if (closeCheckout) closeCheckout.addEventListener('click', () => {
        if (checkoutModal) checkoutModal.style.display = 'none';
    });
    if (continueBtn) continueBtn.addEventListener('click', () => {
        if (cartModal) cartModal.style.display = 'none';
    });
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Cart is empty! Add items first.');
                return;
            }
            if (cartModal) cartModal.style.display = 'none';
            if (checkoutModal) checkoutModal.style.display = 'flex';
        });
    }
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Order placed successfully! Thank you for shopping at SeaTask.');
            cart = [];
            updateCartUI();
            if (checkoutModal) checkoutModal.style.display = 'none';
            checkoutForm.reset();
        });
    }
    window.addEventListener('click', (e) => {
        if (cartModal && e.target === cartModal) cartModal.style.display = 'none';
        if (checkoutModal && e.target === checkoutModal) checkoutModal.style.display = 'none';
    });
}

// ========== FILTERS ==========
function initFilters() {
    const catBtns = document.querySelectorAll('.cat-btn');
    const sortSelect = document.getElementById('sortSelect');
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            displayProducts();
        });
    });
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            displayProducts();
        });
    }
}

// ========== HERO BUTTONS ==========
function initHeroButtons() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    const viewCartBtn = document.getElementById('viewCartBtn');
    const productsSection = document.getElementById('products-section');
    const cartModal = document.getElementById('cartModal');
    if (shopNowBtn && productsSection) {
        shopNowBtn.addEventListener('click', () => {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            renderCartModal();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    initModals();
    initFilters();
    initHeroButtons();
    updateCartUI();
    forceGifLoop();
});