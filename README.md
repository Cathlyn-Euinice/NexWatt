# ⚡ NexWatt | Student Energy Intelligence & Conservation Platform

> **Dexathon 2026** — Sathyabama Institute of Science and Technology  
> **Team Name:** The Logic Lords  
> **Theme:** Open Innovation (Software Track Only)  
> **Strict Rule:** 100% Software. No external hardware, sensors, IoT, or smart plugs. All data is driven by student inputs, sliders, checklists, and simulation.

---

## 🎯 Purpose
NexWatt helps students (especially hostel residents in campus dorms like Nelson Mandela Block A and Kalpana Chawla Block B) and households identify unnoticed electricity-wasting habits and see the exact energy (kWh) and money (₹) they can save under Tamil Nadu (TANGEDCO) progressive slab tariffs.

---

## 🚀 How to Run the Project

### Option 1: Using `flask run` (Official Flask CLI)
```bash
cd /Users/harish/Documents/NexWatt
export FLASK_APP=app.py
export FLASK_RUN_PORT=5050
flask run
```

### Option 2: Using Python directly
```bash
cd /Users/harish/Documents/NexWatt
python3 app.py
```

Then open your browser at:
👉 **`http://localhost:5050`** or **`http://127.0.0.1:5050`**

---

## 📁 Folder Structure

```
NexWatt/
├── config.py             # Single configuration file: Tamil Nadu tariff slabs, points rules, CO2 factor, daily caps
├── store.py              # In-memory data store with JSON persistence & demo data reset
├── tariff.py             # Pure calculation logic (TANGEDCO slabs, appliance math, garden stages)
├── app.py                # Main Flask application with clean beginner-friendly routes and API endpoints
├── requirements.txt      # Python dependencies (Flask>=3.0.0)
├── README.md             # Project documentation & Hackathon judge defense guide
├── data/
│   └── store.json        # Auto-saved working state (persists across server restarts)
├── templates/
│   ├── base.html         # Global layout: navbar, lightning-leaf logo, daily campus tip, footer
│   ├── index.html        # Main dashboard with 7-day Chart.js line graph and KPI summary
│   ├── calculator.html   # Savings Calculator with appliance presets & Tamil Nadu slab table
│   ├── habits.html       # Daily Habit Check-in with anti-cheat cap & peer vouches
│   ├── garden.html       # Energy Impact Garden with hand-drawn SVG stages & ecological equivalents
│   ├── mystery.html      # NexWatt Mystery 45-second detective room game
│   ├── pact.html         # Power Pact inter-hostel league (Block A vs Block B) & peer confirmation
│   ├── simulator.html    # Bill Simulator with before vs after appliance runtime sliders
│   ├── comparison.html   # Month-to-month utility bill comparison from actual meter units
│   └── badges.html       # Achievements & Badges (Streak, Standby Slayer, Century Saver)
└── static/
    ├── css/
    │   └── style.css     # Custom dark navy (#090e1a), electric yellow (#facc15), leaf green (#22c55e)
    └── js/
        ├── main.js       # Toast notifications, habit toggles, demo reset
        ├── dashboard.js  # Chart.js 7-day trajectory line graph
        ├── mystery.js    # 45-second detective room countdown timer & leak math
        └── simulator.js  # Real-time slider reactions & Tamil Nadu slab calculations
```

---

## 💡 "How It Works" (Feature Logic for Hackathon Judges)

### 1. Dashboard & 7-Day Chart
* **Logic:** Aggregates verified energy savings from daily habit check-ins and mystery room discoveries. Displays a 7-day rolling Chart.js line curve comparing daily kilowatt-hour reductions.
* **CO₂ Formula:** Every 1 kWh saved is multiplied by `0.75 kg CO₂/kWh` (official Central Electricity Authority national grid factor).

### 2. Savings Calculator
* **Logic:** Calculates `Daily kWh = (Wattage × Wasted Hours) / 1,000`. Extrapolates to monthly (`× 30`) and annual (`× 365`) savings using the blended rate of `₹6.50 / kWh`.
* **Tariff Reference:** Displays the full Tamil Nadu TANGEDCO progressive slab brackets (first 100 units free, up to ₹8.00/unit above 500 units) so users understand non-linear utility pricing.

### 3. Daily Habit Check-in & Anti-Cheat Cap
* **Logic:** Users self-report everyday student actions (fan off before mess, AC at 24°C, unplugging phone chargers).
* **Anti-Cheat Cap:** Imposes a strict `100 points/day` maximum cap in `config.py` so dishonest users cannot spam all checkboxes in one sitting to rig the leaderboard.

### 4. Energy Impact Garden
* **Logic:** Translates abstract kilowatt-hours into a visual living terrarium that evolves through 5 stages (Seed → Sprout → Plant → Tree → Zen Garden) as the user accumulates points.
* **Hand-Drawn Art:** Built with bespoke organic SVGs (curved stems, clay pots, glowing sun rays, fireflies) rather than generic emojis.

### 5. NexWatt Mystery (Interactive Room Game)
* **Logic:** A simulated hostel dorm room with 6 pulsating hotspots (idle fan, standby TV, daytime tube light, plugged-in charger, gaming PC sleep mode, idling geyser).
* **Game Mechanic:** A 45-second countdown timer challenges students to click and neutralize wasters, displaying the monthly Rupees leaking from their dorm room.

### 6. Power Pact & Peer Confirmation
* **Logic:** Groups roommates into hostel squads (Nelson Mandela Block A vs Kalpana Chawla Block B vs Vikram Sarabhai Block C) with a shared collective kWh goal.
* **Peer Vouching:** Roommates click "👍 Vouch Check-in" on each other's habit logs, granting `+5 bonus teamwork points` and providing social proof instead of intrusive hardware sensors.

### 7. Bill Simulator
* **Logic:** Provides interactive sliders for typical hostel appliances. Simultaneously computes progressive Tamil Nadu slab bills for the 'Before' (wasteful) hours and 'After' (optimized) hours.
* **Slab Leap Effect:** Visually demonstrates how dropping from 492 units to 250 units avoids the punitive ₹6.00 and ₹4.50 high-tier slabs, cutting the bill by over 70%.

### 8. Bill Comparison
* **Logic:** Users enter actual meter units from two consecutive monthly electricity bills. Calculates unit difference, bill difference via TANGEDCO progressive slabs, percentage drop, and gives positive reinforcement.

### 9. Badges & Demo Mode
* **Logic:** Unlocks achievement cards (7-Day Streak, Standby Slayer, Century Saver) based on stored milestones.
* **Demo Reset:** A single click on the "🔄 Demo Reset" button in the navbar reloads a rich pre-configured presentation state with sample users, teams, and 7 days of historical chart data.

---

## ⚙️ Configuration (`config.py`)
All parameters are centralized in `config.py` for effortless tweaking:
* `CO2_FACTOR_KG_PER_KWH = 0.75`
* `DAILY_POINTS_CAP = 100`
* `VOUCH_BONUS_POINTS = 5`
* `TAMIL_NADU_TARIFF` (all 5 progressive slabs)
* `GARDEN_STAGES` (point thresholds for each plant stage)
