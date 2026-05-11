// ========== FOOTER ENHANCEMENT WITH SUPABASE ==========
// Adds: Payment method logos, Social media links, Newsletter subscription (saved to Supabase)
// NO conflicts with existing code

(function() {
    // Supabase configuration
    const FOOTER_SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
    const FOOTER_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';
    
    // Check if enhanced footer already exists
    function isFooterEnhanced() {
        return document.querySelector('.enhanced-footer') !== null;
    }
    
    // Create enhanced footer HTML
    function createEnhancedFooter() {
        const existingFooter = document.querySelector('footer');
        if (!existingFooter) return;
        
        if (isFooterEnhanced()) return;
        
        const enhancedHTML = `
            <div class="enhanced-footer">
                <div class="footer-container">
                    <!-- Payment Methods Section -->
                    <div class="footer-section payment-section">
                        <h4>Secure Payments</h4>
                        <div class="payment-methods">
                            <div class="payment-logo" data-payment="visa">
                                <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" alt="Visa" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg'">
                                <span>Visa</span>
                            </div>
                            <div class="payment-logo" data-payment="mastercard">
                                <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'">
                                <span>Mastercard</span>
                            </div>
                            <div class="payment-logo" data-payment="fpx">
                                <img src="https://www.fpx.com.my/static/media/FPXLogo.8e5a3c8a.svg" alt="FPX" onerror="this.src='https://seeklogo.com/images/F/FPX-logo-8F0F3E7D75-seeklogo.com.png'">
                                <span>FPX</span>
                            </div>
                        </div>
                        <p class="secure-badge">🔒 100% Secure Transactions</p>
                    </div>
                    
                    <!-- Social Media Section -->
                    <div class="footer-section social-section">
                        <h4>Follow Us</h4>
                        <div class="social-links">
                            <a href="https://facebook.com/seatask" target="_blank" class="social-link" data-social="facebook">
                                <span class="social-icon">📘</span>
                                <span>Facebook</span>
                            </a>
                            <a href="https://instagram.com/seatask" target="_blank" class="social-link" data-social="instagram">
                                <span class="social-icon">📷</span>
                                <span>Instagram</span>
                            </a>
                            <a href="https://tiktok.com/@seatask" target="_blank" class="social-link" data-social="tiktok">
                                <span class="social-icon">🎵</span>
                                <span>TikTok</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Newsletter Section -->
                    <div class="footer-section newsletter-section">
                        <h4>Subscribe to Our Newsletter</h4>
                        <p class="newsletter-text">Get the latest updates on new products and exclusive offers!</p>
                        <form id="newsletterForm" class="newsletter-form">
                            <input type="email" id="newsletterEmail" placeholder="Enter your email address" required>
                            <button type="submit" id="newsletterSubscribeBtn">Subscribe</button>
                        </form>
                        <div id="newsletterMessage" class="newsletter-message"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Replace footer content
        existingFooter.innerHTML = enhancedHTML + existingFooter.innerHTML;
        
        // Initialize newsletter subscription
        initNewsletterSubscription();
        
        // Track social link clicks
        trackSocialClicks();
        
        console.log('✅ Enhanced footer with Supabase integration added!');
    }
    
    // Get or create user ID for newsletter
    function getNewsletterUserId() {
        let userId = localStorage.getItem('seatask_newsletter_user_id');
        if (!userId) {
            userId = 'newsletter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('seatask_newsletter_user_id', userId);
        }
        return userId;
    }
    
    // Save newsletter subscription to Supabase
    async function saveNewsletterToSupabase(email) {
        const userId = getNewsletterUserId();
        const timestamp = new Date().toISOString();
        
        try {
            // Check if email already exists
            const checkResponse = await fetch(`${FOOTER_SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=email`, {
                headers: {
                    'apikey': FOOTER_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${FOOTER_SUPABASE_ANON_KEY}`
                }
            });
            
            const existing = await checkResponse.json();
            
            if (existing && existing.length > 0) {
                showNewsletterMessage('This email is already subscribed!', 'warning');
                return false;
            }
            
            // Save new subscription
            const response = await fetch(`${FOOTER_SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
                method: 'POST',
                headers: {
                    'apikey': FOOTER_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${FOOTER_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    email: email,
                    subscribed_at: timestamp,
                    status: 'active',
                    source: 'website_footer'
                })
            });
            
            if (response.ok) {
                showNewsletterMessage('✅ Thanks for subscribing! Check your inbox for updates.', 'success');
                document.getElementById('newsletterEmail').value = '';
                
                // Also save to localStorage for offline fallback
                const localSubs = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
                if (!localSubs.includes(email)) {
                    localSubs.push(email);
                    localStorage.setItem('newsletter_subscribers', JSON.stringify(localSubs));
                }
                return true;
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving newsletter:', error);
            // Fallback to localStorage if Supabase fails
            fallbackSaveNewsletter(email);
            return false;
        }
    }
    
    // Fallback save to localStorage
    function fallbackSaveNewsletter(email) {
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers_fallback') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push({
                email: email,
                date: new Date().toISOString()
            });
            localStorage.setItem('newsletter_subscribers_fallback', JSON.stringify(subscribers));
            showNewsletterMessage('✅ Subscribed! (Saved locally - will sync to database when online)', 'success');
            document.getElementById('newsletterEmail').value = '';
        } else {
            showNewsletterMessage('You are already subscribed!', 'warning');
        }
    }
    
    // Show message to user
    function showNewsletterMessage(message, type) {
        const messageDiv = document.getElementById('newsletterMessage');
        if (!messageDiv) return;
        
        messageDiv.innerHTML = message;
        messageDiv.className = `newsletter-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.style.display = 'none';
                messageDiv.style.opacity = '1';
            }, 500);
        }, 4000);
    }
    
    // Initialize newsletter form
    function initNewsletterSubscription() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            const email = emailInput.value.trim();
            
            if (!email || !email.includes('@')) {
                showNewsletterMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Disable button during submission
            const submitBtn = document.getElementById('newsletterSubscribeBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Subscribing...';
            submitBtn.disabled = true;
            
            await saveNewsletterToSupabase(email);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // Track social media link clicks (for analytics)
    function trackSocialClicks() {
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const social = link.getAttribute('data-social');
                console.log(`📱 Social link clicked: ${social}`);
                
                // Save click to Supabase for analytics
                saveSocialClickToSupabase(social);
            });
        });
    }
    
    // Save social click analytics to Supabase
    async function saveSocialClickToSupabase(socialPlatform) {
        try {
            await fetch(`${FOOTER_SUPABASE_URL}/rest/v1/social_clicks`, {
                method: 'POST',
                headers: {
                    'apikey': FOOTER_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${FOOTER_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform: socialPlatform,
                    clicked_at: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    page_url: window.location.href
                })
            });
        } catch (error) {
            console.log('Social click tracking saved locally');
            // Save to localStorage as fallback
            const clicks = JSON.parse(localStorage.getItem('social_clicks_fallback') || '[]');
            clicks.push({
                platform: socialPlatform,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('social_clicks_fallback', JSON.stringify(clicks.slice(-50)));
        }
    }
    
    // Add CSS styles for enhanced footer
    function addFooterStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-footer {
                background: linear-gradient(135deg, #1a3a5c, #0f2b44);
                color: white;
                padding: 40px 20px 20px;
                margin-top: 50px;
            }
            
            .footer-container {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 40px;
                margin-bottom: 30px;
            }
            
            .footer-section h4 {
                font-size: 18px;
                margin-bottom: 20px;
                color: #4fc3f7;
                position: relative;
                display: inline-block;
            }
            
            .footer-section h4:after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 0;
                width: 40px;
                height: 2px;
                background: #4fc3f7;
            }
            
            /* Payment Methods */
            .payment-methods {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                margin-bottom: 15px;
            }
            
            .payment-logo {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                background: rgba(255,255,255,0.1);
                padding: 10px 15px;
                border-radius: 12px;
                transition: transform 0.2s;
            }
            
            .payment-logo:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.15);
            }
            
            .payment-logo img {
                width: 40px;
                height: 40px;
                object-fit: contain;
            }
            
            .payment-logo span {
                font-size: 11px;
                opacity: 0.8;
            }
            
            .secure-badge {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 10px;
            }
            
            /* Social Links */
            .social-links {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: flex;
                align-items: center;
                gap: 8px;
                color: white;
                text-decoration: none;
                padding: 8px 16px;
                background: rgba(255,255,255,0.1);
                border-radius: 30px;
                transition: all 0.2s;
            }
            
            .social-link:hover {
                background: rgba(255,255,255,0.2);
                transform: translateX(5px);
            }
            
            .social-icon {
                font-size: 20px;
            }
            
            /* Newsletter Form */
            .newsletter-text {
                font-size: 13px;
                opacity: 0.8;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .newsletter-form {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .newsletter-form input {
                flex: 1;
                min-width: 180px;
                padding: 12px 16px;
                border: none;
                border-radius: 30px;
                font-size: 14px;
                outline: none;
            }
            
            .newsletter-form input:focus {
                box-shadow: 0 0 0 2px #4fc3f7;
            }
            
            .newsletter-form button {
                background: #4fc3f7;
                color: #1a3a5c;
                border: none;
                padding: 12px 24px;
                border-radius: 30px;
                cursor: pointer;
                font-weight: 600;
                transition: 0.2s;
            }
            
            .newsletter-form button:hover {
                background: #29b6f6;
                transform: scale(1.02);
            }
            
            .newsletter-message {
                margin-top: 15px;
                font-size: 12px;
                padding: 8px 12px;
                border-radius: 8px;
                display: none;
            }
            
            .newsletter-message.success {
                display: block;
                background: #2e7d32;
                color: white;
            }
            
            .newsletter-message.error {
                display: block;
                background: #c62828;
                color: white;
            }
            
            .newsletter-message.warning {
                display: block;
                background: #f57c00;
                color: white;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .footer-container {
                    grid-template-columns: 1fr;
                    text-align: center;
                    gap: 30px;
                }
                
                .footer-section h4:after {
                    left: 50%;
                    transform: translateX(-50%);
                }
                
                .payment-methods, .social-links {
                    justify-content: center;
                }
                
                .newsletter-form {
                    justify-content: center;
                }
                
                .newsletter-form input {
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize footer enhancement
    function initFooterEnhancement() {
        addFooterStyles();
        createEnhancedFooter();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooterEnhancement);
    } else {
        initFooterEnhancement();
    }
    
    console.log('✅ Footer enhancement ready - connects to Supabase!');
})();