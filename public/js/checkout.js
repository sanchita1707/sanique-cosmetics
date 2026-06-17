// Sanique Cosmetics Checkout Script

let orderSubtotal = 0;
let discountApplied = 0;
let pointsRedeemed = 0;
let finalBill = 0;
let userLoyaltyBalance = 0;

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutPage();
  initPaymentSelectors();
});

async function initCheckoutPage() {
  const summaryBody = document.getElementById('checkout-summary-items');
  const subtotalText = document.getElementById('checkout-subtotal');
  const discountText = document.getElementById('checkout-discount');
  const pointsText = document.getElementById('checkout-points-discount');
  const totalText = document.getElementById('checkout-grand-total');

  if (!summaryBody) return;

  const currentCart = JSON.parse(localStorage.getItem('sanique_cart')) || [];
  if (currentCart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  // Load cart summary list
  let html = '';
  orderSubtotal = 0;
  currentCart.forEach(item => {
    const total = item.price * item.quantity;
    orderSubtotal += total;
    html += `
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:8px;">
        <span>${item.name} (x${item.quantity})</span>
        <span style="font-weight:500;">₹${total.toLocaleString('en-IN')}</span>
      </div>
    `;
  });

  summaryBody.innerHTML = html;
  if (subtotalText) subtotalText.textContent = `₹${orderSubtotal.toLocaleString('en-IN')}`;
  
  updateGrandTotal();

  // Load User Details (Loyalty balance & Default Address)
  const token = localStorage.getItem('sanique_token');
  if (!token) {
    showToast("Session expired, please login", "error");
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await res.json();
    
    // Fill default values in address fields
    if (user.address) {
      const street = document.getElementById('checkout-street');
      const city = document.getElementById('checkout-city');
      const state = document.getElementById('checkout-state');
      const zip = document.getElementById('checkout-zip');
      
      if (street) street.value = user.address.street || '';
      if (city) city.value = user.address.city || '';
      if (state) state.value = user.address.state || '';
      if (zip) zip.value = user.address.zipCode || '';
    }

    // Load Loyalty points options
    userLoyaltyBalance = user.loyaltyPoints || 0;
    const loyaltyContainer = document.getElementById('loyalty-redemption-container');
    if (loyaltyContainer) {
      if (userLoyaltyBalance > 0) {
        loyaltyContainer.innerHTML = `
          <div style="background:var(--bg-secondary); border: 1.5px dashed var(--rose-gold); padding:15px; border-radius:8px; margin-bottom:20px;">
            <strong style="color:var(--rose-gold); font-size:0.9rem;">Sanique Loyalty Program</strong>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin:5px 0;">You have <strong>${userLoyaltyBalance} Points</strong> available. (1 Point = ₹1 Discount)</p>
            <div style="display:flex; gap:10px; align-items:center; margin-top:8px;">
              <input type="number" id="redeem-points-input" max="${userLoyaltyBalance}" min="0" placeholder="Points to redeem..." style="padding:6px 12px; border-radius:4px; border:1px solid var(--border-color); width:150px; font-size:0.85rem;">
              <button class="btn btn-primary" style="padding:6px 15px; font-size:0.75rem; border-radius:4px;" onclick="applyLoyaltyPoints()">Redeem Points</button>
            </div>
          </div>
        `;
      } else {
        loyaltyContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-secondary);">Earn 10% cashpoints on this order!</p>`;
      }
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }

  // Bind Coupon engine
  const couponBtn = document.getElementById('apply-coupon-btn');
  if (couponBtn) {
    couponBtn.addEventListener('click', applyCouponCode);
  }

  // Bind Order placement
  const placeOrderForm = document.getElementById('checkout-form');
  if (placeOrderForm) {
    placeOrderForm.addEventListener('submit', handleOrderPlacement);
  }
}

// Payment Selectors toggle
function initPaymentSelectors() {
  const codRadio = document.getElementById('pay-cod');
  const upiRadio = document.getElementById('pay-upi');
  const rpRadio = document.getElementById('pay-razorpay');
  const detailsDiv = document.getElementById('payment-method-details');

  if (!detailsDiv) return;

  const updateView = () => {
    if (upiRadio && upiRadio.checked) {
  detailsDiv.innerHTML = `
    <div style="text-align:center; padding:20px; border:1px solid var(--border-color); border-radius:12px; background:var(--bg-secondary);">
      
      <h3 style="margin-bottom:15px;">Scan & Pay via UPI</h3>

      <img
        src="/assets/images/payment/upi-qr.jpg"
        alt="UPI QR"
        style="width:250px; max-width:100%; border-radius:10px;"
      >

      <p style="margin-top:15px;">
        <strong>Support Number:</strong> 8369437880
      </p>

      <p style="font-size:14px; color:var(--text-secondary);">
        After payment, send screenshot on WhatsApp.
      </p>

    </div>
  `;
    } else if (rpRadio && rpRadio.checked) {
      detailsDiv.innerHTML = `
        <div style="padding:15px; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-secondary);">
          <p style="font-size:0.85rem; font-weight:600; margin-bottom:8px;"><i class="fab fa-cc-visa" style="color:navy;"></i> Secure Checkout Gateway</p>
          <p style="font-size:0.75rem; color:var(--text-secondary);">We accept all major Indian credit/debit cards, Netbanking, and Wallets via Razorpay framework.</p>
        </div>
      `;
    } else {
      detailsDiv.innerHTML = `
        <p style="font-size:0.8rem; color:var(--text-secondary);">Pay in cash on delivery. An additional fee of ₹0 applies.</p>
      `;
    }
  };

  [codRadio, upiRadio, rpRadio].forEach(radio => {
    if (radio) radio.addEventListener('change', updateView);
  });

  updateView();
}

function updateGrandTotal() {
  const subtotalText = document.getElementById('checkout-subtotal');
  const discountText = document.getElementById('checkout-discount');
  const pointsText = document.getElementById('checkout-points-discount');
  const totalText = document.getElementById('checkout-grand-total');

  finalBill = Math.max(0, orderSubtotal - discountApplied - pointsRedeemed);

  if (discountText) discountText.textContent = `- ₹${discountApplied.toLocaleString('en-IN')}`;
  if (pointsText) pointsText.textContent = `- ₹${pointsRedeemed.toLocaleString('en-IN')}`;
  if (totalText) totalText.textContent = `₹${finalBill.toLocaleString('en-IN')}`;
}

// Apply Coupon validation on backend
async function applyCouponCode() {
  const codeInput = document.getElementById('coupon-code-input');
  if (!codeInput) return;

  const code = codeInput.value.trim();
  if (!code) {
    showToast("Please enter a coupon code", "error");
    return;
  }

  const token = localStorage.getItem('sanique_token');

  try {
    const res = await fetch('/api/orders/coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code, amount: orderSubtotal })
    });
    const data = await res.json();

    if (res.status === 200) {
      discountApplied = data.discountAmount;
      showToast(`Coupon applied! Saved ₹${discountApplied}`, "success");
      updateGrandTotal();
    } else {
      showToast(data.message || "Invalid coupon", "error");
    }
  } catch (err) {
    console.error(err);
  }
}

