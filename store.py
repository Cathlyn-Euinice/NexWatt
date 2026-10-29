"""
NexWatt In-Memory Data Store & Persistence Module
Handles all application state with beginner-friendly functions and optional JSON backup.
No database configuration needed — runs instantly!
"""

import os
import json
import copy
from datetime import datetime, timedelta
import config

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DATA_FILE = os.path.join(DATA_DIR, "store.json")

# Initial realistic demo data for Dexathon 2026 presentation
INITIAL_STATE = {
    "user": {
        "name": "Arun Kumar",
        "room": "Room 304, Block A",
        "hostel": "Nelson Mandela Hostel - Sathyabama",
        "points": 345,
        "streak_days": 5,
        "last_checkin_date": (datetime.now() - timedelta(days=0)).strftime("%Y-%m-%d"),
        "today_points": 35,
        "total_kwh_saved": 52.4,
        "total_inr_saved": 393.00,
        "co2_avoided_kg": round(52.4 * config.CO2_FACTOR_KG_PER_KWH, 2),
        "current_team_id": "team_block_a"
    },
    # Last 7 days history for Chart.js line graph
    "seven_day_history": [
        {"day": "Mon", "kwh": 6.2, "inr": 46.5, "points": 45},
        {"day": "Tue", "kwh": 7.8, "inr": 58.5, "points": 55},
        {"day": "Wed", "kwh": 8.1, "inr": 60.75, "points": 60},
        {"day": "Thu", "kwh": 6.9, "inr": 51.75, "points": 50},
        {"day": "Fri", "kwh": 9.4, "inr": 70.5, "points": 70},
        {"day": "Sat", "kwh": 8.5, "inr": 63.75, "points": 65},
        {"day": "Sun", "kwh": 5.5, "inr": 41.25, "points": 35}
    ],
    # Daily self-reported habits
    "habits": [
        {
            "id": "h_fan",
            "title": "Turned off fan before rushing to mess / class",
            "scenario": "Hostel Room Routine",
            "kwh": 0.40,
            "points": 20,
            "icon": "fan",
            "completed_today": True,
            "vouch_count": 2,
            "last_vouched_by": ["Karthik", "Vignesh"]
        },
        {
            "id": "h_ac24",
            "title": "Kept room AC at 24°C BEE standard (not 18°C chill)",
            "scenario": "Exam Night Cooling",
            "kwh": 1.50,
            "points": 35,
            "icon": "ac",
            "completed_today": False,
            "vouch_count": 0,
            "last_vouched_by": []
        },
        {
            "id": "h_charger",
            "title": "Unplugged laptop & mobile chargers after 100%",
            "scenario": "Phantom Load Slayer",
            "kwh": 0.15,
            "points": 15,
            "icon": "plug",
            "completed_today": True,
            "vouch_count": 1,
            "last_vouched_by": ["Karthik"]
        },
        {
            "id": "h_daylight",
            "title": "Studied with natural window daylight instead of tubes",
            "scenario": "Afternoon Study Session",
            "kwh": 0.30,
            "points": 15,
            "icon": "sun",
            "completed_today": False,
            "vouch_count": 0,
            "last_vouched_by": []
        },
        {
            "id": "h_pc_shutdown",
            "title": "Full PC shutdown overnight (Hibernate/Off, not Sleep)",
            "scenario": "Post-Gaming / Lab Render",
            "kwh": 0.90,
            "points": 25,
            "icon": "pc",
            "completed_today": False,
            "vouch_count": 0,
            "last_vouched_by": []
        },
        {
            "id": "h_geyser",
            "title": "Turned off immersion rod after 8-min bucket warming",
            "scenario": "Morning Routine",
            "kwh": 1.20,
            "points": 30,
            "icon": "geyser",
            "completed_today": False,
            "vouch_count": 0,
            "last_vouched_by": []
        }
    ],
    # Power Pact Teams (Hostel Wings)
    "teams": [
        {
            "id": "team_block_a",
            "name": "Nelson Mandela - Block A",
            "code": "NMA26",
            "motto": "Block A Zero-Waste Guardians",
            "target_kwh": 250,
            "achieved_kwh": 182.4,
            "members": [
                {"name": "Arun Kumar (You)", "room": "304", "pts": 345, "kwh": 52.4},
                {"name": "Karthik R.",         "room": "302", "pts": 310, "kwh": 46.8},
                {"name": "Vignesh S.",         "room": "305", "pts": 285, "kwh": 43.2},
                {"name": "Preethi M.",         "room": "310", "pts": 260, "kwh": 40.0}
            ],
            "feed": [
                {"user": "Arun Kumar", "action": "Turned off fan before mess", "time": "15 mins ago", "id": "feed_1", "vouches": 2},
                {"user": "Karthik R.", "action": "AC set to 24°C for night study", "time": "2 hrs ago", "id": "feed_2", "vouches": 3},
                {"user": "Vignesh S.", "action": "Unplugged gaming rig overnight", "time": "4 hrs ago", "id": "feed_3", "vouches": 1}
            ]
        },
        {
            "id": "team_block_b",
            "name": "Kalpana Chawla - Block B",
            "code": "KCB26",
            "motto": "Kilowatt Queens of Block B",
            "target_kwh": 250,
            "achieved_kwh": 168.0,
            "members": [
                {"name": "Divya N.",  "room": "204", "pts": 330, "kwh": 49.5},
                {"name": "Sneha P.",  "room": "206", "pts": 290, "kwh": 44.0},
                {"name": "Ananya K.", "room": "208", "pts": 275, "kwh": 41.5},
                {"name": "Pooja V.",  "room": "212", "pts": 220, "kwh": 33.0}
            ],
            "feed": [
                {"user": "Divya N.", "action": "Daylight study session in library wing", "time": "1 hr ago", "id": "feed_4", "vouches": 2}
            ]
        },
        {
            "id": "team_block_c",
            "name": "Vikram Sarabhai - Block C",
            "code": "VSC26",
            "motto": "Engineering Efficiency First",
            "target_kwh": 200,
            "achieved_kwh": 124.5,
            "members": [
                {"name": "Rahul M.", "room": "401", "pts": 280, "kwh": 42.0},
                {"name": "Surya T.", "room": "405", "pts": 270, "kwh": 40.5},
                {"name": "Ajay K.",  "room": "408", "pts": 280, "kwh": 42.0}
            ],
            "feed": [
                {"user": "Rahul M.", "action": "Switched common room TV wall switch off", "time": "3 hrs ago", "id": "feed_5", "vouches": 1}
            ]
        }
    ],
    # NexWatt Mystery wasters in room scene
    "mystery_wasters": [
        {
            "id": "w_fan",
            "title": "Induction Fan in Empty Room",
            "location": "Ceiling Center",
            "x": 48, "y": 18,
            "wattage": 75,
            "monthly_inr_waste": 146.25,
            "monthly_kwh_waste": 22.5,
            "found": False,
            "tip": "Fans only cool people through skin convection, NOT empty room air. Turn it off when leaving!"
        },
        {
            "id": "w_tv",
            "title": "Common Room TV Blinking on Standby",
            "location": "Entertainment Table",
            "x": 80, "y": 55,
            "wattage": 20,
            "monthly_inr_waste": 58.50,
            "monthly_kwh_waste": 9.0,
            "found": False,
            "tip": "Standby transformers eat electricity 24/7. Switch off directly at the wall board."
        },
        {
            "id": "w_light",
            "title": "Bright Tube Light ON in Broad Daylight",
            "location": "Upper Left Wall",
            "x": 22, "y": 24,
            "wattage": 40,
            "monthly_inr_waste": 78.00,
            "monthly_kwh_waste": 12.0,
            "found": False,
            "tip": "Pull back curtains during 9 AM - 4 PM. Daylight is 100% free and better for your eyes."
        },
        {
            "id": "w_charger",
            "title": "Phone Charger Plugged In with Switch ON",
            "location": "Bedside Socket",
            "x": 16, "y": 72,
            "wattage": 8,
            "monthly_inr_waste": 31.20,
            "monthly_kwh_waste": 4.8,
            "found": False,
            "tip": "Even without a phone, charging adapters bleed vampire draw if the wall switch is ON."
        },
        {
            "id": "w_pc",
            "title": "Gaming Desktop in Sleep Mode with RGB Glowing",
            "location": "Study Desk",
            "x": 45, "y": 68,
            "wattage": 35,
            "monthly_inr_waste": 91.00,
            "monthly_kwh_waste": 14.0,
            "found": False,
            "tip": "Sleep mode keeps motherboard RAM energized. Use Hibernate to cut power to zero."
        },
        {
            "id": "w_geyser",
            "title": "Bathroom Immersion Rod Boiling Water Past Ready",
            "location": "Bathroom Doorway",
            "x": 90, "y": 75,
            "wattage": 1500,
            "monthly_inr_waste": 292.50,
            "monthly_kwh_waste": 45.0,
            "found": False,
            "tip": "High-draw heating coils eat ₹5 every 30 minutes! Unplug immediately once water is warm."
        }
    ],
    # User Badges & Achievements
    "badges": [
        {
            "id": "b_streak7",
            "title": "7-Day Streak Warrior",
            "desc": "Check in electricity-saving habits 7 days in a row.",
            "icon": "flame",
            "earned": False,
            "progress": "5 / 7 days"
        },
        {
            "id": "b_standby",
            "title": "Standby Slayer",
            "desc": "Find and neutralize all vampire wasters in NexWatt Mystery.",
            "icon": "sword",
            "earned": True,
            "progress": "Completed"
        },
        {
            "id": "b_century",
            "title": "Century Saver (100 kWh)",
            "desc": "Accumulate 100 kWh of verified energy conservation.",
            "icon": "trophy",
            "earned": False,
            "progress": "52.4 / 100 kWh"
        },
        {
            "id": "b_pact",
            "title": "Pact Pioneer",
            "desc": "Join or create a hostel squad to compete together.",
            "icon": "shield",
            "earned": True,
            "progress": "Active in Block A"
        },
        {
            "id": "b_greenthumb",
            "title": "Hostel Green Thumb",
            "desc": "Evolve your Energy Impact Garden to Stage 3 or higher.",
            "icon": "sprout",
            "earned": True,
            "progress": "Stage 3 (Hostel Plant)"
        },
        {
            "id": "b_daylight",
            "title": "Sunlight Scholar",
            "desc": "Log the natural daylight study habit at least 5 times.",
            "icon": "sun",
            "earned": False,
            "progress": "3 / 5 times"
        }
    ],
    # Bill Comparison history
    "bill_comparison_history": [
        {
            "month_label": "September 2026 vs October 2026",
            "prev_units": 260,
            "curr_units": 195,
            "kwh_saved": 65,
            "inr_saved": 395.0,
            "percentage_drop": 25.0,
            "note": "Kept below 200 units threshold! Avoided higher slab."
        }
    ]
}

# In-memory working copy
STATE = copy.deepcopy(INITIAL_STATE)

def get_state():
    """Return the current global application state."""
    return STATE

def reset_to_demo():
    """Reset the application state to pristine demo mode."""
    global STATE
    STATE = copy.deepcopy(INITIAL_STATE)
    save_to_disk()
    return STATE

def save_to_disk():
    """Save in-memory state to disk so it survives server reloads."""
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(STATE, f, indent=2)
    except Exception as e:
        print(f"[Store] Warning: Could not save store to disk: {e}")

def load_from_disk():
    """Load state from disk if exists, else keep default INITIAL_STATE."""
    global STATE
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                STATE = loaded
                print("[Store] Loaded saved state from disk.")
                return STATE
        except Exception as e:
            print(f"[Store] Could not load saved state, using default: {e}")
    STATE = copy.deepcopy(INITIAL_STATE)
    return STATE

# Load on module import
load_from_disk()
