// Sanique Cosmetics Admin Portal Script

let adminProducts = [];
let adminOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('sanique_token');
  const isAdmin = localStorage.getItem('sanique_isAdmin') === 'true';

  if (!token || !isAdmin) {
    showToast("Access Denied: Admin authorization required", "error");
    window.location.href = '/login.html';
    return;
  }

  initAdminTabs();
  loadAdminDashboard();
});

// Load all admin metrics, charts, and tables
async function loadAdminDashboard() {
  await fetchAdminProducts();
  await fetchAdminOrders();
  renderSalesCharts();
}

function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(target).style.display = 'block';
    });
  });
}

// Fetch products for listing & editor
async function fetchAdminProducts() {
  try {
    const res = await fetch('/api/products');
    adminProducts = await res.json();
    renderProductsTable();
  } catch (err) {
    console.error(err);
  }
}

function renderProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminProducts.map(p => `
    <tr>
      <td>
        <div style="font-weight:600;">${p.name}</div>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${p.category}</span>
      </td>
      <td>₹${p.price.toLocaleString('en-IN')}</td>
      <td>₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</td>
      <td>${p.stock} units</td>
      <td><i class="fas fa-star" style="color:var(--gold);"></i> ${p.rating.toFixed(1)}</td>
      <td>
        <button class="btn btn-outline" style="padding:4px 10px; font-size:0.75rem; border-radius:4px;" onclick="openProductEditModal('${p._id}')">Edit</button>
        <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem; border-radius:4px; background:#E05D5D;" onclick="deleteAdminProduct('${p._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Fetch orders list for status change
async function fetchAdminOrders() {
  const token = localStorage.getItem('sanique_token');
  try {
    const res = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    adminOrders = await res.json();
    
    // Compute metrics
    let totalSales = 0;
    let itemsCount = 0;
    adminOrders.forEach(o => {
      if (o.paymentStatus === 'Paid') {
        totalSales += o.amount;
      }
      o.products.forEach(p => itemsCount += p.quantity);
    });

    const salesText = document.getElementById('metric-total-sales');
    const orderText = document.getElementById('metric-total-orders');
    const prodText = document.getElementById('metric-total-products');

    if (salesText) salesText.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
    if (orderText) orderText.textContent = adminOrders.length;
    if (prodText) prodText.textContent = adminProducts.length;

    renderOrdersTable();
  } catch (err) {
    console.error(err);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminOrders.map(o => {
    const uName = o.userId ? o.userId.name : 'Guest User';
    
    return `
      <tr>
        <td>${o.trackingNumber}</td>
        <td>
          <div style="font-weight:600;">${uName}</div>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${o.shippingAddress.city}, ${o.shippingAddress.state}</span>
        </td>
        <td>₹${o.amount.toLocaleString('en-IN')}</td>
        <td>
          <span class="status-badge status-${o.paymentStatus.toLowerCase()}">${o.paymentStatus}</span>
        </td>
        <td>
          <select style="padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);" onchange="updateOrderAdminStatus('${o._id}', this.value)">
            <option value="Ordered" ${o.orderStatus==='Ordered'?'selected':''}>Ordered</option>
            <option value="Shipped" ${o.orderStatus==='Shipped'?'selected':''}>Shipped</option>
            <option value="Delivered" ${o.orderStatus==='Delivered'?'selected':''}>Delivered</option>
            <option value="Cancelled" ${o.orderStatus==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
        <td>
          <a href="/api/orders/${o._id}/invoice" class="btn btn-outline" style="padding:4px 10px; font-size:0.75rem; border-radius:4px;" download>Invoice</a>
        </td>
      </tr>
    `;
  }).join('');
}

// Update order status trigger
async function updateOrderAdminStatus(orderId, status) {
  const token = localStorage.getItem('sanique_token');
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.status === 200) {
      showToast("Order status updated successfully", "success");
      fetchAdminOrders();
    } else {
      showToast("Failed to update status", "error");
    }
  } catch (err) {
    console.error(err);
  }
}

// Visual analytics using mock Chart.js logic (binds to canvas)
function renderSalesCharts() {
  const ctxRevenue = document.getElementById('chart-revenue');
  const ctxCategory = document.getElementById('chart-category');

  if (!ctxRevenue || !ctxCategory) return;

  // Render mock visual bars for analytic grids
  // Draw direct vector charts inside the canvas so it renders beautiful custom shapes without external script lag
  drawLinearChart(ctxRevenue, [40000, 52000, 61000, 75000, 89000, 104000], ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  drawPieChart(ctxCategory, [45, 25, 20, 10], ["Lips", "Skincare", "Face", "Kits"]);
}

function drawLinearChart(canvas, data, labels) {
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 250;
  
  // Background grid
  ctx.strokeStyle = '#EEEEEE';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i <= 4; i++) {
    ctx.moveTo(50, i * 50);
    ctx.lineTo(450, i * 50);
  }
  ctx.stroke();

  // Draw Line
  ctx.strokeStyle = '#B76E79'; // Rose Gold
  ctx.lineWidth = 3;
  ctx.beginPath();
  const max = Math.max(...data);
  
  data.forEach((val, idx) => {
    const x = 50 + idx * 75;
    const y = 220 - (val / max) * 150;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots & Text
  ctx.fillStyle = '#2C2C2C';
  ctx.font = '9px Poppins';
  data.forEach((val, idx) => {
    const x = 50 + idx * 75;
    const y = 220 - (val / max) * 150;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2*Math.PI);
    ctx.fillStyle = '#D4AF37'; // Gold
    ctx.fill();
    
    ctx.fillStyle = 'var(--text-primary)';
    ctx.fillText(`₹${Math.round(val/1000)}k`, x - 12, y - 8);
    ctx.fillText(labels[idx], x - 8, 240);
  });
}

function drawPieChart(canvas, data, labels) {
  const ctx = canvas.getContext('2d');
  canvas.width = 250;
  canvas.height = 250;

  const colors = ['#B76E79', '#D4AF37', '#2C2C2C', '#F8E8EE'];
  let total = data.reduce((a,b)=>a+b, 0);
  let startAngle = 0;

  data.forEach((val, idx) => {
    const sliceAngle = (val / total) * 2 * Math.PI;
    
    ctx.fillStyle = colors[idx];
    ctx.beginPath();
    ctx.moveTo(125, 125);
    ctx.arc(125, 125, 80, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    startAngle += sliceAngle;
  });

  // Legend
  ctx.font = '9px Poppins';
  labels.forEach((l, idx) => {
    ctx.fillStyle = colors[idx];
    ctx.fillRect(10, 10 + idx*16, 12, 12);
    ctx.fillStyle = 'var(--text-primary)';
    ctx.fillText(`${l} (${data[idx]}%)`, 28, 19 + idx*16);
  });
}

// Product CRUD: Edit / Add triggers
let editProductId = null;

function openProductEditModal(id = null) {
  editProductId = id;
  let modal = document.getElementById('product-edit-modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'product-edit-modal';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2 class="modal-title" id="edit-modal-title">Add New Product</h2>
          <button class="modal-close" onclick="closeProductEditModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="admin-product-form" onsubmit="saveAdminProduct(event)" style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" id="prod-name" placeholder="Product Name" required style="padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
            <input type="text" id="prod-category" placeholder="Category (Lipsticks, Serums, etc.)" required style="padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
            <textarea id="prod-desc" placeholder="Description" required style="padding:8px 12px; border-radius:4px; border:1px solid var(--border-color); height:80px;"></textarea>
            
            <div style="display:flex; gap:10px;">
              <input type="number" id="prod-price" placeholder="MRP Price (INR)" required style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
              <input type="number" id="prod-discount" placeholder="Discount Price (INR)" style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
            </div>
            
            <div style="display:flex; gap:10px;">
              <input type="number" id="prod-stock" placeholder="Stock Level" required style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
              <input type="text" id="prod-shades" placeholder="Shades (Red:#f00, Pink:#ffc)" style="flex:1; padding:8px 12px; border-radius:4px; border:1px solid var(--border-color);">
            </div>

            <button type="submit" class="btn btn-luxury" style="width:100%; margin-top:10px;">Save Product</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const title = document.getElementById('edit-modal-title');
  const form = document.getElementById('admin-product-form');

  if (id) {
    title.textContent = 'Edit Product';
    const prod = adminProducts.find(p => p._id === id);
    if (prod) {
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-category').value = prod.category;
      document.getElementById('prod-desc').value = prod.description;
      document.getElementById('prod-price').value = prod.price;
      document.getElementById('prod-discount').value = prod.discountPrice || '';
      document.getElementById('prod-stock').value = prod.stock;
      document.getElementById('prod-shades').value = prod.shades.map(s => `${s.name}:${s.hex}`).join(',');
    }
  } else {
    title.textContent = 'Add New Product';
    form.reset();
  }

  modal.classList.add('active');
}

function closeProductEditModal() {
  const modal = document.getElementById('product-edit-modal');
  if (modal) modal.classList.remove('active');
  editProductId = null;
}

async function saveAdminProduct(e) {
  e.preventDefault();
  const token = localStorage.getItem('sanique_token');

  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = Number(document.getElementById('prod-price').value);
  const discountPrice = Number(document.getElementById('prod-discount').value) || undefined;
  const stock = Number(document.getElementById('prod-stock').value);
  
  // Parse shades: "Red:#f00,Pink:#ffc"
  const shadesRaw = document.getElementById('prod-shades').value.trim();
  const shades = shadesRaw ? shadesRaw.split(',').map(s => {
    const [sName, hex] = s.split(':');
    return { name: sName.trim(), hex: hex.trim() };
  }) : [];

  const bodyData = { name, category, description, price, discountPrice, stock, shades };

  try {
    let res;
    if (editProductId) {
      res = await fetch(`/api/products/${editProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
    }

    if (res.status === 200 || res.status === 201) {
      showToast("Product saved successfully!", "success");
      closeProductEditModal();
      fetchAdminProducts();
    } else {
      showToast("Failed to save product details", "error");
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteAdminProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  const token = localStorage.getItem('sanique_token');

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 200) {
      showToast("Product deleted successfully", "success");
      fetchAdminProducts();
    } else {
      showToast("Error deleting product", "error");
    }
  } catch (err) {
    console.error(err);
  }
}
