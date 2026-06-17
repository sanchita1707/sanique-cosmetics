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
    document.querySelector('main').innerHTML = '<div class="section"><p style="text-align:center;">Product not selected. Go to <a href="/shop.html" style="color:var(--rose-gold);">Shop</a></p></div>';
  }
});

// Fetch single product detail
async function fetchProductDetails(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.status === 404) {
      document.querySelector('main').innerHTML = '<div class="section"><p style="text-align:center;">Product not found.</p></div>';
      return;
    }
    currentProduct = await res.json();
    renderProductDetails();
    renderSafetyChecker();
    renderFrequentlyBought();
    fetchReviews(id);
  } catch (err) {
    console.error("Details error:", err);
  }
}

// Render product HTML
function renderProductDetails() {
  if (!currentProduct) return;

  // Render images
  const mainImg = document.getElementById('details-main-img');
  const thumbsContainer = document.getElementById('details-thumbnails');

  if (mainImg) {
    // Elegant packaging render dynamically if no assets
    mainImg.innerHTML = `
      <div class="cosmetic-render" style="width: 250px; height: 350px; background: linear-gradient(to bottom, ${getCategoryGradient(currentProduct.category)});">
        <div class="cosmetic-render-label" style="font-size:1.1rem; top:100px; padding: 10px 0;">SANIQUE</div>
      </div>
    `;
  }

  // Details
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
    ratingText.innerHTML = `
      <i class="fas fa-star" style="color:var(--gold);"></i> 
      <span>${currentProduct.rating.toFixed(1)} / 5 (${currentProduct.reviewsCount} customer reviews)</span>
    `;
  }
  if (priceVal) {
    priceVal.innerHTML = `
      <span class="price-actual" style="font-size:1.8rem;">₹${(currentProduct.discountPrice || currentProduct.price).toLocaleString('en-IN')}</span>
      ${currentProduct.discountPrice ? `<span class="price-mrp" style="font-size:1.3rem;">₹${currentProduct.price.toLocaleString('en-IN')}</span>` : ''}
      <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-top:5px;">Price includes 18% GST (Indian tax)</span>
    `;
  }

  if (description) description.textContent = currentProduct.description;

  if (benefitList) {
    benefitList.innerHTML = currentProduct.benefits.map(b => `<li><i class="fas fa-check" style="color:var(--success); margin-right:8px;"></i> ${b}</li>`).join('');
  }

  if (methodText) methodText.textContent = currentProduct.howToUse || "Apply evenly on prep skin.";

  // Shades configuration
  if (shadeSwatches && currentProduct.shades && currentProduct.shades.length > 0) {
    selectedShade = currentProduct.shades[0].name;
    shadeSwatches.innerHTML = currentProduct.shades.map((s, i) => `
      <span class="shade-bubble ${i === 0 ? 'active' : ''}" 
            style="background-color: ${s.hex}; width: 22px; height: 22px;" 
            title="${s.name}" 
            onclick="selectDetailsShade(this, '${s.name}')">
      </span>
    `).join('');
    
    // Add try-on action buttons if lipstick, foundations, blushes
    const tryOnContainer = document.getElementById('try-on-actions');
    if (tryOnContainer && ['Lipsticks', 'Foundations', 'Blush'].includes(currentProduct.category)) {
      tryOnContainer.innerHTML = `
        <button class="btn btn-luxury" onclick="openTryOnModal()"><i class="fas fa-camera"></i> Live Virtual Try-On</button>
        <button class="btn btn-outline" onclick="openShadeFinder()"><i class="fas fa-magic"></i> Find My Shade</button>
      `;
    }
  }

  // Stock status
  const stockText = document.getElementById('details-stock');
  if (stockText) {
    if (currentProduct.stock === 0) {
      stockText.innerHTML = '<span style="color:#E05D5D; font-weight:bold;"><i class="fas fa-times-circle"></i> Out of Stock</span>';
    } else if (currentProduct.stock <= 5) {
      stockText.innerHTML = `<span style="color:#E2BA96; font-weight:bold;"><i class="fas fa-exclamation-triangle"></i> Low Stock: Only ${currentProduct.stock} left</span>`;
    } else {
      stockText.innerHTML = '<span style="color:var(--success); font-weight:bold;"><i class="fas fa-check-circle"></i> In Stock</span>';
    }
  }

  // Bind Add to Cart / Buy Now
  const addBtn = document.getElementById('details-add-cart');
  const buyBtn = document.getElementById('details-buy-now');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (currentProduct.stock === 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, currentProduct.images[0], selectedShade);
    });
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      if (currentProduct.stock === 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      // Add and redirect
      addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, currentProduct.images[0], selectedShade);
      window.location.href = '/cart.html';
    });
  }
}

function selectDetailsShade(elem, name) {
  document.querySelectorAll('#details-shades .shade-bubble').forEach(s => s.classList.remove('active'));
  elem.classList.add('active');
  selectedShade = name;
  showToast(`Selected shade: ${name}`, 'success');
  
  // Update virtual tryon if running
  if (window.updateTryOnColor) {
    const hex = currentProduct.shades.find(s => s.name === name).hex;
    window.updateTryOnColor(hex);
  }
}

