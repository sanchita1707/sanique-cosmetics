// Sanique Cosmetics Global Script

// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('sanique_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarUserState();
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

// User Profile and Account Management
function updateNavbarUserState() {
  const token = localStorage.getItem('sanique_token');
  const userBtn = document.getElementById('user-btn');
  if (!userBtn) return;

  let dropdown = document.getElementById('user-dropdown');
  let wrapper = userBtn.closest('.user-menu-wrapper');

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'user-menu-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    userBtn.parentNode.insertBefore(wrapper, userBtn);
    wrapper.appendChild(userBtn);
  }

  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.id = 'user-dropdown';
    wrapper.appendChild(dropdown);
  }

  // Clone button to clear old event listeners safely
  const newUserBtn = userBtn.cloneNode(true);
  userBtn.replaceWith(newUserBtn);

  if (token) {
    // User is logged in
    newUserBtn.innerHTML = '<i class="fas fa-user-check" style="color: var(--rose-gold);"></i>';
    newUserBtn.title = "Manage Account";

    const userName = localStorage.getItem('sanique_user_name') || 'Member';
    const isAdmin = localStorage.getItem('sanique_isAdmin') === 'true';
    const accountUrl = isAdmin ? '/admin.html' : '/dashboard.html';

    dropdown.innerHTML = `
      <div class="user-dropdown-header">Hi, ${userName}</div>
      <a href="${accountUrl}" class="user-dropdown-item"><i class="fas fa-user-circle"></i> My Account</a>
      <a href="/dashboard.html#order-history-list" class="user-dropdown-item"><i class="fas fa-box"></i> My Orders</a>
      <div class="user-dropdown-item" id="dropdown-logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</div>
    `;

    // Toggle dropdown
    newUserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Logout
    const logoutBtn = dropdown.querySelector('#dropdown-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        localStorage.removeItem('sanique_token');
        localStorage.removeItem('sanique_isAdmin');
        localStorage.removeItem('sanique_user_name');
        localStorage.removeItem('sanique_wishlist');

        showToast("Logged out successfully", "success");
        dropdown.classList.remove('active');
        updateNavbarUserState();

        // Redirect if on auth-protected page
        const path = window.location.pathname;
        if (path === '/dashboard.html' || path === '/admin.html' || path === '/wishlist.html' || path === '/checkout.html') {
          setTimeout(() => window.location.href = '/index.html', 1000);
        }
      });
    }

    // Close dropdown click outside
    if (!window.hasUserDropdownGlobalListener) {
      document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.user-menu-wrapper');
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && wrapper && !wrapper.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
      window.hasUserDropdownGlobalListener = true;
    }

  } else {
    // User is logged out
    newUserBtn.innerHTML = '<i class="fas fa-user"></i>';
    newUserBtn.title = "Account";
    dropdown.innerHTML = '';
    dropdown.classList.remove('active');

    // Open modal
    newUserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });
  }
}

