// ========== PRODUCT DETAIL ENHANCEMENTS ==========

// Product color variations with different images
const colorVariations = {
    // For T-Shirt
    1: {
        colors: {
            "Blue": "https://img.freepik.com/premium-photo/blue-cotton-tshirt-with-luxury-design-tshirt-mockup_677428-1057.jpg",
            "Black": "https://img.freepik.com/premium-photo/black-cotton-tshirt-with-luxury-design_677428-1058.jpg",
            "White": "https://img.freepik.com/premium-photo/white-cotton-tshirt-with-luxury-design_677428-1059.jpg",
            "Red": "https://img.freepik.com/premium-photo/red-cotton-tshirt-with-luxury-design_677428-1060.jpg"
        }
    },
    // For Baseball Cap
    5: {
        colors: {
            "Navy": "https://tse1.mm.bing.net/th/id/OIP.ti9ujzBZ9gwzAkfr34i6mgAAAA?rs=1&pid=ImgDetMain",
            "Black": "https://m.media-amazon.com/images/I/61pQqFqBqBL._AC_SL1500_.jpg",
            "White": "https://m.media-amazon.com/images/I/61tL5YpLtVL._AC_SL1500_.jpg",
            "Gray": "https://m.media-amazon.com/images/I/61SxXxLxXxL._AC_SL1500_.jpg"
        }
    },
    // For Umbrella
    2: {
        colors: {
            "Black": "https://m.media-amazon.com/images/I/412DN-c2swL._AC_SL1500_.jpg",
            "Navy": "https://m.media-amazon.com/images/I/51dn-c2swL._AC_SL1500_.jpg",
            "Red": "https://m.media-amazon.com/images/I/51dN-c2swL._AC_SL1500_.jpg"
        }
    },
    // For Water Bottle
    4: {
        colors: {
            "White": "https://i5.walmartimages.com/seo/40oz-Insulated-Water-Bottles-2-Leak-Proof-Lids-Spout-Lid-Straw-Lid-Wide-Mouth-Sport-Bottle-Straw-Stainless-Steel-Powder-Coated-Flask-Double-Walled-Va_596521a9-6a7c-46e7-9b4d-23a9b9e550e8.4d4eaa5fb8ff569a4ba540b3024479e0.jpeg",
            "Black": "https://m.media-amazon.com/images/I/61xLxXxLxL._AC_SL1500_.jpg",
            "Green": "https://m.media-amazon.com/images/I/61xMxXxLxL._AC_SL1500_.jpg",
            "Pink": "https://m.media-amazon.com/images/I/61xNxXxLxL._AC_SL1500_.jpg"
        }
    },
    // For Earbuds
    6: {
        colors: {
            "White": "https://m.media-amazon.com/images/I/610OFtgRe7L.jpg",
            "Black": "https://m.media-amazon.com/images/I/61zOFtgRe7L.jpg"
        }
    }
};

// Default fallback images for colors not specified
const getColorImage = (productId, colorName, defaultImage) => {
    if (colorVariations[productId] && colorVariations[productId].colors[colorName]) {
        return colorVariations[productId].colors[colorName];
    }
    return defaultImage;
};

