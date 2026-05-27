// ========== SUPABASE ADMIN PANEL ==========
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
                    <td><img src="${p.image_url || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit:cover; border-radius:8px;"></td>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td>${p.category || '-'}</td>
                    <td>RM ${Number(p.price).toFixed(2)}</td>
                    <td>
                        <button class="edit-btn" onclick="editProduct(${p.id})">✏️ Edit</button>
                        <button class="delete-btn" onclick="deleteProduct(${p.id})">🗑 Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('productsList').innerHTML = '<tr><td colspan="5" style="text-align:center;">No products found.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Delete product
window.deleteProduct = async (id) => {
    if (confirm('Delete this product?')) {
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        loadProducts();
    }
};

// Edit product
window.editProduct = async (id) => {
    const newName = prompt('New product name:');
    if (newName) {
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        loadProducts();
    }
};

// Add new product
document.getElementById('addNewBtn')?.addEventListener('click', () => {
    const name = prompt('Product name:');
    if (!name) return;
    const category = prompt('Category (Shirt, Hat, Accessories, Electronics, Badminton):');
    const price = parseFloat(prompt('Price (RM):'));
    const image_url = prompt('Image URL:', 'https://via.placeholder.com/400');
    
    fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name, category, price, image_url,
            rating: 4.5, review_count: 0
        })
    }).then(() => loadProducts());
});

// Categories
function loadCategories() {
    const categories = [
        { icon: '👕', name: 'Shirt' },
        { icon: '🧢', name: 'Hat' },
        { icon: '🎒', name: 'Accessories' },
        { icon: '🔊', name: 'Electronics' },
        { icon: '🏸', name: 'Badminton' }
    ];
    document.getElementById('categoriesList').innerHTML = categories.map(c => `
        <tr><td style="font-size:24px;">${c.icon}</td><td><strong>${c.name}</strong></td><td><button class="edit-btn" disabled>🔒 Default</button></td></tr>
    `).join('');
}

// Tab navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('productsTab').style.display = tab === 'products' ? 'block' : 'none';
        document.getElementById('categoriesTab').style.display = tab === 'categories' ? 'block' : 'none';
        document.getElementById('pageTitle').innerText = tab === 'products' ? 'Products Management' : 'Categories Management';
    });
});

document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
    alert('Categories are managed in the marketplace code.');
});

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

checkAuth();