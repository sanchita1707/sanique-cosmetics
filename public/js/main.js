// Sanique Cosmetics Global Script

// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('sanique_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFloatingActions();
  initTheme();
  initCartDrawer();
  initChatConsultant();
  updateCartBadge();
});

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('active'), 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Navbar operations
function initNavbar() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      if (navLinks.classList.contains('active')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--bg-glass)';
        navLinks.style.padding = '20px';
        navLinks.style.zIndex = '999';
      } else {
        navLinks.style.display = 'none';
      }
    });
  }

  // Header background fade on scroll
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '8px 5%';
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    } else {
      header.style.padding = '15px 5%';
      header.style.boxShadow = '0 4px 30px var(--shadow-color)';
    }
  });

  // Render Logged-in/Logged-out buttons
  const token = localStorage.getItem('sanique_token');
  const userBtn = document.getElementById('user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (token) {
        // Redirect to dashboard or admin
        const isAdmin = localStorage.getItem('sanique_isAdmin') === 'true';
        window.location.href = isAdmin ? '/admin.html' : '/dashboard.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }
}

// Light & Dark Theme management
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('sanique_theme') || 'light';

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('sanique_theme', targetTheme);
      updateThemeIcon(targetTheme);
      showToast(`Switched to ${targetTheme} mode`, 'success');
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('#theme-toggle i');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
}

// Cart Drawer Operations
function initCartDrawer() {
  const cartBtn = document.getElementById('cart-btn');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');

  if (cartBtn && cartDrawer && cartOverlay) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  if (cartClose && cartOverlay) {
    [cartClose, cartOverlay].forEach(btn => {
      btn.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
      });
    });
  }
}

function openCartDrawer() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    renderCartDrawerItems();
  }
}

// Global Cart Modifiers
function addToCart(productId, name, price, image, shade = "", quantity = 1) {
  const existing = cart.find(item => item.productId === productId && item.shade === shade);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name, price, image, shade, quantity });
  }
  localStorage.setItem('sanique_cart', JSON.stringify(cart));
  updateCartBadge();
  openCartDrawer();
  showToast(`${name} added to cart`, 'success');
}

function updateCartQuantity(productId, shade, change) {
  const item = cart.find(item => item.productId === productId && item.shade === shade);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => !(i.productId === productId && i.shade === shade));
    }
    localStorage.setItem('sanique_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawerItems();
  }
}

