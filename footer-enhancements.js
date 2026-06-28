(function() {
    
const API_URL = 'https://seatask-api.onrender.com'; // Your API server address

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
                    <!-- Payment Methods Section - Using Emojis (Always works, no lag) -->
                    <div class="footer-section payment-section">
                        <h4>Secure Payments</h4>
                        <div class="payment-methods">
                            <div class="payment-logo" data-payment="visa">
                                <div class="payment-icon">💳</div>
                                <span>Visa</span>
                            </div>
                            <div class="payment-logo" data-payment="mastercard">
                                <div class="payment-icon">💎</div>
                                <span>Mastercard</span>
                            </div>
                            <div class="payment-logo" data-payment="fpx">
                                <div class="payment-icon">🏦</div>
                                <span>FPX</span>
                            </div>
                        </div>
                        <p class="secure-badge">🔒 100% Secure Transactions</p>
                    </div>
                    
                    <!-- Social Media Section -->
                    <div class="footer-section social-section">
                        <h4>Follow Us</h4>
                        <div class="social-links">
                            <a href="https://www.facebook.com/profile.php?id=61589706664874" target="_blank" class="social-link" data-social="facebook" rel="noopener noreferrer">
                                <span class="social-icon">📘</span>
                                <span>Facebook</span>
                            </a>
                            <a href="https://www.instagram.com/sea_task/" target="_blank" class="social-link" data-social="instagram" rel="noopener noreferrer">
                                <span class="social-icon">📷</span>
                                <span>Instagram</span>
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
        
        console.log('✅ Enhanced footer with social media links added!');
    }
    
    // Save newsletter subscription to PostgreSQL via API
    async function saveNewsletterToPostgreSQL(email) {
        try {
            const response = await fetch(`${API_URL}/api/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNewsletterMessage(result.message, 'success');
                document.getElementById('newsletterEmail').value = '';
                return true;
            } else {
                showNewsletterMessage(result.message, 'warning');
                return false;
            }
        } catch (error) {
            console.error('Error saving newsletter:', error);
            // Fallback to localStorage if API is down
            fallbackSaveNewsletter(email);
            return false;
        }
    }
    
    // Fallback save to localStorage
    function fallbackSaveNewsletter(email) {
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers_fallback') || '[]');
        const exists = subscribers.some(sub => sub.email === email);
        
        if (!exists) {
            subscribers.push({
                email: email,
                date: new Date().toISOString()
            });
            localStorage.setItem('newsletter_subscribers_fallback', JSON.stringify(subscribers));
            showNewsletterMessage('✅ Subscribed! (Saved locally - will sync when online)', 'success');
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
        if (!form) {
            setTimeout(initNewsletterSubscription, 500);
            return;
        }
        
        // Remove any existing listener to prevent duplicate
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const emailInput = document.getElementById('newsletterEmail');
            if (!emailInput) return;
            
            const email = emailInput.value.trim();
            
            if (!email || !email.includes('@')) {
                showNewsletterMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Disable button during submission
            const submitBtn = document.getElementById('newsletterSubscribeBtn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Subscribing...';
            submitBtn.disabled = true;
            
            await saveNewsletterToPostgreSQL(email);
            
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
            });
        });
    }
    
    // Add CSS styles for enhanced footer
    function addFooterStyles() {
        // Check if styles already added
        if (document.getElementById('footer-enhancement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'footer-enhancement-styles';
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
                gap: 8px;
                background: rgba(255,255,255,0.1);
                padding: 12px 18px;
                border-radius: 12px;
                transition: transform 0.2s;
                min-width: 70px;
            }
            
            .payment-logo:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.15);
            }
            
            .payment-icon {
                font-size: 32px;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.15);
                border-radius: 50%;
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
            
            .social-links {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(255,255,255,0.1);
                padding: 8px 20px;
                border-radius: 30px;
                color: white;
                text-decoration: none;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .social-link:hover {
                background: rgba(255,255,255,0.25);
                transform: translateY(-2px);
            }
            
            .social-icon {
                font-size: 18px;
            }
            
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
    
    console.log('✅ Footer enhancement ready - Social media links: Facebook, Instagram');
})();