// Ingredient Safety Auditor query
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
      <h3 style="margin-bottom:15px; font-size:1.1rem; color: var(--rose-gold);">Ingredient Safety Audit:</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${data.results.map(ing => {
          let ratingColor = 'var(--success)';
          if (ing.rating === 'Caution') ratingColor = '#E2BA96';
          if (ing.rating === 'Avoid') ratingColor = '#E05D5D';
          
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); padding:10px; border-radius:6px; border: 1px solid var(--border-color);">
              <div>
                <strong>${ing.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">${ing.description} (${ing.source})</span>
              </div>
              <span style="background:${ratingColor}; color:var(--white); font-size:0.75rem; padding:2px 8px; border-radius:10px; font-weight:600;">${ing.rating}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    console.error("Safety query failed:", err);
  }
}

// Frequently Bought Together calculator
function renderFrequentlyBought() {
  const container = document.getElementById('frequently-bought');
  if (!container || !currentProduct) return;

  // Generate a mock package bundle: current product + face cleanser or serum
  const bundlePrice = Math.round((currentProduct.discountPrice || currentProduct.price) * 1.75); // 25% discount bundle
  
  container.innerHTML = `
    <div style="background:var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding:20px; box-shadow:0 4px 15px var(--shadow-color);">
      <h3 style="margin-bottom:15px; font-size:1.15rem; color:var(--rose-gold);">Frequently Bought Together</h3>
      <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="cosmetic-render" style="width:50px; height:70px; transform:scale(0.8);"><div class="cosmetic-render-label" style="font-size:0.35rem; top:20px;">SANIQUE</div></div>
          <span style="font-size:1.2rem; font-weight:bold;">+</span>
          <div class="cosmetic-render" style="width:50px; height:70px; background:linear-gradient(to bottom, #E8F8F5, #73C6B6); transform:scale(0.8);"><div class="cosmetic-render-label" style="font-size:0.35rem; top:20px;">SANIQUE</div></div>
        </div>
        <div style="flex-grow:1;">
          <p style="font-size:0.85rem; color:var(--text-secondary);">Combine this with our <strong>Hydrating Gel Face Wash</strong> and save 25%!</p>
          <div style="font-size:1.1rem; font-weight:bold; margin-top:5px;">Bundle Price: <span style="color:var(--rose-gold);">₹${bundlePrice.toLocaleString('en-IN')}</span></div>
        </div>
        <button class="btn btn-luxury" style="padding: 8px 18px; font-size: 0.8rem;" onclick="buyBundle()">Add Bundle To Cart</button>
      </div>
    </div>
  `;
}

function buyBundle() {
  // Add current
  addToCart(currentProduct._id, currentProduct.name, currentProduct.discountPrice || currentProduct.price, currentProduct.images[0], selectedShade);
  // Add a face wash: mock addition with ID (we lookup/seed) or static
  addToCart("666c0000000000000000000b", "Hydrating Gel Face Wash", 399, "/assets/images/products/skincare-facewash.jpg");
  showToast("Bundle added! Check Cart drawer.", "success");
}

// Track recently viewed items
function trackRecentlyViewed(id) {
  let list = JSON.parse(localStorage.getItem('sanique_recent')) || [];
  list = list.filter(i => i !== id);
  list.unshift(id);
  if (list.length > 5) list.pop();
  localStorage.setItem('sanique_recent', JSON.stringify(list));
}

// Customer reviews loader
async function fetchReviews(id) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  try {
    const res = await fetch(`/api/products/${id}/reviews`);
    const reviews = await res.json();

    if (reviews.length === 0) {
      container.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">No reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div style="border-bottom: 1px solid var(--border-color); padding: 15px 0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
          <strong>${r.userName}</strong>
          <span style="font-size:0.8rem; color:var(--text-secondary);">${new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        <div style="color:var(--gold); margin-bottom:8px;">
          ${Array(r.rating).fill('<i class="fas fa-star"></i>').join('')}
          ${Array(5 - r.rating).fill('<i class="far fa-star"></i>').join('')}
        </div>
        <p style="font-size:0.9rem; color:var(--text-primary); line-height:1.5;">${r.comment}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error("Reviews query fail:", err);
  }
}

// Review submission mechanics
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

// Global helper for card gradients
function getCategoryGradient(cat) {
  switch(cat) {
    case 'Lipsticks': return '#9B111E, #2C0C0E';
    case 'Foundations': return '#EAD2C2, #B99379';
    case 'Serums': return 'rgba(255,255,255,0.4), rgba(183, 110, 121, 0.6)';
    case 'Sunscreens': return '#F9EBEA, #D4AC0D';
    case 'Face Wash': return '#E8F8F5, #73C6B6';
    case 'Makeup Kits': return '#2C2C2C, #B76E79';
    default: return '#F8E8EE, #B76E79';
  }
}
