// NexWatt Simulator & Calculator Live Math
// Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology

// ---------------------------------------------------------------------------
// 1. Savings Calculator Functions
// ---------------------------------------------------------------------------
function handleApplianceChange() {
  const select = document.getElementById('applianceSelect');
  if (!select) return;

  const selectedOpt = select.options[select.selectedIndex];
  const watt = selectedOpt.getAttribute('data-watt');
  const hours = selectedOpt.getAttribute('data-hours');

  if (watt) document.getElementById('wattageInput').value = watt;
  if (hours) {
    document.getElementById('hoursInput').value = hours;
    document.getElementById('hoursSlider').value = hours;
    document.getElementById('sliderHoursDisplay').innerText = `${parseFloat(hours).toFixed(1)} hrs/day`;
  }

  calculateSavingsLive();
}

function syncHoursSlider(val) {
  document.getElementById('hoursInput').value = val;
  document.getElementById('sliderHoursDisplay').innerText = `${parseFloat(val).toFixed(1)} hrs/day`;
  calculateSavingsLive();
}

function calculateSavingsLive() {
  const wattInput = document.getElementById('wattageInput');
  const hoursInput = document.getElementById('hoursInput');
  if (!wattInput || !hoursInput) return;

  const w = Math.max(0, parseFloat(wattInput.value) || 0);
  const h = Math.max(0, parseFloat(hoursInput.value) || 0);

  const rate = typeof averageTariffRate !== 'undefined' ? averageTariffRate : 6.50;
  const factor = typeof co2Factor !== 'undefined' ? co2Factor : 0.75;

  const dailyKwh = (w * h) / 1000.0;
  const monthlyKwh = dailyKwh * 30.0;
  const yearlyKwh = dailyKwh * 365.0;

  const dailyInr = dailyKwh * rate;
  const monthlyInr = monthlyKwh * rate;
  const yearlyInr = yearlyKwh * rate;
  const yearlyCo2 = yearlyKwh * factor;
  const trees = (yearlyCo2 / 21.77).toFixed(1);

  // Update DOM elements if present
  const elDailyKwh = document.getElementById('resDailyKwh');
  if (elDailyKwh) {
    elDailyKwh.innerText = `${dailyKwh.toFixed(3)} kWh`;
    document.getElementById('resDailyInr').innerText = `₹${dailyInr.toFixed(2)}`;
    document.getElementById('resMonthlyKwh').innerText = `${monthlyKwh.toFixed(2)} kWh`;
    document.getElementById('resMonthlyInr').innerText = `₹${monthlyInr.toFixed(2)}`;
    document.getElementById('resYearlyKwh').innerText = `${yearlyKwh.toFixed(2)} kWh`;
    document.getElementById('resYearlyInr').innerText = `₹${yearlyInr.toFixed(2)}`;
    document.getElementById('resYearlyInr2').innerText = `₹${yearlyInr.toFixed(2)}`;
    document.getElementById('resYearlyCo2').innerText = `${yearlyCo2.toFixed(1)} kg CO₂`;
    document.getElementById('resTrees').innerText = `${trees} Trees`;
  }
}

// ---------------------------------------------------------------------------
// 2. Bill Simulator Functions (Tamil Nadu Slab Engine)
// ---------------------------------------------------------------------------
function calculateTNSlabBillJS(u) {
  if (u <= 0) return 0;
  let bill = 0;
  if (u > 0) bill += Math.min(u, 100) * 0.0;
  if (u > 100) bill += Math.min(u - 100, 100) * 2.25;
  if (u > 200) bill += Math.min(u - 200, 200) * 4.50;
  if (u > 400) bill += Math.min(u - 400, 100) * 6.00;
  if (u > 500) bill += (u - 500) * 8.00;
  return bill;
}

