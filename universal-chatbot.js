// ========== UNIVERSAL AI CHATBOT WITH VOICE ==========
// Works on ALL pages (index.html, product-detail.html, and any future pages)
// Includes: Voice assistant, persistent chat, contact support, quick actions

(function() {
    // ========== CONFIGURATION ==========
    const CONFIG = {
        autoPopupDelay: 3000,
        showContactUs: true,
        supportEmail: 'support@seatask.com',
        supportPhone: '+60 12-345 6789',
        supportHours: 'Mon-Fri, 9AM - 6PM',
        voiceEnabled: true
    };
    
    // ========== PRODUCT DATABASE FOR CHATBOT ==========
    const chatbotProducts = [
        { name: "Premium Cotton T-Shirt", category: "Shirt", price: 79, keywords: ["shirt", "clothes", "apparel", "tshirt", "wear"] },
        { name: "Adjustable Baseball Cap", category: "Hat", price: 29, keywords: ["hat", "cap", "headwear", "sun"] },
        { name: "Compact Travel Umbrella", category: "Accessories", price: 45, keywords: ["umbrella", "rain", "wet", "weather", "storm"] },
        { name: "Insulated Water Bottle", category: "Accessories", price: 35, keywords: ["bottle", "water", "drink", "hydration"] },
        { name: "Gym Bag", category: "Accessories", price: 59, keywords: ["bag", "gym", "sports", "carry"] },
        { name: "Bluetooth Speaker", category: "Electronics", price: 129, keywords: ["speaker", "music", "audio", "sound", "bluetooth"] },
        { name: "Wireless Earbuds", category: "Electronics", price: 89, keywords: ["earbuds", "headphones", "wireless", "music"] },
        { name: "Smart Watch Band", category: "Electronics", price: 49, keywords: ["watch", "band", "smartwatch", "strap"] },
        { name: "Carbon Fiber Badminton Racket", category: "Badminton", price: 159, keywords: ["racket", "badminton", "sports", "play"] },
        { name: "Durable Shuttlecock (6pcs)", category: "Badminton", price: 25, keywords: ["shuttlecock", "badminton", "birdie"] },
        { name: "Badminton Training Bag", category: "Badminton", price: 69, keywords: ["bag", "badminton", "sports"] },
        { name: "Professional Badminton Net", category: "Badminton", price: 89, keywords: ["net", "badminton", "court"] }
    ];
    
    // ========== GLOBAL VARIABLES ==========
    let isChatbotOpen = false;
    let recognition = null;
    let isListening = false;
    let unansweredCount = 0;
    
    // ========== CREATE CHATBOT HTML (If not exists) ==========
    function createChatbotHTML() {
        // Check if chatbot already exists
        if (document.getElementById('universalChatbotContainer')) return;
        
        const chatbotHTML = `
            <div class="chatbot-container" id="universalChatbotContainer">
                <div class="chatbot-header" id="chatbotHeader">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">🤖</div>
                        <div>
                            <div class="chatbot-title">SeaTask AI Assistant</div>
                            <div class="chatbot-status">Online • Ready to help</div>
                        </div>
                    </div>
                    <button class="chatbot-minimize" id="chatbotMinimize">−</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chatbot-message bot">
                        <div class="message-bubble">
                            👋 Hi there! I'm your SeaTask AI Assistant.<br>
                            I can help you find products, answer questions, and give recommendations!<br><br>
                            💡 <strong>Try asking:</strong><br>
                            • "It's raining today, what should I buy?"<br>
                            • "I need a gift for a badminton player"<br>
                            • "What's your best seller?"<br>
                            • "Recommend something under RM50"<br><br>
                            🎤 <strong>Or click the microphone to speak!</strong>
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" id="chatbotInput" placeholder="Type your message..." class="chatbot-input">
                    <button class="chatbot-voice-btn" id="voiceBtn" title="Voice input (Speak your question)">🎤</button>
                    <button class="chatbot-send-btn" id="chatbotSendBtn">📤</button>
                </div>
                <div class="quick-actions" id="quickActions">
                    <button class="quick-action-btn" data-query="Help me find a product">🛍️ Shop</button>
                    <button class="quick-action-btn" data-query="Track my order">📦 Track Order</button>
                    <button class="quick-action-btn" data-query="Contact support">📞 Support</button>
                    <button class="quick-action-btn" data-query="Best sellers">⭐ Best Sellers</button>
                </div>
            </div>
            <button class="chatbot-float-btn" id="chatbotFloatBtn">💬 Chat now</button>
            <div id="voiceIndicator" class="voice-indicator" style="display:none;">🎤 Listening... <span>⚡</span></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    // ========== ADD CSS STYLES ==========
    function addChatbotStyles() {
        if (document.getElementById('universalChatbotStyles')) return;
        
        const styles = `
            <style id="universalChatbotStyles">
                .chatbot-container {
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    width: 380px;
                    height: 550px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 9999;
                    transform: scale(0);
                    opacity: 0;
                    transition: all 0.3s ease;
                    transform-origin: bottom right;
                }
                .chatbot-container.open {
                    transform: scale(1);
                    opacity: 1;
                }
                .chatbot-float-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #1976a5, #2c8cbb);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(25,118,165,0.4);
                    z-index: 9998;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                .chatbot-float-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 25px rgba(25,118,165,0.6);
                }
                .chatbot-header {
                    background: linear-gradient(135deg, #1976a5, #2c8cbb);
                    color: white;
                    padding: 15px 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                .chatbot-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .chatbot-avatar {
                    font-size: 32px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .chatbot-title {
                    font-weight: bold;
                    font-size: 16px;
                }
                .chatbot-status {
                    font-size: 11px;
                    opacity: 0.85;
                }
                .chatbot-minimize {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .chatbot-minimize:hover {
                    background: rgba(255,255,255,0.2);
                }
                .chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    background: #f5f8fa;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .chatbot-message {
                    display: flex;
                    animation: messageSlideIn 0.3s ease;
                }
                @keyframes messageSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .chatbot-message.user {
                    justify-content: flex-end;
                }
                .chatbot-message.bot {
                    justify-content: flex-start;
                }
                .message-bubble {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 13px;
                    line-height: 1.5;
                }
                .chatbot-message.user .message-bubble {
                    background: linear-gradient(135deg, #1976a5, #2c8cbb);
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                .chatbot-message.bot .message-bubble {
                    background: white;
                    color: #1a3a5c;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .chatbot-input-area {
                    display: flex;
                    padding: 12px;
                    background: white;
                    border-top: 1px solid #e0eef5;
                    gap: 10px;
                }
                .chatbot-input {
                    flex: 1;
                    padding: 12px;
                    border: 1px solid #c8dce8;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                }
                .chatbot-input:focus {
                    border-color: #1976a5;
                    box-shadow: 0 0 0 2px rgba(25,118,165,0.2);
                }
                .chatbot-send-btn, .chatbot-voice-btn {
                    background: #1976a5;
                    color: white;
                    border: none;
                    width: 42px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    transition: 0.2s;
                }
                .chatbot-voice-btn {
                    background: #27ae60;
                }
                .chatbot-voice-btn:hover, .chatbot-send-btn:hover {
                    transform: scale(1.05);
                }
                .chatbot-voice-btn.listening {
                    background: #e74c3c;
                    animation: pulseMic 1.5s infinite;
                }
                @keyframes pulseMic {
                    0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                }
                .quick-actions {
                    display: flex;
                    gap: 8px;
                    padding: 8px 12px;
                    flex-wrap: wrap;
                    border-top: 1px solid #e0eef5;
                    background: white;
                }
                .quick-action-btn {
                    background: #f0f4f8;
                    border: 1px solid #c8dce8;
                    padding: 6px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: 0.2s;
                }
                .quick-action-btn:hover {
                    background: #e0eef5;
                    transform: translateY(-1px);
                }
                .voice-indicator {
                    position: fixed;
                    bottom: 200px;
                    right: 100px;
                    background: #1976a5;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    display: none;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    font-size: 14px;
                }
                .contact-us-bubble {
                    background: linear-gradient(135deg, #fff9f0, #fff3e0) !important;
                    border-left: 4px solid #ff9800;
                }
                .contact-support-btn {
                    margin-top: 10px;
                    background: #1976a5;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 12px;
                    width: 100%;
                }
                .contact-support-btn:hover {
                    background: #0f5479;
                }
                .offline-support-note .message-bubble {
                    background: #fff3e0 !important;
                    border-left: 3px solid #ff9800;
                }
                @media (max-width: 768px) {
                    .chatbot-container { width: calc(100vw - 40px); right: 20px; height: 500px; }
                    .chatbot-float-btn { padding: 10px 18px; font-size: 14px; bottom: 20px; right: 20px; }
                    .quick-action-btn { font-size: 10px; padding: 4px 10px; }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // ========== CHATBOT RESPONSE LOGIC ==========
    function getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('rain') || message.includes('raining') || message.includes('wet') || message.includes('weather')) {
            return { text: "☔ It looks like rainy weather! Perfect time to grab our <strong>Compact Travel Umbrella (RM45)</strong>. It's windproof and UV protected!<br><br>🛒 Would you like me to help you add it to your cart?", recommendation: "Compact Travel Umbrella" };
        }
        if (message.includes('hot') || message.includes('sunny') || message.includes('sun')) {
            return { text: "☀️ Staying cool in this hot weather? Our <strong>Adjustable Baseball Cap (RM29)</strong> and <strong>Insulated Water Bottle (RM35)</strong> are perfect for you!<br><br>🧢💧 Want me to add these to your cart?", recommendation: "Adjustable Baseball Cap, Insulated Water Bottle" };
        }
        if (message.includes('gift') || message.includes('present') || message.includes('birthday')) {
            return { text: "🎁 Looking for a gift? Here are our top picks:<br>• <strong>Bluetooth Speaker (RM129)</strong> - perfect for music lovers<br>• <strong>Carbon Fiber Badminton Racket (RM159)</strong> - for sports enthusiasts<br>• <strong>Premium Cotton T-Shirt (RM79)</strong> - simple and classy<br><br>Which one catches your eye?", recommendation: "Bluetooth Speaker, Badminton Racket, T-Shirt" };
        }
        if (message.includes('budget') || message.includes('cheap') || message.includes('affordable') || message.includes('under')) {
            let priceMatch = message.match(/(\d+)/);
            let maxPrice = priceMatch ? parseInt(priceMatch[0]) : 50;
            let affordable = chatbotProducts.filter(p => p.price <= maxPrice);
            if (affordable.length > 0) {
                let productsList = affordable.slice(0, 3).map(p => `• <strong>${p.name}</strong> (RM${p.price})`).join('<br>');
                return { text: `💰 Products under RM${maxPrice}:<br>${productsList}<br><br>Would you like more details on any of these?`, recommendation: affordable.slice(0, 3).map(p => p.name).join(", ") };
            }
        }
        if (message.includes('badminton') || message.includes('racket') || message.includes('shuttlecock')) {
            return { text: "🏸 Badminton enthusiast! Check out our top badminton gear:<br>• <strong>Carbon Fiber Badminton Racket (RM159)</strong><br>• <strong>Durable Shuttlecock 6pcs (RM25)</strong><br>• <strong>Professional Badminton Net (RM89)</strong><br><br>Want to see our collection?", recommendation: "Badminton Racket, Shuttlecock, Badminton Net" };
        }
        if (message.includes('track') || message.includes('order')) {
            return { text: "📦 To track your order, please check your email for the tracking link. You can also contact our support team at <strong>support@seatask.com</strong> with your order number.", recommendation: null };
        }
        if (message.includes('contact') || message.includes('support') || message.includes('help')) {
            return { text: `📞 <strong>Customer Support</strong><br><br>📧 Email: ${CONFIG.supportEmail}<br>📞 Phone: ${CONFIG.supportPhone}<br>⏰ Hours: ${CONFIG.supportHours}<br><br>Our team will respond within 24 hours!`, recommendation: null };
        }
        if (message.includes('best seller') || message.includes('popular')) {
            return { text: "🌟 Our top selling products:<br>1. <strong>Carbon Fiber Badminton Racket (RM159)</strong><br>2. <strong>Bluetooth Speaker (RM129)</strong><br>3. <strong>Premium Cotton T-Shirt (RM79)</strong><br><br>These are customer favorites!", recommendation: "Carbon Fiber Badminton Racket, Bluetooth Speaker, Premium Cotton T-Shirt" };
        }
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return { text: "👋 Hello! I'm here to help!<br><br>You can ask me about:<br>• Weather recommendations<br>• Gift ideas<br>• Budget-friendly products<br>• Badminton gear<br>• Electronics<br>• Apparel<br><br>🎤 Or click the microphone to speak!", recommendation: null };
        }
        return { text: "Thanks for your message! 🤝<br><br>Here are some things you can ask me:<br>• 'What should I buy on a rainy day?'<br>• 'Recommend a gift for a badminton player'<br>• 'Best seller products'<br>• 'Products under RM50'<br><br>Or just tell me what you're looking for!", recommendation: null };
    }
    
    // ========== MESSAGE HANDLING ==========
    function addMessage(message, isUser = false) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `<div class="message-bubble">${message}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to localStorage for persistence
        saveMessagesToStorage();
    }
    
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<div class="message-bubble">●●●</div>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    function processUserMessage(userMessage) {
        if (!userMessage.trim()) return;
        addMessage(userMessage, true);
        
        const input = document.getElementById('chatbotInput');
        if (input) input.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = getBotResponse(userMessage);
            addMessage(response.text, false);
            
            if (response.recommendation) {
                setTimeout(() => {
                    const quickAddDiv = document.createElement('div');
                    quickAddDiv.className = 'chatbot-message bot';
                    quickAddDiv.innerHTML = `<div class="message-bubble quick-add">💡 <strong>Quick Tip:</strong> Check out our ${response.recommendation} in the Shop section!<br><br><button class="chatbot-shop-btn" onclick="document.getElementById('products-section')?.scrollIntoView({behavior: 'smooth'})">🛍️ Browse Products</button></div>`;
                    const messagesContainer = document.getElementById('chatbotMessages');
                    if (messagesContainer) {
                        messagesContainer.appendChild(quickAddDiv);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }, 500);
            }
            
            unansweredCount = 0;
            saveMessagesToStorage();
        }, 800);
        
        unansweredCount++;
        if (unansweredCount >= 3) {
            setTimeout(() => {
                addContactUsMessage();
                unansweredCount = 0;
            }, 1000);
        }
    }
    
    function addContactUsMessage() {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'chatbot-message bot offline-support-note';
        contactDiv.innerHTML = `
            <div class="message-bubble">
                ⚠️ <strong>Still need help?</strong><br>
                Our AI might not have the answer you're looking for.<br><br>
                📧 Contact our support team: <a href="mailto:${CONFIG.supportEmail}" style="color:#1976a5;">${CONFIG.supportEmail}</a><br>
                📞 Or call us: <a href="tel:${CONFIG.supportPhone}" style="color:#1976a5;">${CONFIG.supportPhone}</a>
            </div>
        `;
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.appendChild(contactDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // ========== VOICE RECOGNITION ==========
    function initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Voice recognition not supported');
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.style.display = 'none';
            }
            return;
        }
        
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice recognized:', transcript);
            
            const input = document.getElementById('chatbotInput');
            if (input) {
                input.value = transcript;
                setTimeout(() => {
                    processUserMessage(transcript);
                }, 100);
            }
            
            stopListening();
            showVoiceMessage(`You said: "${transcript}"`, 'success');
        };
        
        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            stopListening();
            if (event.error !== 'no-speech') {
                showVoiceMessage(`Voice error: ${event.error}. Please try again.`, 'error');
            }
        };
        
        recognition.onend = () => {
            stopListening();
        };
        
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', toggleVoiceInput);
        }
    }
    
    function toggleVoiceInput() {
        if (!recognition) return;
        
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
    
    function startListening() {
        try {
            recognition.start();
            isListening = true;
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '⏹️';
                voiceBtn.title = 'Stop listening';
            }
            showVoiceIndicator(true);
        } catch (error) {
            console.error('Start listening error:', error);
        }
    }
    
    function stopListening() {
        if (recognition) {
            try {
                recognition.stop();
            } catch(e) {}
        }
        isListening = false;
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '🎤';
            voiceBtn.title = 'Voice input (Speak your question)';
        }
        showVoiceIndicator(false);
    }
    
    function showVoiceIndicator(show) {
        const indicator = document.getElementById('voiceIndicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
    }
    
    function showVoiceMessage(message, type) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = message;
            toast.style.background = type === 'error' ? '#e74c3c' : '#27ae60';
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
                toast.style.background = '#1976a5';
            }, 3000);
        }
    }
    
    // ========== PERSISTENT CHAT (Save/Load messages) ==========
    function saveMessagesToStorage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messages = [];
        const messageDivs = messagesContainer.querySelectorAll('.chatbot-message');
        messageDivs.forEach(div => {
            const isUser = div.classList.contains('user');
            const bubble = div.querySelector('.message-bubble');
            if (bubble && !div.classList.contains('offline-support-note')) {
                messages.push({
                    text: bubble.innerText,
                    isUser: isUser
                });
            }
        });
        localStorage.setItem('chatbot_messages', JSON.stringify(messages.slice(-30)));
        localStorage.setItem('chatbot_last_activity', Date.now());
    }
    
    function loadSavedMessages() {
        const savedMessages = localStorage.getItem('chatbot_messages');
        const lastActivity = localStorage.getItem('chatbot_last_activity');
        
        if (savedMessages && lastActivity && (Date.now() - parseInt(lastActivity)) < 30 * 60 * 1000) {
            const messages = JSON.parse(savedMessages);
            const messagesContainer = document.getElementById('chatbotMessages');
            if (messagesContainer && messages.length > 0) {
                // Clear only welcome message if exists
                const existingMessages = messagesContainer.querySelectorAll('.chatbot-message');
                if (existingMessages.length <= 2) {
                    messagesContainer.innerHTML = '';
                    messages.forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `chatbot-message ${msg.isUser ? 'user' : 'bot'}`;
                        messageDiv.innerHTML = `<div class="message-bubble">${msg.text}</div>`;
                        messagesContainer.appendChild(messageDiv);
                    });
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        }
    }
    
    // ========== CHATBOT CONTROLS ==========
    function openChatbot() {
        const container = document.getElementById('universalChatbotContainer');
        const floatBtn = document.getElementById('chatbotFloatBtn');
        if (container) {
            container.classList.add('open');
            isChatbotOpen = true;
        }
        if (floatBtn) floatBtn.style.display = 'none';
        sessionStorage.setItem('chatbot_auto_popup_shown', 'true');
    }
    
    function closeChatbot() {
        const container = document.getElementById('universalChatbotContainer');
        const floatBtn = document.getElementById('chatbotFloatBtn');
        if (container) {
            container.classList.remove('open');
            isChatbotOpen = false;
        }
        if (floatBtn) floatBtn.style.display = 'flex';
        saveMessagesToStorage();
    }
    
    function sendMessage() {
        const input = document.getElementById('chatbotInput');
        if (input && input.value.trim()) {
            processUserMessage(input.value);
        }
    }
    
    function autoPopupChat() {
        const hasSeenPopup = sessionStorage.getItem('chatbot_auto_popup_shown');
        if (!hasSeenPopup && !isChatbotOpen) {
            setTimeout(() => {
                const floatBtn = document.getElementById('chatbotFloatBtn');
                if (floatBtn && !isChatbotOpen) {
                    floatBtn.style.animation = 'pulseGlow 0.5s ease-in-out 2';
                    setTimeout(() => openChatbot(), 1000);
                }
                sessionStorage.setItem('chatbot_auto_popup_shown', 'true');
            }, CONFIG.autoPopupDelay);
        }
    }
    
    // ========== INITIALIZE ==========
    function initUniversalChatbot() {
        // Don't re-initialize
        if (window.universalChatbotInitialized) return;
        window.universalChatbotInitialized = true;
        
        // Create HTML and styles
        addChatbotStyles();
        createChatbotHTML();
        
        // Get elements
        const floatBtn = document.getElementById('chatbotFloatBtn');
        const minimizeBtn = document.getElementById('chatbotMinimize');
        const sendBtn = document.getElementById('chatbotSendBtn');
        const input = document.getElementById('chatbotInput');
        
        // Event listeners
        if (floatBtn) floatBtn.addEventListener('click', openChatbot);
        if (minimizeBtn) minimizeBtn.addEventListener('click', closeChatbot);
        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (input) input.value = query;
                sendMessage();
            });
        });
        
        // Voice recognition
        if (CONFIG.voiceEnabled) {
            initVoiceRecognition();
        }
        
        // Load saved messages
        loadSavedMessages();
        
        // Auto popup
        autoPopupChat();
        
        console.log('✅ Universal AI Chatbot with Voice initialized on ALL pages!');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUniversalChatbot);
    } else {
        initUniversalChatbot();
    }
})();