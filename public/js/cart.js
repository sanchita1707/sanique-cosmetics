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
      <div style="text-align:center; padding: 80px 0;">
        <i class="fas fa-shopping-bag" style="font-size: 4rem; color:var(--rose-gold); margin-bottom:20px;"></i>
        <h2 style="font-family:var(--font-serif); margin-bottom:15px;">Your Shopping Cart is Empty</h2>
        <p style="color:var(--text-secondary); margin-bottom:30px;">Add items from our premium cosmetic catalog to begin.</p>
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
        <tr style="border-bottom: 2px solid var(--border-color); color:var(--text-secondary); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">
          <th style="padding:15px 10px;">Product</th>
          <th style="padding:15px 10px;">Price</th>
          <th style="padding:15px 10px; text-align:center;">Quantity</th>
          <th style="padding:15px 10px; text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;

  currentCart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const imgHtml = item.image && item.image.startsWith('/assets') ? 
      `<div class="cosmetic-render" style="width:40px; height:55px; transform:scale(0.8); margin-right:15px;"><div class="cosmetic-render-label" style="font-size:0.25rem; top:15px;">SANIQUE</div></div>` :
      `<img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; margin-right:15px;">`;

    html += `
      <tr style="border-bottom: 1px solid var(--border-color); vertical-align:middle;">
        <td style="padding:20px 10px; display:flex; align-items:center;">
          ${imgHtml}
          <div>
            <strong style="display:block; font-size:1rem;">${item.name}</strong>
            <span style="font-size:0.8rem; color:var(--rose-gold);">${item.shade ? `Shade: ${item.shade}` : 'Default'}</span>
            <button onclick="removePageItem('${item.productId}', '${item.shade}')" style="background:none; border:none; color:#E05D5D; font-size:0.75rem; cursor:pointer; display:block; margin-top:5px; padding:0;">Remove</button>
          </div>
        </td>
        <td style="padding:20px 10px; font-weight:500;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:20px 10px; text-align:center;">
          <div style="display:inline-flex; align-items:center; border:1px solid var(--border-color); border-radius:20px; padding:4px 10px; gap:12px;">
            <button onclick="updatePageQty('${item.productId}', '${item.shade}', -1)" style="background:none; border:none; font-weight:bold; cursor:pointer; font-size:1rem;">-</button>
            <span>${item.quantity}</span>
            <button onclick="updatePageQty('${item.productId}', '${item.shade}', 1)" style="background:none; border:none; font-weight:bold; cursor:pointer; font-size:1rem;">+</button>
          </div>
        </td>
        <td style="padding:20px 10px; text-align:right; font-weight:bold; color:var(--rose-gold);">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  // Compute Indian taxes: price is GST inclusive (18%). Let's report the tax portion for transparency.
  const taxPortion = Math.round(subtotal - (subtotal / 1.18));

  if (subtotalText) subtotalText.textContent = `₹${(subtotal - taxPortion).toLocaleString('en-IN')}`;
  if (taxText) taxText.textContent = `₹${taxPortion.toLocaleString('en-IN')} (18% GST)`;
  if (totalText) totalText.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (checkoutBtn) {
    checkoutBtn.style.display = 'inline-block';
    checkoutBtn.addEventListener('click', () => {
      const token = localStorage.getItem('sanique_token');
      if (!token) {
        showToast("Please login to proceed to checkout", "error");
        setTimeout(() => window.location.href = '/login.html?redirect=checkout.html', 1500);
      } else {
        window.location.href = '/checkout.html';
      }
    });
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

// Smart recommendations engine based on items inside the cart
async function renderSmartRecommendations() {
  const container = document.getElementById('smart-cart-recommendations');
  if (!container) return;

  const currentCart = JSON.parse(localStorage.getItem('sanique_cart')) || [];
  if (currentCart.length === 0) return;

  // Query database
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    
    // Suggest items not currently inside the cart
    const cartIds = currentCart.map(c => c.productId);
    const suggested = products.filter(p => !cartIds.includes(p._id)).slice(0, 3);

    if (suggested.length === 0) return;

    container.innerHTML = `
      <h3 style="font-family:var(--font-serif); margin-bottom:20px; color:var(--rose-gold);">Recommended For Your Routine:</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px;">
        ${suggested.map(p => `
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:15px; text-align:center; box-shadow:0 4px 10px var(--shadow-color);">
            <div class="cosmetic-render" style="width:40px; height:60px; margin:0 auto 10px; background:linear-gradient(to bottom, ${getCategoryGradient(p.category)});">
              <div class="cosmetic-render-label" style="font-size:0.25rem; top:18px;">SANIQUE</div>
            </div>
            <h4 style="font-size:0.9rem; margin-bottom:5px;">${p.name}</h4>
            <div style="font-weight:bold; color:var(--rose-gold); font-size:0.85rem; margin-bottom:10px;">₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</div>
            <button class="btn btn-primary" style="padding:6px 12px; font-size:0.75rem; border-radius:20px; width:100%;" onclick="addToCart('${p._id}', '${p.name}', ${p.discountPrice || p.price}, '${p.images[0]}')">Quick Add</button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error("Recommendations fail:", err);
  }
}
