// NexWatt Core Application Logic
// Dexathon 2026 - The Logic Lords

let appState = null;
let currentAppliance = null;
let telemetryChartInstance = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  fetchState();
  initTelemetryChart();
  runSimulation();
});

// Fetch full backend state
async function fetchState() {
  try {
    const res = await fetch('/api/state');
    appState = await res.json();
    renderAll();
  } catch (err) {
    console.error("Failed to load state:", err);
  }
}

// Master Render Function
function renderAll() {
  if (!appState) return;

  // 1. Live Ticker
  document.getElementById('topKwh').innerHTML = `${appState.user.total_kwh_saved.toFixed(1)} <small>kWh</small>`;
  document.getElementById('topInr').innerText = `₹${appState.user.total_inr_saved.toFixed(2)}`;
  document.getElementById('topCo2').innerHTML = `${appState.user.co2_avoided_kg.toFixed(1)} <small>kg</small>`;
  
  const stageNames = ["Seedling", "Sprout", "Canopy Bloom", "Solar Canopy Tree", "Eden Sanctuary"];
  const currentStageName = stageNames[appState.user.garden_stage - 1] || "Canopy Bloom";
  document.getElementById('topTier').innerText = `LVL ${appState.user.garden_stage} • ${currentStageName}`;
  document.getElementById('gardenTierText').innerText = `Stage ${appState.user.garden_stage}: ${currentStageName}`;

  // 2. Habits List
  renderHabits();

  // 3. Mystery Progress & Pins
  renderMystery();

  // 4. Botanical Garden
  renderGarden();

  // 5. Hostel League / Pact Table
  renderPacts();
}

