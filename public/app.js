// ============================================================
// app.js — AI Shopping Assistant Frontend
// Wired to Netlify Functions backend + Supabase persistence
// ============================================================

// ---- Config ----
const API_BASE = '/.netlify/functions';

// ---- Core UI Elements ----
const chatForm = document.getElementById('chat-form');
const intentInput = document.getElementById('intent-input');
const chatContainer = document.getElementById('chat-container');

// ---- Application State (lightweight — source of truth is now Supabase) ----
let sessionId = null;          // UUID, persisted in localStorage
let cart = [];                 // Cached from server, refreshed on changes
let activeQuickViewProduct = null;
let selectedSize = 'M';
let dynamicCatalog = [];       // Still used for Quick View lookups after bundles are received

// ============================================================
// SESSION MANAGEMENT
// ============================================================
async function initSession() {
    sessionId = localStorage.getItem('lumina_session_id');

    if (sessionId) {
        // Try to restore existing session
        try {
            const res = await fetch(`${API_BASE}/session?session_id=${sessionId}`);
            if (!res.ok) throw new Error('Session not found');
            const data = await res.json();
            cart = data.cart || [];
            updateCartUI();

            // Restore conversation messages if any
            if (data.messages && data.messages.length > 0) {
                restoreMessages(data.messages, data.session);
            }
            return; // Session restored successfully
        } catch {
            // Session invalid — create a new one
            localStorage.removeItem('lumina_session_id');
        }
    }

    // Create new session
    try {
        const res = await fetch(`${API_BASE}/session`, { method: 'POST' });
        const data = await res.json();
        sessionId = data.session_id;
        localStorage.setItem('lumina_session_id', sessionId);
    } catch (err) {
        console.error('Failed to init session:', err);
        // Graceful degradation: generate local UUID if backend is unreachable
        sessionId = 'local_' + Math.random().toString(36).substring(2, 15);
    }
}

// Restore previous conversation messages from DB
function restoreMessages(messages, session) {
    // Clear default greeting from DOM
    chatContainer.innerHTML = '';
    messages.forEach(msg => {
        if (msg.role === 'user') {
            appendMessage('user', msg.content);
        } else {
            // For assistant messages with bundles, we can't re-render the full bundle
            // (products are not stored in messages), so just show the text
            appendMessage('ai', msg.content);
        }
    });
    scrollToBottom();
}

// ============================================================
// CART API LAYER (replaces in-memory cart mutations)
// ============================================================
async function fetchCart() {
    if (!sessionId) return;
    try {
        const res = await fetch(`${API_BASE}/cart?session_id=${sessionId}`);
        const data = await res.json();
        cart = data.cart || [];
        updateCartUI();
    } catch (err) {
        console.error('Failed to fetch cart:', err);
    }
}

async function addToCartServer(productId, size = 'M', event) {
    if (!sessionId) return;

    // Optimistic UI — show button feedback immediately
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Adding...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }, 1500);
    }

    try {
        await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, product_id: productId, size })
        });
        await fetchCart();
    } catch (err) {
        console.error('Failed to add to cart:', err);
    }
}

async function addBundleToCartServer(productIds, event) {
    if (!sessionId || !productIds.length) return;

    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Bundle Added!';
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

    try {
        await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, action: 'bundle', product_ids: productIds })
        });
        await fetchCart();
    } catch (err) {
        console.error('Failed to add bundle:', err);
    }
}

async function removeFromCartServer(cartItemId) {
    if (!sessionId) return;
    try {
        await fetch(`${API_BASE}/cart`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, cart_item_id: cartItemId })
        });
        await fetchCart();
    } catch (err) {
        console.error('Failed to remove from cart:', err);
    }
}

// ============================================================
// CART UI
// ============================================================
function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

function removeFromCart(cartItemId) {
    removeFromCartServer(cartItemId);
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
            total += Number(p.price);
            html += `
                <div class="cart-item">
                    <img src="${p.image_url}" alt="${p.name}">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${p.name}</span>
                        <span style="font-size: 0.8rem; color: #565959;">Size: ${p.selectedSize}</span>
                        <span class="cart-item-price">$${Number(p.price).toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${p.cartItemId}')">Remove</button>
                </div>`;
        });
        cartItemsDiv.innerHTML = html;
    }
    document.getElementById('cart-total-price').innerText = total.toFixed(2);
}

