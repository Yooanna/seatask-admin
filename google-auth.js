// ========== SIMPLE GOOGLE LOGIN - NO MODULES ==========
(function() {
    const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';
    
    // Sign in with Google
    window.loginWithGoogle = function() {
        const redirectUrl = window.location.origin;
        const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}&prompt=select_account`;
        window.location.href = authUrl;
    };
    
    // Sign out
    window.logout = function() {
        localStorage.removeItem('sb_session');
        localStorage.removeItem('sb_user');
        localStorage.removeItem('seatask_cart_user_id');
        localStorage.removeItem('seatask_persistent_user_id');
        sessionStorage.clear();
        window.location.reload();
    };
    
    // Get current user
    window.getCurrentUser = function() {
        const user = localStorage.getItem('sb_user');
        return user ? JSON.parse(user) : null;
    };
    
    // Handle OAuth callback
    function handleAuthCallback() {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
            localStorage.setItem('sb_session', JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }));
            fetchUserInfo(accessToken);
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
        return false;
    }
    
    // Fetch user info
    async function fetchUserInfo(accessToken) {
        try {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('sb_user', JSON.stringify(user));
                showMessage(`Welcome, ${user.email}!`, 'success');
                setTimeout(() => window.location.reload(), 500);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    
    // Show message
    function showMessage(msg, type) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.background = type === 'error' ? '#dc2626' : '#1976a5';
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
                toast.style.background = '#1976a5';
            }, 3000);
        }
    }
    
    // Check existing session
    async function checkSession() {
        const session = localStorage.getItem('sb_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${sessionData.access_token}`
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem('sb_user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('sb_session');
                    localStorage.removeItem('sb_user');
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        }
        updateUI();
    }
    
    // Update UI
    function updateUI() {
        const user = getCurrentUser();
        const userIcon = document.querySelector('.user-icon');
        
        if (!userIcon) return;
        
        if (user && user.email) {
            const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
            const avatarUrl = user.user_metadata?.avatar_url;
            
            userIcon.innerHTML = avatarUrl ? 
                `<img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">` : 
                `👤 ${displayName.substring(0, 8)}`;
            userIcon.style.cursor = 'pointer';
            userIcon.title = 'Click to sign out';
            userIcon.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Sign out?')) {
                    window.logout();
                }
            };
        } else {
            userIcon.innerHTML = '🔑 Login';
            userIcon.style.cursor = 'pointer';
            userIcon.title = 'Sign in with Google';
            userIcon.onclick = (e) => {
                e.stopPropagation();
                window.loginWithGoogle();
            };
        }
    }
    
    // Add styles
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-icon {
                font-size: 14px !important;
                background: rgba(255,255,255,0.15);
                padding: 8px 20px !important;
                border-radius: 40px;
                transition: 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .user-icon:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.02);
            }
            .user-icon img {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid white;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    function init() {
        addStyles();
        handleAuthCallback();
        checkSession();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();