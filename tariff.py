"""
NexWatt Tariff & Energy Calculation Module
Dexathon 2026 - The Logic Lords - Sathyabama Institute of Science and Technology

All formulas are kept straightforward and clean so students can easily
explain the math to hackathon judges.
"""

import config

def calculate_tn_slab_bill(units):
    """
    Calculates monthly electricity bill in INR using Tamil Nadu (TANGEDCO) progressive slabs.
    Example:
      If units = 250:
        First 100 units  @ Rs 0.00  = Rs 0.00
        Next 100 units   @ Rs 2.25  = Rs 225.00
        Remaining 50 pts @ Rs 4.50  = Rs 225.00
        Total Bill                  = Rs 450.00
    """
    if units <= 0:
        return 0.0

    total_bill = 0.0
    units_left = float(units)
    previous_limit = 0.0

    for slab in config.TAMIL_NADU_TARIFF["slabs"]:
        slab_capacity = slab["max"] - previous_limit
        if units_left <= 0:
            break

        # Units that fall inside this slab
        units_in_slab = min(units_left, slab_capacity)
        total_bill += units_in_slab * slab["rate"]

        units_left -= units_in_slab
        previous_limit = slab["max"]

    return round(total_bill, 2)


def calculate_appliance_savings(wattage_watts, wasted_hours_per_day):
    """
    Calculates daily, monthly, and annual energy and money saved by reducing
    appliance runtime.

    Formulas:
      Daily kWh   = (Wattage in Watts * Hours per day) / 1000
      Monthly kWh = Daily kWh * 30 days
      Yearly kWh  = Daily kWh * 365 days
      Money Saved = kWh * blended tariff rate (Rs 6.50 / kWh)
      CO2 Avoided = kWh * 0.75 kg CO2 / kWh
    """
    w = max(0.0, float(wattage_watts))
    h = max(0.0, float(wasted_hours_per_day))

    daily_kwh = (w * h) / 1000.0
    monthly_kwh = daily_kwh * 30.0
    yearly_kwh = daily_kwh * 365.0

    rate = config.TAMIL_NADU_TARIFF["average_rate_per_kwh"]
    factor = config.CO2_FACTOR_KG_PER_KWH

    return {
        "daily_kwh": round(daily_kwh, 3),
        "daily_inr": round(daily_kwh * rate, 2),
        "monthly_kwh": round(monthly_kwh, 2),
        "monthly_inr": round(monthly_kwh * rate, 2),
        "yearly_kwh": round(yearly_kwh, 2),
        "yearly_inr": round(yearly_kwh * rate, 2),
        "monthly_co2_kg": round(monthly_kwh * factor, 2),
        "yearly_co2_kg": round(yearly_kwh * factor, 2)
    }


def calculate_bill_simulation(appliance_list):
    """
    Simulates monthly hostel room / household consumption before and after
    lifestyle optimizations.
    Each item in appliance_list has:
      { name, wattage, before_hours, after_hours, count }
    """
    before_monthly_kwh = 0.0
    after_monthly_kwh = 0.0

    breakdown = []
    for app in appliance_list:
        w = float(app.get("wattage", 100))
        qty = int(app.get("count", 1))
        h_before = float(app.get("before_hours", 0))
        h_after = float(app.get("after_hours", 0))

        kwh_b = ((w * h_before * qty) / 1000.0) * 30.0
        kwh_a = ((w * h_after * qty) / 1000.0) * 30.0

        before_monthly_kwh += kwh_b
        after_monthly_kwh += kwh_a

        breakdown.append({
            "name": app.get("name", "Appliance"),
            "wattage": w,
            "count": qty,
            "before_hours": h_before,
            "after_hours": h_after,
            "before_kwh": round(kwh_b, 1),
            "after_kwh": round(kwh_a, 1),
            "saved_kwh": round(kwh_b - kwh_a, 1)
        })

    # Calculate actual Tamil Nadu progressive slab bills
    bill_before = calculate_tn_slab_bill(before_monthly_kwh)
    bill_after = calculate_tn_slab_bill(after_monthly_kwh)
    inr_saved = round(bill_before - bill_after, 2)
    kwh_saved = round(before_monthly_kwh - after_monthly_kwh, 2)
    co2_saved = round(kwh_saved * config.CO2_FACTOR_KG_PER_KWH, 2)

    return {
        "before_kwh": round(before_monthly_kwh, 1),
        "after_kwh": round(after_monthly_kwh, 1),
        "kwh_saved": kwh_saved,
        "bill_before_inr": bill_before,
        "bill_after_inr": bill_after,
        "inr_saved": inr_saved,
        "co2_saved_kg": co2_saved,
        "breakdown": breakdown
    }


def compare_monthly_bills(prev_units, curr_units):
    """
    Compares two monthly bills entered by the user.
    Calculates change in units and bill amount using the Tamil Nadu slab structure.
    """
    prev_u = max(0.0, float(prev_units))
    curr_u = max(0.0, float(curr_units))

    prev_bill = calculate_tn_slab_bill(prev_u)
    curr_bill = calculate_tn_slab_bill(curr_u)

    kwh_diff = round(prev_u - curr_u, 1) # positive means saved
    inr_diff = round(prev_bill - curr_bill, 2)

    percentage = 0.0
    if prev_u > 0:
        percentage = round(((prev_u - curr_u) / prev_u) * 100.0, 1)

    co2_diff = round(kwh_diff * config.CO2_FACTOR_KG_PER_KWH, 2)

    # Student feedback message
    if kwh_diff > 0:
        feedback = f"Awesome work! You reduced electricity consumption by {percentage}% and saved ₹{inr_diff:.2f} this month."
    elif kwh_diff == 0:
        feedback = "Your electricity usage was identical to last month. Try checking off 2 daily habits to see savings!"
    else:
        feedback = f"Usage increased by {abs(percentage)}% (+{abs(kwh_diff)} units). Check the NexWatt Mystery room to uncover where power is leaking!"

    return {
        "prev_units": prev_u,
        "curr_units": curr_u,
        "prev_bill_inr": prev_bill,
        "curr_bill_inr": curr_bill,
        "kwh_saved": kwh_diff,
        "inr_saved": inr_diff,
        "percentage_change": percentage,
        "co2_saved_kg": co2_diff,
        "feedback": feedback
    }


def get_garden_stage_info(points):
    """
    Determines the Energy Impact Garden evolution stage and progress based on user points.
    """
    pts = max(0, int(points))
    current_stage = config.GARDEN_STAGES[0]
    next_stage = None

    for i, s in enumerate(config.GARDEN_STAGES):
        if pts >= s["min_pts"]:
            current_stage = s
            if i + 1 < len(config.GARDEN_STAGES):
                next_stage = config.GARDEN_STAGES[i + 1]
            else:
                next_stage = None

    # Calculate percentage progress to next stage
    if next_stage:
        span = next_stage["min_pts"] - current_stage["min_pts"]
        progress_pts = pts - current_stage["min_pts"]
        pct = min(100, max(0, int((progress_pts / span) * 100)))
        pts_needed = next_stage["min_pts"] - pts
    else:
        pct = 100
        pts_needed = 0

    return {
        "stage_number": current_stage["stage"],
        "stage_name": current_stage["name"],
        "stage_desc": current_stage["desc"],
        "progress_percent": pct,
        "points_to_next": pts_needed,
        "next_stage_name": next_stage["name"] if next_stage else "Max Level"
    }