// ============================================================
// QUICK VIEW MODAL
// ============================================================
function openQuickView(productId) {
    const product = dynamicCatalog.find(p => p.id === productId);
    if (!product) return;

    activeQuickViewProduct = product;
    selectedSize = 'M';

    document.getElementById('qv-image').src = product.image_url || product.image;
    document.getElementById('qv-title').innerText = product.name;
    document.getElementById('qv-price').innerText = '$' + Number(product.price).toFixed(2);
    document.getElementById('qv-desc').innerText = product.description || 'A premium choice for your wardrobe.';

    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.size-btn')[1].classList.add('selected');

    const addBtn = document.getElementById('qv-add-btn');
    addBtn.onclick = (e) => {
        addToCartServer(product.id, selectedSize, e);
        closeQuickView();
    };
    addBtn.innerHTML = 'Add to Cart — $' + Number(product.price).toFixed(2);

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

// ============================================================
// BUNDLE RENDERER
// ============================================================
function renderBundle(products) {
    if (!products || products.length === 0) return '';

    // Store products in local catalog for Quick View lookups
    products.forEach(p => {
        if (!dynamicCatalog.find(c => c.id === p.id)) {
            dynamicCatalog.push(p);
        }
    });

    let html = `<div class="bundle-container">`;
    products.forEach(p => {
        html += `
            <div class="product-card">
                <img src="${p.image_url || p.image}" alt="${p.name}" class="product-image" onclick="openQuickView('${p.id}')" style="cursor: pointer;">
                <div class="product-info" onclick="openQuickView('${p.id}')" style="cursor: pointer;">
                    <span class="product-type">${p.type}</span>
                    <span class="product-name">${p.name}</span>
                    <span class="product-price">$${Number(p.price).toFixed(2)}</span>
                </div>
                <button class="add-btn" onclick="openQuickView('${p.id}')">
                    Select Size &amp; Add
                </button>
            </div>`;
    });

    if (products.length > 1) {
        const productIdsJson = JSON.stringify(products.map(p => p.id));
        html += `
            <button class="add-all-btn" onclick="addBundleToCartServer(${productIdsJson.replace(/"/g, '&quot;')}, event)">
                <i class="fa-solid fa-layer-group"></i> Add Entire Bundle to Cart
            </button>`;
    }

    html += `</div>`;
    return html;
}

// ============================================================
// CHAT: Submit handler → calls /api/chat
// ============================================================
window.setInput = function(text) {
    intentInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
};

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendMessage(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

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
            </div>`;
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

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = intentInput.value.trim();
    if (!text || !sessionId) return;

    appendMessage('user', text);
    intentInput.value = '';
    appendMessage('ai', 'typing');

    try {
        const res = await fetch(`${API_BASE}/chat-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: text })
        });

        const result = await res.json();
        removeTypingIndicator();

        if (result.error) {
            appendMessage('ai', "I'm having a little trouble right now. Please try again in a moment! 🙏");
            return;
        }

        let finalHtml = result.response_text;
        if (result.bundle && result.bundle.length > 0) {
            finalHtml += renderBundle(result.bundle);
        }
        appendMessage('ai', finalHtml);

    } catch (err) {
        console.error('Chat error:', err);
        removeTypingIndicator();
        appendMessage('ai', "Sorry, I'm having trouble connecting right now. Please check your connection and try again!");
    }
});

// ============================================================
// CHECKOUT FLOW
// ============================================================
function goToCheckout() {
    if (cart.length === 0) { alert('Your cart is empty!'); return; }
    document.getElementById('cart-overlay').style.display = 'none';
    document.getElementById('chat-container').style.display = 'none';
    document.querySelector('.input-area').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';

    const summaryItems = document.getElementById('checkout-summary-items');
    let total = 0, html = '';
    cart.forEach(p => {
        total += Number(p.price);
        html += `<div class="summary-item"><span>${p.name} (Size: ${p.selectedSize})</span><span>$${Number(p.price).toFixed(2)}</span></div>`;
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

async function processPayment() {
    const inputs = document.querySelectorAll('.checkout-form input');
    let valid = true;
    let phone = '';
    let name = '';
    let address = '';

    inputs.forEach(input => {
        if (!input.value.trim()) valid = false;
        if (input.id === 'checkout-phone') phone = input.value.trim();
        if (input.id === 'checkout-name') name = input.value.trim();
        if (input.id === 'checkout-address') address = input.value.trim();
    });

    if (!valid) { alert('Please fill out all shipping and payment information.'); return; }

    const btn = document.getElementById('checkout-pay-btn');
    if (btn) { btn.innerHTML = 'Processing...'; btn.disabled = true; }

    try {
        const res = await fetch(`${API_BASE}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, phone, name, address })
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Checkout failed');

        // Open WhatsApp in new tab
        window.open(result.whatsapp_url, '_blank');

        // Show success screen
        document.getElementById('checkout-view').style.display = 'none';
        document.getElementById('success-view').style.display = 'flex';

        // Cart is cleared server-side; update local state
        cart = [];
        updateCartUI();

    } catch (err) {
        console.error('Payment error:', err);
        alert('There was an issue processing your order. Please try again.');
        if (btn) { btn.innerHTML = 'Place Order'; btn.disabled = false; }
    }
}

function resetApp() {
    document.getElementById('success-view').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    document.querySelector('.input-area').style.display = 'block';

    chatContainer.innerHTML = `
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
        </div>`;
}

// ============================================================
// INIT: Kick off session on page load
// ============================================================
(async function init() {
    await initSession();
    updateCartUI();
})();
