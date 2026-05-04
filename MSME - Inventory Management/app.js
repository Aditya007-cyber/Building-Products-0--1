// Core UI Elements
const chatForm = document.getElementById('chat-form');
const intentInput = document.getElementById('intent-input');
const chatContainer = document.getElementById('chat-container');

// Application State
let userName = "";
let openaiApiKey = "";
let cart = [];
let currentContextVibe = null;
let shownProducts = new Set();
let activeQuickViewProduct = null;
let selectedSize = 'M'; // default
let dynamicCatalog = []; // Will hold FakeStoreAPI data + existing catalog

// Fetch Real Products
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const realProducts = await response.json();
        
        // Map real products to our app's structure
        const mappedReal = realProducts.map(rp => {
            let vibe = 'casual';
            if (rp.category === "men's clothing") vibe = 'professional';
            if (rp.category === "women's clothing") vibe = 'traditional';
            if (rp.category === "jewelery") vibe = 'traditional';
            
            return {
                id: 'fake_' + rp.id,
                name: rp.title,
                type: rp.category,
                price: rp.price,
                image: rp.image,
                tags: [rp.category, 'real', 'fetched'],
                vibe: vibe,
                description: rp.description
            };
        });
        
        // Combine our dummy catalog with real products
        dynamicCatalog = [...catalog, ...mappedReal];
        console.log("Loaded " + dynamicCatalog.length + " products (including real web data).");
    } catch (e) {
        console.error("Failed to fetch real products:", e);
        dynamicCatalog = catalog; // fallback
    }
}
fetchProducts();

// Authentication Logic
// Authentication Logic
function toggleAuthMode(mode) {
    if (mode === 'signup') {
        document.getElementById('signin-card').style.display = 'none';
        document.getElementById('signup-card').style.display = 'block';
    } else {
        document.getElementById('signup-card').style.display = 'none';
        document.getElementById('signin-card').style.display = 'block';
    }
}

function handleLogin(e) {
    e.preventDefault();
    userName = document.getElementById('auth-name-signin').value.trim();
    completeAuth();
}

function handleSignup(e) {
    e.preventDefault();
    userName = document.getElementById('auth-name-signup').value.trim();
    completeAuth();
}

function completeAuth() {
    openaiApiKey = ""; // Mock flow
    
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    // Setup initial greeting
    document.getElementById('chat-container').innerHTML = `
        <div class="message ai">
            <div class="bubble">
                <strong>Hi ${userName}, I'm your Amazon Shopping Assistant.</strong><br>
                I use True AI to understand exactly what you need.
                <br><br>
                What are you looking for today?
            </div>
            <div class="suggestions">
                <div class="suggestion-chip" onclick="setInput('Traditional wear for men')">🥻 Traditional (Men)</div>
                <div class="suggestion-chip" onclick="setInput('Traditional wear for women')">✨ Traditional (Women)</div>
                <div class="suggestion-chip" onclick="setInput('Relaxed home clothes for women')">🏠 Home Loungewear</div>
                <div class="suggestion-chip" onclick="setInput('Casual everyday fashion for men')">👕 Casual Men's</div>
                <div class="suggestion-chip" onclick="setInput('Need a relaxed outfit for my Goa trip')">🌴 Goa Trip</div>
            </div>
        </div>
    `;
}

// True LLM Integration via Netlify Function
async function callOpenAI(text) {
    try {
        const response = await fetch('/.netlify/functions/chat-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            console.error("Netlify function error:", await response.text());
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch(e) {
        console.error("Failed to call serverless function:", e);
        return null;
    }
}

// Cart & Quick View Logic
function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

function openQuickView(productId) {
    const product = dynamicCatalog.find(p => p.id === productId);
    if (!product) return;
    
    activeQuickViewProduct = product;
    selectedSize = 'M'; // Reset size
    
    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-title').innerText = product.name;
    document.getElementById('qv-price').innerText = '$' + product.price.toFixed(2);
    document.getElementById('qv-desc').innerText = product.description || "A premium choice for your wardrobe.";
    
    // Update size UI
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.size-btn')[1].classList.add('selected'); // Select 'M' visually
    
    // Setup add button
    const addBtn = document.getElementById('qv-add-btn');
    addBtn.onclick = (e) => addToCart(product.id, e, selectedSize);
    addBtn.innerHTML = 'Add to Cart - $' + product.price.toFixed(2);
    
    document.getElementById('quick-view-overlay').style.display = 'flex';
}

function closeQuickView() {
    document.getElementById('quick-view-overlay').style.display = 'none';
    activeQuickViewProduct = null;
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.innerText === size) b.classList.add('selected');
    });
}

