// Sanique Cosmetics Detailed Cart Script

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  renderSmartRecommendations();
});

function renderCartPage() {
  const container = document.getElementById('cart-page-items');
  const subtotalText = document.getElementById('cart-page-subtotal');
  const taxText = document.getElementById('cart-page-tax');
  const totalText = document.getElementById('cart-page-total');
  const checkoutBtn = document.getElementById('cart-page-checkout');

  if (!container) return;

  const currentCart = JSON.parse(localStorage.getItem('sanique_cart')) || [];

  if (currentCart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 64px 0;">
        <i class="fas fa-shopping-bag" style="font-size: 3.5rem; color:var(--rose-gold); margin-bottom:16px;"></i>
        <h2 style="font-family:var(--font-serif); margin-bottom:12px; font-weight:600; font-size:1.8rem;">Your Shopping Bag is Empty</h2>
        <p style="color:var(--grey); margin-bottom:24px; font-size:0.95rem; font-family:var(--font-sans);">Add items from our premium cosmetic catalog to begin your routine.</p>
        <a href="/shop.html" class="btn btn-luxury">Browse Shop</a>
      </div>
    `;
    if (subtotalText) subtotalText.textContent = '₹0';
    if (taxText) taxText.textContent = '₹0';
    if (totalText) totalText.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  let subtotal = 0;
  let html = `
    <table style="width:100%; border-collapse:collapse; text-align:left;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); color:var(--grey); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">
          <th style="padding:16px 8px;">Product</th>
          <th style="padding:16px 8px;">Price</th>
          <th style="padding:16px 8px; text-align:center;">Quantity</th>
          <th style="padding:16px 8px; text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;

  currentCart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const imgUrl = item.image ? item.image : '/assets/images/products/default-product.jpg';
    const imgHtml = `<img src="${imgUrl}" alt="${item.name}" style="width:70px; height:70px; object-fit:contain; border-radius:12px; margin-right:16px; border:1px solid var(--border-color); padding:4px;" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';" loading="lazy">`;

    html += `
      <tr style="border-bottom: 1px solid var(--border-color); vertical-align:middle;">
        <td style="padding:20px 8px; display:flex; align-items:center;">
          ${imgHtml}
          <div>
            <strong style="display:block; font-size:0.95rem; color:var(--charcoal); font-family:var(--font-sans);">${item.name}</strong>
            <span style="font-size:0.8rem; color:var(--rose-gold); font-family:var(--font-sans);">${item.shade ? `Shade: ${item.shade}` : 'Default'}</span>
            <button onclick="removePageItem('${item.productId}', '${item.shade}')" style="background:none; border:none; color:var(--error); font-size:0.75rem; cursor:pointer; display:block; margin-top:6px; padding:0; font-family:var(--font-sans); font-weight:500;">Remove</button>
          </div>
        </td>
        <td style="padding:20px 8px; font-weight:500; font-family:var(--font-sans); font-size:0.95rem; color:var(--charcoal);">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:20px 8px; text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:10px;">
            <button class="qty-btn" onclick="updatePageQty('${item.productId}', '${item.shade}', -1)">-</button>
            <span style="font-size:0.85rem; font-family:var(--font-sans); min-width:20px; font-weight:600;">${item.quantity}</span>
            <button class="qty-btn" onclick="updatePageQty('${item.productId}', '${item.shade}', 1)">+</button>
          </div>
        </td>
        <td style="padding:20px 8px; text-align:right; font-weight:700; color:var(--charcoal); font-family:var(--font-sans); font-size:0.95rem;">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  const taxPortion = Math.round(subtotal - (subtotal / 1.18));

  if (subtotalText) subtotalText.textContent = `₹${(subtotal - taxPortion).toLocaleString('en-IN')}`;
  if (taxText) taxText.textContent = `₹${taxPortion.toLocaleString('en-IN')}`;
  if (totalText) totalText.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  
  if (checkoutBtn) {
    checkoutBtn.style.display = 'inline-block';
    // Bind once to prevent duplicate listeners on updates
    checkoutBtn.onclick = () => {
      const token = localStorage.getItem('sanique_token');
      if (!token) {
        showToast("Please login to proceed to checkout", "error");
        setTimeout(() => window.location.href = '/login.html?redirect=checkout.html', 1500);
      } else {
        window.location.href = '/checkout.html';
      }
    };
  }
}

function updatePageQty(id, shade, change) {
  updateCartQuantity(id, shade, change);
  renderCartPage();
}

function removePageItem(id, shade) {
  removeFromCart(id, shade);
  renderCartPage();
}

// Recommendations
async function renderSmartRecommendations() {
  const container = document.getElementById('smart-cart-recommendations');
  if (!container) return;

  const currentCart = JSON.parse(localStorage.getItem('sanique_cart')) || [];
  if (currentCart.length === 0) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    
    const cartIds = currentCart.map(c => c.productId);
    const suggested = products.filter(p => !cartIds.includes(p._id)).slice(0, 3);

    if (suggested.length === 0) return;

    container.innerHTML = `
      <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:24px; font-weight:600; color:var(--charcoal);">Recommended for Your Routine</h3>
      <div class="product-grid" style="grid-template-columns: repeat(3, 1fr); gap: 30px;">
        ${suggested.map(p => {
          const firstImg = p.images?.[0] || '/assets/images/products/default-product.jpg';
          return `
            <div class="product-card" onclick="window.location.href='/product.html?id=${p._id}'">
              <div class="product-img-wrapper" style="height:200px;">
                <img src="${firstImg}" alt="${p.name}" onerror="this.onerror=null; this.src='/assets/images/products/default-product.jpg';" loading="lazy">
              </div>
              <div class="product-info">
                <div class="product-brand">SANIQUE Milan</div>
                <div class="product-category">${p.category}</div>
                <h3 class="product-title" style="font-size:1.1rem;">${p.name}</h3>
                <div class="product-price">
                  <span class="price-actual">₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions">
                  <button class="btn-add-cart" style="width:100%;" onclick="event.stopPropagation(); addToCart('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.discountPrice || p.price}, '${firstImg}', '')">Quick Add</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    console.error("Recommendations fail:", err);
  }
}
