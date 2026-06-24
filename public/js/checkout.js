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
  submitOrderToBackend(orderData, token);
}

async function submitOrderToBackend(orderData, token) {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';

  try {
    // 1. Create order in our database first (marked as Pending if Razorpay, Confirmed if COD)
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const order = await orderRes.json();

    if (orderRes.status !== 201) {
      showToast(order.message || "Failed to create order", "error");
      if (btn) btn.innerHTML = 'Place Order';
      return;
    }

    // 2. If Payment Method is COD or UPI, complete order immediately
    if (orderData.paymentMethod !== 'Razorpay') {
      showToast("Order placed successfully!", "success");
      localStorage.removeItem('sanique_cart');
      setTimeout(() => {
        window.location.href = `/tracking.html?id=${order.orderId}`;
      }, 1500);
      return;
    }

    // 3. For Razorpay, fetch Razorpay Order ID from backend payment API
    const rpRes = await fetch('/api/payments/razorpay/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: finalBill })
    });
    const rpData = await rpRes.json();

    if (!rpData.success) {
      showToast("Failed to initialize payment gateway", "error");
      if (btn) btn.innerHTML = 'Place Order';
      return;
    }

    // 4. Configure Razorpay Options and Open Checkout Modal
    const options = {
      key: rpData.keyId,
      amount: rpData.order.amount,
      currency: rpData.order.currency,
      name: "Sanique Cosmetics",
      description: `Purchase Order ID: ${order.orderId}`,
      order_id: rpData.order.id,
      handler: async function (response) {
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming Payment...';
        
        // 5. Verify signature on backend
        const verifyRes = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id || rpData.order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: finalBill,
            orderId: order.orderId,
            method: "Razorpay Card/UPI"
          })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          showToast("Payment verified! Order confirmed.", "success");
          localStorage.removeItem('sanique_cart');
          setTimeout(() => {
            window.location.href = `/tracking.html?id=${order.orderId}`;
          }, 1500);
        } else {
          showToast("Payment verification failed", "error");
          if (btn) btn.innerHTML = 'Place Order';
        }
      },
      prefill: {
        name: order.customerName,
        email: order.email,
        contact: order.phone
      },
      theme: {
        color: "#B76E79"
      },
      modal: {
        ondismiss: function () {
          showToast("Payment cancelled by customer", "error");
          if (btn) btn.innerHTML = 'Place Order';
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("Order payment error:", err);
    showToast("An error occurred during payment processing", "error");
    if (btn) btn.innerHTML = 'Place Order';
  }
}
