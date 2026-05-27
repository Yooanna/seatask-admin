// ========== SUPABASE ADMIN PANEL - FULL CRUD ==========
const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Seatask2025';

// Check auth
function checkAuth() {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        loadProducts();
        loadCategories();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

// Login
document.getElementById('loginBtn')?.addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        checkAuth();
        document.getElementById('loginError').innerText = '';
    } else {
        document.getElementById('loginError').innerText = 'Invalid username or password';
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    checkAuth();
});

// ========== PRODUCT MANAGEMENT ==========

// Load products from Supabase
async function loadProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const products = await response.json();
        
        if (products && products.length > 0) {
            document.getElementById('productsList').innerHTML = products.map(p => `
                <tr data-id="${p.id}">
                    <td><img src="${p.image_url || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit:cover; border-radius:8px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td>${escapeHtml(p.category || '-')}</td>
                    <td>RM ${Number(p.price).toFixed(2)}</td>
                    <td>
                        <button class="edit-btn" onclick="editProduct(${p.id})">✏️ Edit</button>
                        <button class="delete-btn" onclick="deleteProduct(${p.id})">🗑 Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('productsList').innerHTML = '<tr><td colspan="5" style="text-align:center;">No products found. Click "Add New Product" to create one.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsList').innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading products from database.</td></tr>';
    }
}

// Delete product
window.deleteProduct = async (id) => {
    if (confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            showToast('Product deleted successfully!', 'success');
            loadProducts();
        } catch (error) {
            showToast('Error deleting product: ' + error.message, 'error');
        }
    }
};

// Edit product - FULL EDIT MODAL
window.editProduct = async (id) => {
    // Fetch current product data
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    const products = await response.json();
    const product = products[0];
    
    if (!product) return;
    
    // Create modal for editing
    const modalHtml = `
        <div id="editModal" class="modal" style="display:flex;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" onclick="closeEditModal()">&times;</span>
                <h2>✏️ Edit Product</h2>
                <form id="editProductForm">
                    <div class="form-group">
                        <label>Product Name:</label>
                        <input type="text" id="editName" value="${escapeHtml(product.name)}" required>
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="editCategory">
                            <option value="Shirt" ${product.category === 'Shirt' ? 'selected' : ''}>👕 Shirt</option>
                            <option value="Hat" ${product.category === 'Hat' ? 'selected' : ''}>🧢 Hat</option>
                            <option value="Accessories" ${product.category === 'Accessories' ? 'selected' : ''}>🎒 Accessories</option>
                            <option value="Electronics" ${product.category === 'Electronics' ? 'selected' : ''}>🔊 Electronics</option>
                            <option value="Badminton" ${product.category === 'Badminton' ? 'selected' : ''}>🏸 Badminton</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price (RM):</label>
                        <input type="number" id="editPrice" step="0.01" value="${product.price}" required>
                    </div>
                    <div class="form-group">
                        <label>Image URL:</label>
                        <input type="text" id="editImageUrl" value="${product.image_url || ''}" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>Rating (1-5):</label>
                        <input type="number" id="editRating" step="0.1" min="0" max="5" value="${product.rating || 4.5}">
                    </div>
                    <div class="form-group">
                        <label>Description:</label>
                        <textarea id="editDescription" rows="3">${escapeHtml(product.description || '')}</textarea>
                    </div>
                    <button type="submit" class="login-btn" style="margin-top: 10px;">💾 Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    closeEditModal();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add form submit handler
    document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedProduct = {
            name: document.getElementById('editName').value,
            category: document.getElementById('editCategory').value,
            price: parseFloat(document.getElementById('editPrice').value),
            image_url: document.getElementById('editImageUrl').value,
            rating: parseFloat(document.getElementById('editRating').value),
            description: document.getElementById('editDescription').value
        };
        
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            });
            showToast('Product updated successfully!', 'success');
            closeEditModal();
            loadProducts();
        } catch (error) {
            showToast('Error updating product: ' + error.message, 'error');
        }
    });
};

// Add new product - FULL FORM MODAL
document.getElementById('addNewBtn')?.addEventListener('click', () => {
    const modalHtml = `
        <div id="addModal" class="modal" style="display:flex;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" onclick="closeAddModal()">&times;</span>
                <h2>➕ Add New Product</h2>
                <form id="addProductForm">
                    <div class="form-group">
                        <label>Product Name:</label>
                        <input type="text" id="addName" required placeholder="e.g., Premium Cotton T-Shirt">
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="addCategory" required>
                            <option value="">Select Category</option>
                            <option value="Shirt">👕 Shirt</option>
                            <option value="Hat">🧢 Hat</option>
                            <option value="Accessories">🎒 Accessories</option>
                            <option value="Electronics">🔊 Electronics</option>
                            <option value="Badminton">🏸 Badminton</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price (RM):</label>
                        <input type="number" id="addPrice" step="0.01" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Image URL:</label>
                        <input type="text" id="addImageUrl" placeholder="https://...">
                        <small style="color:#666;">Leave empty for placeholder image</small>
                    </div>
                    <div class="form-group">
                        <label>Rating (1-5):</label>
                        <input type="number" id="addRating" step="0.1" min="0" max="5" value="4.5">
                    </div>
                    <div class="form-group">
                        <label>Description:</label>
                        <textarea id="addDescription" rows="3" placeholder="Product description..."></textarea>
                    </div>
                    <button type="submit" class="login-btn" style="margin-top: 10px;">➕ Create Product</button>
                </form>
            </div>
        </div>
    `;
    
    closeAddModal();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newProduct = {
            name: document.getElementById('addName').value,
            category: document.getElementById('addCategory').value,
            price: parseFloat(document.getElementById('addPrice').value),
            image_url: document.getElementById('addImageUrl').value || 'https://via.placeholder.com/400',
            rating: parseFloat(document.getElementById('addRating').value),
            description: document.getElementById('addDescription').value,
            review_count: 0
        };
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct)
            });
            
            if (response.ok) {
                showToast('Product created successfully!', 'success');
                closeAddModal();
                loadProducts();
            } else {
                const error = await response.json();
                showToast('Error: ' + JSON.stringify(error), 'error');
            }
        } catch (error) {
            showToast('Error creating product: ' + error.message, 'error');
        }
    });
});