// Render Habits Grid
function renderHabits() {
  const container = document.getElementById('habitsList');
  if (!container) return;
  container.innerHTML = '';

  appState.habits.forEach(h => {
    const card = document.createElement('div');
    card.className = `habit-card ${h.done ? 'completed' : ''}`;
    card.onclick = () => toggleHabit(h.id);

    card.innerHTML = `
      <div class="habit-checkbox">${h.done ? '✓' : ''}</div>
      <div class="habit-content">
        <div class="habit-title">${h.title}</div>
        <div class="habit-meta">
          <span class="meta-chip kwh">⚡ -${h.kwh} kWh/day</span>
          <span class="meta-chip inr">₹ +${h.inr.toFixed(2)}</span>
          <span class="meta-chip xp">✨ +${h.xp} XP</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Toggle Habit Action
async function toggleHabit(id) {
  try {
    const res = await fetch('/api/toggle-habit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      appState = data.state;
      renderAll();
    }
  } catch (err) {
    console.error("Toggle error:", err);
  }
}

// Render Mystery Section
function renderMystery() {
  const discoveredCount = appState.mystery_appliances.filter(a => a.discovered).length;
  document.getElementById('mysteryFoundCount').innerText = discoveredCount;
  const pct = (discoveredCount / appState.mystery_appliances.length) * 100;
  document.getElementById('mysteryProgressFill').style.width = `${pct}%`;

  // Update visual pins
  appState.mystery_appliances.forEach(app => {
    const pin = document.querySelector(`.pin-${app.id.replace('_empty', '')}`);
    if (pin && app.discovered) {
      pin.classList.add('discovered');
      pin.title = `${app.name} (Neutralized)`;
    }
  });
}

// Inspect Appliance in Room
function inspectAppliance(id) {
  const app = appState.mystery_appliances.find(a => a.id === id);
  if (!app) return;

  currentAppliance = app;
  document.getElementById('diagPlaceholder').classList.add('hidden');
  const activePanel = document.getElementById('diagActive');
  activePanel.classList.remove('hidden');

  document.getElementById('diagName').innerText = app.name;
  document.getElementById('diagWatt').innerText = `${app.leak_wattage} W`;
  document.getElementById('diagInr').innerText = `₹${app.annual_waste_inr}`;
  document.getElementById('diagCo2').innerText = `${app.co2_kg} kg`;
  document.getElementById('diagTip').innerText = app.fix_tip;

  const btn = document.getElementById('btnResolveLeak');
  if (app.discovered) {
    btn.innerText = "✓ Leak Already Neutralized";
    btn.style.opacity = "0.6";
    btn.disabled = true;
  } else {
    btn.innerText = `⚡ Neutralize Leak & Claim +${app.xp_reward} XP`;
    btn.style.opacity = "1";
    btn.disabled = false;
  }
}

// Resolve Leak Action
async function resolveCurrentAppliance() {
  if (!currentAppliance || currentAppliance.discovered) return;

  try {
    const res = await fetch('/api/discover-mystery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentAppliance.id })
    });
    const data = await res.json();
    if (data.success) {
      appState = data.state;
      currentAppliance = data.item;
      renderAll();
      inspectAppliance(currentAppliance.id);
    }
  } catch (err) {
    console.error("Resolve error:", err);
  }
}

// Render Living Garden Terrarium
function renderGarden() {
  const visual = document.getElementById('gardenPlantVisual');
  if (!visual) return;
  const stage = appState.user.garden_stage || 3;

  // Dynamic SVG based on stage
  let svgContent = '';
  if (stage === 1) {
    // Seedling
    svgContent = `
      <svg viewBox="0 0 100 100" width="120" height="120">
        <ellipse cx="50" cy="85" rx="12" ry="4" fill="#3f2e22" />
        <path d="M50 85 Q48 65 50 55" stroke="#10b981" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M50 55 C40 50 38 40 50 42 C60 40 58 50 50 55" fill="#34d399" />
      </svg>
    `;
  } else if (stage === 2) {
    // Sprout with double leaves
    svgContent = `
      <svg viewBox="0 0 100 120" width="150" height="180">
        <ellipse cx="50" cy="110" rx="16" ry="6" fill="#3f2e22" />
        <path d="M50 110 Q45 80 50 50" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M50 70 Q30 60 25 45 Q40 50 50 68" fill="#10b981" />
        <path d="M50 65 Q70 55 75 40 Q60 48 50 63" fill="#34d399" />
        <circle cx="50" cy="48" r="6" fill="#fbbf24" />
      </svg>
    `;
  } else if (stage === 3) {
    // Canopy Bloom
    svgContent = `
      <svg viewBox="0 0 140 160" width="180" height="220">
        <ellipse cx="70" cy="150" rx="24" ry="8" fill="#2d221a" />
        <path d="M70 150 Q65 105 70 65" stroke="#047857" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M68 110 Q40 95 30 75 Q55 85 68 105" fill="#10b981" />
        <path d="M72 100 Q100 85 110 65 Q85 75 72 95" fill="#34d399" />
        <path d="M70 75 Q45 50 48 30 Q65 45 70 70" fill="#6ee7b7" />
        <circle cx="70" cy="45" r="14" fill="#f59e0b" filter="drop-shadow(0 0 8px rgba(245,158,11,0.8))"/>
        <circle cx="70" cy="45" r="6" fill="#fef08a" />
      </svg>
    `;
  } else if (stage === 4) {
    // Solar Canopy Tree
    svgContent = `
      <svg viewBox="0 0 160 180" width="220" height="250">
        <ellipse cx="80" cy="170" rx="30" ry="10" fill="#2d221a" />
        <path d="M80 170 Q75 115 80 50" stroke="#064e3b" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="55" r="42" fill="#059669" opacity="0.9" />
        <circle cx="60" cy="45" r="26" fill="#10b981" />
        <circle cx="100" cy="45" r="26" fill="#34d399" />
        <circle cx="80" cy="30" r="16" fill="#fbbf24" filter="drop-shadow(0 0 12px rgba(251,191,36,0.9))"/>
      </svg>
    `;
  } else {
    // Stage 5: Eden Sanctuary
    svgContent = `
      <svg viewBox="0 0 180 200" width="240" height="270">
        <ellipse cx="90" cy="185" rx="36" ry="12" fill="#2d221a" />
        <path d="M90 185 Q82 120 90 40" stroke="#064e3b" stroke-width="11" fill="none" stroke-linecap="round"/>
        <circle cx="90" cy="50" r="50" fill="#047857" opacity="0.95" />
        <circle cx="65" cy="40" r="32" fill="#10b981" />
        <circle cx="115" cy="40" r="32" fill="#34d399" />
        <circle cx="90" cy="20" r="20" fill="#fde047" filter="drop-shadow(0 0 16px rgba(253,224,71,1))"/>
      </svg>
    `;
  }

  visual.innerHTML = svgContent;

  // Ecological equivalencies
  const kwh = appState.user.total_kwh_saved;
  const trees = (kwh * 0.82 / 21.77).toFixed(1);
  const waterL = Math.round(kwh * 7.2); // ~7.2L powerplant cooling water saved per kWh
  const carKm = Math.round(kwh * 3.33);

  document.getElementById('ecoTrees').innerText = `${trees} Trees`;
  document.getElementById('ecoWater').innerText = `${waterL} Litres`;
  document.getElementById('ecoKm').innerText = `${carKm} km`;
}

// Garden Action Buttons (Nourish)
function nourishGarden(type) {
  const sky = document.getElementById('terrariumSky');
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'sparkle-particle';
    p.style.left = `${Math.random() * 80 + 10}%`;
    p.style.bottom = `${Math.random() * 60 + 20}%`;
    p.innerText = type === 'water' ? '💧' : type === 'sun' ? '✨' : '🍃';
    sky.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

// Render Pacts Leaderboard
function renderPacts() {
  const tbody = document.getElementById('pactTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  appState.hostel_pacts.forEach(p => {
    const pct = Math.round((p.achieved_kwh / p.target_kwh) * 100);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="rank-badge rank-${p.rank}">${p.rank}</span></td>
      <td>
        <strong>${p.name}</strong>
        <div style="font-size:0.75rem; color:var(--text-dim);">${p.badge}</div>
      </td>
      <td>${p.members}</td>
      <td>
        <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
          <span>${p.achieved_kwh} kWh</span>
          <span style="color:var(--emerald);">${pct}%</span>
        </div>
        <div class="progress-bar-wrap" style="height:5px; margin-top:3px;">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
      </td>
      <td><span style="color:var(--solar); font-family:var(--font-mono);">🔥 ${p.streak}d</span></td>
      <td><button class="btn-secondary" style="padding:4px 10px; font-size:0.78rem;" onclick="joinSquad('${p.id}')">Join</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Join Squad directly or open modal
async function joinSquad(blockId) {
  try {
    const res = await fetch('/api/join-pact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_id: blockId })
    });
    const data = await res.json();
    if (data.success) {
      appState.hostel_pacts = data.pacts;
      renderPacts();
      alert("Successfully pledged with this hostel block! +30 XP awarded.");
    }
  } catch (err) {
    console.error(err);
  }
}

function joinSquadModal() {
  document.getElementById('pactModal').classList.remove('hidden');
}
function closeSquadModal() {
  document.getElementById('pactModal').classList.add('hidden');
}
function submitPledge() {
  const block = document.getElementById('pactSelectBlock').value;
  joinSquad(block);
  closeSquadModal();
}

// BEE Star & Tariff Simulator
async function runSimulation() {
  const acStars = parseInt(document.getElementById('simAcStars').value);
  const acHrs = parseFloat(document.getElementById('simAcHrs').value);
  document.getElementById('lblAcHrs').innerText = `${acHrs} hrs/day`;

  const fanStars = parseInt(document.getElementById('simFanStars').value);
  const fanHrs = parseFloat(document.getElementById('simFanHrs').value);
  document.getElementById('lblFanHrs').innerText = `${fanHrs} hrs/day`;

  const lightStars = parseInt(document.getElementById('simLightStars').value);
  const lightHrs = parseFloat(document.getElementById('simLightHrs').value);
  document.getElementById('lblLightHrs').innerText = `${lightHrs} hrs/day`;

  const tariff = document.getElementById('simTariffSchedule').value;

  const payload = {
    tariff_type: tariff,
    appliances: [
      { wattage: acStars === 5 ? 950 : acStars === 3 ? 1250 : 1650, hours_per_day: acHrs, qty: 1, star_rating: acStars },
      { wattage: fanStars === 5 ? 28 : 75, hours_per_day: fanHrs, qty: 2, star_rating: fanStars },
      { wattage: lightStars === 5 ? 18 : 40, hours_per_day: lightHrs, qty: 2, star_rating: lightStars }
    ]
  };

  try {
    const res = await fetch('/api/calculate-tariff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    document.getElementById('resMonthlyKwh').innerHTML = `${data.total_monthly_kwh} <small>kWh</small>`;
    document.getElementById('resBaseBill').innerText = `₹${data.total_monthly_bill_inr.toFixed(2)}`;
    const optBill = Math.max(0, data.total_monthly_bill_inr - data.potential_star_savings_inr);
    document.getElementById('resOptBill').innerText = `₹${optBill.toFixed(2)}`;
    document.getElementById('resAnnualSave').innerText = `₹${(data.potential_star_savings_inr * 12).toFixed(2)}`;
    document.getElementById('resCo2Avoid').innerText = `${data.annual_co2_kg} kg CO₂/yr`;
    document.getElementById('resTrees').innerText = `${data.trees_required} Trees`;
  } catch (err) {
    console.error(err);
  }
}

// Download Formal Energy Audit Slip
function downloadAuditReport() {
  const text = `=====================================================
NEXWATT CAMPUS ENERGY AUDIT & TARIFF COMPLIANCE REPORT
Dexathon 2026 - The Logic Lords
Institution: Sathyabama Institute of Science & Technology
=====================================================

User: Alex - Room 402 (Vikram Sarabhai Block C)
Assessment Date: ${new Date().toLocaleDateString()}
CEA Grid Factor: 0.82 kg CO2 / kWh
Institutional Tariff: ₹7.50 / kWh

Monthly Consumption: ${document.getElementById('resMonthlyKwh').innerText}
Baseline Utility Cost: ${document.getElementById('resBaseBill').innerText}
Optimized 5-Star Bill: ${document.getElementById('resOptBill').innerText}
Potential Annual Cost Avoidance: ${document.getElementById('resAnnualSave').innerText}
Carbon Emissions Avoided: ${document.getElementById('resCo2Avoid').innerText}

RECOMMENDATION:
1. Retrofit standard 75W induction ceiling fans with 28W 5-Star BLDC units.
2. Standardize air conditioner cooling set-point at 24°C in compliance with BEE guidelines.
3. Eliminate transformer phantom draw via automated power strips.

Status: Verified & Audit-Ready (NAAC Criterion 7.1.2)
=====================================================`;

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `NexWatt_Campus_Energy_Audit_Report.txt`;
  a.click();
}

// Perspective Switcher: Student vs Campus Admin View
function switchPerspective(mode) {
  const studentSec = document.getElementById('studentPerspective');
  const adminSec = document.getElementById('adminPerspective');
  const btnStudent = document.getElementById('btnStudentMode');
  const btnAdmin = document.getElementById('btnAdminMode');

  if (mode === 'student') {
    studentSec.classList.remove('hidden');
    adminSec.classList.add('hidden');
    btnStudent.classList.add('active');
    btnAdmin.classList.remove('active');
  } else {
    studentSec.classList.add('hidden');
    adminSec.classList.remove('hidden');
    btnAdmin.classList.add('active');
    btnStudent.classList.remove('active');
    refreshTelemetry();
  }
}

// Sub Nav Tab Opener
function openTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  if (targetPane) targetPane.classList.add('active');

  const activeBtn = Array.from(document.querySelectorAll('.tab-link')).find(btn => btn.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');
}

// Claim Daily LiFE Bonus
function claimDailyBonus() {
  alert("🎉 Daily LiFE (Lifestyle for Environment) Badge Synced! +50 XP and 1 Day added to conservation streak!");
}

// Telemetry Chart (Chart.js)
function initTelemetryChart() {
  const ctx = document.getElementById('telemetryChart');
  if (!ctx) return;

  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  const baseline = [310, 345, 380, 420, 440, 435, 410, 395, 380, 410, 450, 465, 430];
  const nexwatt = [260, 285, 310, 340, 360, 350, 330, 320, 305, 335, 370, 380, 350];

  telemetryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Baseline Grid Demand (kW)',
          data: baseline,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2
        },
        {
          label: 'NexWatt Shaved Demand (kW)',
          data: nexwatt,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af' },
          title: { display: true, text: 'Hostel Micro-Grid Load (kW)', color: '#9ca3af' }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af' }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Refresh Live IoT Telemetry
async function refreshTelemetry() {
  try {
    const res = await fetch('/api/campus-telemetry');
    const data = await res.json();
    if (telemetryChartInstance) {
      telemetryChartInstance.data.labels = data.timestamps;
      telemetryChartInstance.data.datasets[0].data = data.baseline_load_kw;
      telemetryChartInstance.data.datasets[1].data = data.nexwatt_optimized_kw;
      telemetryChartInstance.update();
    }
    document.getElementById('campusPeakShaved').innerHTML = `${data.demand_shaved_kw} <small>kW</small>`;
    
    // Append simulated log entry
    const log = document.getElementById('telemetryLog');
    const timeStr = new Date().toLocaleTimeString();
    log.innerHTML += `<br><code>[${timeStr}] Sync complete: ${data.active_meters} smart meters responding. Peak shaved: ${data.demand_shaved_kw} kW.</code>`;
    log.scrollTop = log.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}


// ==================== IOT LIVE MONITOR ====================

let iotChart = null;
let iotPollInterval = null;
let iotSimInterval = null;
let iotSimRunning = false;

// Initialize IoT Live Chart
function initIotChart() {
  const ctx = document.getElementById('iotLiveChart');
  if (!ctx || iotChart) return;

  iotChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Power (W)',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#9ca3af' },
          title: { display: true, text: 'Watts (W)', color: '#9ca3af' }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#9ca3af', maxTicksLimit: 10 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// Poll the IoT latest endpoint every 2 seconds
function startIotPolling() {
  if (iotPollInterval) return;
  initIotChart();

  iotPollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/iot/latest');
      const data = await res.json();
      updateIotUI(data);
    } catch (err) {
      // server unreachable
    }
  }, 2000);
}

function stopIotPolling() {
  if (iotPollInterval) {
    clearInterval(iotPollInterval);
    iotPollInterval = null;
  }
}

// Update all IoT UI elements
function updateIotUI(data) {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');

  if (data.connected && data.latest) {
    dot.className = 'conn-dot connected';
    label.innerText = 'ESP32 + PZEM-004T Active';
    const r = data.latest;

    // Big power gauge
    document.getElementById('iotPowerVal').innerText = Math.round(r.power_w);
    // Arc: 534 is full circumference, map power 0-3000W
    const pct = Math.min(r.power_w / 3000, 1);
    document.getElementById('powerArc').setAttribute('stroke-dashoffset', 534 - (534 * pct));
    // Color: green < 200, yellow 200-800, red > 800
    const arcColor = r.power_w < 200 ? '#10b981' : r.power_w < 800 ? '#f59e0b' : '#ef4444';
    document.getElementById('powerArc').setAttribute('stroke', arcColor);
    document.getElementById('iotPowerVal').style.color = arcColor;

    // Mini stats
    document.getElementById('iotVoltage').innerText = `${r.voltage.toFixed(1)} V`;
    document.getElementById('iotCurrent').innerText = `${r.current.toFixed(3)} A`;
    document.getElementById('iotFreq').innerText = `${r.frequency.toFixed(1)} Hz`;
    document.getElementById('iotPF').innerText = r.power_factor.toFixed(2);
    document.getElementById('iotSessionKwh').innerText = `${data.session_kwh_used.toFixed(4)} kWh`;
    const sessionCost = (data.session_kwh_used * 7.5).toFixed(2);
    document.getElementById('iotSessionCost').innerText = `₹${sessionCost}`;

    // Update chart with new point
    if (iotChart) {
      iotChart.data.labels.push(r.time_str || '');
      iotChart.data.datasets[0].data.push(r.power_w);
      // Keep last 150 points
      if (iotChart.data.labels.length > 150) {
        iotChart.data.labels.shift();
        iotChart.data.datasets[0].data.shift();
      }
      iotChart.update('none');
    }

    // Detected appliances fingerprint
    renderFingerprints(r.detected_appliances || []);

    // Habit cross-validation
    renderValidation(r.habit_validation || []);

  } else {
    dot.className = 'conn-dot disconnected';
    label.innerText = 'Waiting for ESP32...';
  }
}

function renderFingerprints(appliances) {
  const container = document.getElementById('fingerprintList');
  if (!container) return;
  if (appliances.length === 0) {
    container.innerHTML = '<span class="no-data-msg">No significant power draw detected.</span>';
    return;
  }
  container.innerHTML = appliances.map(a =>
    `<div class="fp-item">
      <span class="fp-label">${a.label}</span>
      <span class="fp-watts">~${Math.round(a.estimated_w)}W (${a.range})</span>
    </div>`
  ).join('');
}

function renderValidation(validations) {
  const container = document.getElementById('validationList');
  if (!container) return;
  if (validations.length === 0) {
    container.innerHTML = '<span class="no-data-msg">Log habits to see IoT verification status...</span>';
    return;
  }
  container.innerHTML = validations.map(v =>
    `<div class="validation-item ${v.verified ? 'verified' : 'unverified'}">
      <span class="v-icon">${v.verified ? '✅' : '⚠️'}</span>
      <div class="v-content">
        <span class="v-title">${v.title}</span>
        <span class="v-reason">${v.reason}</span>
      </div>
    </div>`
  ).join('');
}

// ==================== IOT SIMULATION MODE ====================
// For demo day when no physical ESP32 is available.
// Simulates realistic PZEM-004T readings including load step changes.

let simBasePower = 145; // A room with fan + charger + light

function startIotSimulation() {
  if (iotSimRunning) return;
  iotSimRunning = true;
  initIotChart();

  // Start polling the UI updates
  startIotPolling();

  iotSimInterval = setInterval(async () => {
    // Simulate slight realistic fluctuation
    const noise = (Math.random() - 0.5) * 8;
    const power = Math.max(5, simBasePower + noise);
    const voltage = 230 + (Math.random() - 0.5) * 6;
    const current = power / voltage;

    const payload = {
      device_id: "room-402-sim",
      voltage: parseFloat(voltage.toFixed(1)),
      current: parseFloat(current.toFixed(3)),
      power_w: parseFloat(power.toFixed(1)),
      energy_kwh: parseFloat((Math.random() * 0.01).toFixed(4)),
      frequency: parseFloat((49.9 + Math.random() * 0.2).toFixed(2)),
      power_factor: parseFloat((0.85 + Math.random() * 0.14).toFixed(2))
    };

    try {
      await fetch('/api/iot/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { /* ignore */ }
  }, 2000);

  // Schedule load step changes to simulate turning devices on/off
  setTimeout(() => { simBasePower = 850; }, 10000);   // "AC turns on" at 10s
  setTimeout(() => { simBasePower = 920; }, 20000);   // "PC also on" at 20s
  setTimeout(() => { simBasePower = 145; }, 35000);   // "AC + PC off" at 35s
  setTimeout(() => { simBasePower = 70; },  45000);   // "Fan off too" at 45s
  setTimeout(() => { simBasePower = 145; }, 55000);   // "Back to normal" at 55s
}

function stopIotSimulation() {
  iotSimRunning = false;
  if (iotSimInterval) {
    clearInterval(iotSimInterval);
    iotSimInterval = null;
  }
  stopIotPolling();
}

// Auto-start IoT polling when the IoT tab is opened
const origOpenTab = openTab;
openTab = function(tabId) {
  origOpenTab(tabId);
  if (tabId === 'tab-iot') {
    startIotPolling();
  }
};