// Open Login Modal
function openLoginModal() {
  let modal = document.getElementById('luxury-login-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'luxury-modal-overlay';
    modal.id = 'luxury-login-modal';
    modal.innerHTML = `
      <div class="luxury-modal-container">
        <button class="modal-close-btn" id="modal-close-btn">&times;</button>
        <div class="luxury-modal-content">
          <h2 class="modal-title">Welcome to SANIQUE</h2>
          <p class="modal-subtitle">Sign in to access your customized beauty suite.</p>
          
          <div id="modal-error-msg" class="form-error-msg" style="display:none; text-align:center; margin-bottom:15px; background:rgba(224,93,93,0.1); padding:10px; border-radius:8px;"></div>
          
          <form id="modal-login-form">
            <div class="form-group">
              <input type="email" id="modal-login-email" placeholder="Email Address" required autocomplete="email">
            </div>
            <div class="form-group password-group" style="position:relative;">
              <input type="password" id="modal-login-password" placeholder="Password" required autocomplete="current-password">
              <button type="button" class="password-toggle-btn" id="modal-password-toggle" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--grey); cursor:pointer; font-size:1rem; padding: 5px; display: flex; align-items: center; justify-content: center;">
                <i class="far fa-eye"></i>
              </button>
            </div>
            <div class="forgot-pwd-container" style="text-align:right; margin-bottom:15px;">
              <a href="#" class="forgot-link" id="modal-forgot-link" style="font-size:0.75rem; color:var(--grey); text-decoration:none; font-family:var(--font-sans); transition: var(--transition);">Forgot Password?</a>
            </div>
            <button type="submit" class="btn btn-luxury submit-btn" id="modal-login-submit" style="width:100%; justify-content:center; gap:8px;">
              <span class="btn-text">Sign In</span>
              <span class="btn-loader" style="display:none;"><i class="fas fa-spinner fa-spin"></i></span>
            </button>
          </form>
          
          <div class="modal-footer" style="text-align:center; margin-top:20px; font-size:0.85rem; color:var(--grey); font-family:var(--font-sans);">
            <p>New to Sanique? <a href="/login.html?register=true" id="modal-register-link" style="color:var(--rose-gold); font-weight:600; text-decoration:none; transition: var(--transition);">Create Account</a></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('#modal-close-btn');
    closeBtn.addEventListener('click', closeLoginModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLoginModal();
    });

    const toggleBtn = modal.querySelector('#modal-password-toggle');
    const pwdInput = modal.querySelector('#modal-login-password');
    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.innerHTML = isPwd ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
    });

    const forgotLink = modal.querySelector('#modal-forgot-link');
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast("Password recovery link has been sent to your registered email.", "success");
    });

    const loginForm = modal.querySelector('#modal-login-form');
    loginForm.addEventListener('submit', handleModalLoginSubmit);
  }

  const errorMsg = modal.querySelector('#modal-error-msg');
  errorMsg.style.display = 'none';
  modal.querySelector('#modal-login-email').value = '';
  modal.querySelector('#modal-login-password').value = '';
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Login Modal
function closeLoginModal() {
  const modal = document.getElementById('luxury-login-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Handle Modal Submit
async function handleModalLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('#modal-login-email').value;
  const password = form.querySelector('#modal-login-password').value;
  
  const submitBtn = form.querySelector('#modal-login-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const errorMsg = document.getElementById('modal-error-msg');

  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  submitBtn.disabled = true;
  errorMsg.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem('sanique_token', data.token);
      localStorage.setItem('sanique_isAdmin', data.isAdmin);
      localStorage.setItem('sanique_user_name', data.name);
      localStorage.setItem('sanique_wishlist', JSON.stringify(data.wishlist || []));
      
      showToast("Welcome back to Sanique!", "success");
      closeLoginModal();
      updateNavbarUserState();
    } else {
      errorMsg.textContent = data.message || "Invalid credentials";
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    console.error("Modal login error:", err);
    errorMsg.textContent = "Server connection lost. Try again.";
    errorMsg.style.display = 'block';
  } finally {
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
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

  // Interactive button visual confirmation feedback
  try {
    if (window.event) {
      const activeElem = window.event.currentTarget || window.event.target;
      if (activeElem) {
        const btn = activeElem.classList.contains('btn-add-cart') || activeElem.classList.contains('btn-luxury') || activeElem.tagName === 'BUTTON' ? activeElem : activeElem.closest('.btn-add-cart, .btn-luxury, button');
        if (btn && !btn.classList.contains('added')) {
          const originalHtml = btn.innerHTML;
          btn.classList.add('added');
          btn.innerHTML = '<i class="fas fa-check"></i> Added';
          btn.disabled = true;
          setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = originalHtml;
            btn.disabled = false;
          }, 1500);
        }
      }
    }
  } catch (e) {
    console.error("Cart button feedback animation error:", e);
  }
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
    const oldTotal = parseInt(countBadge.textContent) || 0;
    countBadge.textContent = total;
    if (total !== oldTotal) {
      countBadge.classList.remove('pulse');
      void countBadge.offsetWidth; // Trigger reflow to restart animation
      countBadge.classList.add('pulse');
    }
  }
}

function renderCartDrawerItems() {
  const cartBody = document.querySelector('.cart-drawer-body');
  const cartSubtotal = document.getElementById('cart-subtotal');

  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align:center; padding: 40px 0; color: var(--grey);">
        <i class="fas fa-shopping-bag" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--rose-gold);"></i>
        <p>Your shopping bag is empty.</p>
        <a href="/shop.html" class="btn btn-outline" style="margin-top:16px; font-size:0.75rem; padding: 8px 16px;">Browse Products</a>
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
  let floatingActions = document.querySelector('.floating-actions');
  if (!floatingActions) {
    floatingActions = document.createElement('div');
    floatingActions.className = 'floating-actions';
    floatingActions.innerHTML = `
      <button class="float-btn" id="theme-toggle" title="Toggle Light/Dark Theme"><i class="fas fa-moon"></i></button>
      <button class="float-btn" id="chat-toggle" title="Consult Beauty Expert"><i class="fas fa-comments"></i></button>
      <button class="float-btn" id="scroll-top" title="Scroll to Top" style="display:none;"><i class="fas fa-arrow-up"></i></button>
    `;
    document.body.appendChild(floatingActions);
  }

  // Scroll to Top trigger
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.display = 'flex';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Simulated Luxury Chatbot Advisor ("Sasha")
function initChatConsultant() {
  const chatToggle = document.getElementById('chat-toggle');

  let chatBox = document.getElementById('chat-consultant-box');
  if (!chatBox) {
    chatBox = document.createElement('div');
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
  }

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

// ==========================================
// LUXURY QUICK VIEW SYSTEM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initQuickViewModal();
});

function initQuickViewModal() {
  const overlay = document.getElementById('quick-view-overlay');
  const closeBtn = document.getElementById('quick-view-close');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }
}

// Global Quick View Trigger
async function openQuickView(productId) {
  const overlay = document.getElementById('quick-view-overlay');
  if (!overlay) return;

  try {
    // Show loading state
    document.getElementById('qv-title').textContent = "Curating details...";
    document.getElementById('qv-image').src = '/assets/images/products/default-product.jpg';
    document.getElementById('qv-category').textContent = "";
    document.getElementById('qv-rating').innerHTML = "";
    document.getElementById('qv-price').innerHTML = "";
    document.getElementById('qv-description').textContent = "";
    document.getElementById('qv-shades').innerHTML = "";
    document.getElementById('qv-actions').innerHTML = "";

    overlay.classList.add('active');

    // Fetch product details from endpoint
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error("Product fetch failed");
    const product = await response.json();

    // Populate elements
    document.getElementById('qv-image').src = product.images?.[0] || '/assets/images/products/default-product.jpg';
    document.getElementById('qv-image').alt = product.name;
    document.getElementById('qv-category').textContent = product.category;
    document.getElementById('qv-title').textContent = product.name;
    document.getElementById('qv-description').textContent = product.description || "A luxury beauty formulation crafted with premium organic botanical ingredients and engineered for professional results.";

    // Render ratings stars
    const ratingVal = product.rating || 0;
    const fullStars = Math.floor(ratingVal);
    const halfStar = ratingVal % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star"></i>';
    starsHtml += `<span style="color:var(--grey); margin-left: 8px;">(${product.reviewsCount || 0} reviews)</span>`;
    document.getElementById('qv-rating').innerHTML = starsHtml;

    // Render pricing details
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    let priceHtml = '';
    if (hasDiscount) {
      priceHtml = `
        <span class="price-actual">₹${product.discountPrice.toLocaleString('en-IN')}</span>
        <span class="price-mrp" style="margin-left: 10px; text-decoration: line-through; color: var(--grey);">₹${product.price.toLocaleString('en-IN')}</span>
      `;
    } else {
      priceHtml = `<span class="price-actual">₹${product.price.toLocaleString('en-IN')}</span>`;
    }
    document.getElementById('qv-price').innerHTML = priceHtml;

    // Render shades bubble selector
    let selectedShadeName = '';
    if (product.shades && product.shades.length > 0) {
      selectedShadeName = product.shades[0].name;
      const shadesHtml = product.shades.map((shade, sIdx) => `
        <span class="shade-bubble ${sIdx === 0 ? 'active' : ''}" 
              style="background-color: ${shade.hex}; width:20px; height:20px; border-radius:50%; display:inline-block; border:1px solid rgba(0,0,0,0.15); cursor:pointer;" 
              title="${shade.name}" 
              onclick="selectQuickViewShade(this, '${shade.name.replace(/'/g, "\\'")}')">
        </span>
      `).join('');
      
      document.getElementById('qv-shades').innerHTML = `
        <div style="font-weight: 700; font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; color: var(--charcoal);">Select Shade</div>
        <div style="display:flex; gap:8px;">${shadesHtml}</div>
        <div id="qv-selected-shade-label" style="font-size:0.75rem; color:var(--grey); margin-top:8px;">Shade: ${selectedShadeName}</div>
      `;
    }

    // Add buttons
    const cartPrice = product.discountPrice || product.price;
    const isOutOfStock = product.stock === 0;
    const firstImg = product.images?.[0] || '/assets/images/products/default-product.jpg';
    
    const cartBtnHtml = isOutOfStock ? 
      `<button class="btn btn-add-cart" disabled style="background:#bdc3c7; cursor:not-allowed; flex: 1.5;">Out of Stock</button>` :
      `<button class="btn btn-add-cart" style="flex: 1.5;" onclick="triggerQuickViewAddToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${cartPrice}, '${firstImg}')">Add to Cart</button>`;
    
    document.getElementById('qv-actions').innerHTML = `
      ${cartBtnHtml}
      <button class="btn btn-quick-view" style="flex: 1; border:1px solid rgba(28,28,28,0.2);" onclick="window.location.href='/product.html?id=${product._id}'">Details</button>
    `;

  } catch (error) {
    console.error("Error loading quick view:", error);
    document.getElementById('qv-title').textContent = "Failed to load product details.";
  }
}

// Global functions for Quick View shade & cart handlers
window.selectQuickViewShade = function(el, shadeName) {
  const bubbles = el.parentNode.querySelectorAll('.shade-bubble');
  bubbles.forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  
  const label = document.getElementById('qv-selected-shade-label');
  if (label) {
    label.textContent = `Shade: ${shadeName}`;
  }
};

window.triggerQuickViewAddToCart = function(id, name, price, img) {
  let shadeName = '';
  const activeBubble = document.querySelector('#qv-shades .shade-bubble.active');
  if (activeBubble) {
    shadeName = activeBubble.getAttribute('title') || '';
  }
  
  if (typeof addToCart === 'function') {
    addToCart(id, name, price, img, shadeName);
    const overlay = document.getElementById('quick-view-overlay');
    if (overlay) overlay.classList.remove('active');
  }
};

// Page Transition Interceptor
document.addEventListener('DOMContentLoaded', () => {
  const transitionOverlay = document.createElement('div');
  transitionOverlay.className = 'page-transition-overlay';
  transitionOverlay.innerHTML = '<div class="luxury-spinner"></div>';
  document.body.appendChild(transitionOverlay);

  // Fade out overlay on load
  setTimeout(() => {
    transitionOverlay.classList.add('fade-out');
    setTimeout(() => transitionOverlay.remove(), 500);
  }, 100);

  // Intercept links for exit animation
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.getAttribute('target') === '_blank') {
      return;
    }
    if (href.startsWith('/') || href.includes(window.location.hostname)) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const exitOverlay = document.createElement('div');
        exitOverlay.className = 'page-transition-overlay exit-active';
        exitOverlay.innerHTML = '<div class="luxury-spinner"></div>';
        document.body.appendChild(exitOverlay);
        
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    }
  });
});
