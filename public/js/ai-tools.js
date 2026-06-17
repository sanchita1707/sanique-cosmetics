// Sanique Cosmetics AI Tools Script

let webcamStream = null;

// =========================================================================
// 1. AI Skin Analyzer
// =========================================================================
function openSkinAnalysisModal() {
  let modal = document.getElementById('skin-analysis-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'skin-analysis-modal';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2 class="modal-title">AI Skin Health Analysis</h2>
          <button class="modal-close" onclick="closeSkinAnalysisModal()">&times;</button>
        </div>
        <div class="modal-body" style="text-align:center;">
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:15px;">
            Position your face clearly in the camera grid. Our engine will check hydration, oil index, and pores.
          </p>
          <div class="scanner-animation-wrapper">
            <video id="skin-video" class="scanner-video" autoplay playsinline></video>
            <div id="skin-beam" class="scanner-beam"></div>
            <canvas id="skin-capture-canvas" style="display:none;"></canvas>
          </div>
          <button class="btn btn-luxury" id="skin-scan-btn" style="margin-top:20px; width:100%;" onclick="startSkinScan()">Scan My Skin</button>
          
          <div id="skin-results-section" class="scanner-results">
            <div class="scanner-metric-card">
              <div class="scanner-metric-value" id="metric-oil">42%</div>
              <div class="scanner-metric-title">Oil Index</div>
            </div>
            <div class="scanner-metric-card">
              <div class="scanner-metric-value" id="metric-hydration">78%</div>
              <div class="scanner-metric-title">Hydration</div>
            </div>
            <div class="scanner-metric-card">
              <div class="scanner-metric-value" id="metric-condition">Normal</div>
              <div class="scanner-metric-title">Classification</div>
            </div>
            
            <div style="grid-column: 1/-1; margin-top:15px; border-top:1px solid var(--border-color); padding-top:15px; text-align:left;">
              <h4 style="color:var(--rose-gold); margin-bottom:8px;">Expert Recommendation:</h4>
              <p id="skin-recommend-text" style="font-size:0.85rem; line-height:1.4; color:var(--text-secondary);"></p>
              <div id="skin-rec-products" style="margin-top:15px; display:flex; gap:10px; overflow-x:auto;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.add('active');
  startWebcam('skin-video');
}

function closeSkinAnalysisModal() {
  const modal = document.getElementById('skin-analysis-modal');
  if (modal) modal.classList.remove('active');
  stopWebcam();
}

async function startSkinScan() {
  const video = document.getElementById('skin-video');
  const beam = document.getElementById('skin-beam');
  const scanBtn = document.getElementById('skin-scan-btn');
  const results = document.getElementById('skin-results-section');

  if (!video || !beam || !scanBtn || !results) return;

  beam.classList.add('active');
  scanBtn.disabled = true;
  scanBtn.textContent = 'Analyzing skin tone and hydration...';

  // Wait 2.5s scan animation
  setTimeout(async () => {
    beam.classList.remove('active');
    scanBtn.style.display = 'none';

    // Simulated skin calculation based on canvas capturing
    const canvas = document.getElementById('skin-capture-canvas');
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Generate random skin health logs
    const oilIndex = Math.floor(25 + Math.random() * 55);
    const hydration = Math.floor(40 + Math.random() * 50);
    
    let classification = "Normal";
    let recText = "";
    let recCategory = "Serums";

    if (oilIndex > 60) {
      classification = "Oily Skin";
      recText = "Your skin indicates high sebum activity. We recommend oil-free formulas, niacinamide, and physical gel face cleansers.";
      recCategory = "Face Wash";
    } else if (hydration < 55) {
      classification = "Dry Skin";
      recText = "Your moisture level is low. We recommend our Ceramide-rich Hydra-Dew Moisturizer and Hyaluronic Serums.";
      recCategory = "Moisturizers";
    } else {
      classification = "Combination";
      recText = "Balanced oil and water levels. Keep glowing using our Vitamin C glow serums and broad-spectrum physical sunscreens.";
      recCategory = "Serums";
    }

    document.getElementById('metric-oil').textContent = `${oilIndex}%`;
    document.getElementById('metric-hydration').textContent = `${hydration}%`;
    document.getElementById('metric-condition').textContent = classification;
    document.getElementById('skin-recommend-text').textContent = recText;

    results.style.display = 'grid';

    // Fetch related cosmetics recommendation
    try {
      const res = await fetch(`/api/products?category=${recCategory}`);
      const products = await res.json();
      
      const pContainer = document.getElementById('skin-rec-products');
      if (pContainer) {
        pContainer.innerHTML = products.slice(0,2).map(p => `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; padding:10px; display:flex; gap:10px; align-items:center; flex:1; min-width:200px;">
            <div class="cosmetic-render" style="width:30px; height:45px; transform:scale(0.8);"><div class="cosmetic-render-label" style="font-size:0.2rem; top:12px;">SANIQUE</div></div>
            <div>
              <strong style="font-size:0.8rem; display:block;">${p.name}</strong>
              <span style="color:var(--rose-gold); font-size:0.75rem; font-weight:bold;">₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
              <button class="btn btn-primary" style="padding:2px 8px; font-size:0.65rem; border-radius:10px; margin-top:4px;" onclick="addToCart('${p._id}', '${p.name}', ${p.discountPrice || p.price}, '${p.images[0]}')">Quick Add</button>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error(err);
    }

  }, 2500);
}

// =========================================================================
// 2. Virtual Makeup Try-On
// =========================================================================
let activeTryOnColor = "#9B111E"; // default Red shade

function openTryOnModal() {
  let modal = document.getElementById('try-on-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'try-on-modal';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 800px;">
        <div class="modal-header">
          <h2 class="modal-title">Virtual Makeup Try-On</h2>
          <button class="modal-close" onclick="closeTryOnModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tryon-workspace">
            <div class="tryon-camera-wrapper">
              <video id="tryon-video" class="tryon-video" autoplay playsinline></video>
              <canvas id="tryon-canvas" class="tryon-canvas"></canvas>
            </div>
            <div class="tryon-controls">
              <div class="tryon-control-group">
                <h4>Shades</h4>
                <div class="shade-picker-list" id="tryon-shades"></div>
              </div>
              <div class="tryon-control-group" style="margin-top:20px;">
                <h4>Intensity</h4>
                <input type="range" id="tryon-opacity" min="1" max="10" value="4" style="width:100%; accent-color:var(--rose-gold);" oninput="updateTryOnOpacity(this.value)">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.add('active');
  
  // Populate shades based on current details
  const shadeList = document.getElementById('tryon-shades');
  if (shadeList && currentProduct && currentProduct.shades) {
    activeTryOnColor = currentProduct.shades[0].hex;
    shadeList.innerHTML = currentProduct.shades.map(s => `
      <span class="shade-bubble" style="background-color: ${s.hex}; width:28px; height:28px; border: 2px solid #fff;" onclick="selectTryOnColor('${s.hex}')"></span>
    `).join('');
  }

  startWebcam('tryon-video').then(() => {
    initTryOnCanvasLoop();
  });
}

function selectTryOnColor(hex) {
  activeTryOnColor = hex;
  showToast("Try-on color matched!", "success");
}

let tryOnOpacity = 0.35;
function updateTryOnOpacity(val) {
  tryOnOpacity = Number(val) / 10;
}

function closeTryOnModal() {
  const modal = document.getElementById('try-on-modal');
  if (modal) modal.classList.remove('active');
  stopWebcam();
}

// Draw a responsive cosmetic mask on top of the webcam feed
function initTryOnCanvasLoop() {
  const video = document.getElementById('tryon-video');
  const canvas = document.getElementById('tryon-canvas');
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  const loop = () => {
    if (video.paused || video.ended) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply color highlights on coordinates
    // In standard production this uses tensorflow models.
    // For our luxury mock experience, we draw overlay blends:
    if (currentProduct.category === 'Lipsticks') {
      // Lips shape coordinates
      ctx.beginPath();
      ctx.fillStyle = activeTryOnColor;
      ctx.globalAlpha = tryOnOpacity;
      
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.65;
      
      // Upper lips curve
      ctx.moveTo(cx - 50, cy);
      ctx.quadraticCurveTo(cx - 25, cy - 18, cx - 12, cy - 8);
      ctx.quadraticCurveTo(cx, cy - 12, cx + 12, cy - 8);
      ctx.quadraticCurveTo(cx + 25, cy - 18, cx + 50, cy);
      ctx.quadraticCurveTo(cx, cy + 10, cx - 50, cy);

      // Lower lips curve
      ctx.moveTo(cx - 50, cy);
      ctx.quadraticCurveTo(cx, cy + 28, cx + 50, cy);
      ctx.quadraticCurveTo(cx, cy + 6, cx - 50, cy);

      ctx.fill();
      ctx.closePath();
    } else if (currentProduct.category === 'Blush') {
      // Blush cheeks highlights
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.52;

      ctx.globalAlpha = tryOnOpacity;
      ctx.fillStyle = activeTryOnColor;

      // Left cheek blush
      ctx.beginPath();
      ctx.arc(cx - 90, cy, 32, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      // Right cheek blush
      ctx.beginPath();
      ctx.arc(cx + 90, cy, 32, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    } else if (currentProduct.category === 'Foundations') {
      // Face layer highlight
      ctx.globalAlpha = tryOnOpacity * 0.4; // subtle
      ctx.fillStyle = activeTryOnColor;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 130, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }

    ctx.globalAlpha = 1.0; // reset
    animationFrameId = requestAnimationFrame(loop);
  };

  video.addEventListener('play', loop);
}

// =========================================================================
// 3. Foundation Shade Finder
// =========================================================================
function openShadeFinder() {
  let modal = document.getElementById('shade-finder-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'shade-finder-modal';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:500px;">
        <div class="modal-header">
          <h2 class="modal-title">Foundation Shade Finder</h2>
          <button class="modal-close" onclick="closeShadeFinder()">&times;</button>
        </div>
        <div class="modal-body" style="text-align:center;">
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">Choose the skin tone block that matches your complexion:</p>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:20px;">
            <div onclick="matchShade('#F6E4D9', 'Ivory Glow')" style="height:100px; background:#F6E4D9; border-radius:8px; border:2px solid var(--border-color); cursor:pointer; display:flex; align-items:flex-end; justify-content:center; padding-bottom:8px; font-weight:600; font-size:0.8rem;">Fair / Ivory</div>
            <div onclick="matchShade('#E3C2AE', 'Warm Honey')" style="height:100px; background:#E3C2AE; border-radius:8px; border:2px solid var(--border-color); cursor:pointer; display:flex; align-items:flex-end; justify-content:center; padding-bottom:8px; font-weight:600; font-size:0.8rem;">Medium / Honey</div>
            <div onclick="matchShade('#C39D7D', 'Rich Amber')" style="height:100px; background:#C39D7D; border-radius:8px; border:2px solid var(--border-color); cursor:pointer; display:flex; align-items:flex-end; justify-content:center; padding-bottom:8px; font-weight:600; font-size:0.8rem;">Deep / Amber</div>
          </div>
          <div id="shade-finder-result" style="display:none; padding:15px; border-radius:8px; background:var(--bg-secondary); border: 1.5px solid var(--rose-gold);">
            <p style="font-size:0.9rem;">Your Recommended Shade match is:</p>
            <h3 id="shade-finder-result-name" style="color:var(--rose-gold); margin:5px 0;"></h3>
            <button class="btn btn-luxury" style="padding:6px 15px; font-size:0.8rem;" onclick="applyFoundShade()">Apply Shade Choice</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
}

let foundShadeName = "";
function matchShade(hex, name) {
  foundShadeName = name;
  const resultName = document.getElementById('shade-finder-result-name');
  const resultDiv = document.getElementById('shade-finder-result');
  if (resultName && resultDiv) {
    resultName.textContent = name;
    resultDiv.style.display = 'block';
  }
}

function applyFoundShade() {
  const matchingBubble = Array.from(document.querySelectorAll('#details-shades .shade-bubble')).find(s => s.title === foundShadeName);
  if (matchingBubble) {
    matchingBubble.click();
    closeShadeFinder();
  } else {
    showToast(`Shade '${foundShadeName}' selected.`, "success");
    closeShadeFinder();
  }
}

function closeShadeFinder() {
  const modal = document.getElementById('shade-finder-modal');
  if (modal) modal.classList.remove('active');
}

// =========================================================================
// 4. Interactive Beauty Quiz
// =========================================================================
let quizCurrentStep = 1;
const quizAnswers = [];

function nextQuizStep(questionId, optionSelected) {
  quizAnswers.push(optionSelected);
  
  // Hide current
  const currentElem = document.getElementById(`quiz-step-${quizCurrentStep}`);
  if (currentElem) currentElem.classList.remove('active');

  quizCurrentStep++;
  const nextElem = document.getElementById(`quiz-step-${quizCurrentStep}`);
  if (nextElem) {
    nextElem.classList.add('active');
  } else {
    // End of quiz, submit answers
    submitQuizAnswers();
  }
}

async function submitQuizAnswers() {
  const resultContainer = document.getElementById('quiz-result-container');
  const quizForm = document.getElementById('quiz-questions-wrapper');

  if (!resultContainer || !quizForm) return;

  quizForm.style.display = 'none';
  resultContainer.innerHTML = '<div style="text-align:center; padding: 40px 0;"><i class="fas fa-spinner fa-spin" style="font-size:2.5rem; color:var(--rose-gold);"></i><p style="margin-top:10px;">Evaluating beauty profiles...</p></div>';

  try {
    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: quizAnswers })
    });
    const data = await res.json();

    // Render Quiz Results
    resultContainer.innerHTML = `
      <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--border-radius); padding:35px; box-shadow:0 10px 30px var(--shadow-color);">
        <h2 style="font-family:var(--font-serif); color:var(--rose-gold); margin-bottom:15px; text-align:center;">Your Personalized Regimen</h2>
        <p style="text-align:center; color:var(--text-secondary); margin-bottom:30px;">Based on your choices, we mapped the ideal skincare routine and products:</p>
        
        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:30px; margin-bottom:30px;">
          <div>
            <h3 style="font-size:1.1rem; color:var(--charcoal); margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Routine Steps:</h3>
            <ul style="display:flex; flex-direction:column; gap:10px;">
              ${data.routine.map((step, idx) => `<li><strong style="color:var(--rose-gold); font-size:0.95rem;">Step ${idx+1}:</strong> ${step}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 style="font-size:1.1rem; color:var(--charcoal); margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Beauty Tips:</h3>
            <ul style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem; color:var(--text-secondary);">
              ${data.beautyTips.map(tip => `<li><i class="fas fa-magic" style="color:var(--gold); margin-right:6px;"></i> ${tip}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <h3 style="font-size:1.1rem; color:var(--rose-gold); margin-bottom:15px; text-align:center;">Recommended Products For You</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
          ${data.recommendedProducts.map(p => `
            <div style="border:1px solid var(--border-color); border-radius:8px; padding:15px; text-align:center; background:var(--bg-secondary);">
              <div class="cosmetic-render" style="width:40px; height:60px; margin:0 auto 10px; background:linear-gradient(to bottom, ${getCategoryGradient(p.category)});">
                <div class="cosmetic-render-label" style="font-size:0.25rem; top:18px;">SANIQUE</div>
              </div>
              <h4 style="font-size:0.85rem; margin-bottom:4px;">${p.name}</h4>
              <div style="color:var(--rose-gold); font-weight:bold; font-size:0.85rem; margin-bottom:10px;">₹${(p.discountPrice || p.price).toLocaleString('en-IN')}</div>
              <button class="btn btn-primary" style="padding:4px 12px; font-size:0.7rem;" onclick="addToCart('${p._id}', '${p.name}', ${p.discountPrice || p.price}, '${p.images[0]}')">Quick Add</button>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align:center; margin-top:35px;">
          <a href="/shop.html" class="btn btn-luxury">Browse Full Shop</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

// =========================================================================
// Webcam APIs Utilities
// =========================================================================
async function startWebcam(videoId) {
  const video = document.getElementById(videoId);
  if (!video) return;

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: false
    });
    video.srcObject = webcamStream;
  } catch (err) {
    console.error("Camera access denied:", err);
    showToast("Webcam access required for AI overlays", "error");
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
}
// Share layout matching category
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
