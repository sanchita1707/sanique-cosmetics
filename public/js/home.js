// Sanique Cosmetics Home Page Script

let currentSlideIdx = 0;
let slideInterval;

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  fetchHomeProducts();
  initHomeBeforeAfter();
});

// Hero Slider control
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  if (slides.length === 0) return;

  window.changeSlide = (direction) => {
    slides[currentSlideIdx].classList.remove('active');
    dots[currentSlideIdx].classList.remove('active');
    
    currentSlideIdx = (currentSlideIdx + direction + slides.length) % slides.length;
    
    slides[currentSlideIdx].classList.add('active');
    dots[currentSlideIdx].classList.add('active');
    resetSliderTimer();
  };

  window.setSlide = (idx) => {
    slides[currentSlideIdx].classList.remove('active');
    dots[currentSlideIdx].classList.remove('active');
    
    currentSlideIdx = idx;
    
    slides[currentSlideIdx].classList.add('active');
    dots[currentSlideIdx].classList.add('active');
    resetSliderTimer();
  };

  function startSliderTimer() {
    slideInterval = setInterval(() => {
      window.changeSlide(1);
    }, 6000);
  }

  function resetSliderTimer() {
    clearInterval(slideInterval);
    startSliderTimer();
  }

  startSliderTimer();
}

// Before & After Transformation Slider
function initHomeBeforeAfter() {
  const slider = document.getElementById('ba-slider');
  const beforeImg = document.getElementById('ba-before-img');
  const handle = document.getElementById('ba-handle');

  if (slider && beforeImg && handle) {
    let isDragging = false;

    const onMove = (e) => {
      if (!isDragging) return;
      const rect = slider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let x = clientX - rect.left;
      
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      const pct = (x / rect.width) * 100;
      beforeImg.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
    };

    handle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', onMove);
    
    handle.addEventListener('touchstart', () => isDragging = true);
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', onMove);
  }
}

// Fetch and distribute products
async function fetchHomeProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (products.length === 0) return;

    // 1. Best Sellers: rating >= 4.8, sorted by rating desc
    const bestSellers = [...products]
      .filter(p => p.rating >= 4.7)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    // 2. New Arrivals: sorted by date created desc
    const newArrivals = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    // 3. Featured Products: Lips or Eyeshadow Palettes categories
    const featured = [...products]
      .filter(p => p.category === 'Lipsticks' || p.category === 'Eyeshadow Palettes')
      .slice(0, 4);

    // 4. Trending Products: high reviews count
    const trending = [...products]
      .sort((a, b) => b.reviewsCount - a.reviewsCount)
      .slice(0, 4);

    // Render each grid
    renderHomeGrid('best-sellers-grid', bestSellers);
    renderHomeGrid('new-arrivals-grid', newArrivals);
    renderHomeGrid('featured-grid', featured);
    renderHomeGrid('trending-grid', trending);

  } catch (error) {
    console.error("Error loading home page products:", error);
  }
}

function renderHomeGrid(elementId, items) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Luxury collection coming soon...</p>';
    return;
  }

  grid.innerHTML = items.map(product => {
    const isWished = isProductInWishlist(product._id);
    const badgeHtml = product.stock <= 5 ? `<div class="product-badge">Low Stock</div>` : 
                      (product.discountPrice ? `<div class="product-badge">Offer</div>` : '');
    
    // Check shades
    const shadesHtml = product.shades && product.shades.length > 0 ? 
      `<div class="shade-container">
        ${product.shades.map((s, i) => `<span class="shade-bubble ${i===0?'active':''}" style="background-color: ${s.hex}" title="${s.name}" onclick="event.stopPropagation(); selectCardShade(this, '${s.name}')"></span>`).join('')}
       </div>` : '';

    const activeShadeName = product.shades && product.shades.length > 0 ? product.shades[0].name : '';

    return `
      <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
        ${badgeHtml}
        <button class="wishlist-btn ${isWished?'active':''}" onclick="event.stopPropagation(); toggleWishlistItem('${product._id}', this)">
          <i class="${isWished?'fas':'far'} fa-heart"></i>
        </button>
        <div class="product-img-wrapper">
          <img src="${product.images?.[0] || '/assets/images/products/default-product.jpg'}" alt="${product.name}" onerror="this.src='/assets/images/products/default-product.jpg'">
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-rating">
            <i class="fas fa-star"></i> <span>${product.rating.toFixed(1)} (${product.reviewsCount})</span>
          </div>
          ${shadesHtml}
          <div class="product-price">
            <span class="price-actual">₹${(product.discountPrice || product.price).toLocaleString('en-IN')}</span>
            ${product.discountPrice ? `<span class="price-mrp">₹${product.price.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}', '${product.name}', ${product.discountPrice || product.price}, '${product.images[0]}', '${activeShadeName}')">
              Add to Cart
            </button>
            <button class="btn-quick-view" onclick="event.stopPropagation(); toggleCompareProduct('${product._id}')">
              Compare
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Helpers duplicated from shop.js to maintain local operations on card clicks
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

// Product comparison toggling wrapper
function toggleCompareProduct(id) {
  let compared = JSON.parse(localStorage.getItem('sanique_compare')) || [];
  const index = compared.indexOf(id);
  if (index > -1) {
    compared.splice(index, 1);
    showToast("Removed from comparison", "error");
  } else {
    if (compared.length >= 3) {
      showToast("You can compare up to 3 products at a time", "error");
      return;
    }
    compared.push(id);
    showToast("Added to comparison", "success");
  }
  localStorage.setItem('sanique_compare', JSON.stringify(compared));
}
