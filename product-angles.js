// ========== PRODUCT MULTI-ANGLE VIEWS ==========
// Small black circular dots for angle navigation
// FIXED: Prevents duplicate initialization

(function() {
    // Flag to track if already initialized
    let angleDotsInitialized = false;
    
    const productAngles = {
        1: { "Front": "https://img.freepik.com/premium-photo/blue-cotton-tshirt-with-luxury-design-tshirt-mockup_677428-1057.jpg", "Back": "https://img.freepik.com/premium-photo/back-view-blue-cotton-tshirt_677428-1061.jpg", "Side": "https://img.freepik.com/premium-photo/side-view-blue-cotton-tshirt_677428-1062.jpg", "Detail": "https://img.freepik.com/premium-photo/closeup-fabric-texture-blue-cotton-tshirt_677428-1063.jpg" },
        2: { "Closed": "https://m.media-amazon.com/images/I/412DN-c2swL._AC_SL1500_.jpg", "Open": "https://m.media-amazon.com/images/I/51dn-c2swL._AC_SL1500_.jpg", "Side": "https://m.media-amazon.com/images/I/51dN-c2swL._AC_SL1500_.jpg", "Handle": "https://m.media-amazon.com/images/I/41dN-c2swL._AC_SL1500_.jpg" },
        3: { "Front": "https://wonderfulengineering.com/wp-content/uploads/2022/11/10-Best-Portable-Bluetooth-Speaker9-1024x1024.jpg", "Back": "https://m.media-amazon.com/images/I/71xLxXxLxL._AC_SL1500_.jpg", "Top": "https://m.media-amazon.com/images/I/71xMxXxLxL._AC_SL1500_.jpg", "Bottom": "https://m.media-amazon.com/images/I/71xNxXxLxL._AC_SL1500_.jpg" },
        4: { "Front": "https://i5.walmartimages.com/seo/40oz-Insulated-Water-Bottles-2-Leak-Proof-Lids-Spout-Lid-Straw-Lid-Wide-Mouth-Sport-Bottle-Straw-Stainless-Steel-Powder-Coated-Flask-Double-Walled-Va_596521a9-6a7c-46e7-9b4d-23a9b9e550e8.4d4eaa5fb8ff569a4ba540b3024479e0.jpeg", "Side": "https://m.media-amazon.com/images/I/61xLxXxLxL._AC_SL1500_.jpg", "Lid": "https://m.media-amazon.com/images/I/61xMxXxLxL._AC_SL1500_.jpg", "Bottom": "https://m.media-amazon.com/images/I/61xNxXxLxL._AC_SL1500_.jpg" },
        5: { "Front": "https://tse1.mm.bing.net/th/id/OIP.ti9ujzBZ9gwzAkfr34i6mgAAAA", "Back": "https://m.media-amazon.com/images/I/61pQqFqBqBL._AC_SL1500_.jpg", "Side": "https://m.media-amazon.com/images/I/61tL5YpLtVL._AC_SL1500_.jpg", "Top": "https://m.media-amazon.com/images/I/61SxXxLxXxL._AC_SL1500_.jpg" },
        6: { "Front": "https://m.media-amazon.com/images/I/610OFtgRe7L.jpg", "Back": "https://m.media-amazon.com/images/I/61zOFtgRe7L.jpg", "Case": "https://m.media-amazon.com/images/I/61xOFtgRe7L.jpg", "Earbuds": "https://m.media-amazon.com/images/I/61yOFtgRe7L.jpg" },
        7: { "Front": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841547", "Back": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841548", "Inside": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841549", "Side": "https://th.bing.com/th/id/R.da02c3df9c583a25a23afb65d2841550" },
        8: { "Front": "https://m.media-amazon.com/images/I/716X7VCEaeL._AC_SL1500_.jpg", "Side": "https://m.media-amazon.com/images/I/71xX7VCEaeL._AC_SL1500_.jpg", "Back": "https://m.media-amazon.com/images/I/71yX7VCEaeL._AC_SL1500_.jpg", "Clasp": "https://m.media-amazon.com/images/I/71zX7VCEaeL._AC_SL1500_.jpg" },
        9: { "Front": "https://cdn.store-assets.com/s/964873/i/49661033.jpg", "Back": "https://cdn.store-assets.com/s/964873/i/49661034.jpg", "Side": "https://cdn.store-assets.com/s/964873/i/49661035.jpg", "Grip": "https://cdn.store-assets.com/s/964873/i/49661036.jpg" },
        10: { "Front": "https://genesissports.co.ke/wp-content/uploads/2023/09/58e97e_f6f8a231e7cb427da7d80d6a4e636f36mv2.webp", "Side": "https://genesissports.co.ke/wp-content/uploads/2023/09/shuttlecock-side.jpg", "Top": "https://genesissports.co.ke/wp-content/uploads/2023/09/shuttlecock-top.jpg" },
        11: { "Front": "https://badminton-shop.fr/wp-content/uploads/2025/09/Hundred-Trailblazer-Bag-White-Badmintontaske.jpg", "Back": "https://badminton-shop.fr/wp-content/uploads/2025/09/Hundred-Trailblazer-Bag-White-Badmintontaske-back.jpg", "Side": "https://badminton-shop.fr/wp-content/uploads/2025/09/Hundred-Trailblazer-Bag-White-Badmintontaske-side.jpg", "Inside": "https://badminton-shop.fr/wp-content/uploads/2025/09/Hundred-Trailblazer-Bag-White-Badmintontaske-inside.jpg" },
        12: { "Full": "https://myoutdoorsports.co.uk/wp-content/uploads/2022/04/buy-badminton-net-online.jpg", "Net": "https://myoutdoorsports.co.uk/wp-content/uploads/2022/04/badminton-net-detail.jpg", "Poles": "https://myoutdoorsports.co.uk/wp-content/uploads/2022/04/badminton-net-poles.jpg", "Bag": "https://myoutdoorsports.co.uk/wp-content/uploads/2022/04/badminton-net-bag.jpg" }
    };

    function getProductAngleImage(productId, angleName) {
        if (productAngles[productId] && productAngles[productId][angleName]) {
            return productAngles[productId][angleName];
        }
        return null;
    }

    // Remove existing angle dots if any
    function removeExistingAngleDots() {
        const existingDots = document.querySelectorAll('.angle-dots-container');
        existingDots.forEach(dot => dot.remove());
    }

    function addAngleDots() {
        // Prevent duplicate initialization
        if (angleDotsInitialized) {
            return;
        }
        
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            
            if (!productAngles[productId]) return;
            
            const angleNames = Object.keys(productAngles[productId]);
            if (angleNames.length === 0) return;
            
            const galleryDiv = document.querySelector('.product-detail-gallery');
            if (!galleryDiv) return;
            
            // Remove any existing dots first
            removeExistingAngleDots();
            
            let imageWrapper = galleryDiv.querySelector('.image-wrapper');
            if (!imageWrapper) {
                const productImage = galleryDiv.querySelector('img');
                if (productImage) {
                    imageWrapper = document.createElement('div');
                    imageWrapper.className = 'image-wrapper';
                    productImage.parentNode.insertBefore(imageWrapper, productImage);
                    imageWrapper.appendChild(productImage);
                }
            }
            
            if (!imageWrapper) return;
            
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'angle-dots-container';
            dotsContainer.innerHTML = `
                <div class="angle-dots">
                    ${angleNames.map((angle, index) => `
                        <button class="angle-dot ${index === 0 ? 'active' : ''}" data-angle="${angle}" title="${angle} view"></button>
                    `).join('')}
                </div>
            `;
            
            imageWrapper.insertAdjacentElement('afterend', dotsContainer);
            
            const productImage = document.getElementById('mainProductImage') || galleryDiv.querySelector('img');
            const dots = document.querySelectorAll('.angle-dot');
            
            dots.forEach(dot => {
                dot.addEventListener('click', function() {
                    const angleName = this.getAttribute('data-angle');
                    const newImageSrc = getProductAngleImage(productId, angleName);
                    
                    if (newImageSrc && productImage) {
                        productImage.style.transition = 'opacity 0.2s ease';
                        productImage.style.opacity = '0.4';
                        setTimeout(() => {
                            productImage.src = newImageSrc;
                            productImage.style.opacity = '1';
                        }, 150);
                        dots.forEach(d => d.classList.remove('active'));
                        this.classList.add('active');
                    }
                });
            });
            
            // Mark as initialized
            angleDotsInitialized = true;
        }, 500);
    }

    function addDotStyles() {
        // Check if styles already added
        if (document.getElementById('angle-dots-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'angle-dots-styles';
        style.textContent = `
            .angle-dots-container { 
                margin-top: 15px; 
                text-align: center; 
            }
            .angle-dots { 
                display: flex; 
                justify-content: center; 
                gap: 10px; 
                flex-wrap: wrap; 
            }
            .angle-dot { 
                width: 10px; 
                height: 10px; 
                border-radius: 50%; 
                background: #ccc; 
                border: none; 
                cursor: pointer; 
                transition: all 0.2s ease; 
                padding: 0; 
                margin: 0; 
            }
            .angle-dot:hover { 
                background: #888; 
                transform: scale(1.2); 
            }
            .angle-dot.active { 
                background: #1a1a1a; 
                transform: scale(1.1); 
            }
            .image-wrapper img { 
                transition: opacity 0.2s ease; 
            }
        `;
        document.head.appendChild(style);
    }

    function initProductAngles() {
        // Only run on product detail page
        if (!window.location.pathname.includes('product-detail.html')) {
            return;
        }
        
        addDotStyles();
        addAngleDots();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductAngles);
    } else {
        initProductAngles();
    }
    
    // Export for external use (without causing duplicate)
    window.getProductAngleImage = getProductAngleImage;
    window.addAngleDots = function() {
        if (!angleDotsInitialized) {
            addAngleDots();
        }
    };
})();