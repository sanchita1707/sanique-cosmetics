// Sanique Cosmetics Shop Script

let allProducts = [];
let comparedProducts = JSON.parse(localStorage.getItem('sanique_compare')) || [];

document.addEventListener('DOMContentLoaded', () => {
  initShopFilters();
  initSmartSearch();
  initVoiceSearch();
  initCompareSystem();
  fetchProducts();
});

// Fetch products from API
async function fetchProducts() {
  const productContainer = document.getElementById('shop-product-grid');
  if (!productContainer) return;

  productContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding: 50px 0;"><i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--rose-gold);"></i><p style="margin-top:10px;">Curating luxury products...</p></div>';

  try {
    // Read query strings
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || '';
    const search = urlParams.get('search') || '';

    // Put search values in DOM inputs
    const searchInput = document.getElementById('shop-search');
    if (searchInput && search) searchInput.value = search;

    const categorySelect = document.getElementById('filter-category');
    if (categorySelect && category) categorySelect.value = category;

    // Build query URL
    let queryUrl = '/api/products?';
    if (category) queryUrl += `category=${encodeURIComponent(category)}&`;
    if (search) queryUrl += `search=${encodeURIComponent(search)}&`;

    const res = await fetch(queryUrl);
    allProducts = await res.json();

    renderProducts(allProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #E05D5D;">Failed to load products. Please check server connection.</p>';
  }
}

// Render Products Grid
function renderProducts(products) {
  const container = document.getElementById('shop-product-grid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px 0; color: var(--text-secondary);"><i class="fas fa-search-minus" style="font-size:3rem; margin-bottom:15px;"></i><p>No products found matching your luxury preferences.</p></div>';
    return;
  }

  container.innerHTML = products.map(product => {
    const isWished = isProductInWishlist(product._id);
    const badgeHtml = product.stock <= 5 ? `<div class="product-badge">Low Stock</div>` : 
                      (product.discountPrice ? `<div class="product-badge">Offer</div>` : '');
    
    // Check shades
    const shadesHtml = product.shades && product.shades.length > 0 ? 
      `<div class="shade-container">
        ${product.shades.map((s, i) => `<span class="shade-bubble ${i===0?'active':''}" style="background-color: ${s.hex}" title="${s.name}" onclick="event.stopPropagation(); selectCardShade(this, '${s.name}')"></span>`).join('')}
       </div>` : '';

    const activeShadeName = product.shades && product.shades.length > 0 ? product.shades[0].name : '';
  
    // Render packaging design if binary is missing
    const renderHtml = `
<img
  src="${product.images?.[0] || '/assets/images/products/default-product.jpg'}"
  alt="${product.name}"
  loading="lazy"
  style="
    width:100%;
    height:280px;
    object-fit:contain;
    display:block;
    padding:15px;
    transition:0.4s ease;
  "
  onerror="this.src='/assets/images/products/default-product.jpg'"
>
`;

    return `
      <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
        ${badgeHtml}
        <button class="wishlist-btn ${isWished?'active':''}" onclick="event.stopPropagation(); toggleWishlistItem('${product._id}', this)">
          <i class="${isWished?'fas':'far'} fa-heart"></i>
        </button>
        <div class="product-img-wrapper">
          ${renderHtml}
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
            <button class="btn-add-cart" onclick="event.stopPropagation(); triggerAddToCart('${product._id}', '${product.name}', ${product.discountPrice || product.price}, '${product.images[0]}', '${activeShadeName}')">
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

// Helpers for cosmetic packaging styling
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

function selectCardShade(elem, name) {
  const card = elem.closest('.product-card');
  card.querySelectorAll('.shade-bubble').forEach(s => s.classList.remove('active'));
  elem.classList.add('active');
  
  // Re-bind click value on cart button
  const cartBtn = card.querySelector('.btn-add-cart');
  if (cartBtn) {
    const origOnclick = cartBtn.getAttribute('onclick');
    // Replace the last parameter (shade name)
    const newOnclick = origOnclick.substring(0, origOnclick.lastIndexOf("'")) + name + "')";
    cartBtn.setAttribute('onclick', newOnclick);
  }
}

function triggerAddToCart(id, name, price, img, shade) {
  addToCart(id, name, price, img, shade);
}

// Wishlist Helpers
function isProductInWishlist(id) {
  const wish = JSON.parse(localStorage.getItem('sanique_wishlist')) || [];
  return wish.includes(id);
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

// Filters & Sorting triggers
function initShopFilters() {
  const categorySelect = document.getElementById('filter-category');
  const priceSelect = document.getElementById('filter-price');
  const sortingSelect = document.getElementById('shop-sort');

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Category
    if (categorySelect && categorySelect.value) {
      filtered = filtered.filter(p => p.category === categorySelect.value);
    }

    // Price Range
    if (priceSelect && priceSelect.value) {
      const [min, max] = priceSelect.value.split('-').map(Number);
      filtered = filtered.filter(p => {
        const finalPrice = p.discountPrice || p.price;
        if (max) {
          return finalPrice >= min && finalPrice <= max;
        } else {
          return finalPrice >= min; // above 2500 case
        }
      });
    }

    // Sorting
    if (sortingSelect && sortingSelect.value) {
      const sortVal = sortingSelect.value;
      if (sortVal === 'price-low') {
        filtered.sort((a,b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sortVal === 'price-high') {
        filtered.sort((a,b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      } else if (sortVal === 'rating') {
        filtered.sort((a,b) => b.rating - a.rating);
      }
    }

    renderProducts(filtered);
  };

  [categorySelect, priceSelect, sortingSelect].forEach(item => {
    if (item) item.addEventListener('change', applyFilters);
  });
}

// Smart search suggestions autocomplete
function initSmartSearch() {
  const searchInput = document.getElementById('shop-search');
  if (!searchInput) return;

  const suggestBox = document.createElement('div');
  suggestBox.className = 'search-suggestions';
  suggestBox.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 8px 8px;
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
    display: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;
  searchInput.parentElement.style.position = 'relative';
  searchInput.parentElement.appendChild(suggestBox);

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    if (!val) {
      suggestBox.style.display = 'none';
      return;
    }

    const matches = allProducts.filter(p => p.name.toLowerCase().includes(val) || p.category.toLowerCase().includes(val));
    if (matches.length === 0) {
      suggestBox.style.display = 'none';
      return;
    }

    suggestBox.innerHTML = matches.map(m => `
      <div class="suggest-item" style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid var(--border-color);" onclick="window.location.href='/product.html?id=${m._id}'">
        <strong>${m.name}</strong> <span style="font-size:0.75rem; color: var(--rose-gold); float:right;">${m.category}</span>
      </div>
    `).join('');
    
    suggestBox.style.display = 'block';
  });

  // Hide suggestion list when clicked outside
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) suggestBox.style.display = 'none';
  });
}

// Voice Search using HTML5 Web Speech API
function initVoiceSearch() {
  const voiceBtn = document.getElementById('voice-search-btn');
  const searchInput = document.getElementById('shop-search');

  if (!voiceBtn || !searchInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.style.display = 'none'; // hide if not supported
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    showToast("Listening for product search...", "success");
    voiceBtn.innerHTML = '<i class="fas fa-microphone fa-spin" style="color: var(--rose-gold);"></i>';
  });

  recognition.addEventListener('result', (e) => {
    const transcript = e.results[0][0].transcript;
    searchInput.value = transcript;
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    showToast(`Searching for: "${transcript}"`, "success");
    
    // Trigger list filtering
    const matched = allProducts.filter(p => p.name.toLowerCase().includes(transcript.toLowerCase()) || p.category.toLowerCase().includes(transcript.toLowerCase()));
    renderProducts(matched);
  });

  recognition.addEventListener('speechend', () => {
    recognition.stop();
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  });

  recognition.addEventListener('error', (e) => {
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    showToast("Voice recognition error: " + e.error, "error");
  });
}

// Side-by-Side Product Comparison logic
function initCompareSystem() {
  // Add compared tray container
  let tray = document.querySelector('.compare-tray');
  if (!tray) {
    tray = document.createElement('div');
    tray.className = 'compare-tray';
    tray.id = 'compare-tray';
    tray.innerHTML = `
      <div style="font-weight:600; font-size:0.9rem;">Compare Products:</div>
      <div class="compare-tray-items" id="compare-tray-items"></div>
      <button class="btn btn-luxury" style="padding: 6px 15px; font-size: 0.75rem;" onclick="openComparisonModal()">Compare Now</button>
    `;
    document.body.appendChild(tray);
  }

  // Add comparison modal
  let modal = document.querySelector('#compare-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'compare-modal';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 900px;">
        <div class="modal-header">
          <h2 class="modal-title">Product Comparison</h2>
          <button class="modal-close" onclick="closeCompareModal()">&times;</button>
        </div>
        <div class="modal-body" id="compare-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  renderCompareTray();
}

function toggleCompareProduct(id) {
  const index = comparedProducts.indexOf(id);
  if (index > -1) {
    comparedProducts.splice(index, 1);
    showToast("Removed from comparison", "error");
  } else {
    if (comparedProducts.length >= 3) {
      showToast("You can compare up to 3 products at a time", "error");
      return;
    }
    comparedProducts.push(id);
    showToast("Added to comparison", "success");
  }

  localStorage.setItem('sanique_compare', JSON.stringify(comparedProducts));
  renderCompareTray();
}

function renderCompareTray() {
  const tray = document.getElementById('compare-tray');
  const itemsContainer = document.getElementById('compare-tray-items');
  if (!tray || !itemsContainer) return;

  if (comparedProducts.length === 0) {
    tray.classList.remove('active');
    return;
  }

  tray.classList.add('active');

  const matched = allProducts.filter(p => comparedProducts.includes(p._id));
  itemsContainer.innerHTML = matched.map(p => `
    <div class="compare-tray-item">
      <span>${p.name}</span>
      <button class="compare-tray-remove" onclick="toggleCompareProduct('${p._id}')">&times;</button>
    </div>
  `).join('');
}

function openComparisonModal() {
  const modal = document.getElementById('compare-modal');
  const body = document.getElementById('compare-modal-body');
  if (!modal || !body) return;

  const matched = allProducts.filter(p => comparedProducts.includes(p._id));
  if (matched.length === 0) return;

  let tableHtml = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Attributes</th>
          ${matched.map(p => `<th>${p.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Category</td>
          ${matched.map(p => `<td>${p.category}</td>`).join('')}
        </tr>
        <tr>
          <td>Price</td>
          ${matched.map(p => `<td>₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</td>`).join('')}
        </tr>
        <tr>
          <td>Rating</td>
          ${matched.map(p => `<td><i class="fas fa-star" style="color:var(--gold);"></i> ${p.rating.toFixed(1)}</td>`).join('')}
        </tr>
        <tr>
          <td>Ingredients</td>
          ${matched.map(p => `<td>${p.ingredients.slice(0,3).join(', ')}...</td>`).join('')}
        </tr>
        <tr>
          <td>Benefits</td>
          ${matched.map(p => `<td>${p.benefits[0] || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td>Action</td>
          ${matched.map(p => `<td>
            <button class="btn btn-primary" style="padding:6px 12px; font-size:0.75rem;" onclick="triggerAddToCart('${p._id}', '${p.name}', ${p.discountPrice || p.price}, '${p.images[0]}')">Add to Cart</button>
          </td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;

  body.innerHTML = tableHtml;
  modal.classList.add('active');
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (modal) modal.classList.remove('active');
}