function addToCart(productId, event, size = 'M') {
    const product = dynamicCatalog.find(p => p.id === productId);
    
    // We allow adding the same product in different sizes, so we check ID+Size combination
    const cartItemId = `${productId}_${size}`;
    
    if (product && !cart.find(p => p.cartItemId === cartItemId)) {
        cart.push({ ...product, cartItemId, selectedSize: size });
        updateCartUI();
        
        // Change button visual temporarily
        if (event && event.currentTarget) {
            const btn = event.currentTarget;
            const oldHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            btn.style.background = '#f0f2f2';
            btn.style.borderColor = '#067D62';
            btn.style.color = '#067D62';
            setTimeout(() => {
                btn.innerHTML = oldHtml;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1500);
        }
    }
}

function addAllToCart(productIds, event) {
    productIds.forEach(id => addToCart(id, null));
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Entire Bundle Added!';
        btn.style.background = '#f0f2f2';
        btn.style.borderColor = '#067D62';
        btn.style.color = '#067D62';
        setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 1500);
    }
}

function removeFromCart(cartItemId) {
    cart = cart.filter(p => p.cartItemId !== cartItemId);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    
    const cartItemsDiv = document.getElementById('cart-items');
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">Your bundle is empty.</p>';
    } else {
        let html = '';
        cart.forEach(p => {
            total += p.price;
            html += `
                <div class="cart-item">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${p.name}</span>
                        <span style="font-size: 0.8rem; color: #565959;">Size: ${p.selectedSize}</span>
                        <span class="cart-item-price">$${p.price.toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${p.cartItemId}')">
                        Remove
                    </button>
                </div>
            `;
        });
        cartItemsDiv.innerHTML = html;
    }
    
    document.getElementById('cart-total-price').innerText = total.toFixed(2);
}

// Initial UI
updateCartUI();

// Helper to set input from suggestions
window.setInput = function(text) {
    intentInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
};

// Scroll to bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add a message to the UI
function appendMessage(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    // Remove suggestions if user types
    if (sender === 'user') {
        const suggestions = document.querySelector('.suggestions');
        if (suggestions) suggestions.remove();
    }

    if (sender === 'ai' && htmlContent === 'typing') {
        msgDiv.id = 'typing-indicator';
        msgDiv.innerHTML = `
            <div class="bubble typing">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
    } else {
        msgDiv.innerHTML = `<div class="bubble">${htmlContent}</div>`;
    }

    chatContainer.appendChild(msgDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Render the bundle UI
function renderBundle(products) {
    if (!products || products.length === 0) return '';
    
    let html = `<div class="bundle-container">`;
    products.forEach(p => {
        html += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-image" onclick="openQuickView('${p.id}')" style="cursor: pointer;">
                <div class="product-info" onclick="openQuickView('${p.id}')" style="cursor: pointer;">
                    <span class="product-type">${p.type}</span>
                    <span class="product-name">${p.name}</span>
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                </div>
                <button class="add-btn" onclick="openQuickView('${p.id}')">
                    Select Size & Add
                </button>
            </div>
        `;
    });
    
    // Add "Add entire bundle" button if there's more than 1 item
    if (products.length > 1) {
        const productIds = products.map(p => `'${p.id}'`).join(',');
        html += `
            <button class="add-all-btn" onclick="addAllToCart([${productIds}], event)">
                <i class="fa-solid fa-layer-group"></i> Add Entire Bundle to Cart
            </button>
        `;
    }
    
    html += `</div>`;
    return html;
}