// Loyalty program points redemption
function applyLoyaltyPoints() {
  const pointsInput = document.getElementById('redeem-points-input');
  if (!pointsInput) return;

  const pointsVal = Math.min(Number(pointsInput.value), userLoyaltyBalance);
  if (pointsVal < 0) return;

  // Make sure points don't exceed current bill amount
  const availableBill = orderSubtotal - discountApplied;
  pointsRedeemed = Math.min(pointsVal, availableBill);
  
  showToast(`Points applied! Saved ₹${pointsRedeemed}`, "success");
  updateGrandTotal();
}

// Order Form Submission mapping
async function handleOrderPlacement(e) {
  e.preventDefault();

  const street = document.getElementById('checkout-street').value.trim();
  const city = document.getElementById('checkout-city').value.trim();
  const state = document.getElementById('checkout-state').value.trim();
  const zip = document.getElementById('checkout-zip').value.trim();

  if (!street || !city || !state || !zip) {
    showToast("Please complete the shipping address fields", "error");
    return;
  }

  const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'COD';

  const cartItems = JSON.parse(localStorage.getItem('sanique_cart')) || [];
  const couponCodeInput = document.getElementById('coupon-code-input');
  const couponCode = couponCodeInput ? couponCodeInput.value.toUpperCase().trim() : '';

  const orderData = {
    orderItems: cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      shade: item.shade
    })),
    shippingAddress: {
      street,
      city,
      state,
      zipCode: zip
    },
    paymentMethod,
    couponCode,
    redeemPoints: pointsRedeemed
  };

  const token = localStorage.getItem('sanique_token');

  // Trigger simulated popup overlays for Razorpay or UPI
  if (paymentMethod === 'Razorpay') {
    showSimulatedPaymentPopup(orderData, token);
  } else {
    submitOrderToBackend(orderData, token);
  }
}

function showSimulatedPaymentPopup(orderData, token) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'razorpay-popup';
  overlay.innerHTML = `
    <div class="modal-container" style="max-width:400px; text-align:center; padding:30px;">
      <i class="fab fa-cc-stripe" style="font-size:3rem; color:var(--rose-gold);"></i>
      <h3 style="margin:15px 0 10px; font-family:var(--font-serif);">Razorpay Checkout Gate</h3>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">Paying: <strong>₹${finalBill.toLocaleString('en-IN')}</strong></p>
      
      <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
        <input type="text" placeholder="Card Number (4111 2222 ...)" value="4111222233334444" style="padding:8px 12px; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem;">
        <div style="display:flex; gap:10px;">
          <input type="text" placeholder="MM/YY" value="12/29" style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem;">
          <input type="password" placeholder="CVV" value="123" style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem;">
        </div>
      </div>
      
      <button class="btn btn-luxury" id="razorpay-submit" style="width:100%;">Authorize Payment</button>
      <button class="btn btn-outline" id="razorpay-cancel" style="width:100%; margin-top:10px; padding:8px;">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('razorpay-cancel').addEventListener('click', () => {
    overlay.remove();
    showToast("Payment cancelled by customer", "error");
  });

  document.getElementById('razorpay-submit').addEventListener('click', () => {
    overlay.remove();
    showToast("Razorpay Authentication Approved", "success");
    submitOrderToBackend(orderData, token);
  });
}

async function submitOrderToBackend(orderData, token) {
  try {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const order = await res.json();

    if (res.status === 201) {
      showToast("Order placed successfully!", "success");
      // Clear Cart
      localStorage.removeItem('sanique_cart');
      setTimeout(() => {
        window.location.href = `/tracking.html?id=${order._id}`;
      }, 1500);
    } else {
      showToast(order.message || "Failed to place order", "error");
      if (btn) btn.innerHTML = 'Place Order';
    }
  } catch (err) {
    console.error("Order error:", err);
  }
}