// Initialize product detail enhancements
function initProductEnhancements(product) {
    // Variables for zoom
    let currentZoom = 1;
    let zoomLevel = 0.25;
    let currentColor = null;
    
    // Get DOM elements
    const productImage = document.querySelector('.product-detail-gallery img');
    const colorOptions = document.querySelectorAll('[data-type="color"]');
    const imageContainer = document.querySelector('.product-detail-gallery');
    
    if (!productImage) return;
    
    // Store original image src
    const originalImageSrc = productImage.src;
    
    // ========== 1. COLOR CHANGE FUNCTIONALITY ==========
    function changeProductColor(colorName, imageSrc) {
        if (!productImage) return;
        
        // Add fade out effect
        productImage.style.transition = 'opacity 0.3s ease';
        productImage.style.opacity = '0.5';
        
        setTimeout(() => {
            productImage.src = imageSrc;
            productImage.style.opacity = '1';
        }, 150);
        
        // Update selected color display
        const colorDisplay = document.querySelector('.selected-color-display');
        if (colorDisplay) {
            colorDisplay.innerHTML = `Selected: <strong style="color: ${colorName.toLowerCase()};">${colorName}</strong>`;
        }
        
        currentColor = colorName;
    }
    
    // Add color change event listeners
    if (colorOptions && colorOptions.length > 0) {
        colorOptions.forEach(btn => {
            btn.addEventListener('click', function() {
                const colorName = this.getAttribute('data-value');
                const newImageSrc = getColorImage(product.id, colorName, originalImageSrc);
                changeProductColor(colorName, newImageSrc);
            });
        });
    }
    
    // ========== 2. ZOOM IN/OUT FUNCTIONALITY ==========
    function createZoomControls() {
        const galleryDiv = document.querySelector('.product-detail-gallery');
        if (!galleryDiv) return;
        
        // Create zoom controls container
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = `
            <button id="zoomOutBtn" class="zoom-btn" title="Zoom Out">−</button>
            <span id="zoomLevelDisplay" class="zoom-level">100%</span>
            <button id="zoomInBtn" class="zoom-btn" title="Zoom In">+</button>
            <button id="resetZoomBtn" class="zoom-btn reset" title="Reset Zoom">⟳</button>
        `;
        
        // Insert zoom controls before the image
        const imageWrapper = document.querySelector('.product-detail-gallery .image-wrapper') || galleryDiv;
        imageWrapper.insertBefore(zoomControls, productImage);
        
        // Add zoom functionality
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');
        
        // Create wrapper for zoom effect
        const imageWrapperDiv = document.createElement('div');
        imageWrapperDiv.className = 'image-zoom-wrapper';
        productImage.parentNode.insertBefore(imageWrapperDiv, productImage);
        imageWrapperDiv.appendChild(productImage);
        
        // Enable mouse wheel zoom
        imageWrapperDiv.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        });
        
        function updateZoom() {
            const percentage = Math.round(currentZoom * 100);
            zoomLevelDisplay.textContent = `${percentage}%`;
            productImage.style.transform = `scale(${currentZoom})`;
            productImage.style.transition = 'transform 0.2s ease';
            
            // Enable panning when zoomed
            if (currentZoom > 1) {
                imageWrapperDiv.style.cursor = 'grab';
                makeImageDraggable(imageWrapperDiv, productImage);
            } else {
                imageWrapperDiv.style.cursor = 'default';
            }
        }
        
        function zoomIn() {
            if (currentZoom < 3) {
                currentZoom += zoomLevel;
                updateZoom();
            }
        }
        
        function zoomOut() {
            if (currentZoom > 0.5) {
                currentZoom -= zoomLevel;
                updateZoom();
            }
        }
        
        function resetZoom() {
            currentZoom = 1;
            updateZoom();
            // Reset image position
            productImage.style.transformOrigin = 'center center';
            productImage.style.left = '0';
            productImage.style.top = '0';
        }
        
        if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
        if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetZoom);
    }
    
    function makeImageDraggable(container, image) {
        let isDragging = false;
        let startX, startY;
        let translateX = 0, translateY = 0;
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            translateX += dx;
            translateY += dy;
            image.style.transform = `scale(${currentZoom}) translate(${translateX / currentZoom}px, ${translateY / currentZoom}px)`;
            startX = e.clientX;
            startY = e.clientY;
        };
        
        const onMouseUp = () => {
            isDragging = false;
            container.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        container.addEventListener('mousedown', (e) => {
            if (currentZoom > 1) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                container.style.cursor = 'grabbing';
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                e.preventDefault();
            }
        });
    }
    
    // ========== 3. ADDITIONAL FEATURE: 360° VIEW ==========
    function create360View() {
        const galleryDiv = document.querySelector('.product-detail-gallery');
        if (!galleryDiv) return;
        
        const view360Btn = document.createElement('button');
        view360Btn.className = 'view360-btn';
        view360Btn.innerHTML = '🔄 360° View';
        view360Btn.title = 'View product in 360 degrees';
        
        galleryDiv.appendChild(view360Btn);
        
        view360Btn.addEventListener('click', () => {
            show360Modal(product);
        });
    }
    
    function show360Modal(product) {
        // Create modal for 360 view
        let modal = document.getElementById('view360Modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'view360Modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content view360-content">
                    <span class="close360">&times;</span>
                    <h3>360° View - ${product.name}</h3>
                    <div class="view360-container">
                        <canvas id="view360Canvas" width="500" height="400"></canvas>
                        <div class="view360-controls">
                            <button id="spinLeft">← Spin Left</button>
                            <button id="spinRight">Spin Right →</button>
                        </div>
                        <p class="view360-tip">👆 Drag to rotate or use buttons</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close360');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        modal.style.display = 'flex';
        init360Canvas(product);
    }
    
    function init360Canvas(product) {
        const canvas = document.getElementById('view360Canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let currentAngle = 0;
        let isDragging = false;
        let startX = 0;
        
        // Create multiple angles (simulate 360 view with rotating image)
        const angles = 12;
        let images = [];
        let loadedCount = 0;
        
        // Use the product image and rotate it programmatically
        const baseImage = new Image();
        baseImage.src = product.image;
        
        baseImage.onload = () => {
            function drawAngle(angle) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((angle * 30) * Math.PI / 180);
                ctx.drawImage(baseImage, -canvas.width / 3, -canvas.height / 3, canvas.width / 1.5, canvas.height / 1.5);
                ctx.restore();
                
                // Add reflection effect
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = '#1976a5';
                ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
                ctx.globalAlpha = 1;
            }
            
            drawAngle(currentAngle);
            
            // Mouse drag for rotation
            canvas.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                canvas.style.cursor = 'grabbing';
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                if (Math.abs(dx) > 10) {
                    const angleChange = dx > 0 ? 1 : -1;
                    currentAngle = (currentAngle + angleChange + angles) % angles;
                    drawAngle(currentAngle);
                    startX = e.clientX;
                }
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
                canvas.style.cursor = 'grab';
            });
            
            // Button controls
            const spinLeft = document.getElementById('spinLeft');
            const spinRight = document.getElementById('spinRight');
            
            if (spinLeft) {
                spinLeft.addEventListener('click', () => {
                    currentAngle = (currentAngle - 1 + angles) % angles;
                    drawAngle(currentAngle);
                });
            }
            
            if (spinRight) {
                spinRight.addEventListener('click', () => {
                    currentAngle = (currentAngle + 1) % angles;
                    drawAngle(currentAngle);
                });
            }
            
            canvas.style.cursor = 'grab';
        };
    }
    
    // ========== 4. ADDITIONAL FEATURE: SIZE GUIDE ==========
    function createSizeGuide() {
        const variationsDiv = document.querySelector('.product-variations');
        if (!variationsDiv) return;
        
        const sizeGuideBtn = document.createElement('button');
        sizeGuideBtn.className = 'size-guide-btn';
        sizeGuideBtn.innerHTML = '📏 Size Guide';
        
        variationsDiv.appendChild(sizeGuideBtn);
        
        sizeGuideBtn.addEventListener('click', () => {
            showSizeGuide(product);
        });
    }
    
    function showSizeGuide(product) {
        let modal = document.getElementById('sizeGuideModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'sizeGuideModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content size-guide-content">
                    <span class="closeSizeGuide">&times;</span>
                    <h3>Size Guide - ${product.category}</h3>
                    <div class="size-chart">
                        <table class="size-table">
                            <thead>
                                <tr><th>Size</th><th>Chest (inches)</th><th>Length (inches)</th><th>Shoulder (inches)</th></tr>
                            </thead>
                            <tbody id="sizeTableBody"></tbody>
                        </table>
                    </div>
                    <div class="size-tips">
                        <strong>💡 How to measure:</strong>
                        <ul>
                            <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
                            <li><strong>Length:</strong> Measure from highest point of shoulder to hem</li>
                            <li><strong>Shoulder:</strong> Measure across the back from shoulder to shoulder</li>
                        </ul>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.closeSizeGuide');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Populate size chart based on category
        const sizeTableBody = document.getElementById('sizeTableBody');
        let sizes = [];
        
        if (product.category === 'Shirt') {
            sizes = [
                { size: 'S', chest: '34-36', length: '27-28', shoulder: '16-17' },
                { size: 'M', chest: '38-40', length: '28-29', shoulder: '17-18' },
                { size: 'L', chest: '42-44', length: '29-30', shoulder: '18-19' },
                { size: 'XL', chest: '46-48', length: '30-31', shoulder: '19-20' },
                { size: 'XXL', chest: '50-52', length: '31-32', shoulder: '20-21' }
            ];
        } else if (product.category === 'Hat') {
            sizes = [
                { size: 'S/M', chest: 'Head: 21-22"', length: '-', shoulder: '-' },
                { size: 'L/XL', chest: 'Head: 23-24"', length: '-', shoulder: '-' }
            ];
        } else {
            sizes = [
                { size: 'One Size', chest: 'Fits most', length: 'Universal', shoulder: 'Adjustable' }
            ];
        }
        
        sizeTableBody.innerHTML = sizes.map(s => `
            <tr>
                <td><strong>${s.size}</strong></td>
                <td>${s.chest}</td>
                <td>${s.length}</td>
                <td>${s.shoulder}</td>
            </tr>
        `).join('');
        
        modal.style.display = 'flex';
    }
    
    // ========== 5. ADDITIONAL FEATURE: REVIEW SUMMARY & RATING BREAKDOWN ==========
    function createReviewBreakdown() {
        const reviewsSection = document.querySelector('.reviews-section');
        if (!reviewsSection) return;
        
        const reviewBreakdown = document.createElement('div');
        reviewBreakdown.className = 'review-breakdown';
        reviewBreakdown.innerHTML = `
            <div class="rating-summary">
                <div class="overall-rating">
                    <span class="rating-number">${product.rating}</span>
                    <span class="rating-stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                    <span class="rating-count">(${product.reviewCount || 0} reviews)</span>
                </div>
                <div class="rating-bars">
                    ${[5,4,3,2,1].map(star => {
                        const percentage = product.reviewCount ? 
                            Math.floor(Math.random() * 30) + (star === 5 ? 40 : star === 4 ? 30 : star === 3 ? 20 : 10) : 0;
                        return `
                            <div class="rating-bar-item">
                                <span class="rating-star-label">${star} ★</span>
                                <div class="rating-bar-bg">
                                    <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="rating-percent">${percentage}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        reviewsSection.insertBefore(reviewBreakdown, reviewsSection.firstChild);
    }
    
    // ========== 6. ADDITIONAL FEATURE: SIMILAR ITEMS CAROUSEL ==========
    function enhanceRecommendations() {
        const recommendationsGrid = document.querySelector('.recommendations-grid');
        if (!recommendationsGrid) return;
        
        // Add navigation arrows for carousel on mobile
        const recommendationsSection = document.querySelector('.recommendations-section');
        if (recommendationsSection) {
            const carouselControls = document.createElement('div');
            carouselControls.className = 'carousel-controls';
            carouselControls.innerHTML = `
                <button class="carousel-prev" aria-label="Previous">‹</button>
                <button class="carousel-next" aria-label="Next">›</button>
            `;
            recommendationsSection.insertBefore(carouselControls, recommendationsGrid);
            
            let scrollAmount = 0;
            const prevBtn = carouselControls.querySelector('.carousel-prev');
            const nextBtn = carouselControls.querySelector('.carousel-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    scrollAmount -= recommendationsGrid.clientWidth / 2;
                    if (scrollAmount < 0) scrollAmount = 0;
                    recommendationsGrid.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    scrollAmount += recommendationsGrid.clientWidth / 2;
                    recommendationsGrid.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                });
            }
        }
    }
    
    // ========== INITIALIZE ALL ENHANCEMENTS ==========
    setTimeout(() => {
        createZoomControls();
        create360View();
        createSizeGuide();
        
        // Only create these if product has color options
        if (colorOptions && colorOptions.length > 0) {
            // Add selected color display
            const colorDisplay = document.createElement('div');
            colorDisplay.className = 'selected-color-display';
            const variationsDiv = document.querySelector('.product-variations');
            if (variationsDiv && document.querySelector('.variation-options')) {
                document.querySelector('.variation-options').insertAdjacentElement('beforebegin', colorDisplay);
                const firstColor = document.querySelector('[data-type="color"]')?.getAttribute('data-value') || 'Default';
                colorDisplay.innerHTML = `Selected: <strong>${firstColor}</strong>`;
            }
        }
        
        createReviewBreakdown();
        enhanceRecommendations();
    }, 100);
}

// Export for use in product-detail.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initProductEnhancements, getColorImage, colorVariations };
}