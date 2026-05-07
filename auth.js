// auth.js - Simplified working version
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Function to login with Google
window.loginWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        
        if (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } else {
            console.log('Login initiated:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        alert('Login failed. Check console for details.');
    }
};

// Function to logout
window.logout = async () => {
    await supabase.auth.signOut();
    location.reload();
};

// Update UI based on auth state
async function updateUI() {
    const { data: { session } } = await supabase.auth.getSession();
    const authContainer = document.getElementById('auth-container');
    
    if (!authContainer) {
        console.error('auth-container not found');
        return;
    }
    
    if (session) {
        // User is logged in - show user info and logout button
        const userName = session.user.user_metadata?.full_name || session.user.email;
        const userAvatar = session.user.user_metadata?.avatar_url || '👤';
        
        authContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 8px 16px; border-radius: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #1976a5; color: white; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    ${typeof userAvatar === 'string' && userAvatar.startsWith('http') ? `<img src="${userAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : userAvatar}
                </div>
                <span><strong>${userName}</strong></span>
                <button onclick="logout()" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 30px; cursor: pointer;">Logout</button>
            </div>
        `;
    } else {
        // User is logged out - show login button
        authContainer.innerHTML = `
            <button onclick="loginWithGoogle()" style="background: #4285F4; color: white; border: none; padding: 10px 20px; border-radius: 40px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                🔵 Login with Google
            </button>
        `;
    }
}

// Listen for auth state changes (when popup closes)
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    updateUI();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    console.log('Auth script loaded. Container:', document.getElementById('auth-container'));
});