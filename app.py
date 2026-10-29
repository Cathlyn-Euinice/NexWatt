"""
NexWatt - Flask Web Application
Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology
Theme: Open Innovation (Software Only)

A clean, beginner-friendly Flask application designed for students and judges.
Runs easily on localhost with:
    flask run
or:
    python app.py
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import random
from datetime import datetime
import config
import store
import tariff

app = Flask(__name__)
# Secret key for session security
app.secret_key = "nexwatt_dexathon_2026_the_logic_lords"


# ---------------------------------------------------------------------------
# Helper Context Processor
# Injects global variables (tariff info, tips, user stats) into every HTML template
# ---------------------------------------------------------------------------
@app.context_processor
def inject_global_data():
    state = store.get_state()
    user = state["user"]
    garden_info = tariff.get_garden_stage_info(user["points"])
    daily_tip = random.choice(config.DAILY_TIPS)

    return {
        "user": user,
        "garden": garden_info,
        "daily_tip": daily_tip,
        "config": config,
        "active_team": next((t for t in state["teams"] if t["id"] == user.get("current_team_id")), None)
    }


# ---------------------------------------------------------------------------
# Route: Dashboard (Home)
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    state = store.get_state()
    garden_info = tariff.get_garden_stage_info(state["user"]["points"])
    
    return render_template(
        "index.html",
        history=state["seven_day_history"],
        habits=state["habits"],
        garden=garden_info,
        user=state["user"]
    )


# ---------------------------------------------------------------------------
# Route: Savings Calculator
# ---------------------------------------------------------------------------
@app.route("/calculator")
def calculator():
    state = store.get_state()
    return render_template(
        "calculator.html",
        appliances=config.APPLIANCE_DEFAULTS,
        tariff=config.TAMIL_NADU_TARIFF
    )


@app.route("/api/calculator/calculate", methods=["POST"])
def api_calculate_savings():
    data = request.get_json() or {}
    wattage = float(data.get("wattage", 100))
    hours = float(data.get("hours", 4))
    
    result = tariff.calculate_appliance_savings(wattage, hours)
    return jsonify({"success": True, "result": result})


# ---------------------------------------------------------------------------
# Route: Daily Habit Check-in
# ---------------------------------------------------------------------------
@app.route("/habits")
def habits():
    state = store.get_state()
    return render_template(
        "habits.html",
        habits=state["habits"],
        user=state["user"],
        daily_cap=config.DAILY_POINTS_CAP
    )


@app.route("/api/habits/toggle", methods=["POST"])
def api_toggle_habit():
    data = request.get_json() or {}
    habit_id = data.get("habit_id")

    state = store.get_state()
    user = state["user"]

    target_habit = next((h for h in state["habits"] if h["id"] == habit_id), None)
    if not target_habit:
        return jsonify({"success": False, "message": "Habit not found."}), 404

    # Toggle the completion status
    target_habit["completed_today"] = not target_habit["completed_today"]
    is_now_done = target_habit["completed_today"]

    pts = target_habit["points"]
    kwh = target_habit["kwh"]

    if is_now_done:
        # Check daily points cap to prevent student over-reporting / cheating
        points_to_award = pts
        capped_notice = False
        if user["today_points"] + pts > config.DAILY_POINTS_CAP:
            points_to_award = max(0, config.DAILY_POINTS_CAP - user["today_points"])
            capped_notice = True

        user["today_points"] += points_to_award
        user["points"] += points_to_award
        user["total_kwh_saved"] = round(user["total_kwh_saved"] + kwh, 2)
        user["total_inr_saved"] = round(user["total_kwh_saved"] * config.TAMIL_NADU_TARIFF["average_rate_per_kwh"], 2)
        user["co2_avoided_kg"] = round(user["total_kwh_saved"] * config.CO2_FACTOR_KG_PER_KWH, 2)

        # Update current team's contribution if user is in a team
        team = next((t for t in state["teams"] if t["id"] == user.get("current_team_id")), None)
        if team:
            team["achieved_kwh"] = round(team["achieved_kwh"] + kwh, 2)

        msg = f"Logged '{target_habit['title']}'! +{points_to_award} points awarded."
        if capped_notice:
            msg += f" (Daily cap of {config.DAILY_POINTS_CAP} pts reached for today)."
    else:
        # User un-checked the habit
        user["today_points"] = max(0, user["today_points"] - pts)
        user["points"] = max(0, user["points"] - pts)
        user["total_kwh_saved"] = round(max(0.0, user["total_kwh_saved"] - kwh), 2)
        user["total_inr_saved"] = round(user["total_kwh_saved"] * config.TAMIL_NADU_TARIFF["average_rate_per_kwh"], 2)
        user["co2_avoided_kg"] = round(user["total_kwh_saved"] * config.CO2_FACTOR_KG_PER_KWH, 2)

        team = next((t for t in state["teams"] if t["id"] == user.get("current_team_id")), None)
        if team:
            team["achieved_kwh"] = round(max(0.0, team["achieved_kwh"] - kwh), 2)

        msg = f"Unchecked '{target_habit['title']}'."

    store.save_to_disk()
    garden_info = tariff.get_garden_stage_info(user["points"])

    return jsonify({
        "success": True,
        "message": msg,
        "completed": is_now_done,
        "user": user,
        "garden": garden_info
    })


# ---------------------------------------------------------------------------
# Route: Energy Impact Garden (Visual Showcase)
# ---------------------------------------------------------------------------
@app.route("/garden")
def garden():
    state = store.get_state()
    garden_info = tariff.get_garden_stage_info(state["user"]["points"])
    
    # Calculate real-world ecological equivalents
    kwh = state["user"]["total_kwh_saved"]
    trees_equivalent = round((kwh * config.CO2_FACTOR_KG_PER_KWH) / 21.77, 1) # 1 tree absorbs ~21.77 kg/yr
    water_liters_saved = round(kwh * 7.2, 0) # ~7.2 L of powerplant cooling water saved per kWh
    km_driving_avoided = round(kwh * 3.3, 1) # petrol car tailpipe equivalent

    return render_template(
        "garden.html",
        garden=garden_info,
        user=state["user"],
        trees=trees_equivalent,
        water=water_liters_saved,
        km=km_driving_avoided
    )


# ---------------------------------------------------------------------------
# Route: NexWatt Mystery (Room Game)
# ---------------------------------------------------------------------------
@app.route("/mystery")
def mystery():
    state = store.get_state()
    return render_template(
        "mystery.html",
        wasters=state["mystery_wasters"],
        user=state["user"]
    )


@app.route("/api/mystery/reveal", methods=["POST"])
def api_reveal_waster():
    data = request.get_json() or {}
    waster_id = data.get("waster_id")

    state = store.get_state()
    waster = next((w for w in state["mystery_wasters"] if w["id"] == waster_id), None)
    if not waster:
        return jsonify({"success": False, "message": "Waster not found."}), 404

    is_new = not waster.get("found", False)
    waster["found"] = True

    # Award bonus points on first discovery
    if is_new:
        state["user"]["points"] += config.MYSTERY_BONUS_POINTS
        store.save_to_disk()

    # Check if all wasters found
    all_found = all(w.get("found", False) for w in state["mystery_wasters"])
    if all_found:
        # Unlock Standby Slayer badge
        for b in state["badges"]:
            if b["id"] == "b_standby":
                b["earned"] = True

    store.save_to_disk()

    return jsonify({
        "success": True,
        "waster": waster,
        "is_new": is_new,
        "all_found": all_found,
        "points_awarded": config.MYSTERY_BONUS_POINTS if is_new else 0,
        "total_points": state["user"]["points"]
    })


@app.route("/api/mystery/reset", methods=["POST"])
def api_reset_mystery():
    state = store.get_state()
    for w in state["mystery_wasters"]:
        w["found"] = False
    store.save_to_disk()
    return jsonify({"success": True, "message": "Mystery room reset for another round!"})


# ---------------------------------------------------------------------------
# Route: Power Pact (Inter-Hostel Squads)
# ---------------------------------------------------------------------------
@app.route("/pact")
def pact():
    state = store.get_state()
    user = state["user"]
    teams = state["teams"]
    active_team = next((t for t in teams if t["id"] == user.get("current_team_id")), teams[0])

    # Rank teams by total kWh saved
    ranked_teams = sorted(teams, key=lambda t: t["achieved_kwh"], reverse=True)

    return render_template(
        "pact.html",
        teams=ranked_teams,
        active_team=active_team,
        user=user
    )


@app.route("/api/pact/join", methods=["POST"])
def api_join_team():
    data = request.get_json() or {}
    join_code = data.get("code", "").strip().upper()

    state = store.get_state()
    team = next((t for t in state["teams"] if t["code"] == join_code), None)

    if not team:
        return jsonify({"success": False, "message": f"No team found with join code '{join_code}'."}), 404

    state["user"]["current_team_id"] = team["id"]

    # Check if user already listed in team members
    user_name = state["user"]["name"]
    already_member = any(user_name in m["name"] for m in team["members"])
    if not already_member:
        team["members"].append({
            "name": f"{user_name} (You)",
            "room": state["user"]["room"],
            "pts": state["user"]["points"],
            "kwh": state["user"]["total_kwh_saved"]
        })

    # Unlock Pact Pioneer badge
    for b in state["badges"]:
        if b["id"] == "b_pact":
            b["earned"] = True

    store.save_to_disk()
    return jsonify({"success": True, "message": f"Successfully joined squad: {team['name']}!", "team": team})


@app.route("/api/pact/create", methods=["POST"])
def api_create_team():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    motto = data.get("motto", "").strip() or "Sathyabama Energy Protectors"
    target = float(data.get("target_kwh", 200))

    if not name:
        return jsonify({"success": False, "message": "Team name cannot be empty."}), 400

    state = store.get_state()
    # Generate 5-character join code
    code = f"{name[:3].upper()}{random.randint(20, 99)}"
    new_id = f"team_{len(state['teams']) + 1}"

    new_team = {
        "id": new_id,
        "name": name,
        "code": code,
        "motto": motto,
        "target_kwh": target,
        "achieved_kwh": state["user"]["total_kwh_saved"],
        "members": [
            {
                "name": f"{state['user']['name']} (Captain)",
                "room": state["user"]["room"],
                "pts": state["user"]["points"],
                "kwh": state["user"]["total_kwh_saved"]
            }
        ],
        "feed": [
            {
                "user": state["user"]["name"],
                "action": f"Founded the squad '{name}'!",
                "time": "Just now",
                "id": f"feed_new_{random.randint(100, 999)}",
                "vouches": 1
            }
        ]
    }

    state["teams"].append(new_team)
    state["user"]["current_team_id"] = new_id

    for b in state["badges"]:
        if b["id"] == "b_pact":
            b["earned"] = True

    store.save_to_disk()
    return jsonify({"success": True, "message": f"Squad '{name}' created with Join Code: {code}!", "team": new_team})


@app.route("/api/pact/vouch", methods=["POST"])
def api_vouch_feed():
    data = request.get_json() or {}
    feed_id = data.get("feed_id")

    state = store.get_state()
    found_item = None
    for team in state["teams"]:
        for item in team.get("feed", []):
            if item["id"] == feed_id:
                item["vouches"] = item.get("vouches", 0) + 1
                found_item = item
                break

    if found_item:
        # Give user a small teamwork bonus
        state["user"]["points"] += config.VOUCH_BONUS_POINTS
        store.save_to_disk()
        return jsonify({
            "success": True,
            "message": f"Vouched for {found_item['user']}! +{config.VOUCH_BONUS_POINTS} teamwork points.",
            "vouches": found_item["vouches"]
        })

    return jsonify({"success": False, "message": "Activity not found."}), 404


# ---------------------------------------------------------------------------
# Route: Bill Simulator
# ---------------------------------------------------------------------------
@app.route("/simulator")
def simulator():
    return render_template(
        "simulator.html",
        tariff=config.TAMIL_NADU_TARIFF
    )


@app.route("/api/simulator/simulate", methods=["POST"])
def api_simulate_bill():
    data = request.get_json() or {}
    appliances = data.get("appliances", [])
    result = tariff.calculate_bill_simulation(appliances)
    return jsonify({"success": True, "result": result})


# ---------------------------------------------------------------------------
# Route: Bill Comparison (Month-to-Month)
# ---------------------------------------------------------------------------
@app.route("/comparison")
def comparison():
    state = store.get_state()
    return render_template(
        "comparison.html",
        history=state.get("bill_comparison_history", []),
        tariff=config.TAMIL_NADU_TARIFF
    )


@app.route("/api/comparison/calculate", methods=["POST"])
def api_compare_bills():
    data = request.get_json() or {}
    prev_units = float(data.get("prev_units", 250))
    curr_units = float(data.get("curr_units", 200))
    month_label = data.get("month_label", "Latest Month Comparison")

    result = tariff.compare_monthly_bills(prev_units, curr_units)

    # Save to history
    state = store.get_state()
    entry = {
        "month_label": month_label,
        "prev_units": prev_units,
        "curr_units": curr_units,
        "kwh_saved": result["kwh_saved"],
        "inr_saved": result["inr_saved"],
        "percentage_drop": result["percentage_change"],
        "note": result["feedback"]
    }
    state["bill_comparison_history"].insert(0, entry)
    store.save_to_disk()

    return jsonify({"success": True, "result": result, "entry": entry})


# ---------------------------------------------------------------------------
# Route: Badges & Achievements
# ---------------------------------------------------------------------------
@app.route("/badges")
def badges():
    state = store.get_state()
    return render_template(
        "badges.html",
        badges=state["badges"],
        user=state["user"]
    )


# ---------------------------------------------------------------------------
# Route: Reset Demo Data
# ---------------------------------------------------------------------------
@app.route("/api/reset-demo", methods=["POST"])
def api_reset_demo():
    new_state = store.reset_to_demo()
    return jsonify({"success": True, "message": "Demo data restored to pristine state!"})


# ---------------------------------------------------------------------------
# Local Server Execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  ⚡ NexWatt - The Logic Lords - Dexathon 2026")
    print("  🏫 Sathyabama Institute of Science and Technology")
    print("  🌐 Running locally at: http://127.0.0.1:5050")
    print("=" * 60 + "\n")
    app.run(host="0.0.0.0", port=5050, debug=True)
