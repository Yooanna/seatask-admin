// ========== GOOGLE LOGIN AUTHENTICATION ==========
// Allows account selection every time (with prompt=select_account)

const AUTH_SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const AUTH_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

// Create auth client
const authClient = {
    url: AUTH_SUPABASE_URL,
    key: AUTH_SUPABASE_ANON_KEY,
    
    // Sign in with Google - FORCES ACCOUNT SELECTION EVERY TIME
    async signInWithGoogle() {
        try {
            // Get current site URL
            const redirectUrl = window.location.origin;
            // Add prompt=select_account to force Google to show account chooser
            const authUrl = `${this.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}&prompt=select_account`;
            window.location.href = authUrl;
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showMessage('Failed to sign in with Google', 'error');
        }
    },
    
    // Sign out - CLEAR ALL STORAGE
    async signOut() {
        // Clear all auth data from localStorage
        localStorage.removeItem('sb_session');
        localStorage.removeItem('sb_user');
        localStorage.removeItem('supabase.auth.token');
        
        // Clear any other possible storage
        sessionStorage.clear();
        
        this.showMessage('Signed out successfully', 'success');
        
        // Force reload to clear UI
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },
    
    // Get current user
    getUser() {
        const user = localStorage.getItem('sb_user');
        return user ? JSON.parse(user) : null;
    },
    
    // Get session
    getSession() {
        const session = localStorage.getItem('sb_session');
        return session ? JSON.parse(session) : null;
    },
    
    // Save session
    setSession(session) {
        if (session) {
            localStorage.setItem('sb_session', JSON.stringify(session));
        } else {
            localStorage.removeItem('sb_session');
        }
    },
    
    // Save user
    setUser(user) {
        if (user) {
            localStorage.setItem('sb_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('sb_user');
        }
    },
    
    // Show message
    showMessage(msg, type) {
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
        } else {
            alert(msg);
        }
    }
};

// Handle OAuth callback
function handleAuthCallback() {
    // Check for hash fragment (access_token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken) {
        // Store session
        authClient.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        
        // Fetch user info
        fetchUserInfo(accessToken);
        
        // Clean URL (remove hash)
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
    }
    return false;
}

// Fetch user info from Supabase
async function fetchUserInfo(accessToken) {
    try {
        const response = await fetch(`${authClient.url}/auth/v1/user`, {
            headers: {
                'apikey': authClient.key,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            authClient.setUser(user);
            authClient.showMessage(`Welcome, ${user.email}!`, 'success');
            updateAuthUI();
            // Refresh page to update UI
            setTimeout(() => window.location.reload(), 500);
        } else {
            console.error('Failed to fetch user');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const user = authClient.getUser();
    const userIcon = document.querySelector('.user-icon');
    
    if (!userIcon) return;
    
    if (user && user.email) {
        // User is logged in
        const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url;
        
        userIcon.innerHTML = avatarUrl ? 
            `<img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">` : 
            `👤 ${displayName.substring(0, 8)}`;
        
        userIcon.style.cursor = 'pointer';
        userIcon.title = 'Click to sign out';
        
        // Sign out on click
        userIcon.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Sign out?')) {
                authClient.signOut();
            }
        };
        
        // Add welcome tooltip with email
        userIcon.style.position = 'relative';
        
    } else {
        // User is logged out - show login button
        userIcon.innerHTML = '🔑 Login';
        userIcon.style.cursor = 'pointer';
        userIcon.title = 'Sign in with Google (you can choose different account)';
        
        userIcon.onclick = (e) => {
            e.stopPropagation();
            authClient.signInWithGoogle();
        };
    }
}

// Check session on page load
async function checkExistingSession() {
    const session = authClient.getSession();
    if (session && session.access_token) {
        // Verify token is still valid by fetching user
        try {
            const response = await fetch(`${authClient.url}/auth/v1/user`, {
                headers: {
                    'apikey': authClient.key,
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                authClient.setUser(user);
            } else {
                // Token expired
                authClient.setSession(null);
                authClient.setUser(null);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            authClient.setSession(null);
            authClient.setUser(null);
        }
    }
    updateAuthUI();
}

// Initialize auth
async function initGoogleAuth() {
    const handled = handleAuthCallback();
    if (!handled) {
        await checkExistingSession();
    }
    updateAuthUI();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleAuth);
} else {
    initGoogleAuth();
}
