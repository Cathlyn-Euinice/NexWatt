// NexWatt Dashboard 7-Day Chart Initialization
// Dexathon 2026 - The Logic Lords

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sevenDayChart');
  if (!canvas || typeof rawHistory === 'undefined') return;

  const ctx = canvas.getContext('2d');

  // Create subtle gradient fill under the line
  const gradient = ctx.createLinearGradient(0, 0, 0, 230);
  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.35)');
  gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

  const labels = rawHistory.map(item => item.day);
  const kwhData = rawHistory.map(item => item.kwh);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Energy Saved (kWh)',
          data: kwhData,
          borderColor: '#22c55e',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#facc15',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#facc15',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const inr = (val * 6.5).toFixed(2);
              return `⚡ ${val} kWh saved (~₹${inr})`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: '600' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono' },
            callback: value => `${value} u`
          }
        }
      }
    }
  });
});
