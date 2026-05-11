// ========== SUPABASE PRODUCT DETAIL OVERRIDE ==========
// This file REPLACES the hardcoded product detail with Supabase data
// Your original product-detail.html remains UNCHANGED

(function() {
    // Store original loadProductDetail function
    let originalLoadProductDetail = null;
    
    // New function that loads product details from Supabase
    async function loadProductDetailFromSupabase() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (isNaN(productId)) {
            document.getElementById('detailContent').innerHTML = '<p>Invalid product ID.</p>';
            return;
        }
        
        // Get product from Supabase
        const product = await supabaseDB.getProductById(productId);
        
        if (!product) {
            document.getElementById('detailContent').innerHTML = '<p>Product not found in database.</p>';
            return;
        }
        
        // Get recommendations (similar products from same category)
        const allProducts = await supabaseDB.getProducts();
        let sameCategory = allProducts.filter(p => p.category === product.category && p.id !== product.id);
        if (sameCategory.length < 4) {
            const priceRange = allProducts.filter(p => p.id !== product.id && p.category !== product.category && Math.abs(p.price - product.price) < 50);
            sameCategory = [...sameCategory, ...priceRange];
        }
        const recommendations = sameCategory.slice(0, 4);
        
        // Parse colors and sizes (handle JSON arrays)
        let colors = [];
        let sizes = [];
        try {
            if (product.colors) {
                colors = Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors);
            }
            if (product.sizes) {
                sizes = Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes);
            }
        } catch(e) {
            colors = product.colors ? [product.colors] : [];
            sizes = product.sizes ? [product.sizes] : [];
        }
        
        // Build variations HTML
        let variationsHtml = '';
        if (colors.length > 0) {
            variationsHtml += `
                <div class="variation-label">🎨 Color:</div>
                <div class="variation-options" id="colorOptions">
                    ${colors.map((color, i) => `<button class="variation-btn ${i === 0 ? 'active' : ''}" data-type="color" data-value="${color}">${color}</button>`).join('')}
                </div>
            `;
        }
        if (sizes.length > 0) {
            variationsHtml += `
                <div class="variation-label" style="margin-top:15px;">📏 Size:</div>
                <div class="variation-options" id="sizeOptions">
                    ${sizes.map((size, i) => `<button class="variation-btn ${i === 0 ? 'active' : ''}" data-type="size" data-value="${size}">${size}</button>`).join('')}
                </div>
            `;
        }
        
        // Sample reviews
        const sampleReviews = [
            { name: "Ahmad F.", rating: 5, date: "2 days ago", text: "Excellent quality! Fast delivery and well packaged." },
            { name: "Siti N.", rating: 5, date: "5 days ago", text: "Very satisfied with my purchase. Product matches description perfectly." },
            { name: "Kevin T.", rating: 4, date: "1 week ago", text: "Good product for the price. Shipping was quick." }
        ];
        
        const reviewsHtml = sampleReviews.map(review => `
            <div class="review-card">
                <div class="reviewer-name">${review.name}</div>
                <div class="review-rating">${'⭐'.repeat(review.rating)} ${review.rating}/5</div>
                <div class="review-date">${review.date}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
        
        // Build recommendations HTML
        let recommendationsHtml = '';
        if (recommendations.length > 0) {
            recommendationsHtml = `
                <div class="recommendations-section">
                    <div class="recommendations-title">✨ You May Also Like</div>
                    <div class="recommendations-grid">
                        ${recommendations.map(rec => `
                            <a href="product-detail.html?id=${rec.id}" class="rec-product-card">
                                <img class="rec-product-img" src="${rec.image_url}" alt="${rec.name}">
                                <div class="rec-product-info">
                                    <div class="rec-product-name">${rec.name}</div>
                                    <div class="rec-product-price">RM ${rec.price.toFixed(2)}</div>
                                    <div class="rec-product-rating">⭐ ${rec.rating}/5</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Build full HTML
        const html = `
            <div class="product-detail-main">
                <div class="product-detail-gallery">
                    <div class="image-wrapper">
                        <img src="${product.image_url}" alt="${product.name}" id="mainProductImage">
                    </div>
                </div>
                <div class="product-detail-info">
                    <div class="product-detail-title">${product.name}</div>
                    <div class="product-detail-brand">Brand: ${product.brand || 'SeaTask Original'}</div>
                    <div class="product-detail-rating">
                        <div class="rating-stars">${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}/5</div>
                        <div class="rating-count">${product.review_count || 0} Ratings</div>
                    </div>
                    <div class="product-detail-price">
                        <span class="current-price">RM ${product.price.toFixed(2)}</span>
                        <span class="original-price">RM ${(product.price * 1.5).toFixed(2)}</span>
                        <span class="discount">-${Math.round((1 - product.price/(product.price*1.5)) * 100)}%</span>
                    </div>
                    
                    <div class="product-variations">
                        ${variationsHtml}
                    </div>
                    
                    <div class="quantity-selector">
                        <button class="quantity-btn" id="decrQty">-</button>
                        <span class="quantity-value" id="qtyValue">1</span>
                        <button class="quantity-btn" id="incrQty">+</button>
                    </div>
                    
                    <button class="add-to-cart-detail" id="addToCartBtn">Add to Cart</button>
                    
                    <div class="seller-info">
                        <div>🏪 <span class="seller-name">SeaTask Official Store</span></div>
                        <div>⭐ 98% Positive Ratings • Preferred Seller</div>
                    </div>
                    
                    <div class="delivery-info">
                        <div class="delivery-row"><span>🚚 Delivery:</span><span>Kuala Lumpur</span></div>
                        <div class="delivery-row"><span>📅 Estimated Delivery:</span><span>${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()} - ${new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()}</span></div>
                    </div>
                    
                    <div class="warranty-info">
                        ✅ Authentic • 30 Days Free Return • 2 Year Warranty
                    </div>
                    
                    <div class="details-description">
                        <strong>📝 Description:</strong><br>
                        ${product.description || 'No description available.'}
                        <br><br>
                        <strong>🧵 Material:</strong> ${product.material || 'Premium Quality'}<br>
                        <strong>📍 Origin:</strong> ${product.origin || 'Made in Malaysia'}<br>
                        <strong>🧼 Care:</strong> ${product.care || 'Standard care instructions.'}
                    </div>
                </div>
            </div>
            
            ${recommendationsHtml}
            
            <div class="reviews-section">
                <h3>Customer Reviews (${product.review_count || 0})</h3>
                ${reviewsHtml}
            </div>
        `;
        
        document.getElementById('detailContent').innerHTML = html;
        
        // Quantity selector
        let qty = 1;
        const incrBtn = document.getElementById('incrQty');
        const decrBtn = document.getElementById('decrQty');
        const qtySpan = document.getElementById('qtyValue');
        
        if (incrBtn) {
            incrBtn.addEventListener('click', () => {
                qty++;
                if (qtySpan) qtySpan.innerText = qty;
            });
        }
        if (decrBtn) {
            decrBtn.addEventListener('click', () => {
                if (qty > 1) qty--;
                if (qtySpan) qtySpan.innerText = qty;
            });
        }
        
        // Add to Cart button - WORKS WITH SUPABASE
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const selectedColor = document.querySelector('[data-type="color"].active')?.getAttribute('data-value') || null;
                const selectedSize = document.querySelector('[data-type="size"].active')?.getAttribute('data-value') || null;
                
                // Get current cart
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const variation = { color: selectedColor, size: selectedSize };
                
                // Check if product already in cart
                const existingIndex = cart.findIndex(item => 
                    item.id === product.id && 
                    JSON.stringify(item.variation) === JSON.stringify(variation)
                );
                
                if (existingIndex !== -1) {
                    cart[existingIndex].quantity += qty;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: qty,
                        variation: variation
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count if function exists
                if (typeof window.updateCartUI === 'function') {
                    window.updateCartUI();
                } else {
                    // Manual update
                    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                    const cartCountSpan = document.getElementById('cartCount');
                    if (cartCountSpan) cartCountSpan.innerText = totalItems;
                }
                
                // Show toast
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.innerText = `${product.name} added to cart!`;
                    toast.style.opacity = '1';
                    toast.style.visibility = 'visible';
                    setTimeout(() => {
                        toast.style.opacity = '0';
                        toast.style.visibility = 'hidden';
                    }, 2000);
                } else {
                    alert(`${product.name} added to cart!`);
                }
            });
        }
        
        // Variation buttons
        document.querySelectorAll('.variation-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentElement;
                parent.querySelectorAll('.variation-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
       // Initialize angle view dots if available (prevent duplicate)
if (typeof window.addAngleDots === 'function' && !window._angleDotsAdded) {
    window._angleDotsAdded = true;
    setTimeout(() => window.addAngleDots(), 100);
}
    
    // Replace the original loadProductDetail function
    function overrideLoadProductDetail() {
        if (typeof window.loadProductDetail === 'function') {
            window.loadProductDetail = loadProductDetailFromSupabase;
            console.log('✅ Product detail now loading from Supabase database!');
            
            // Trigger load if on product detail page
            if (window.location.pathname.includes('product-detail.html')) {
                setTimeout(() => loadProductDetailFromSupabase(), 100);
            }
        } else {
            // Try again in 500ms
            setTimeout(overrideLoadProductDetail, 500);
        }
    }
    
    // Start overriding
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(overrideLoadProductDetail, 100);
        });
    } else {
        setTimeout(overrideLoadProductDetail, 100);
    }
})();