function updateSimCalculations() {
  const slAcB = document.getElementById('slAcBefore');
  if (!slAcB) return;

  // Read Slider Values
  const acB_hrs = parseFloat(slAcB.value);
  const acA_hrs = parseFloat(document.getElementById('slAcAfter').value);
  document.getElementById('lblAcBefore').innerText = `${acB_hrs.toFixed(1)} hrs/day`;
  document.getElementById('lblAcAfter').innerText = `${acA_hrs.toFixed(1)} hrs/day`;

  const fanB_hrs = parseFloat(document.getElementById('slFanBefore').value);
  const fanA_hrs = parseFloat(document.getElementById('slFanAfter').value);
  document.getElementById('lblFanBefore').innerText = `${fanB_hrs.toFixed(1)} hrs/day`;
  document.getElementById('lblFanAfter').innerText = `${fanA_hrs.toFixed(1)} hrs/day`;

  const lightB_hrs = parseFloat(document.getElementById('slLightBefore').value);
  const lightA_hrs = parseFloat(document.getElementById('slLightAfter').value);
  document.getElementById('lblLightBefore').innerText = `${lightB_hrs.toFixed(1)} hrs/day`;
  document.getElementById('lblLightAfter').innerText = `${lightA_hrs.toFixed(1)} hrs/day`;

  const pcB_hrs = parseFloat(document.getElementById('slPcBefore').value);
  const pcA_hrs = parseFloat(document.getElementById('slPcAfter').value);
  document.getElementById('lblPcBefore').innerText = `${pcB_hrs.toFixed(1)} hrs/day`;
  document.getElementById('lblPcAfter').innerText = `${pcA_hrs.toFixed(1)} hrs/day`;

  const geyserB_hrs = parseFloat(document.getElementById('slGeyserBefore').value);
  const geyserA_hrs = parseFloat(document.getElementById('slGeyserAfter').value);
  document.getElementById('lblGeyserBefore').innerText = `${geyserB_hrs.toFixed(2)} hrs/day`;
  document.getElementById('lblGeyserAfter').innerText = `${geyserA_hrs.toFixed(2)} hrs/day`;

  // Wattages
  // AC: 1500W Before (18°C) vs 950W After (24°C BEE Inverter)
  const kwh_ac_b = ((1500 * acB_hrs) / 1000) * 30;
  const kwh_ac_a = ((950 * acA_hrs) / 1000) * 30;

  // Fans: 2 units * 75W
  const kwh_fan_b = ((150 * fanB_hrs) / 1000) * 30;
  const kwh_fan_a = ((150 * fanA_hrs) / 1000) * 30;

  // Lights: 2 units * 40W
  const kwh_light_b = ((80 * lightB_hrs) / 1000) * 30;
  const kwh_light_a = ((80 * lightA_hrs) / 1000) * 30;

  // PC: 180W
  const kwh_pc_b = ((180 * pcB_hrs) / 1000) * 30;
  const kwh_pc_a = ((180 * pcA_hrs) / 1000) * 30;

  // Geyser: 1500W
  const kwh_geyser_b = ((1500 * geyserB_hrs) / 1000) * 30;
  const kwh_geyser_a = ((1500 * geyserA_hrs) / 1000) * 30;

  // Update Item Saving Badges
  document.getElementById('acSavingDisplay').innerText = `Saves ~${Math.max(0, kwh_ac_b - kwh_ac_a).toFixed(1)} kWh/mo`;
  document.getElementById('fanSavingDisplay').innerText = `Saves ~${Math.max(0, kwh_fan_b - kwh_fan_a).toFixed(1)} kWh/mo`;
  document.getElementById('lightSavingDisplay').innerText = `Saves ~${Math.max(0, kwh_light_b - kwh_light_a).toFixed(1)} kWh/mo`;
  document.getElementById('pcSavingDisplay').innerText = `Saves ~${Math.max(0, kwh_pc_b - kwh_pc_a).toFixed(1)} kWh/mo`;
  document.getElementById('geyserSavingDisplay').innerText = `Saves ~${Math.max(0, kwh_geyser_b - kwh_geyser_a).toFixed(1)} kWh/mo`;

  // Aggregate
  const total_kwh_b = kwh_ac_b + kwh_fan_b + kwh_light_b + kwh_pc_b + kwh_geyser_b;
  const total_kwh_a = kwh_ac_a + kwh_fan_a + kwh_light_a + kwh_pc_a + kwh_geyser_a;

  const bill_b = calculateTNSlabBillJS(total_kwh_b);
  const bill_a = calculateTNSlabBillJS(total_kwh_a);

  const kwh_saved = total_kwh_b - total_kwh_a;
  const inr_saved = bill_b - bill_a;
  const pct = total_kwh_b > 0 ? ((kwh_saved / total_kwh_b) * 100).toFixed(0) : 0;

  const annualInr = inr_saved * 12;
  const annualCo2 = kwh_saved * 12 * 0.75;
  const annualTrees = Math.round(annualCo2 / 21.77);

  // Update Output Box
  document.getElementById('simKwhBefore').innerText = `${total_kwh_b.toFixed(1)} kWh`;
  document.getElementById('simBillBefore').innerText = `₹${bill_b.toFixed(2)}`;
  document.getElementById('simKwhAfter').innerText = `${total_kwh_a.toFixed(1)} kWh`;
  document.getElementById('simBillAfter').innerText = `₹${bill_a.toFixed(2)}`;

  document.getElementById('simInrSaved').innerText = `₹${inr_saved.toFixed(2)} / month`;
  document.getElementById('simKwhSaved').innerText = `-${kwh_saved.toFixed(1)} kWh (-${pct}%)`;

  document.getElementById('simAnnualInr').innerText = `₹${annualInr.toFixed(2)} / year`;
  document.getElementById('simAnnualCo2').innerText = `${annualCo2.toFixed(1)} kg CO₂/yr`;
  document.getElementById('simAnnualTrees').innerText = `${annualTrees} Mature Trees`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('applianceSelect')) {
    calculateSavingsLive();
  }
  if (document.getElementById('slAcBefore')) {
    updateSimCalculations();
  }
});