// AI Logic (LLM Powered)
async function processIntent(text) {
    const lowerText = text.toLowerCase();
    const isFollowUp = lowerText.includes('add') || lowerText.includes('more') || lowerText.includes('also');
    
    let vibe = "casual";
    let targetGender = null;
    let responseText = "Here are some items I found for you.";
    
    // Call True LLM
    const aiResponse = await callOpenAI(text);
    
    if (aiResponse) {
        vibe = aiResponse.vibe || "casual";
        targetGender = aiResponse.targetGender || null;
        responseText = aiResponse.responseText || responseText;
    } else {
        // Fallback Keyword Logic if API Key fails
        if (lowerText.match(/\bwomen's\b|\bwomen\b|\bfemale\b/)) targetGender = "women";
        else if (lowerText.match(/\bmen's\b|\bmen\b|\bmale\b/)) targetGender = "men";
        
        if (lowerText.includes('goa') || lowerText.includes('beach')) vibe = "beachy";
        else if (lowerText.includes('office') || lowerText.includes('formal')) vibe = "professional";
        else if (lowerText.includes('winter') || lowerText.includes('cozy')) vibe = "cozy";
        else if (lowerText.includes('gift') || lowerText.includes('mom')) vibe = "comfort";
        else if (lowerText.includes('traditional') || lowerText.includes('wedding')) vibe = "traditional";
        else if (lowerText.includes('home') || lowerText.includes('lounge')) vibe = "loungewear";
        
        responseText = "I've put together this bundle for you (Fallback Mode).";
    }

    // Save context for follow-ups
    if (isFollowUp && currentContextVibe) {
        vibe = currentContextVibe;
        responseText = "I've found some additional items that match the vibe.";
    } else {
        currentContextVibe = vibe;
    }

    // 2. Query Catalog (Filter by vibe)
    let matchedProducts = dynamicCatalog.filter(p => p.vibe === vibe);
    
    // Filter by gender if specified
    if (targetGender) {
        matchedProducts = matchedProducts.filter(p => p.tags.includes(targetGender) || p.tags.includes("unisex"));
    }

    // 3. Bundle Generator (Agentic Logic)
    // Ensure we don't just return random items. We want a cohesive bundle (e.g. top + bottom + accessory)
    const bundle = [];
    const hasType = new Set();
    
    matchedProducts.forEach(product => {
        if (!hasType.has(product.type)) {
            bundle.push(product);
            hasType.add(product.type);
            shownProducts.add(product.id);
        }
    });

    return {
        text: responseText,
        bundle: bundle
    };
}

// Event Listeners
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = intentInput.value.trim();
    if (!text) return;

    // User Message
    appendMessage('user', text);
    intentInput.value = '';

    // Show Typing
    appendMessage('ai', 'typing');
        
    // Await True LLM Process Intent
    const result = await processIntent(text);
            
    removeTypingIndicator();
    
    // Render Response
    let finalHtml = result.text;
    if (result.bundle.length > 0) {
        finalHtml += renderBundle(result.bundle);
    }
    
    appendMessage('ai', finalHtml);
});

// SPA Navigation & Checkout Logic
function goToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    // Hide chat & cart, show checkout
    document.getElementById('cart-overlay').style.display = 'none';
    document.getElementById('chat-container').style.display = 'none';
    document.querySelector('.input-area').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    
    // Populate Order Summary
    const summaryItems = document.getElementById('checkout-summary-items');
    let total = 0;
    let html = '';
    
    cart.forEach(p => {
        total += p.price;
        html += `
            <div class="summary-item">
                <span>${p.name} (Size: ${p.selectedSize})</span>
                <span>$${p.price.toFixed(2)}</span>
            </div>
        `;
    });
    
    summaryItems.innerHTML = html;
    document.getElementById('checkout-summary-total').innerText = total.toFixed(2);
    document.getElementById('checkout-total-btn').innerText = total.toFixed(2);
}

function backToChat() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    document.querySelector('.input-area').style.display = 'block';
    scrollToBottom();
}

async function processPayment(e) {
    if (e) e.preventDefault();
    // Validate simple mock form
    const inputs = document.querySelectorAll('.checkout-form input');
    let valid = true;
    let phone = '';
    
    inputs.forEach(input => {
        if (!input.value.trim()) valid = false;
        if (input.id === 'checkout-phone') phone = input.value.trim();
    });
    
    if (!valid) {
        alert("Please fill out all shipping and payment information.");
        return;
    }
    
    const btn = document.querySelector('.pay-btn');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    let total = 0;
    cart.forEach(p => total += p.price);

    try {
        const response = await fetch('/.netlify/functions/process-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart: cart,
                phone: phone,
                total: total
            })
        });
        
        const data = await response.json();
        console.log("Checkout processed by Serverless Function:", data);
        
        document.getElementById('checkout-view').style.display = 'none';
        const successView = document.getElementById('success-view');
        successView.style.display = 'flex';
        
        // Clear cart & state
        cart = [];
        currentContextVibe = null;
        shownProducts.clear();
        updateCartUI();
        if (btn) btn.innerHTML = 'Pay Now';
        
    } catch(error) {
        alert("Checkout failed. Please try again.");
        if (btn) btn.innerHTML = 'Pay Now';
    }
}

function resetApp() {
    document.getElementById('success-view').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    document.querySelector('.input-area').style.display = 'block';
    
    // Clear chat
    document.getElementById('chat-container').innerHTML = `
        <div class="message ai">
            <div class="bubble">
                Hi there! I'm Lumina, your AI styling assistant. 
                I don't just find products; I curate complete looks based on your needs.
                <br><br>
                What are we styling for today?
            </div>
            <div class="suggestions">
                <div class="suggestion-chip" onclick="setInput('Need a relaxed outfit for my Goa trip')">🌴 Goa Trip</div>
                <div class="suggestion-chip" onclick="setInput('Formal attire for an office meeting')">💼 Office Meeting</div>
                <div class="suggestion-chip" onclick="setInput('Cozy winter clothes')">❄️ Winter Cabin</div>
                <div class="suggestion-chip" onclick="setInput('Gift for a new mom')">🎁 Gift for New Mom</div>
            </div>
        </div>
    `;
}
