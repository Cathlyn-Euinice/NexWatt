// NexWatt Mystery: Phantom Load Detective Room Logic
// Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology

let gameActive = false;
let timerSeconds = 45;
let timerInterval = null;
let foundWasters = new Set();
let totalEliminatedInr = 0;
let totalEliminatedKwh = 0;

function startMysteryGame() {
  if (gameActive) return;
  gameActive = true;
  timerSeconds = 45;
  foundWasters.clear();
  totalEliminatedInr = 0;
  totalEliminatedKwh = 0;

  document.getElementById('gameTimer').innerText = `${timerSeconds}s`;
  document.getElementById('btnStartGame').innerText = "⏱️ Game Running...";
  document.getElementById('btnStartGame').style.opacity = "0.7";
  document.getElementById('roomInstruction').innerHTML = '<span>⚡ <strong>Hurry!</strong> Find all 6 hidden wasters before the timer hits 0!</span>';

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds--;
    const timerEl = document.getElementById('gameTimer');
    timerEl.innerText = `${timerSeconds}s`;

    if (timerSeconds <= 10) {
      timerEl.style.color = '#ef4444';
      timerEl.style.animation = 'pulse 0.5s infinite';
    } else {
      timerEl.style.color = '#facc15';
    }

    if (timerSeconds <= 0) {
      endMysteryGame(false);
    }
  }, 1000);
}

async function clickWaster(wasterId) {
  if (!gameActive) {
    startMysteryGame();
  }

  const pin = document.getElementById(`pin-${wasterId}`);
  if (!pin || foundWasters.has(wasterId)) return;

  try {
    const res = await fetch('/api/mystery/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waster_id: wasterId })
    });
    const data = await res.json();
    if (data.success) {
      foundWasters.add(wasterId);
      pin.classList.add('neutralized');

      const w = data.waster;
      totalEliminatedInr += w.monthly_inr_waste;
      totalEliminatedKwh += w.monthly_kwh_waste;

      // Update Top Status Bar
      document.getElementById('foundCount').innerText = `${foundWasters.size} / 6`;
      document.getElementById('moneyEliminated').innerText = `₹${totalEliminatedInr.toFixed(2)}`;

      // Update Inspection Terminal Log
      appendTerminalCard(w);

      showToast(`Neutralized ${w.title}! Saves ₹${w.monthly_inr_waste.toFixed(2)}/mo`, "🔍");

      // Check if all 6 found
      if (foundWasters.size >= 6) {
        endMysteryGame(true);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function appendTerminalCard(waster) {
  const placeholder = document.getElementById('termPlaceholder');
  if (placeholder) placeholder.style.display = 'none';

  const container = document.getElementById('termActiveCards');
  const card = document.createElement('div');
  card.className = 'waster-detail-card cleared';
  card.innerHTML = `
    <div class="wdc-header">
      <span class="wdc-title">✅ ${waster.title}</span>
      <span class="wdc-waste inr-color">₹${waster.monthly_inr_waste.toFixed(2)} / mo</span>
    </div>
    <p class="wdc-tip">💡 <strong>Remedy:</strong> ${waster.tip}</p>
  `;
  container.prepend(card);

  document.getElementById('termTotalKwh').innerText = `${totalEliminatedKwh.toFixed(1)} kWh/month`;
  document.getElementById('termTotalInr').innerText = `₹${totalEliminatedInr.toFixed(2)} / month`;
}

function endMysteryGame(wonAll) {
  clearInterval(timerInterval);
  gameActive = false;
  document.getElementById('btnStartGame').innerText = "▶️ Start 45s Challenge";
  document.getElementById('btnStartGame').style.opacity = "1";

  const modal = document.getElementById('gameModal');
  const foundNum = foundWasters.size;
  document.getElementById('modalFoundNum').innerText = `${foundNum} / 6`;
  document.getElementById('modalMoneySaved').innerText = `₹${totalEliminatedInr.toFixed(2)}`;
  document.getElementById('modalPointsEarned').innerText = `+${foundNum * 10} pts`;

  const rankTitle = document.getElementById('modalRankTitle');
  if (foundNum >= 6) {
    rankTitle.innerText = "Master Energy Detective 🏆";
  } else if (foundNum >= 4) {
    rankTitle.innerText = "Senior Energy Detective 🎖️";
  } else {
    rankTitle.innerText = "Hostel Rookie Inspector 🔍";
  }

  modal.classList.remove('hidden');
}

function closeGameModal() {
  document.getElementById('gameModal').classList.add('hidden');
}

async function resetMysteryGame() {
  clearInterval(timerInterval);
  gameActive = false;
  timerSeconds = 45;
  foundWasters.clear();
  totalEliminatedInr = 0;
  totalEliminatedKwh = 0;

  document.getElementById('gameTimer').innerText = "45s";
  document.getElementById('foundCount').innerText = "0 / 6";
  document.getElementById('moneyEliminated').innerText = "₹0.00";
  document.getElementById('termTotalKwh').innerText = "0.0 kWh/month";
  document.getElementById('termTotalInr').innerText = "₹0.00 / month";
  document.getElementById('btnStartGame').innerText = "▶️ Start 45s Challenge";
  document.getElementById('btnStartGame').style.opacity = "1";

  document.querySelectorAll('.waster-pin').forEach(pin => pin.classList.remove('neutralized'));
  document.getElementById('termActiveCards').innerHTML = '';
  const placeholder = document.getElementById('termPlaceholder');
  if (placeholder) placeholder.style.display = 'block';

  try {
    await fetch('/api/mystery/reset', { method: 'POST' });
    showToast("Mystery Room reset for a new detective round!", "🔄");
  } catch (e) { /* ignore */ }
}