function removeFromCart(productId, shade) {
  cart = cart.filter(i => !(i.productId === productId && i.shade === shade));
  localStorage.setItem('sanique_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawerItems();
  showToast('Product removed from cart', 'error');
}

function updateCartBadge() {
  const countBadge = document.querySelector('.cart-count');
  if (countBadge) {
    const total = cart.reduce((acc, item) => item.quantity + acc, 0);
    countBadge.textContent = total;
  }
}

function renderCartDrawerItems() {
  const cartBody = document.querySelector('.cart-drawer-body');
  const cartSubtotal = document.getElementById('cart-subtotal');

  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align:center; padding: 50px 0; color: var(--text-secondary);">
        <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 15px; color: var(--rose-gold);"></i>
        <p>Your luxury cart is empty.</p>
        <a href="/shop.html" class="btn btn-outline" style="margin-top:20px; font-size:0.8rem;">Browse Products</a>
      </div>
    `;
    if (cartSubtotal) cartSubtotal.textContent = '₹0';
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const imgUrl = item.image ? item.image : '/assets/images/products/default-product.jpg';
    const imgHtml = `<div class="cart-item-img"><img src="${imgUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';"></div>`;

    html += `
      <div class="cart-item">
        ${imgHtml}
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-shade">${item.shade ? `Shade: ${item.shade}` : 'Default'}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateCartQuantity('${item.productId}', '${item.shade}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${item.productId}', '${item.shade}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.productId}', '${item.shade}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });

  cartBody.innerHTML = html;
  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}

// Floating button triggers
function initFloatingActions() {
  const floatingActions = document.createElement('div');
  floatingActions.className = 'floating-actions';
  floatingActions.innerHTML = `
    <button class="float-btn" id="theme-toggle" title="Toggle Light/Dark Theme"><i class="fas fa-moon"></i></button>
    <button class="float-btn" id="chat-toggle" title="Consult Beauty Expert"><i class="fas fa-comments"></i></button>
    <button class="float-btn" id="scroll-top" title="Scroll to Top" style="display:none;"><i class="fas fa-arrow-up"></i></button>
  `;
  document.body.appendChild(floatingActions);

  // Scroll to Top trigger
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.display = 'flex';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Simulated Luxury Chatbot Advisor ("Sasha")
function initChatConsultant() {
  const chatToggle = document.getElementById('chat-toggle');

  const chatBox = document.createElement('div');
  chatBox.className = 'chat-consultant-box';
  chatBox.id = 'chat-consultant-box';
  chatBox.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-avatar"></div>
        <div>
          <span class="chat-header-title">Sasha</span>
          <span class="chat-header-status">Sanique Beauty Advisor</span>
        </div>
      </div>
      <button class="chat-close" id="chat-close">&times;</button>
    </div>
    <div class="chat-body" id="chat-body">
      <div class="chat-msg consultant">
        Hello! I am Sasha, your personal Sanique Beauty Expert. Whether you need help finding your perfect foundation shade, choosing skincare serums, or creating a bridal routine, I am here for you!
      </div>
    </div>
    <div class="chat-footer">
      <input type="text" class="chat-input" id="chat-input" placeholder="Ask Sasha anything...">
      <button class="chat-send-btn" id="chat-send"><i class="fas fa-paper-plane"></i></button>
    </div>
  `;
  document.body.appendChild(chatBox);

  if (chatToggle) {
    chatToggle.addEventListener('click', () => {
      chatBox.classList.toggle('active');
    });
  }

  const closeBtn = document.getElementById('chat-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatBox.classList.remove('active');
    });
  }

  const sendBtn = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input');

  if (sendBtn && chatInput) {
    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      appendChatMessage(text, 'customer');
      chatInput.value = '';

      // Set typing indicator
      setTimeout(() => {
        const response = generateExpertResponse(text);
        appendChatMessage(response, 'consultant');
      }, 1000);
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

function appendChatMessage(text, sender) {
  const chatBody = document.getElementById('chat-body');
  if (chatBody) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

function generateExpertResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('lipstick') || q.includes('shade') || q.includes('lip')) {
    return "Our Luxe Matte Lipsticks are infused with organic jojoba oil. I highly recommend trying 'Crimson Silk' for bold looks or 'Velvet Rose' for a warm daily wear. You can test them on your phone camera using our Virtual Try-on tool on the Product details page!";
  }
  if (q.includes('foundation') || q.includes('skin tone') || q.includes('shade finder')) {
    return "To find your flawless match, you can use our Shade Finder tool on the Product Details page, or take our quick 5-step Beauty Quiz under the 'Quiz' page. Our foundations offer a luminous dewy finish with SPF 20.";
  }
  if (q.includes('acne') || q.includes('oily') || q.includes('pimple') || q.includes('cleanser')) {
    return "For oily or acne-prone skin, cleansing is key. I recommend our Hydrating Gel Face Wash followed by the Vitamin C Glow Serum which contains Centella extracts to soothe redness and regulate sebum.";
  }
  if (q.includes('dry') || q.includes('moisture') || q.includes('hydrate')) {
    return "Dry skin benefits from deep hydration. Our Hydra-Dew Moisturizer locking moisture for 72 hours alongside our Glow-Radiance Foundation will keep your face hydrated and dewy all day long.";
  }
  if (q.includes('discount') || q.includes('coupon') || q.includes('offer')) {
    return "You can use code 'SANIQUE10' for 10% off your purchase, or 'FESTIVE500' on orders above ₹2,500. Additionally, as a member, you'll earn 10% cashpoints on checkout!";
  }
  return "That sounds wonderful! To give you a customized skin or makeup regimen, try launching our camera-based AI Skin Analysis scanner on the homepage or complete the Beauty Quiz.";
}

// Global user logout
function userLogout() {
  localStorage.removeItem('sanique_token');
  localStorage.removeItem('sanique_isAdmin');
  localStorage.removeItem('sanique_wishlist');
  showToast("Logged out successfully", "success");
  setTimeout(() => window.location.href = '/index.html', 1000);
}
// =======================
// Mobile Menu
// =======================

// ======================
// Mobile Menu
// ======================

const menuBtn = document.getElementById("mobile-menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

}
