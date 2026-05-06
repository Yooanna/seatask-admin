// ========== AI CHATBOT ==========
// Product Database for Recommendations (based on your actual products)
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

// Chatbot DOM Elements
let chatbotContainer = document.getElementById('chatbotContainer');
let chatbotFloatBtn = document.getElementById('chatbotFloatBtn');
let chatbotMinimize = document.getElementById('chatbotMinimize');
let chatbotMessages = document.getElementById('chatbotMessages');
let chatbotInput = document.getElementById('chatbotInput');
let chatbotSendBtn = document.getElementById('chatbotSendBtn');

// Chat state
let isChatbotOpen = false;

// ========== CHATBOT RESPONSE LOGIC ==========
function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Weather-related recommendations
    if (message.includes('rain') || message.includes('raining') || message.includes('wet') || message.includes('weather')) {
        return {
            text: "☔ It looks like rainy weather! Perfect time to grab our <strong>Compact Travel Umbrella (RM45)</strong>. It's windproof and UV protected!<br><br>🛒 Would you like me to help you add it to your cart?",
            recommendation: "Compact Travel Umbrella"
        };
    }
    
    // Hot/sunny weather
    if (message.includes('hot') || message.includes('sunny') || message.includes('sun')) {
        return {
            text: "☀️ Staying cool in this hot weather? Our <strong>Adjustable Baseball Cap (RM29)</strong> and <strong>Insulated Water Bottle (RM35)</strong> are perfect for you! The bottle keeps water cold for 24 hours.<br><br>🧢💧 Want me to add these to your cart?",
            recommendation: "Adjustable Baseball Cap, Insulated Water Bottle"
        };
    }
    
    // Gift recommendations
    if (message.includes('gift') || message.includes('present') || message.includes('birthday')) {
        return {
            text: "🎁 Looking for a gift? Here are our top picks:<br>• <strong>Bluetooth Speaker (RM129)</strong> - perfect for music lovers<br>• <strong>Carbon Fiber Badminton Racket (RM159)</strong> - for sports enthusiasts<br>• <strong>Premium Cotton T-Shirt (RM79)</strong> - simple and classy<br><br>Which one catches your eye?",
            recommendation: "Bluetooth Speaker, Badminton Racket, T-Shirt"
        };
    }
    
    // Budget recommendations
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable') || message.includes('under')) {
        let priceMatch = message.match(/(\d+)/);
        let maxPrice = priceMatch ? parseInt(priceMatch[0]) : 50;
        
        let affordable = chatbotProducts.filter(p => p.price <= maxPrice);
        if (affordable.length > 0) {
            let productsList = affordable.slice(0, 3).map(p => `• <strong>${p.name}</strong> (RM${p.price})`).join('<br>');
            return {
                text: `💰 Products under RM${maxPrice}:<br>${productsList}<br><br>Would you like more details on any of these?`,
                recommendation: affordable.slice(0, 3).map(p => p.name).join(", ")
            };
        }
    }
    
    // Badminton recommendations
    if (message.includes('badminton') || message.includes('racket') || message.includes('shuttlecock') || message.includes('play')) {
        return {
            text: "🏸 Badminton enthusiast! Check out our top badminton gear:<br>• <strong>Carbon Fiber Badminton Racket (RM159)</strong> - lightweight and powerful<br>• <strong>Durable Shuttlecock 6pcs (RM25)</strong><br>• <strong>Professional Badminton Net (RM89)</strong><br><br>Want to see our full badminton collection?",
            recommendation: "Badminton Racket, Shuttlecock, Badminton Net"
        };
    }
    
    // Electronics recommendations
    if (message.includes('speaker') || message.includes('music') || message.includes('earbuds') || message.includes('bluetooth')) {
        return {
            text: "🔊 Great choice! Our best electronics:<br>• <strong>Bluetooth Speaker (RM129)</strong> - waterproof, 20hr battery<br>• <strong>Wireless Earbuds (RM89)</strong> - 30hr battery case<br><br>Which one interests you?",
            recommendation: "Bluetooth Speaker, Wireless Earbuds"
        };
    }
    
    // Apparel recommendations
    if (message.includes('shirt') || message.includes('clothes') || message.includes('wear') || message.includes('cap')) {
        return {
            text: "👕 Looking good! Check out our apparel:<br>• <strong>Premium Cotton T-Shirt (RM79)</strong><br>• <strong>Adjustable Baseball Cap (RM29)</strong><br><br>Both are high quality and super comfortable!",
            recommendation: "Premium Cotton T-Shirt, Adjustable Baseball Cap"
        };
    }
    
    // Best seller
    if (message.includes('best seller') || message.includes('popular') || message.includes('top')) {
        return {
            text: "🌟 Our top selling products right now:<br>1. <strong>Carbon Fiber Badminton Racket (RM159)</strong><br>2. <strong>Bluetooth Speaker (RM129)</strong><br>3. <strong>Premium Cotton T-Shirt (RM79)</strong><br><br>These are customer favorites!",
            recommendation: "Carbon Fiber Badminton Racket, Bluetooth Speaker, Premium Cotton T-Shirt"
        };
    }
    
    // Cart/checkout questions
    if (message.includes('cart') || message.includes('checkout') || message.includes('buy')) {
        return {
            text: "🛒 You can add items to your cart by clicking the <strong>'Add to Cart'</strong> button on any product. Then click the cart icon 🛒 at the top right to complete your purchase!<br><br>Need help with anything specific?",
            recommendation: null
        };
    }
    
    // Help/greeting
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('help')) {
        return {
            text: "👋 Hello! I'm here to help!<br><br>You can ask me about:<br>• Weather recommendations (rainy/hot weather)<br>• Gift ideas<br>• Budget-friendly products<br>• Badminton gear<br>• Electronics<br>• Apparel<br><br>What can I help you with today?",
            recommendation: null
        };
    }
    
    // Price inquiry
    if (message.includes('price') || message.includes('how much')) {
        return {
            text: "💰 Our products range from <strong>RM25</strong> (Shuttlecock) to <strong>RM159</strong> (Badminton Racket). Most items are between RM25-RM130.<br><br>Is there a specific product you're interested in?",
            recommendation: null
        };
    }
    
    // Default response
    return {
        text: "Thanks for your message! 🤝<br><br>Here are some things you can ask me:<br>• 'What should I buy on a rainy day?'<br>• 'Recommend a gift for a badminton player'<br>• 'Best seller products'<br>• 'Products under RM50'<br><br>Or just tell me what you're looking for!",
        recommendation: null
    };
}

