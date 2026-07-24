// Sanique Cosmetics Home Page Script

document.addEventListener('DOMContentLoaded', () => {
  renderHomeSkeletons();
  fetchHomeProducts();
});

// Fetch and distribute products
async function fetchHomeProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (products.length === 0) return;

    // 1. Best Sellers: rating >= 4.7, sorted by rating desc
    const bestSellers = [...products]
      .filter(p => p.rating >= 4.7)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    // 2. New Arrivals: sorted by date created desc
    const newArrivals = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    // Render grids
    renderHomeGrid('best-sellers-grid', bestSellers);
    renderHomeGrid('new-arrivals-grid', newArrivals);

  } catch (error) {
    console.error("Error loading home page products:", error);
  }
}

// Redesigned premium product cards builder (Step 7)
function renderHomeGrid(elementId, items) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--grey);">Luxury collection coming soon...</p>';
    return;
  }

  grid.innerHTML = items.map(product => {
    const isWished = isProductInWishlist(product._id);
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const priceVal = hasDiscount ? product.discountPrice : product.price;

    const badgeHtml = product.stock === 0 ? `<div class="product-badge" style="background:#E05D5D; left:auto; right:15px;">Out of Stock</div>` :
                      (product.stock <= 5 ? `<div class="product-badge" style="background:#E2BA96; left:auto; right:15px;">Low Stock</div>` : 
                      (hasDiscount ? `<div class="product-badge">Offer</div>` : ''));
    
    const shadesHtml = product.shades && product.shades.length > 0 ? 
      `<div class="shade-container">
        ${product.shades.map((s, i) => `<span class="shade-bubble ${i===0?'active':''}" style="background-color: ${s.hex}" title="${s.name}" onclick="event.stopPropagation(); selectCardShade(this, '${s.name.replace(/'/g, "\\'")}')"></span>`).join('')}
       </div>` : '';

    const activeShadeName = product.shades && product.shades.length > 0 ? product.shades[0].name : '';
    const firstImg = product.images?.[0] || '/assets/images/products/default-product.jpg';

    return `
      <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
        ${badgeHtml}
        <button class="wishlist-btn ${isWished?'active':''}" onclick="event.stopPropagation(); toggleWishlistItem('${product._id}', this)">
          <i class="${isWished?'fas':'far'} fa-heart"></i>
        </button>
        <div class="product-img-wrapper">
          <img src="${firstImg}" alt="${product.name}" onerror="this.src='/assets/images/products/default-product.jpg'" loading="lazy">
          <div class="product-img-overlay">
            <button class="img-quickview-btn" onclick="event.stopPropagation(); openQuickView('${product._id}')">
              <i class="fas fa-eye"></i> Quick View
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">SANIQUE Milan</div>
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-rating">
            <i class="fas fa-star"></i> <span>${product.rating.toFixed(1)} (${product.reviewsCount} reviews)</span>
          </div>
          ${shadesHtml}
          <div class="product-price">
            <span class="price-actual">₹${priceVal.toLocaleString('en-IN')}</span>
            ${hasDiscount ? `<span class="price-mrp">₹${product.price.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${priceVal}, '${firstImg}', '${activeShadeName.replace(/'/g, "\\'")}')">
              Add to Cart
            </button>
            <button class="btn-quick-view" onclick="event.stopPropagation(); window.location.href='/product.html?id=${product._id}'">
              Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Helpers
function isProductInWishlist(id) {
  const wish = JSON.parse(localStorage.getItem('sanique_wishlist')) || [];
  return wish.includes(id);
}

function selectCardShade(elem, name) {
  const card = elem.closest('.product-card');
  card.querySelectorAll('.shade-bubble').forEach(s => s.classList.remove('active'));
  elem.classList.add('active');
  
  const cartBtn = card.querySelector('.btn-add-cart');
  if (cartBtn) {
    const origOnclick = cartBtn.getAttribute('onclick');
    const newOnclick = origOnclick.substring(0, origOnclick.lastIndexOf("'")) + name + "')";
    cartBtn.setAttribute('onclick', newOnclick);
  }
}

async function toggleWishlistItem(id, button) {
  const token = localStorage.getItem('sanique_token');
  if (!token) {
    showToast("Please login to manage your wishlist", "error");
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }

  try {
    const res = await fetch('/api/auth/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: id })
    });
    const data = await res.json();
    
    let wish = JSON.parse(localStorage.getItem('sanique_wishlist')) || [];
    const index = wish.indexOf(id);
    if (index > -1) {
      wish.splice(index, 1);
      button.classList.remove('active');
      button.querySelector('i').className = 'far fa-heart';
      showToast("Removed from wishlist", "error");
    } else {
      wish.push(id);
      button.classList.add('active');
      button.querySelector('i').className = 'fas fa-heart';
      showToast("Added to wishlist", "success");
    }
    localStorage.setItem('sanique_wishlist', JSON.stringify(wish));
  } catch (err) {
    console.error("Wishlist error:", err);
  }
}

function renderHomeSkeletons() {
  const grids = ['best-sellers-grid', 'new-arrivals-grid'];
  const skeletonHtml = Array(4).fill(`
    <div class="skeleton-card">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-shimmer short"></div>
      <div class="skeleton-line skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-shimmer half"></div>
      <div class="skeleton-btn skeleton-shimmer"></div>
    </div>
  `).join('');

  grids.forEach(id => {
    const grid = document.getElementById(id);
    if (grid) grid.innerHTML = `<div class="skeleton-loader">${skeletonHtml}</div>`;
  });
}

// Testimonials Slider Logic
let activeTestimonialIdx = 0;
let testimonialTimer;

function initTestimonialsSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  if (slides.length === 0) return;

  window.changeTestimonial = (dir) => {
    slides[activeTestimonialIdx].classList.remove('active');
    activeTestimonialIdx = (activeTestimonialIdx + dir + slides.length) % slides.length;
    slides[activeTestimonialIdx].classList.add('active');
    
    // Entry animation for testimonial card
    if (window.gsap) {
      window.gsap.fromTo(slides[activeTestimonialIdx].querySelector('.testimonial-card'), 
        { opacity: 0, scale: 0.96 }, 
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
    resetTestimonialTimer();
  };

  const startTestimonialTimer = () => {
    testimonialTimer = setInterval(() => {
      window.changeTestimonial(1);
    }, 6000);
  };

  const resetTestimonialTimer = () => {
    clearInterval(testimonialTimer);
    startTestimonialTimer();
  };

  startTestimonialTimer();
}

// Newsletter submit function
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const container = document.getElementById('newsletter-form-container');
  if (!emailInput || !container) return;

  const email = emailInput.value.trim();
  if (!email) return;

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  // Animation transition for subscription success
  if (window.gsap) {
    window.gsap.to(container, {
      opacity: 0,
      y: -15,
      duration: 0.4,
      onComplete: () => {
        container.innerHTML = `
          <div class="newsletter-success-state" style="text-align: center; padding: 20px;">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(110, 155, 123, 0.1); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2rem; border: 2px solid var(--success);">
              <i class="fas fa-check"></i>
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 10px; color: var(--charcoal);">You are in!</h3>
            <p style="color: var(--grey); font-size: 0.95rem; line-height: 1.6;">
              Welcome to the Sanique Society. Check your inbox shortly for your invitation and 100 loyalty points code.
            </p>
          </div>
        `;
        window.gsap.fromTo(container, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      }
    });
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 10px; color: var(--charcoal);">You are in!</h3>
        <p style="color: var(--grey); font-size: 0.95rem;">Check your inbox shortly for your invitation and 100 loyalty points code.</p>
      </div>
    `;
  }

  showToast("Subscribed successfully!", "success");
}

document.addEventListener('DOMContentLoaded', () => {
  initTestimonialsSlider();
});
