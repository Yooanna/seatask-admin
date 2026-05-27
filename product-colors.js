// ========== PRODUCT COLOR IMAGES ==========
// Actual image URLs for each product color

const productColorImages = {
    // Premium Cotton T-Shirt (id: 1)
    1: {
        "Blue": "https://img.freepik.com/premium-photo/blue-cotton-tshirt-with-luxury-design-tshirt-mockup_677428-1057.jpg",
        "Black": "https://img.freepik.com/premium-photo/black-cotton-tshirt-with-luxury-design_677428-1058.jpg",
        "White": "https://img.freepik.com/premium-photo/white-cotton-tshirt-with-luxury-design_677428-1059.jpg",
        "Red": "https://img.freepik.com/premium-photo/red-cotton-tshirt-with-luxury-design_677428-1060.jpg"
    },
    // Adjustable Baseball Cap (id: 5)
    5: {
        "Black": "https://m.media-amazon.com/images/I/61pQqFqBqBL._AC_SL1500_.jpg",
        "Navy": "https://tse1.mm.bing.net/th/id/OIP.ti9ujzBZ9gwzAkfr34i6mgAAAA",
        "Red": "https://m.media-amazon.com/images/I/61tL5YpLtVL._AC_SL1500_.jpg",
        "White": "https://m.media-amazon.com/images/I/61SxXxLxXxL._AC_SL1500_.jpg"
    },
    // Compact Travel Umbrella (id: 2)
    2: {
        "White": "https://m.media-amazon.com/images/I/412DN-c2swL._AC_SL1500_.jpg",
        "Black": "https://m.media-amazon.com/images/I/51dn-c2swL._AC_SL1500_.jpg",
        "Navy": "https://m.media-amazon.com/images/I/51dN-c2swL._AC_SL1500_.jpg"
    },
    // Insulated Water Bottle (id: 4)
    4: {
        "Green": "https://i5.walmartimages.com/seo/40oz-Insulated-Water-Bottles-2-Leak-Proof-Lids-Spout-Lid-Straw-Lid-Wide-Mouth-Sport-Bottle-Straw-Stainless-Steel-Powder-Coated-Flask-Double-Walled-Va_596521a9-6a7c-46e7-9b4d-23a9b9e550e8.4d4eaa5fb8ff569a4ba540b3024479e0.jpeg",
        "White": "https://m.media-amazon.com/images/I/61xLxXxLxL._AC_SL1500_.jpg",
        "Black": "https://m.media-amazon.com/images/I/61xMxXxLxL._AC_SL1500_.jpg",
        "Pink": "https://m.media-amazon.com/images/I/61xNxXxLxL._AC_SL1500_.jpg"
    },
    // Gym Bag (id: 7)
    7: {
        "Blue": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841547",
        "Black": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841548",
        "Gray": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841549"
    },
    // Bluetooth Speaker (id: 3)
    3: {
        "Green": "https://wonderfulengineering.com/wp-content/uploads/2022/11/10-Best-Portable-Bluetooth-Speaker9-1024x1024.jpg",
        "Black": "https://m.media-amazon.com/images/I/71xLxXxLxL._AC_SL1500_.jpg",
        "Red": "https://m.media-amazon.com/images/I/71xMxXxLxL._AC_SL1500_.jpg"
    },
    // Wireless Earbuds (id: 6)
    6: {
        "Blue": "https://m.media-amazon.com/images/I/610OFtgRe7L.jpg",
        "White": "https://m.media-amazon.com/images/I/61zOFtgRe7L.jpg",
        "Black": "https://m.media-amazon.com/images/I/61xOFtgRe7L.jpg"
    },
    // Smart Watch Band (id: 8)
    8: {
        "Red": "https://m.media-amazon.com/images/I/716X7VCEaeL._AC_SL1500_.jpg",
        "Black": "https://m.media-amazon.com/images/I/71xX7VCEaeL._AC_SL1500_.jpg",
        "White": "https://m.media-amazon.com/images/I/71yX7VCEaeL._AC_SL1500_.jpg",
        "Blue": "https://m.media-amazon.com/images/I/71zX7VCEaeL._AC_SL1500_.jpg"
    },
    // Carbon Fiber Badminton Racket (id: 9)
    9: {
        "Black": "https://cdn.store-assets.com/s/964873/i/49661033.jpg",
        "Blue": "https://cdn.store-assets.com/s/964873/i/49661034.jpg",
        "Red": "https://cdn.store-assets.com/s/964873/i/49661035.jpg"
    },
    // Durable Shuttlecock (id: 10)
    10: {
        "Green": "https://genesissports.co.ke/wp-content/uploads/2023/09/58e97e_f6f8a231e7cb427da7d80d6a4e636f36mv2.webp",
        "White": "https://genesissports.co.ke/wp-content/uploads/2023/09/shuttlecock-white.jpg"
    }
};

// Get color image for a product
function getProductColorImage(productId, colorName) {
    if (productColorImages[productId] && productColorImages[productId][colorName]) {
        return productColorImages[productId][colorName];
    }
    return null;
}

// Apply to product detail page
function initDetailPageColors() {
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (!productColorImages[productId]) return;
        
        const colors = Object.keys(productColorImages[productId]);
        if (colors.length === 0) return;
        
        // Find the color options container
        const colorOptionsDiv = document.getElementById('colorOptions');
        if (!colorOptionsDiv) return;
        
        // Clear existing buttons and recreate with proper images
        colorOptionsDiv.innerHTML = '';
        
        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'variation-btn';
            if (color === colors[0]) btn.classList.add('active');
            btn.setAttribute('data-type', 'color');
            btn.setAttribute('data-value', color);
            btn.textContent = color;
            colorOptionsDiv.appendChild(btn);
        });
        
        // Get product image element
        const productImage = document.getElementById('mainProductImage');
        
        // Add click event to color buttons
        document.querySelectorAll('[data-type="color"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const colorName = this.getAttribute('data-value');
                const newImageSrc = getProductColorImage(productId, colorName);
                
                if (newImageSrc && productImage) {
                    // Smooth transition
                    productImage.style.transition = 'opacity 0.3s ease';
                    productImage.style.opacity = '0.5';
                    
                    setTimeout(() => {
                        productImage.src = newImageSrc;
                        productImage.style.opacity = '1';
                    }, 150);
                }
                
                // Update active state
                document.querySelectorAll('[data-type="color"]').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update color display text
                const colorDisplay = document.querySelector('.selected-color-display');
                if (colorDisplay) {
                    colorDisplay.innerHTML = `Selected Color: <strong>${colorName}</strong>`;
                }
            });
        });
        
        // Add color display text
        if (colorOptionsDiv && !document.querySelector('.selected-color-display')) {
            const colorDisplay = document.createElement('div');
            colorDisplay.className = 'selected-color-display';
            colorDisplay.innerHTML = `Selected Color: <strong>${colors[0]}</strong>`;
            colorOptionsDiv.insertAdjacentElement('beforebegin', colorDisplay);
        }
        
    }, 300);
}

// Initialize
function initProductColors() {
    if (window.location.pathname.includes('product-detail.html')) {
        initDetailPageColors();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductColors);
} else {
    initProductColors();
}