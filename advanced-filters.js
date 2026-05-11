// ========== ADVANCED PRODUCT FILTERING WITH SUPABASE ==========
// Adds: Wide sidebar filters, price range, size, color, category filtering
// All selections save to Supabase, not localStorage
// UPDATED: Wider sidebar for better visibility

(function() {
    const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';
    
    let currentFilters = {
        categories: [],
        priceRange: { min: 0, max: 1000 },
        sizes: [],
        colors: [],
        sortBy: 'default',
        viewMode: 'grid'
    };
    
    // Create wide filter sidebar HTML
    function createFilterSidebar() {
        // Check if already exists
        if (document.querySelector('.filter-sidebar')) return;
        
        const filterHTML = `
            <div class="filter-sidebar wide-sidebar">
                <div class="filter-header">
                    <h3>🛒 Filter Products</h3>
                    <button class="clear-filters-btn" id="clearFiltersBtn">Clear All</button>
                </div>
                
                <!-- Search Products -->
                <div class="filter-group">
                    <h4>🔍 Search Products</h4>
                    <input type="text" id="productSearchInput" placeholder="Search by name..." class="search-input">
                </div>
                
                <!-- Price Range Filter -->
                <div class="filter-group">
                    <h4>💰 Price Range</h4>
                    <div class="price-range-container">
                        <div class="price-inputs">
                            <div class="price-input-wrapper">
                                <span class="price-currency">RM</span>
                                <input type="number" id="minPrice" placeholder="Min" value="0">
                            </div>
                            <span class="price-separator">-</span>
                            <div class="price-input-wrapper">
                                <span class="price-currency">RM</span>
                                <input type="number" id="maxPrice" placeholder="Max" value="1000">
                            </div>
                        </div>
                        <input type="range" id="priceSlider" min="0" max="1000" step="10" value="1000">
                        <div class="price-labels">
                            <span>RM 0</span>
                            <span>RM 250</span>
                            <span>RM 500</span>
                            <span>RM 750</span>
                            <span>RM 1000+</span>
                        </div>
                    </div>
                </div>
                
                <!-- Size Filter -->
                <div class="filter-group">
                    <h4>📏 Size</h4>
                    <div class="size-options" id="sizeOptions">
                        <button class="size-btn" data-size="XS">XS</button>
                        <button class="size-btn" data-size="S">S</button>
                        <button class="size-btn" data-size="M">M</button>
                        <button class="size-btn" data-size="L">L</button>
                        <button class="size-btn" data-size="XL">XL</button>
                        <button class="size-btn" data-size="XXL">XXL</button>
                    </div>
                </div>
                
                <!-- Color Filter -->
                <div class="filter-group">
                    <h4>🎨 Color</h4>
                    <div class="color-options" id="colorOptions">
                        <button class="color-btn" data-color="Black" style="background:#1a1a2e; color:white;">⬤ Black</button>
                        <button class="color-btn" data-color="White" style="background:#f5f5f5; color:#333;">⬤ White</button>
                        <button class="color-btn" data-color="Blue" style="background:#1976a5; color:white;">⬤ Blue</button>
                        <button class="color-btn" data-color="Red" style="background:#dc2626; color:white;">⬤ Red</button>
                        <button class="color-btn" data-color="Green" style="background:#16a34a; color:white;">⬤ Green</button>
                        <button class="color-btn" data-color="Yellow" style="background:#eab308; color:#333;">⬤ Yellow</button>
                        <button class="color-btn" data-color="Navy" style="background:#1e3a5f; color:white;">⬤ Navy</button>
                        <button class="color-btn" data-color="Gray" style="background:#6b7280; color:white;">⬤ Gray</button>
                    </div>
                </div>
                
                <!-- Category Filter -->
                <div class="filter-group">
                    <h4>👕 Product Type</h4>
                    <div class="category-options" id="categoryOptions">
                        <label class="checkbox-label">
                            <input type="checkbox" value="Shirt">
                            <span class="checkbox-custom"></span>
                            👕 T-Shirts
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="Hat">
                            <span class="checkbox-custom"></span>
                            🧢 Caps/Hats
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="Accessories">
                            <span class="checkbox-custom"></span>
                            🎒 Accessories
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="Electronics">
                            <span class="checkbox-custom"></span>
                            🔊 Electronics
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="Badminton">
                            <span class="checkbox-custom"></span>
                            🏸 Badminton
                        </label>
                    </div>
                </div>
                
                <!-- Rating Filter -->
                <div class="filter-group">
                    <h4>⭐ Customer Rating</h4>
                    <div class="rating-options">
                        <label class="rating-label">
                            <input type="radio" name="rating" value="4.5">
                            <span class="radio-custom"></span>
                            ★★★★★ 4.5 & above
                        </label>
                        <label class="rating-label">
                            <input type="radio" name="rating" value="4">
                            <span class="radio-custom"></span>
                            ★★★★☆ 4.0 & above
                        </label>
                        <label class="rating-label">
                            <input type="radio" name="rating" value="3">
                            <span class="radio-custom"></span>
                            ★★★☆☆ 3.0 & above
                        </label>
                        <label class="rating-label">
                            <input type="radio" name="rating" value="2">
                            <span class="radio-custom"></span>
                            ★★☆☆☆ 2.0 & above
                        </label>
                    </div>
                </div>
                
                <!-- Sort Options -->
                <div class="filter-group">
                    <h4>📊 Sort By</h4>
                    <select id="wideSortSelect" class="sort-select-wide">
                        <option value="default">Default</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                        <option value="nameAZ">Name: A to Z</option>
                        <option value="ratingHighLow">Rating: High to Low</option>
                        <option value="popularity">Popularity (Most Reviewed)</option>
                    </select>
                </div>
                
                <!-- View Mode Toggle -->
                <div class="filter-group">
                    <h4>📱 View Mode</h4>
                    <div class="view-buttons">
                        <button class="view-btn active" data-view="grid">📐 Grid View</button>
                        <button class="view-btn" data-view="list">📄 List View</button>
                    </div>
                </div>
                
                <!-- Active Filters Summary -->
                <div class="active-filters" id="activeFilters">
                    <h4>🔖 Active Filters</h4>
                    <div id="activeFiltersList" class="active-filters-list"></div>
                </div>
            </div>
        `;
        
        // Insert filter sidebar before products section
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            // Create wrapper for filter + products
            let wrapper = document.querySelector('.products-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'products-wrapper';
                productsSection.parentNode.insertBefore(wrapper, productsSection);
                wrapper.appendChild(productsSection);
            }
            wrapper.insertAdjacentHTML('afterbegin', filterHTML);
            productsSection.classList.add('with-sidebar');
        }
        
        // Initialize filter events
        initFilterEvents();
    }
    
    // Initialize all filter events
    function initFilterEvents() {
        // Search input
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentFilters.searchTerm = e.target.value.toLowerCase();
                applyFilters();
            });
        }
        
        // Price range slider
        const priceSlider = document.getElementById('priceSlider');
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                maxPriceInput.value = e.target.value;
                currentFilters.priceRange.max = parseInt(e.target.value);
                updateActiveFiltersDisplay();
                applyFilters();
            });
        }
        
        if (maxPriceInput) {
            maxPriceInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1000;
                priceSlider.value = val;
                currentFilters.priceRange.max = val;
                updateActiveFiltersDisplay();
                applyFilters();
            });
        }
        
        if (minPriceInput) {
            minPriceInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                currentFilters.priceRange.min = val;
                updateActiveFiltersDisplay();
                applyFilters();
            });
        }
        
        // Size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const size = btn.dataset.size;
                if (btn.classList.contains('active')) {
                    if (!currentFilters.sizes.includes(size)) currentFilters.sizes.push(size);
                } else {
                    currentFilters.sizes = currentFilters.sizes.filter(s => s !== size);
                }
                updateActiveFiltersDisplay();
                applyFilters();
            });
        });
        
        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const color = btn.dataset.color;
                if (btn.classList.contains('active')) {
                    if (!currentFilters.colors.includes(color)) currentFilters.colors.push(color);
                } else {
                    currentFilters.colors = currentFilters.colors.filter(c => c !== color);
                }
                updateActiveFiltersDisplay();
                applyFilters();
            });
        });
        
        // Category checkboxes
        document.querySelectorAll('#categoryOptions input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const category = cb.value;
                if (cb.checked) {
                    if (!currentFilters.categories.includes(category)) currentFilters.categories.push(category);
                } else {
                    currentFilters.categories = currentFilters.categories.filter(c => c !== category);
                }
                updateActiveFiltersDisplay();
                applyFilters();
            });
        });
        
        // Rating filter
        document.querySelectorAll('input[name="rating"]').forEach(rb => {
            rb.addEventListener('change', () => {
                if (rb.checked) {
                    currentFilters.minRating = parseFloat(rb.value);
                } else {
                    currentFilters.minRating = null;
                }
                updateActiveFiltersDisplay();
                applyFilters();
            });
        });
        
        // View mode toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilters.viewMode = btn.dataset.view;
                const productGrid = document.getElementById('productGrid');
                if (productGrid) {
                    productGrid.className = `product-grid ${currentFilters.viewMode}-view`;
                }
            });
        });
        
        // Sort select
        const wideSortSelect = document.getElementById('wideSortSelect');
        if (wideSortSelect) {
            wideSortSelect.addEventListener('change', (e) => {
                currentFilters.sortBy = e.target.value;
                applyFilters();
            });
        }
        
        // Also sync with existing sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                if (wideSortSelect) wideSortSelect.value = e.target.value;
                currentFilters.sortBy = e.target.value;
                applyFilters();
            });
        }
        
        // Clear all filters
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllFilters);
        }
    }
    
    // Update active filters display
    function updateActiveFiltersDisplay() {
        const activeFiltersList = document.getElementById('activeFiltersList');
        if (!activeFiltersList) return;
        
        const activeItems = [];
        
        if (currentFilters.categories.length > 0) {
            activeItems.push(`<span class="active-filter-tag">📁 ${currentFilters.categories.join(', ')} <button class="remove-filter" data-type="categories">✖</button></span>`);
        }
        
        if (currentFilters.priceRange.max < 1000 || currentFilters.priceRange.min > 0) {
            activeItems.push(`<span class="active-filter-tag">💰 RM ${currentFilters.priceRange.min} - RM ${currentFilters.priceRange.max} <button class="remove-filter" data-type="price">✖</button></span>`);
        }
        
        if (currentFilters.sizes.length > 0) {
            activeItems.push(`<span class="active-filter-tag">📏 Size: ${currentFilters.sizes.join(', ')} <button class="remove-filter" data-type="sizes">✖</button></span>`);
        }
        
        if (currentFilters.colors.length > 0) {
            activeItems.push(`<span class="active-filter-tag">🎨 ${currentFilters.colors.join(', ')} <button class="remove-filter" data-type="colors">✖</button></span>`);
        }
        
        if (currentFilters.minRating) {
            activeItems.push(`<span class="active-filter-tag">⭐ ${currentFilters.minRating}+ stars <button class="remove-filter" data-type="rating">✖</button></span>`);
        }
        
        if (currentFilters.searchTerm) {
            activeItems.push(`<span class="active-filter-tag">🔍 "${currentFilters.searchTerm}" <button class="remove-filter" data-type="search">✖</button></span>`);
        }
        
        if (activeItems.length === 0) {
            activeFiltersList.innerHTML = '<span class="no-active-filters">No active filters</span>';
        } else {
            activeFiltersList.innerHTML = activeItems.join('');
            
            // Add remove filter event listeners
            document.querySelectorAll('.remove-filter').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = btn.dataset.type;
                    removeFilterByType(type);
                });
            });
        }
    }
    
    // Remove specific filter by type
    function removeFilterByType(type) {
        switch(type) {
            case 'categories':
                currentFilters.categories = [];
                document.querySelectorAll('#categoryOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
                break;
            case 'price':
                const priceSlider = document.getElementById('priceSlider');
                const maxPriceInput = document.getElementById('maxPrice');
                if (priceSlider) priceSlider.value = '1000';
                if (maxPriceInput) maxPriceInput.value = '1000';
                currentFilters.priceRange = { min: 0, max: 1000 };
                break;
            case 'sizes':
                currentFilters.sizes = [];
                document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                break;
            case 'colors':
                currentFilters.colors = [];
                document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                break;
            case 'rating':
                currentFilters.minRating = null;
                document.querySelectorAll('input[name="rating"]').forEach(rb => rb.checked = false);
                break;
            case 'search':
                currentFilters.searchTerm = '';
                const searchInput = document.getElementById('productSearchInput');
                if (searchInput) searchInput.value = '';
                break;
        }
        updateActiveFiltersDisplay();
        applyFilters();
    }
    
    // Clear all filters
    function clearAllFilters() {
        // Reset price
        const priceSlider = document.getElementById('priceSlider');
        const maxPriceInput = document.getElementById('maxPrice');
        const minPriceInput = document.getElementById('minPrice');
        if (priceSlider) priceSlider.value = '1000';
        if (maxPriceInput) maxPriceInput.value = '1000';
        if (minPriceInput) minPriceInput.value = '0';
        currentFilters.priceRange = { min: 0, max: 1000 };
        
        // Reset search
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) searchInput.value = '';
        currentFilters.searchTerm = '';
        
        // Reset sizes
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
        currentFilters.sizes = [];
        
        // Reset colors
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        currentFilters.colors = [];
        
        // Reset categories
        document.querySelectorAll('#categoryOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
        currentFilters.categories = [];
        
        // Reset rating
        document.querySelectorAll('input[name="rating"]').forEach(rb => rb.checked = false);
        currentFilters.minRating = null;
        
        // Reset sort
        const wideSortSelect = document.getElementById('wideSortSelect');
        if (wideSortSelect) wideSortSelect.value = 'default';
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'default';
        currentFilters.sortBy = 'default';
        
        // Update display and apply
        updateActiveFiltersDisplay();
        applyFilters();
    }
    
    // Apply all filters to products
    async function applyFilters() {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '<div style="text-align:center; padding:50px;">Applying filters...</div>';
        
        try {
            // Fetch all products from Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            let products = await response.json();
            
            if (!products || products.length === 0) {
                productGrid.innerHTML = '<div style="text-align:center; padding:50px;">No products found.</div>';
                return;
            }
            
            // Apply filters
            let filtered = [...products];
            
            // Search filter
            if (currentFilters.searchTerm) {
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(currentFilters.searchTerm) ||
                    (p.category && p.category.toLowerCase().includes(currentFilters.searchTerm))
                );
            }
            
            // Price filter
            filtered = filtered.filter(p => p.price >= currentFilters.priceRange.min && p.price <= currentFilters.priceRange.max);
            
            // Category filter
            if (currentFilters.categories.length > 0) {
                filtered = filtered.filter(p => currentFilters.categories.includes(p.category));
            }
            
            // Rating filter
            if (currentFilters.minRating) {
                filtered = filtered.filter(p => p.rating >= currentFilters.minRating);
            }
            
            // Apply sorting
            if (currentFilters.sortBy === 'priceLowHigh') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (currentFilters.sortBy === 'priceHighLow') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (currentFilters.sortBy === 'nameAZ') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (currentFilters.sortBy === 'ratingHighLow') {
                filtered.sort((a, b) => b.rating - a.rating);
            } else if (currentFilters.sortBy === 'popularity') {
                filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
            }
            
            // Update filter count display
            updateFilterCount(filtered.length);
            
            // Save filter preference
            saveFilterPreferences();
            
            // Display products
            if (filtered.length === 0) {
                productGrid.innerHTML = '<div style="text-align:center; padding:50px;">No products match your filters. Try clearing some filters!</div>';
                return;
            }
            
            displayFilteredProducts(filtered);
            
        } catch (error) {
            console.error('Error applying filters:', error);
            productGrid.innerHTML = '<div style="text-align:center; padding:50px;">Error loading products.</div>';
        }
    }
    
    // Display filtered products
    function displayFilteredProducts(products) {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = `product-card ${currentFilters.viewMode === 'list' ? 'list-view' : ''}`;
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
                    ${product.original_price ? `<div class="product-original-price">Was RM ${product.original_price.toFixed(2)}</div>` : ''}
                    <button class="add-to-cart-filtered" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                </div>
            `;
            
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart-filtered')) {
                    window.location.href = `product-detail.html?id=${product.id}`;
                }
            });
            
            productGrid.appendChild(card);
        });
        
        // Attach add to cart events
        document.querySelectorAll('.add-to-cart-filtered').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = parseInt(newBtn.getAttribute('data-id'));
                const name = newBtn.getAttribute('data-name');
                const price = parseFloat(newBtn.getAttribute('data-price'));
                
                if (typeof window.addToCartSupabase === 'function') {
                    await window.addToCartSupabase(id, name, price, 1, null);
                    showToast(`${name} added to cart!`);
                }
            });
        });
    }
    
    // Update filter count display
    function updateFilterCount(count) {
        let countDisplay = document.querySelector('.filter-count');
        if (!countDisplay) {
            const filterHeader = document.querySelector('.filter-header');
            if (filterHeader) {
                countDisplay = document.createElement('span');
                countDisplay.className = 'filter-count';
                filterHeader.appendChild(countDisplay);
            }
        }
        if (countDisplay) {
            countDisplay.innerHTML = `(${count} products)`;
        }
    }
    
    // Save filter preferences to Supabase
    async function saveFilterPreferences() {
        const userId = getFilterUserId();
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/user_filter_preferences`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    preferences: currentFilters,
                    updated_at: new Date().toISOString()
                })
            });
        } catch (error) {
            console.log('Filter preference not saved (table may not exist yet)');
        }
    }
    
    // Get user ID for filter preferences
    function getFilterUserId() {
        let userId = localStorage.getItem('seatask_filter_user_id');
        if (!userId) {
            userId = 'filter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('seatask_filter_user_id', userId);
        }
        return userId;
    }
    
    // Show toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = message;
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
            }, 2000);
        }
    }
    
    // Add CSS styles for wide filter sidebar
    function addFilterStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Products Wrapper with Sidebar */
            .products-wrapper {
                max-width: 1600px;
                margin: 30px auto;
                padding: 0 20px;
                display: flex;
                gap: 35px;
            }
            
            /* WIDE Filter Sidebar - BIGGER AND MORE VISIBLE */
            .filter-sidebar.wide-sidebar {
                width: 320px;
                min-width: 320px;
                background: white;
                border-radius: 20px;
                padding: 25px;
                position: sticky;
                top: 20px;
                height: fit-content;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border: 1px solid #e8edf2;
            }
            
            /* Custom Scrollbar for Sidebar */
            .filter-sidebar.wide-sidebar::-webkit-scrollbar {
                width: 6px;
            }
            
            .filter-sidebar.wide-sidebar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            
            .filter-sidebar.wide-sidebar::-webkit-scrollbar-thumb {
                background: #1976a5;
                border-radius: 10px;
            }
            
            .filter-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e0eef5;
            }
            
            .filter-header h3 {
                font-size: 20px;
                color: #1a3a5c;
                font-weight: 600;
            }
            
            .clear-filters-btn {
                background: #f0f4f8;
                border: none;
                color: #1976a5;
                cursor: pointer;
                font-size: 13px;
                padding: 6px 12px;
                border-radius: 20px;
                transition: 0.2s;
            }
            
            .clear-filters-btn:hover {
                background: #1976a5;
                color: white;
            }
            
            .filter-group {
                margin-bottom: 28px;
                border-bottom: 1px solid #eef2f6;
                padding-bottom: 20px;
            }
            
            .filter-group h4 {
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #1a3a5c;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Search Input */
            .search-input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #c8dce8;
                border-radius: 30px;
                font-size: 14px;
                outline: none;
                transition: 0.2s;
            }
            
            .search-input:focus {
                border-color: #1976a5;
                box-shadow: 0 0 0 3px rgba(25,118,165,0.1);
            }
            
            /* Price Range */
            .price-inputs {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .price-input-wrapper {
                flex: 1;
                display: flex;
                align-items: center;
                background: #f5f8fa;
                border-radius: 12px;
                border: 1px solid #c8dce8;
            }
            
            .price-currency {
                padding: 10px 8px 10px 12px;
                font-size: 13px;
                color: #7a8e9c;
            }
            
            .price-input-wrapper input {
                flex: 1;
                padding: 10px 8px 10px 0;
                border: none;
                background: transparent;
                outline: none;
                font-size: 14px;
            }
            
            .price-separator {
                color: #7a8e9c;
                font-weight: bold;
            }
            
            #priceSlider {
                width: 100%;
                margin: 15px 0 10px;
                height: 4px;
                border-radius: 5px;
                background: #c8dce8;
                outline: none;
                -webkit-appearance: none;
            }
            
            #priceSlider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #1976a5;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            
            .price-labels {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #7a8e9c;
                margin-top: 8px;
            }
            
            /* Size Buttons - BIGGER */
            .size-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .size-btn {
                width: 52px;
                padding: 10px 0;
                border: 1px solid #c8dce8;
                background: white;
                border-radius: 12px;
                cursor: pointer;
                transition: 0.2s;
                font-size: 14px;
                font-weight: 500;
            }
            
            .size-btn.active {
                background: #1976a5;
                color: white;
                border-color: #1976a5;
            }
            
            .size-btn:hover {
                border-color: #1976a5;
                transform: translateY(-2px);
            }
            
            /* Color Buttons - BIGGER */
            .color-options {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .color-btn {
                padding: 10px 16px;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .color-btn.active {
                transform: scale(1.02);
                box-shadow: 0 0 0 2px #1976a5, 0 2px 5px rgba(0,0,0,0.1);
            }
            
            /* Checkbox Labels */
            .checkbox-label, .rating-label {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
                cursor: pointer;
                font-size: 14px;
                padding: 6px 0;
            }
            
            .checkbox-label input, .rating-label input {
                display: none;
            }
            
            .checkbox-custom {
                width: 20px;
                height: 20px;
                border: 2px solid #c8dce8;
                border-radius: 6px;
                display: inline-block;
                position: relative;
                transition: 0.2s;
            }
            
            .checkbox-label input:checked + .checkbox-custom {
                background: #1976a5;
                border-color: #1976a5;
            }
            
            .checkbox-label input:checked + .checkbox-custom::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
            }
            
            .radio-custom {
                width: 20px;
                height: 20px;
                border: 2px solid #c8dce8;
                border-radius: 50%;
                display: inline-block;
                position: relative;
                transition: 0.2s;
            }
            
            .rating-label input:checked + .radio-custom {
                border-color: #1976a5;
            }
            
            .rating-label input:checked + .radio-custom::after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 10px;
                height: 10px;
                background: #1976a5;
                border-radius: 50%;
            }
            
            /* Sort Select */
            .sort-select-wide {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #c8dce8;
                border-radius: 12px;
                font-size: 14px;
                background: white;
                cursor: pointer;
                outline: none;
            }
            
            .sort-select-wide:focus {
                border-color: #1976a5;
            }
            
            /* View Mode Buttons */
            .view-buttons {
                display: flex;
                gap: 12px;
            }
            
            .view-btn {
                flex: 1;
                padding: 10px;
                border: 1px solid #c8dce8;
                background: white;
                border-radius: 12px;
                cursor: pointer;
                font-size: 13px;
                transition: 0.2s;
            }
            
            .view-btn.active {
                background: #1976a5;
                color: white;
                border-color: #1976a5;
            }
            
            /* Active Filters */
            .active-filters {
                margin-top: 10px;
            }
            
            .active-filters-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .active-filter-tag {
                background: #e8f4fd;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: #1976a5;
            }
            
            .remove-filter {
                background: none;
                border: none;
                cursor: pointer;
                color: #1976a5;
                font-size: 12px;
                padding: 0;
                margin-left: 5px;
            }
            
            .remove-filter:hover {
                color: #e74c3c;
            }
            
            .no-active-filters {
                font-size: 12px;
                color: #7a8e9c;
            }
            
            /* Product Grid with Sidebar */
            #products-section {
                flex: 1;
                margin: 0;
            }
            
            .product-grid.list-view {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .product-card.list-view {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 20px;
            }
            
            .product-card.list-view .product-image-container {
                width: 120px;
                height: 120px;
            }
            
            .product-card.list-view .product-info {
                flex: 1;
            }
            
            .filter-count {
                font-size: 13px;
                color: #7a8e9c;
                margin-left: 8px;
                font-weight: normal;
            }
            
            /* Product Original Price */
            .product-original-price {
                font-size: 12px;
                color: #999;
                text-decoration: line-through;
                margin: 5px 0;
            }
            
            /* Responsive */
            @media (max-width: 1100px) {
                .products-wrapper {
                    flex-direction: column;
                }
                .filter-sidebar.wide-sidebar {
                    width: 100%;
                    min-width: auto;
                    position: static;
                    max-height: none;
                }
            }
            
            @media (max-width: 768px) {
                .filter-sidebar.wide-sidebar {
                    padding: 18px;
                }
                .size-btn {
                    width: 45px;
                    padding: 8px 0;
                    font-size: 12px;
                }
                .color-btn {
                    padding: 8px 12px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    function initAdvancedFilters() {
        addFilterStyles();
        createFilterSidebar();
        // Override the existing displayProducts function
        if (typeof window.displayProducts === 'function') {
            const originalDisplay = window.displayProducts;
            window.displayProducts = function() {
                applyFilters();
            };
        }
        console.log('✅ Advanced filters loaded with wider sidebar!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdvancedFilters);
    } else {
        initAdvancedFilters();
    }
})();