// ========== CATEGORY MANAGEMENT ==========

// Categories from Supabase (dynamic)
let categories = [
    { icon: '👕', name: 'Shirt', id: 1 },
    { icon: '🧢', name: 'Hat', id: 2 },
    { icon: '🎒', name: 'Accessories', id: 3 },
    { icon: '🔊', name: 'Electronics', id: 4 },
    { icon: '🏸', name: 'Badminton', id: 5 }
];

function loadCategories() {
    document.getElementById('categoriesList').innerHTML = categories.map(c => `
        <tr data-id="${c.id}">
            <td style="font-size:24px;">${c.icon}</td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>
                <button class="edit-btn" onclick="editCategory(${c.id})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteCategory(${c.id})">🗑 Delete</button>
            </td>
        </tr>
    `).join('');
}

// Edit category
window.editCategory = (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    const newName = prompt('Edit category name:', category.name);
    if (newName && newName.trim()) {
        category.name = newName.trim();
        loadCategories();
        showToast(`Category updated to "${newName}"`, 'success');
        
        // Also update products with this category (optional)
        updateProductsCategory(category.name, category.name);
    }
};

// Delete category
window.deleteCategory = async (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    // Check if any products use this category
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?category=eq.${category.name}&select=id`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    const productsWithCategory = await response.json();
    
    if (productsWithCategory.length > 0) {
        if (confirm(`⚠️ ${productsWithCategory.length} product(s) use this category. Deleting will set them to "Uncategorized". Continue?`)) {
            // Update products to uncategorized
            await fetch(`${SUPABASE_URL}/rest/v1/products?category=eq.${category.name}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category: 'Uncategorized' })
            });
        } else {
            return;
        }
    }
    
    if (confirm(`Delete category "${category.name}"?`)) {
        categories = categories.filter(c => c.id !== id);
        loadCategories();
        showToast(`Category "${category.name}" deleted`, 'success');
        loadProducts(); // Refresh products to show updated categories
    }
};

// Update products when category name changes
async function updateProductsCategory(oldName, newName) {
    await fetch(`${SUPABASE_URL}/rest/v1/products?category=eq.${oldName}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: newName })
    });
    loadProducts();
}

// Add new category
document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
    const newName = prompt('Enter new category name:', '');
    if (newName && newName.trim()) {
        const newIcon = prompt('Enter icon for this category (emoji):', '📦');
        const newId = Math.max(...categories.map(c => c.id), 0) + 1;
        categories.push({
            id: newId,
            name: newName.trim(),
            icon: newIcon || '📦'
        });
        loadCategories();
        showToast(`Category "${newName}" added!`, 'success');
    }
});

// ========== HELPER FUNCTIONS ==========

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #1976a5;
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: 0.3s;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.style.background = type === 'error' ? '#dc2626' : '#1976a5';
    toast.innerText = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

window.closeEditModal = () => {
    const modal = document.getElementById('editModal');
    if (modal) modal.remove();
};

window.closeAddModal = () => {
    const modal = document.getElementById('addModal');
    if (modal) modal.remove();
};

// Tab navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('productsTab').style.display = tab === 'products' ? 'block' : 'none';
        document.getElementById('categoriesTab').style.display = tab === 'categories' ? 'block' : 'none';
        document.getElementById('pageTitle').innerText = tab === 'products' ? 'Products Management' : 'Categories Management';
        
        // Update the Add button text
        const addBtn = document.getElementById('addNewBtn');
        if (addBtn) {
            addBtn.innerText = tab === 'products' ? '+ Add New Product' : '+ Add Category';
            addBtn.style.display = tab === 'products' ? 'block' : 'none';
        }
    });
});

// Also update the Add button for categories tab
const addBtn = document.getElementById('addNewBtn');
if (addBtn) {
    addBtn.innerText = '+ Add New Product';
}

// Add styles for modals
const style = document.createElement('style');
style.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
    }
    .close-modal {
        position: absolute;
        right: 20px;
        top: 15px;
        font-size: 28px;
        cursor: pointer;
        color: #999;
    }
    .close-modal:hover {
        color: #333;
    }
    .form-group {
        margin-bottom: 15px;
    }
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #1a3a5c;
    }
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #c8dce8;
        border-radius: 8px;
        font-size: 14px;
    }
    .form-group textarea {
        resize: vertical;
    }
    .form-group small {
        font-size: 11px;
        color: #7a8e9c;
    }
`;
document.head.appendChild(style);

checkAuth();