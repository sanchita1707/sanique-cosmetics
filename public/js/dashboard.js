// Sanique Cosmetics User Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  initTrackerCamera();
});

async function loadDashboardData() {
  const token = localStorage.getItem('sanique_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await res.json();

    // Render User Header Details
    const nameText = document.getElementById('dash-user-name');
    const emailText = document.getElementById('dash-user-email');
    const vipLevel = document.getElementById('dash-vip-level');
    const pointsText = document.getElementById('dash-points');

    if (nameText) nameText.textContent = user.name;
    if (emailText) emailText.textContent = user.email;
    if (vipLevel) vipLevel.textContent = `${user.vipLevel || 'Bronze'} Member`;
    if (pointsText) pointsText.textContent = user.loyaltyPoints || 0;

    // Render Skincare Routine checklist
    renderRoutineChecklist(user.routine);

    // Render Skincare progress tracker journal
    renderSkinTrackerJournal(user.skinTracker);

    // Fetch and render Order History
    loadOrderHistory();

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

// Skincare routine planning checklists
function renderRoutineChecklist(routine) {
  const morningContainer = document.getElementById('routine-morning-list');
  const nightContainer = document.getElementById('routine-night-list');
  
  if (!morningContainer || !nightContainer) return;

  const defaultMorning = ["Cleanse with Hydrating Gel Face Wash", "Apply Vitamin C Glow Serum", "Apply Broad-Spectrum Sunscreen PA+++"];
  const defaultNight = ["Double Cleanse (Face Wash)", "Apply Vitamin C Glow Serum", "Apply Hydra-Dew 72h Gel Cream"];

  const mList = routine && routine.length > 0 && routine[0].morning && routine[0].morning.length > 0 ? routine[0].morning : defaultMorning;
  const nList = routine && routine.length > 0 && routine[0].night && routine[0].night.length > 0 ? routine[0].night : defaultNight;

  morningContainer.innerHTML = mList.map((step, i) => `
    <label class="routine-item">
      <input type="checkbox" id="m-step-${i}" checked>
      <span>${step}</span>
    </label>
  `).join('');

  nightContainer.innerHTML = nList.map((step, i) => `
    <label class="routine-item">
      <input type="checkbox" id="n-step-${i}">
      <span>${step}</span>
    </label>
  `).join('');
}

// Skincare Tracker journal timeline rendering
function renderSkinTrackerJournal(tracker) {
  const container = document.getElementById('tracker-journal-grid');
  if (!container) return;

  if (!tracker || tracker.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">Your skincare journal is empty. Take a snapshot to start tracking progress.</p>';
    return;
  }

  container.innerHTML = tracker.map(log => `
    <div class="tracker-journal-card">
      <img src="${log.image}" alt="Skin progress scan">
      <div class="tracker-journal-body">
        <span class="tracker-journal-date">${new Date(log.date).toLocaleDateString('en-IN')}</span>
        <div class="tracker-journal-condition">${log.skinCondition}</div>
        <p class="tracker-journal-notes">"${log.notes || 'Routine completed successfully.'}"</p>
      </div>
    </div>
  `).join('');
}

// Webcam capture engine for skincare tracker journal
let trackerStream = null;

function initTrackerCamera() {
  const startBtn = document.getElementById('btn-start-tracker-cam');
  const captureBtn = document.getElementById('btn-capture-tracker');
  const video = document.getElementById('tracker-video');

  if (!startBtn || !captureBtn || !video) return;

  startBtn.addEventListener('click', async () => {
    try {
      trackerStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false
      });
      video.srcObject = trackerStream;
      video.style.display = 'block';
      captureBtn.style.display = 'inline-block';
      startBtn.style.display = 'none';
    } catch (err) {
      showToast("Webcam permissions denied", "error");
    }
  });

  captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Img = canvas.toDataURL('image/jpeg');
    saveSkinJournalLog(base64Img);
  });
}

async function saveSkinJournalLog(base64Img) {
  const notes = document.getElementById('tracker-notes-input').value.trim() || "Completed daily routine.";
  const condition = document.getElementById('tracker-condition-select').value;
  const token = localStorage.getItem('sanique_token');

  try {
    const res = await fetch('/api/auth/skin-tracker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: base64Img, notes, skinCondition: condition })
    });
    
    if (res.status === 201) {
      showToast("Progress logged to journal", "success");
      
      // Stop track stream
      if (trackerStream) {
        trackerStream.getTracks().forEach(t => t.stop());
        trackerStream = null;
      }
      
      // Reset view
      document.getElementById('tracker-video').style.display = 'none';
      document.getElementById('btn-capture-tracker').style.display = 'none';
      document.getElementById('btn-start-tracker-cam').style.display = 'inline-block';
      document.getElementById('tracker-notes-input').value = '';

      loadDashboardData();
    } else {
      showToast("Error updating tracker", "error");
    }
  } catch (err) {
    console.error(err);
  }
}

// Fetch user order history
async function loadOrderHistory() {
  const container = document.getElementById('order-history-list');
  if (!container) return;

  const token = localStorage.getItem('sanique_token');

  try {
    const res = await fetch('/api/orders/myorders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = '<p style="color:var(--text-secondary);">You have not placed any orders yet.</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div style="border: 1px solid var(--border-color); border-radius:8px; padding:20px; background:var(--card-bg); margin-bottom:15px; box-shadow:0 4px 10px var(--shadow-color);">
        <div style="display:flex; justify-content:between; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
          <div>
            <strong>Tracking No: <span style="color:var(--rose-gold);">${order.trackingNumber}</span></strong>
            <span style="font-size:0.8rem; color:var(--text-secondary); display:block;">Placed: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <div style="margin-left:auto; text-align:right;">
            <span class="status-badge status-${order.orderStatus.toLowerCase()}">${order.orderStatus}</span>
            <span style="font-size:0.85rem; font-weight:600; display:block; margin-top:4px;">Total: ₹${order.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">
          ${order.products.map(p => {
            const name = p.productId ? p.productId.name : 'Unknown Product';
            const shadeText = p.shade ? ` (Shade: ${p.shade})` : '';
            return `<div style="font-size:0.85rem; color:var(--text-primary);"><i class="fas fa-box" style="margin-right:8px; color:var(--rose-gold);"></i>${name}${shadeText} x ${p.quantity}</div>`;
          }).join('')}
        </div>
        
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="/tracking.html?id=${order._id}" class="btn btn-primary" style="padding:6px 15px; font-size:0.75rem; border-radius:4px;">Track Delivery</a>
          <a href="/api/orders/${order._id}/invoice" class="btn btn-outline" style="padding:6px 15px; font-size:0.75rem; border-radius:4px;" download>Download PDF Invoice</a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error("Orders load error:", err);
  }
}

function userLogout() {
  localStorage.removeItem('sanique_token');
  localStorage.removeItem('sanique_isAdmin');
  showToast("Logged out successfully", "success");
  setTimeout(() => window.location.href = '/index.html', 1000);
}
