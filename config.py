"""
NexWatt Configuration File
Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology

All tariffs, points, emission factors, and caps are defined here.
Students can easily edit these values for their presentation or local tariffs.
"""

# Carbon emission factor (Central Electricity Authority / National standard)
# 1 kWh of electricity saved = 0.75 kg of CO2 avoided from Indian coal grid
CO2_FACTOR_KG_PER_KWH = 0.75

# Daily point system rules
DAILY_POINTS_CAP = 100       # Maximum points a user can earn in one day (prevents cheating)
VOUCH_BONUS_POINTS = 5       # Bonus points when a roommate vouches for your check-in
MYSTERY_BONUS_POINTS = 10    # Points per waster found in the NexWatt Mystery room

# Tamil Nadu Domestic Tariff Slabs (TANGEDCO Style)
# Slabs apply progressively:
#   0 - 100 units: Free (Rs 0.00)
# 101 - 200 units: Rs 2.25 per unit
# 201 - 400 units: Rs 4.50 per unit
# 401 - 500 units: Rs 6.00 per unit
# Above 500 units: Rs 8.00 per unit
TAMIL_NADU_TARIFF = {
    "currency_symbol": "₹",
    "name": "Tamil Nadu Domestic (TANGEDCO Slabs)",
    "slabs": [
        {"max": 100, "rate": 0.00, "label": "0 - 100 units (Subsidized Free)"},
        {"max": 200, "rate": 2.25, "label": "101 - 200 units (₹2.25/unit)"},
        {"max": 400, "rate": 4.50, "label": "201 - 400 units (₹4.50/unit)"},
        {"max": 500, "rate": 6.00, "label": "401 - 500 units (₹6.00/unit)"},
        {"max": float("inf"), "rate": 8.00, "label": "Above 500 units (₹8.00/unit)"}
    ],
    # Blended flat rate fallback for quick individual appliance calculations
    "average_rate_per_kwh": 6.50
}

# Garden Evolution Stages based on cumulative points
GARDEN_STAGES = [
    {"stage": 1, "name": "Dorm Seed",    "min_pts": 0,   "max_pts": 99,  "desc": "Just planted your conservation seed in Room 304."},
    {"stage": 2, "name": "Green Sprout", "min_pts": 100, "max_pts": 249, "desc": "Small leaves emerging from consistent daily habits."},
    {"stage": 3, "name": "Hostel Plant", "min_pts": 250, "max_pts": 499, "desc": "Healthy potted plant soaking in saved kilowatt-hours."},
    {"stage": 4, "name": "Canopy Tree",  "min_pts": 500, "max_pts": 899, "desc": "Sturdy shade tree shielding the campus microgrid."},
    {"stage": 5, "name": "Zen Garden",   "min_pts": 900, "max_pts": 9999,"desc": "A flourishing biophilic sanctuary with solar blossoms."}
]

# Standard appliance database for the Savings Calculator
APPLIANCE_DEFAULTS = [
    {"id": "fan",      "name": "Ceiling Fan (Standard Induction)", "wattage": 75,   "category": "Hostel Room",  "default_hours": 6},
    {"id": "fan_bldc", "name": "Ceiling Fan (5-Star BLDC)",        "wattage": 28,   "category": "Hostel Room",  "default_hours": 6},
    {"id": "ac_18",    "name": "Hostel Split AC (Set at 18°C)",     "wattage": 1500, "category": "Cooling",      "default_hours": 4},
    {"id": "ac_24",    "name": "Hostel Split AC (Set at 24°C BEE)", "wattage": 950,  "category": "Cooling",      "default_hours": 4},
    {"id": "laptop",   "name": "Laptop Charger / Adapter",          "wattage": 65,   "category": "Electronics",  "default_hours": 5},
    {"id": "phone",    "name": "Mobile Charger Left in Socket",     "wattage": 8,    "category": "Vampire Load", "default_hours": 12},
    {"id": "tube",     "name": "Fluorescent Tube Light (T8)",       "wattage": 40,   "category": "Lighting",     "default_hours": 5},
    {"id": "led",      "name": "LED Tube Light Batten",             "wattage": 18,   "category": "Lighting",     "default_hours": 5},
    {"id": "geyser",   "name": "Immersion Water Heater / Geyser",   "wattage": 1500, "category": "Bathroom",     "default_hours": 1},
    {"id": "pc",       "name": "Gaming Desktop & Monitor (Idle)",   "wattage": 180,  "category": "Electronics",  "default_hours": 4},
    {"id": "tv",       "name": "Hostel Common Room TV on Standby",  "wattage": 20,   "category": "Vampire Load", "default_hours": 18}
]

# Rotating daily tips tailored for hostel students
DAILY_TIPS = [
    "Hostel Life Hack: Keeping your AC at 24°C instead of 18°C cuts your room's cooling electricity by ~36% without losing comfort!",
    "Mess Time Rule: Before running for lunch or dinner, flip the master fan switch. 150 hostel rooms doing this saves 11.2 kWh every meal!",
    "Exam Night Tip: Use a focused 7W LED desk lamp instead of lighting up the entire room with two 40W tube lights while cramming.",
    "Phantom Power Alert: If your phone charger brick feels warm even when your phone isn't connected, it's draining 5-8W 24/7.",
    "Bucket Bath Wisdom: An immersion rod left heating for 25 minutes boils away 0.6 kWh. 8 minutes is all you need for warm water.",
    "Lab Day Habit: Put your desktop PC into 'Hibernate' instead of 'Sleep' before heading to class — Hibernate uses ZERO standby power."
]
