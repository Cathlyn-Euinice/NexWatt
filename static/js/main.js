// NexWatt Common Client Utilities
// Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology

function showToast(message, icon = "✨") {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  if (!toast) return;

  msgEl.innerText = message;
  iconEl.innerText = icon;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// Reset Demo Data to pristine state
async function resetDemoData() {
  if (!confirm("Reset all room data, streaks, and teams back to pristine Dexathon Demo state?")) return;

  try {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast("Demo data successfully restored!", "🔄");
      setTimeout(() => window.location.reload(), 600);
    }
  } catch (err) {
    alert("Could not reset demo data.");
  }
}

// Fast habit toggle from dashboard mini-list
async function toggleHabitFast(habitId, cardElement) {
  try {
    const res = await fetch('/api/habits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit_id: habitId })
    });
    const data = await res.json();
    if (data.success) {
      if (data.completed) {
        cardElement.classList.add('done');
        cardElement.querySelector('.tick-mark').innerText = '✓';
      } else {
        cardElement.classList.remove('done');
        cardElement.querySelector('.tick-mark').innerText = '';
      }
      showToast(data.message, data.completed ? "⚡" : "↩️");

      // Update dashboard top metrics if present
      const kpiKwh = document.getElementById('kpiKwh');
      if (kpiKwh) kpiKwh.innerText = data.user.total_kwh_saved;
      const kpiInr = document.getElementById('kpiInr');
      if (kpiInr) kpiInr.innerText = '₹' + data.user.total_inr_saved.toFixed(2);
      const kpiCo2 = document.getElementById('kpiCo2');
      if (kpiCo2) kpiCo2.innerText = data.user.co2_avoided_kg;
    }
  } catch (err) {
    console.error(err);
  }
}

// Detailed habit toggle from full Habits page
async function toggleHabitAjax(habitId) {
  try {
    const res = await fetch('/api/habits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit_id: habitId })
    });
    const data = await res.json();
    if (data.success) {
      const card = document.getElementById(`card-${habitId}`);
      if (card) {
        if (data.completed) {
          card.classList.add('is-checked');
          card.querySelector('.btn-check-toggle').innerText = 'Done ✅';
        } else {
          card.classList.remove('is-checked');
          card.querySelector('.btn-check-toggle').innerText = 'Mark Done';
        }
      }

      showToast(data.message, data.completed ? "⚡" : "↩️");

      // Update anti-cheat daily cap meter
      const capDisplay = document.getElementById('capDisplay');
      if (capDisplay && typeof dailyCapMax !== 'undefined') {
        capDisplay.innerText = `${data.user.today_points} / ${dailyCapMax} pts`;
        const pct = Math.min(100, Math.round((data.user.today_points / dailyCapMax) * 100));
        document.getElementById('capBarFill').style.width = `${pct}%`;
      }
    }
  } catch (err) {
    console.error(err);
  }
}
