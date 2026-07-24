// Sanique Cosmetics Product Details Script

let currentProduct = null;
let selectedShade = "";

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (id) {
    fetchProductDetails(id);
    initReviewForm(id);
    trackRecentlyViewed(id);
  } else {
    document.querySelector('main').innerHTML = '<div class="section"><p style="text-align:center; color: var(--grey);">Product not selected. Go to <a href="/shop.html" style="color:var(--rose-gold); text-decoration: underline;">Shop Collections</a></p></div>';
  }
});

// Fetch single product details
async function fetchProductDetails(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.status === 404) {
      document.querySelector('main').innerHTML = '<div class="section"><p style="text-align:center; color: var(--grey);">Product not found.</p></div>';
      return;
    }
    currentProduct = await res.json();
    renderProductDetails();
    renderSafetyChecker();
    renderFrequentlyBought();
    fetchRelatedProducts();
    fetchReviews(id);
  } catch (err) {
    console.error("Details error:", err);
  }
}

// Render product HTML
function renderProductDetails() {
  if (!currentProduct) return;

  const mainImg = document.getElementById('details-main-img');
  const thumbsContainer = document.getElementById('details-thumbnails');
  const cartImg = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images[0] : '/assets/images/products/default-product.jpg';

  if (mainImg) {
    mainImg.innerHTML = `<img src="${cartImg}" id="main-product-image" alt="${currentProduct.name}" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';">`;

    if (thumbsContainer) {
      const images = currentProduct.images || [];
      if (images.length > 1) {
        thumbsContainer.innerHTML = images.map((img, idx) => `
          <div class="thumb-wrapper ${idx === 0 ? 'active' : ''}" onclick="swapMainImage(this, '${img}')">
            <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';">
          </div>
        `).join('');
      } else {
        thumbsContainer.innerHTML = '';
      }
    }
  }

  // Text details
  const title = document.getElementById('details-title');
  const category = document.getElementById('details-category');
  const ratingText = document.getElementById('details-rating');
  const priceVal = document.getElementById('details-price');
  const description = document.getElementById('details-description');
  const benefitList = document.getElementById('details-benefits');
  const methodText = document.getElementById('details-howtouse');
  const shadeSwatches = document.getElementById('details-shades');

  if (title) title.textContent = currentProduct.name;
  if (category) category.textContent = currentProduct.category;
  if (ratingText) {
    const ratingVal = currentProduct.rating || 0;
    const fullStars = Math.floor(ratingVal);
    const halfStar = ratingVal % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star" style="color:var(--gold);"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt" style="color:var(--gold);"></i>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star" style="color:var(--gold);"></i>';
    
    ratingText.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${starsHtml}
        <span style="font-size:0.85rem; color:var(--grey); font-family:var(--font-sans);">${ratingVal.toFixed(1)} / 5 (${currentProduct.reviewsCount} customer reviews)</span>
      </div>
    `;
  }

  if (priceVal) {
    const actualPrice = currentProduct.discountPrice || currentProduct.price;
    priceVal.innerHTML = `
      <span class="price-actual" style="font-size:1.8rem;">₹${actualPrice.toLocaleString('en-IN')}</span>
      ${currentProduct.discountPrice ? `<span class="price-mrp" style="font-size:1.3rem; margin-left: 12px; text-decoration: line-through; color: var(--grey);">₹${currentProduct.price.toLocaleString('en-IN')}</span>` : ''}
      <span style="font-size:0.75rem; color:var(--grey); display:block; margin-top:5px; font-family:var(--font-sans);">Price includes 18% GST (Indian luxury tax)</span>
    `;
  }

  if (description) description.textContent = currentProduct.description;

  if (benefitList) {
    benefitList.innerHTML = currentProduct.benefits.map(b => `
      <li style="display:flex; align-items:center; gap:8px; font-size:0.9rem; color:var(--charcoal); font-family:var(--font-sans); margin-bottom:8px;">
        <i class="fas fa-check" style="color:var(--success);"></i> ${b}
      </li>
    `).join('');
  }

  if (methodText) methodText.textContent = currentProduct.howToUse || "Apply evenly on clean skin. Blend outward.";

  // Shades bubbles
  if (shadeSwatches && currentProduct.shades && currentProduct.shades.length > 0) {
    selectedShade = currentProduct.shades[0].name;
    shadeSwatches.innerHTML = currentProduct.shades.map((s, i) => `
      <span class="shade-bubble ${i === 0 ? 'active' : ''}" 
            style="background-color: ${s.hex}; width:24px; height:24px; border-radius:50%; display:inline-block; border:1px solid rgba(0,0,0,0.15); cursor:pointer;" 
            title="${s.name}" 
            onclick="selectDetailsShade(this, '${s.name.replace(/'/g, "\\'")}')">
      </span>
    `).join('');
    
    // Add tryon visual buttons
    const tryOnContainer = document.getElementById('try-on-actions');
    if (tryOnContainer && ['Lipsticks', 'Foundations', 'Blush'].includes(currentProduct.category)) {
      tryOnContainer.innerHTML = `
        <button class="btn btn-luxury" onclick="openTryOnModal()"><i class="fas fa-camera"></i> Live Try-On</button>
        <button class="btn btn-outline" onclick="openShadeFinder()"><i class="fas fa-magic"></i> Find My Shade</button>
      `;
    }
  }

  // Stock status
  const stockText = document.getElementById('details-stock');
  if (stockText) {
    if (currentProduct.stock === 0) {
      stockText.innerHTML = '<span style="color:var(--error); font-weight:bold; font-size:0.85rem;"><i class="fas fa-times-circle"></i> Out of Stock</span>';
    } else if (currentProduct.stock <= 5) {
      stockText.innerHTML = `<span style="color:var(--warning); font-weight:bold; font-size:0.85rem;"><i class="fas fa-exclamation-triangle"></i> Low Stock: Only ${currentProduct.stock} left</span>`;
    } else {
      stockText.innerHTML = '<span style="color:var(--success); font-weight:bold; font-size:0.85rem;"><i class="fas fa-check-circle"></i> In Stock</span>';
    }
  }

  // Bind Standard buy buttons
  const addBtn = document.getElementById('details-add-cart');
  const buyBtn = document.getElementById('details-buy-now');

  if (addBtn) {
    addBtn.onclick = () => {
      if (currentProduct.stock === 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, cartImg, selectedShade);
    };
  }

  if (buyBtn) {
    buyBtn.onclick = () => {
      if (currentProduct.stock === 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, cartImg, selectedShade);
      window.location.href = '/cart.html';
    };
  }

  // Populate Sticky Purchase Panel
  const stickyImg = document.getElementById('sticky-panel-img');
  const stickyTitle = document.getElementById('sticky-panel-title');
  const stickyPrice = document.getElementById('sticky-panel-price');
  const stickyAddBtn = document.getElementById('sticky-panel-add-cart');

  if (stickyImg) stickyImg.src = cartImg;
  if (stickyTitle) stickyTitle.textContent = currentProduct.name;
  if (stickyPrice) {
    stickyPrice.textContent = `₹${(currentProduct.discountPrice || currentProduct.price).toLocaleString('en-IN')}`;
  }
  if (stickyAddBtn) {
    stickyAddBtn.onclick = () => {
      if (currentProduct.stock === 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, cartImg, selectedShade);
    };
  }

  // Sticky panel scroll listener trigger
  const stickyBar = document.getElementById('sticky-purchase-bar');
  if (stickyBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        stickyBar.classList.add('active');
      } else {
        stickyBar.classList.remove('active');
      }
    }, { passive: true });
  }
}

function selectDetailsShade(elem, name) {
  document.querySelectorAll('#details-shades .shade-bubble').forEach(s => s.classList.remove('active'));
  elem.classList.add('active');
  selectedShade = name;
  showToast(`Selected shade: ${name}`, 'success');
  
  if (window.updateTryOnColor && currentProduct.shades) {
    const shadeHex = currentProduct.shades.find(s => s.name === name)?.hex;
    if (shadeHex) window.updateTryOnColor(shadeHex);
  }
}

// Ingredient Safety Auditor
async function renderSafetyChecker() {
  const container = document.getElementById('ingredient-safety-checker');
  if (!container || !currentProduct || !currentProduct.ingredients) return;

  try {
    const res = await fetch('/api/ai/check-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: currentProduct.ingredients })
    });
    const data = await res.json();

    container.innerHTML = `
      <h3 style="margin-bottom:15px; font-size:1.1rem; color: var(--rose-gold); font-weight:600;">Ingredient Safety Audit</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${data.results.map(ing => {
          let ratingColor = 'var(--success)';
          if (ing.rating === 'Caution') ratingColor = 'var(--warning)';
          if (ing.rating === 'Avoid') ratingColor = 'var(--error)';
          
          return `
            <div class="safety-check-card">
              <div>
                <strong style="font-size:0.85rem; color:var(--charcoal); font-family:var(--font-sans);">${ing.name}</strong>
                <span style="font-size:0.75rem; color:var(--grey); display:block; font-family:var(--font-sans);">${ing.description} (${ing.source})</span>
              </div>
              <span class="safety-badge" style="background:${ratingColor}; color:var(--white);">${ing.rating}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    console.error("Safety query failed:", err);
  }
}

// Frequently Bought Together bundle calculator
function renderFrequentlyBought() {
  const container = document.getElementById('frequently-bought');
  if (!container || !currentProduct) return;

  const bundlePrice = Math.round((currentProduct.discountPrice || currentProduct.price) * 1.75); 
  
  container.innerHTML = `
    <div class="bundle-container">
      <h3 style="font-size:1.1rem; color:var(--rose-gold); font-weight:600; margin-bottom:4px;">Frequently Bought Together</h3>
      <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="cosmetic-render" style="width:40px; height:55px; border-radius:4px; background:var(--rose-gold); display:flex; align-items:center; justify-content:center; color:white; font-size:0.4rem; font-weight:700;">SANIQUE</div>
          <span style="font-size:1.1rem; font-weight:bold; color:var(--grey);">+</span>
          <div class="cosmetic-render" style="width:40px; height:55px; border-radius:4px; background:linear-gradient(to bottom, #E8F8F5, #73C6B6); display:flex; align-items:center; justify-content:center; color:white; font-size:0.4rem; font-weight:700;">SANIQUE</div>
        </div>
        <div style="flex-grow:1; max-width: 250px;">
          <p style="font-size:0.8rem; color:var(--grey); margin:0;">Combine this with our <strong>Hydrating Gel Face Wash</strong> and save 25%!</p>
          <div style="font-size:1rem; font-weight:700; margin-top:5px; color:var(--charcoal);">Bundle Price: <span style="color:var(--rose-gold);">₹${bundlePrice.toLocaleString('en-IN')}</span></div>
        </div>
        <button class="btn btn-luxury" style="padding: 10px 18px; font-size: 0.75rem;" onclick="buyBundle()">Add Bundle To Cart</button>
      </div>
    </div>
  `;
}

function buyBundle() {
  const cartImg = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images[0] : '/assets/images/products/default-product.jpg';
  addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, cartImg, selectedShade);
  addToCart("666c0000000000000000000b", "Hydrating Gel Face Wash", 399, "/assets/images/products/skincare-facewash.jpg");
  showToast("Bundle added! Check Cart drawer.", "success");
}

function trackRecentlyViewed(id) {
  let list = JSON.parse(localStorage.getItem('sanique_recent')) || [];
  list = list.filter(i => i !== id);
  list.unshift(id);
  if (list.length > 5) list.pop();
  localStorage.setItem('sanique_recent', JSON.stringify(list));
}

// Reviews
async function fetchReviews(id) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  try {
    const res = await fetch(`/api/products/${id}/reviews`);
    const reviews = await res.json();

    if (reviews.length === 0) {
      container.innerHTML = '<p style="color:var(--grey); text-align:center; padding: 20px 0;">No reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-item-header">
          <strong class="review-author">${r.userName}</strong>
          <span class="review-date">${new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        <div style="color:var(--gold); font-size:0.85rem;">
          ${Array(r.rating).fill('<i class="fas fa-star"></i>').join('')}
          ${Array(5 - r.rating).fill('<i class="far fa-star"></i>').join('')}
        </div>
        <p style="font-size:0.88rem; color:var(--charcoal); line-height:1.5; margin-top:4px;">${r.comment}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error("Reviews query fail:", err);
  }
}

// Write reviews
function initReviewForm(productId) {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('sanique_token');
    if (!token) {
      showToast("Please login to submit a review", "error");
      setTimeout(() => window.location.href = '/login.html', 1500);
      return;
    }

    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();

      if (res.status === 201) {
        showToast("Review submitted successfully!", "success");
        form.reset();
        fetchReviews(productId);
      } else {
        showToast(data.message || "Failed to submit review", "error");
      }
    } catch (err) {
      console.error(err);
    }
  });
}

function swapMainImage(thumb, imgSrc) {
  const mainImageEl = document.getElementById('main-product-image');
  if (mainImageEl) {
    mainImageEl.src = imgSrc;
  }
  document.querySelectorAll('#details-thumbnails .thumb-wrapper').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

// Fetch and Render Related Products in grid cards format
async function fetchRelatedProducts() {
  const container = document.getElementById('related-products-grid');
  if (!container || !currentProduct) return;

  try {
    const res = await fetch('/api/products');
    const allProducts = await res.json();
    
    const related = allProducts.filter(p => p.category === currentProduct.category && p._id !== currentProduct._id).slice(0, 3);
    
    if (related.length === 0) {
      document.getElementById('related-products-section').style.display = 'none';
      return;
    }

    container.innerHTML = related.map(product => {
      const firstImg = (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : '/assets/images/products/default-product.jpg';
      const hasDiscount = product.discountPrice && product.discountPrice < product.price;
      const cartPrice = product.discountPrice || product.price;
      const shadeName = product.shades && product.shades.length > 0 ? product.shades[0].name : '';

      let priceHtml = '';
      if (hasDiscount) {
        priceHtml = `
          <span class="price-actual">₹${product.discountPrice.toLocaleString('en-IN')}</span>
          <span class="price-mrp" style="text-decoration:line-through; font-size:0.8rem; color:var(--grey); margin-left:8px;">₹${product.price.toLocaleString('en-IN')}</span>
        `;
      } else {
        priceHtml = `<span class="price-actual">₹${product.price.toLocaleString('en-IN')}</span>`;
      }

      return `
        <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
          <div class="product-img-wrapper" style="height:200px;">
            <img src="${firstImg}" alt="${product.name}" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';" loading="lazy">
          </div>
          <div class="product-info">
            <div class="product-brand">SANIQUE Milan</div>
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
              ${priceHtml}
            </div>
            <div class="product-actions">
              <button class="btn-add-cart" style="width:100%;" onclick="event.stopPropagation(); addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${cartPrice}, '${firstImg}', '${shadeName}')">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error("Related products error:", err);
  }
}
