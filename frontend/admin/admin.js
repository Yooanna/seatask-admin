let token = null;
let API_BASE = '';

async function checkAuth() {
    token = localStorage.getItem('adminToken');
    if (token) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        await loadProducts();
        await loadCategories();
    }
}

document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            checkAuth();
        } else {
            document.getElementById('loginError').innerText = 'Invalid credentials';
        }
    } catch (err) { document.getElementById('loginError').innerText = 'Login failed'; }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    location.reload();
});

async function loadProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
        document.getElementById('productsList').innerHTML = data.products.map(p => `
            <tr><td><img src="${p.images?.[0] || ''}" width="50" style="object-fit:contain"></td>
            <td>${p.name}</td><td>${p.category}</td><td>RM ${p.price}</td>
            <td><button class="edit-btn" onclick="editProduct('${p._id}')">Edit</button>
            <button class="delete-btn" onclick="deleteProduct('${p._id}')">Delete</button></td></tr>
        `).join('');
    }
}

async function loadCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
        document.getElementById('categoriesList').innerHTML = data.categories.map(c => `
            <tr><td>${c.icon || '📦'}</td><td>${c.name}</td>
            <td><button class="edit-btn" onclick="alert('Edit ${c.name}')">Edit</button>
            <button class="delete-btn" onclick="alert('Delete ${c.name}')">Delete</button></td></tr>
        `).join('');
    }
}

window.editProduct = (id) => { alert('Edit product: ' + id); };
window.deleteProduct = async (id) => { 
    if(confirm('Delete this product?')){ 
        await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
        loadProducts(); 
    } 
};

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

document.getElementById('addNewBtn')?.addEventListener('click', () => { alert('Add new product feature - coming soon'); });
document.getElementById('addCategoryBtn')?.addEventListener('click', () => { alert('Add new category - coming soon'); });

checkAuth();