// Add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<div class="message-bubble">${message}</div>`;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<div class="message-bubble">●●●</div>';
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Process user message and get bot response
function processUserMessage(userMessage) {
    if (!userMessage.trim()) return;
    
    addMessage(userMessage, true);
    chatbotInput.value = '';
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const response = getBotResponse(userMessage);
        addMessage(response.text, false);
        
        if (response.recommendation) {
            const quickAddDiv = document.createElement('div');
            quickAddDiv.className = 'chatbot-message bot';
            quickAddDiv.innerHTML = `
                <div class="message-bubble quick-add">
                    💡 <strong>Quick Tip:</strong> Click the product category in the menu above to find ${response.recommendation}!
                    <br><br>
                    <button class="chatbot-shop-btn" onclick="document.getElementById('products-section').scrollIntoView({behavior: 'smooth'})">
                        🛍️ Browse Products
                    </button>
                </div>
            `;
            chatbotMessages.appendChild(quickAddDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }, 800);
}

// Send message handler
function sendMessage() {
    const message = chatbotInput.value;
    processUserMessage(message);
}

// ========== CHATBOT UI CONTROLS ==========
function openChatbot() {
    chatbotContainer.classList.add('open');
    chatbotFloatBtn.style.display = 'none';
    isChatbotOpen = true;
}

function closeChatbot() {
    chatbotContainer.classList.remove('open');
    chatbotFloatBtn.style.display = 'flex';
    isChatbotOpen = false;
}

// ========== AUTO POP-UP ON PAGE LOAD ==========
function autoPopUpChatbot() {
    setTimeout(() => {
        if (!isChatbotOpen) {
            openChatbot();
        }
    }, 3000);
}

// Time-based recommendation
function getTimeBasedRecommendation() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
        return "🌅 Good morning! Start your day with our <strong>Insulated Water Bottle (RM35)</strong> to stay hydrated!";
    } else if (hour >= 12 && hour < 18) {
        return "☀️ Good afternoon! Need a break? Check out our <strong>Bluetooth Speaker (RM129)</strong> for some music!";
    } else {
        return "🌙 Good evening! Relax after work with our <strong>Premium Cotton T-Shirt (RM79)</strong> - super comfortable!";
    }
}

// Auto welcome message
function addAutoWelcome() {
    setTimeout(() => {
        const welcomeMessage = `🎉 <strong>Special for you!</strong><br><br>${getTimeBasedRecommendation()}<br><br>Ask me anything about our products!`;
        addMessage(welcomeMessage, false);
    }, 500);
}

// ========== EVENT LISTENERS ==========
if (chatbotFloatBtn) {
    chatbotFloatBtn.addEventListener('click', openChatbot);
}

if (chatbotMinimize) {
    chatbotMinimize.addEventListener('click', closeChatbot);
}

if (chatbotSendBtn) {
    chatbotSendBtn.addEventListener('click', sendMessage);
}

if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', () => {
    autoPopUpChatbot();
    addAutoWelcome();
});