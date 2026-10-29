# ⚡ NexWatt IoT Smart Monitoring: Complete A-Z Implementation Guide
## From "Students Can Lie" → Real-Time Verified Energy Telemetry

> **Purpose:** Eliminate self-reporting fraud by installing a physical smart energy  
> monitoring device in ONE demo hostel room that feeds live, tamper-proof electricity  
> data directly into the NexWatt platform.  
> **Budget:** Under ₹1,500 total for a single-room proof-of-concept demo.  
> **Time to Build:** 3–5 hours (including flashing firmware and wiring).

---

## 📋 Table of Contents

1. [Why This Matters for Judges](#1-why-this-matters)
2. [Hardware Shopping List](#2-hardware-shopping-list)
3. [System Architecture](#3-system-architecture)
4. [Step 1: Wiring the PZEM-004T to ESP32](#step-1-wiring)
5. [Step 2: Flashing the ESP32 Firmware](#step-2-firmware)
6. [Step 3: NexWatt Server — IoT Ingestion API](#step-3-server-api)
7. [Step 4: Live Dashboard Integration](#step-4-dashboard)
8. [Step 5: Demo Day Setup Checklist](#step-5-demo-day)
9. [Safety Warnings](#safety)
10. [Alternative: No-Solder Plug-and-Play Option](#alternative)
11. [Judge Q&A for IoT Module](#judge-qa)

---

## 1. Why This Matters for Judges <a id="1-why-this-matters"></a>

> [!IMPORTANT]
> In a 150-team hackathon, **ZERO other teams** will have a physical IoT device  
> streaming live wattage data into their web dashboard. This single differentiator  
> can win the competition by itself.

**The Problem:** Self-reported habit checklists have no verification. A student  
can claim "I turned off my AC" while it is still running at 18°C.

**The NexWatt Solution:** A ₹800 smart energy meter module (PZEM-004T) connected  
to an ESP32 microcontroller reads the room's **actual voltage, current, power,  
energy consumed, and power factor** every 2 seconds, and HTTP-POSTs the data  
to the NexWatt server over Wi-Fi.

The NexWatt dashboard then:
- Shows **live wattage** in real-time (judges can see it change when you flip a switch).
- **Cross-validates** the student's habit log (if they checked "AC off" but power  
  is still at 1,200W, the system flags a mismatch).
- Calculates **verified savings** vs. baseline, not self-reported savings.

---

## 2. Hardware Shopping List <a id="2-hardware-shopping-list"></a>

| # | Component | Model | Where to Buy | Price (₹) |
|---|-----------|-------|-------------|-----------|
| 1 | **Energy Meter Module** | PZEM-004T v3.0 (100A) | Amazon.in / Robu.in / electronicscomp.com | ₹380–500 |
| 2 | **Microcontroller** | ESP32 DevKit v1 (30-pin) | Amazon.in / Robu.in | ₹350–450 |
| 3 | **USB Cable** | Micro-USB data cable (for ESP32) | Any shop | ₹50 |
| 4 | **Jumper Wires** | Female-to-Female Dupont wires (4 pcs) | Amazon.in | ₹30 |
| 5 | **Power Extension Board** | Any 6A/16A extension with accessible wiring | Local hardware shop | ₹150 |
| 6 | **Laptop / Phone** | For running NexWatt server + hotspot | Already owned | ₹0 |
| **TOTAL** | | | | **₹960–1,180** |

> [!TIP]
> **Fastest procurement:** Search "PZEM-004T" and "ESP32 DevKit" on Amazon.in  
> with Prime delivery. Both are widely available with next-day delivery in Chennai.
>
> **Alternative (Zero Soldering):** See [Section 10](#alternative) for the  
> Tuya/Sonoff smart plug option if you cannot source PZEM-004T in time.

---

## 3. System Architecture <a id="3-system-architecture"></a>

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEMO HOSTEL ROOM (PHYSICAL)                  │
│                                                                 │
│   ┌──────────┐     AC Mains      ┌───────────────┐             │
│   │ Wall     │ ──── Live ──────► │  PZEM-004T    │             │
│   │ Socket   │ ──── Neutral ──► │  Energy Meter  │             │
│   │ (230V AC)│                   │  Module        │             │
│   └──────────┘                   │                │             │
│        │                         │  Measures:     │             │
│        │                         │  • Voltage (V) │             │
│        ▼                         │  • Current (A) │             │
│   ┌──────────┐                   │  • Power (W)   │             │
│   │ Appliance│ (Fan/AC/Charger)  │  • Energy (kWh)│             │
│   │ Load     │◄── Neutral ────── │  • Freq (Hz)   │             │
│   └──────────┘                   │  • PF          │             │
│                                  └───────┬───────┘             │
│                                    Serial│(TTL UART)           │
│                                    RX/TX │                     │
│                                  ┌───────▼───────┐             │
│                                  │   ESP32       │             │
│                                  │   DevKit      │             │
│                                  │               │──── Wi-Fi   │
│                                  │   Firmware:   │     ────►   │
│                                  │   Reads PZEM  │             │
│                                  │   every 2 sec │             │
│                                  │   HTTP POST   │             │
│                                  │   to NexWatt  │             │
│                                  └───────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                         Wi-Fi│ HTTP POST JSON
                              │ every 2 seconds
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               NEXWATT SERVER (Laptop / Raspberry Pi)            │
│                                                                 │
│   POST /api/iot/ingest                                          │
│   ┌──────────────────────────────┐                              │
│   │ Receives JSON:               │                              │
│   │ {                            │                              │
│   │   "device_id": "room-402",   │                              │
│   │   "voltage": 232.4,          │                              │
│   │   "current": 4.82,           │                              │
│   │   "power_w": 1121.6,         │                              │
│   │   "energy_kwh": 0.34,        │                              │
│   │   "frequency": 49.98,        │                              │
│   │   "power_factor": 0.94       │                              │
│   │ }                            │                              │
│   └──────────────┬───────────────┘                              │
│                  │                                              │
│                  ▼                                              │
│   ┌──────────────────────────────┐                              │
│   │ Cross-Validation Engine      │                              │
│   │ • Compare live power_w       │                              │
│   │   against habit log claims   │                              │
│   │ • Flag mismatches            │                              │
│   │ • Calculate verified savings │                              │
│   └──────────────┬───────────────┘                              │
│                  │                                              │
│                  ▼                                              │
│   ┌──────────────────────────────┐                              │
│   │ Live Dashboard (Browser)     │                              │
│   │ • Real-time gauge (W)        │                              │
│   │ • 5-minute power timeline    │                              │
│   │ • Verified vs Claimed badge  │                              │
│   │ • Appliance fingerprint      │                              │
│   └──────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Wiring the PZEM-004T to ESP32 <a id="step-1-wiring"></a>

> [!CAUTION]
> **SAFETY FIRST.** The PZEM-004T handles **230V AC mains electricity**.  
> All AC wiring must be done **with the power OFF** and by someone  
> comfortable with basic electrical work. The ESP32 side is safe (3.3V DC).  
> If in doubt, use the [no-solder Tuya Smart Plug alternative](#alternative).

### PZEM-004T Module Pinout (v3.0)

The PZEM-004T has **two sides**:

**AC Side (Screw Terminals — DANGEROUS, 230V):**
```
┌─────────────────────────┐
│  [L_in]  [N_in]         │   ◄── Incoming Live & Neutral from wall socket
│  [L_out] [N_out]        │   ◄── Outgoing to your appliance load
└─────────────────────────┘
```

**DC / Communication Side (Pin Header — Safe, 5V/3.3V):**
```
┌─────────────────────────┐
│  [5V]  [GND]  [RX]  [TX]│
└─────────────────────────┘
```

### Wiring Diagram

```
                    AC SIDE (230V — BE CAREFUL)
                    ===========================

Wall Socket LIVE ────────► PZEM [L_in]
                           PZEM [L_out] ────────► Extension Board LIVE (to appliances)

Wall Socket NEUTRAL ─────► PZEM [N_in]
                           PZEM [N_out] ────────► Extension Board NEUTRAL (to appliances)

Earth/Ground ────────────────────────────────────► Extension Board Earth (pass through)


                    DC SIDE (Safe — 3.3V Logic)
                    ============================

PZEM [5V]  ──────────────► ESP32 [VIN] or [5V] pin
PZEM [GND] ──────────────► ESP32 [GND]
PZEM [TX]  ──────────────► ESP32 [GPIO16] (RX2)     ◄── PZEM TX → ESP32 RX
PZEM [RX]  ──────────────► ESP32 [GPIO17] (TX2)     ◄── PZEM RX → ESP32 TX
```

### Physical Setup Summary
1. **Cut into the extension board cable** (with power OFF) to route Live and  
   Neutral through the PZEM-004T's screw terminals.
2. Connect 4 jumper wires from PZEM's DC header to ESP32.
3. Plug the extension board into the wall socket.
4. Plug your demo appliances (fan, phone charger, desk lamp) into the  
   extension board.
5. Power the ESP32 via its USB cable (from laptop or USB charger).

**Result:** All power drawn by the extension board's appliances now flows  
through the PZEM-004T sensor, and the ESP32 reads the measurements.

---

## Step 2: Flashing the ESP32 Firmware <a id="step-2-firmware"></a>

### Prerequisites
1. Install **Arduino IDE** (v2.x) from https://www.arduino.cc/en/software
2. In Arduino IDE, go to **File → Preferences → Additional Board URLs**, add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools → Board → Board Manager**, search "esp32", install **esp32 by Espressif**.
4. Install the PZEM library: **Sketch → Include Library → Manage Libraries**,  
   search "PZEM-004T v3", install **PZEM-004Tv30** by Jakub Mandula.

### The Firmware Code

Create a new Arduino sketch and paste the code from:

**File:** [`NexWatt/firmware/esp32_pzem_nexwatt.ino`](file:///Users/harish/Documents/NexWatt/firmware/esp32_pzem_nexwatt.ino)

### Flash Instructions
1. Connect ESP32 to laptop via USB cable.
2. In Arduino IDE:
   - **Tools → Board:** "ESP32 Dev Module"
   - **Tools → Port:** Select the COM/tty port that appeared
   - **Tools → Upload Speed:** 115200
3. Click **Upload** (→ button).
4. Open **Serial Monitor** (Tools → Serial Monitor, 115200 baud).
5. You should see:
   ```
   [NexWatt IoT] Connecting to WiFi: NexWatt-Demo
   [NexWatt IoT] WiFi connected! IP: 192.168.43.105
   [NexWatt IoT] Reading PZEM... V=232.4 I=0.45 P=104.6 E=0.02 F=50.01 PF=0.99
   [NexWatt IoT] POST to http://192.168.43.1:5050/api/iot/ingest → 200 OK
   ```

> [!NOTE]
> **For Demo Day Wi-Fi Setup:**  
> Use your phone as a mobile hotspot named `NexWatt-Demo` with password  
> `nexwatt2026`. Run the NexWatt server on your laptop connected to the  
> same hotspot. The ESP32 will find the server automatically.

---

## Step 3: NexWatt Server — IoT Ingestion API <a id="step-3-server-api"></a>

The NexWatt `app.py` has been updated with these new endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/iot/ingest` | POST | Receives JSON telemetry from ESP32 every 2 seconds |
| `GET /api/iot/latest` | GET | Returns the latest device reading + cross-validation status |
| `GET /api/iot/history` | GET | Returns last 150 readings (~5 min) for the live chart |

### Cross-Validation Logic

When a student logs "AC turned off" as a habit, but the IoT device still  
reports power > 800W, the system flags the claim:

```python
# Validation rules (in app.py)
APPLIANCE_SIGNATURES = {
    "cooling":     {"min_w": 800, "max_w": 1800},  # AC compressor running
    "ventilation": {"min_w": 50,  "max_w": 85},    # Ceiling fan
    "vampire":     {"min_w": 3,   "max_w": 15},    # Charger adapters
    "lighting":    {"min_w": 15,  "max_w": 50},     # LED / tube light
    "electronics": {"min_w": 60,  "max_w": 350},   # PC / monitor
    "heating":     {"min_w": 1500,"max_w": 3000},   # Geyser
}
```

**How it works:**
1. Student checks "Set AC to 24°C" → expected power drop of ~450W.
2. IoT device reports current room power = 1,350W (AC still at 18°C).
3. System compares: Power is still in the "cooling" signature range (800–1800W).
4. **Result:** Habit is flagged as `"verified": false` with reason  
   `"Power signature suggests AC compressor load is still active at high duty cycle"`.

---

## Step 4: Live Dashboard Integration <a id="step-4-dashboard"></a>

A new **"📡 Live IoT Room Monitor"** tab has been added to the Student Hub.

### What it shows:
1. **Real-Time Power Gauge:** Large animated dial showing current wattage  
   draw (updates every 2 seconds via polling).
2. **Live 5-Minute Timeline:** Rolling line chart of power consumption.
3. **Appliance Fingerprint Detection:** Based on wattage bands, the system  
   estimates which appliances are likely ON (e.g., "AC + Fan + Charger detected").
4. **Habit Cross-Validation Status:** For each logged habit, shows either  
   ✅ `VERIFIED` (IoT data confirms the action) or  
   ⚠️ `UNVERIFIED` (power signature doesn't match the claimed action).
5. **Connection Status:** Green heartbeat icon when ESP32 is streaming,  
   grey when disconnected.

---

## Step 5: Demo Day Setup Checklist <a id="step-5-demo-day"></a>

### 30 Minutes Before Your Slot

- [ ] **1.** Set up your phone as a Wi-Fi hotspot: SSID `NexWatt-Demo`, password `nexwatt2026`.
- [ ] **2.** Connect your laptop to the hotspot.
- [ ] **3.** Open terminal, run `python3 app.py` → NexWatt starts on port 5050.
- [ ] **4.** Note your laptop's IP on the hotspot network:
  ```bash
  # macOS
  ifconfig en0 | grep inet
  # Look for something like 192.168.43.100
  ```
- [ ] **5.** Update the ESP32 firmware's `NEXWATT_SERVER` to your laptop's IP  
      (or use the default `192.168.43.1` which is the hotspot host).
- [ ] **6.** Power on the ESP32 (USB cable to laptop or USB charger).
- [ ] **7.** Plug the PZEM-004T extension board into a wall socket.
- [ ] **8.** Plug in demo appliances: a desk fan, a phone charger, a desk lamp.
- [ ] **9.** Open browser → `http://localhost:5050` → Click "📡 Live IoT Room Monitor" tab.
- [ ] **10.** **Verify:** You should see live wattage numbers updating every 2 seconds.

### The 90-Second Live Demo Script for Judges

> *"Let me prove this isn't just a checklist app. This ESP32 microcontroller  
> is connected to a PZEM-004T energy meter reading the actual power flowing  
> through this extension board right now."*
>
> *(Point to the Live IoT Monitor tab showing ~130W)*
>
> *"Watch this number. I'm going to turn off this desk fan..."*  
> *(Switch off the fan — the gauge drops from ~130W to ~55W)*
>
> *"The system detected a 75W drop — matching the fan's wattage signature.  
> Now if I log 'Turned off ceiling fan' in my habit checklist..."*  
> *(Check the habit)*
>
> *"...the IoT engine cross-validates: the fan power signature disappeared  
> from the live feed — so this habit is marked ✅ VERIFIED. But if I  
> check 'Set AC to 24°C' while no AC is even connected..."*  
> *(Check the AC habit)*
>
> *"...the system flags it ⚠️ UNVERIFIED because no AC compressor  
> signature was detected. **Students cannot lie to NexWatt.**"*

---

## Safety Warnings <a id="safety"></a>

> [!CAUTION]
> 1. **Never** touch the AC screw terminals on the PZEM-004T while it is  
>    plugged into a live wall socket. 230V AC **can kill**.
> 2. **Always** switch OFF the wall socket before making any wiring changes.
> 3. The PZEM-004T current transformer (CT) coil is rated for **100A** —  
>    more than enough for a single room. Do NOT use it on a full building  
>    distribution board without proper CT clamps.
> 4. Ensure all exposed AC terminals are covered with electrical tape or  
>    housed inside the extension board's plastic casing.
> 5. The ESP32 and its USB cable operate at **5V DC** — completely safe to handle.

---

## 10. Alternative: No-Solder Plug-and-Play Smart Plug Option <a id="alternative"></a>

If you **cannot source the PZEM-004T in time** or are uncomfortable with  
AC wiring, use a **Tuya-compatible Wi-Fi Smart Plug with Energy Monitoring**:

| Option | Model | Price | Where |
|--------|-------|-------|-------|
| **Best** | Tuya Smart Plug 16A with Energy Monitor | ₹500–800 | Amazon.in ("smart plug energy monitor") |
| **Good** | Sonoff S31 / Sonoff POW R3 | ₹800–1200 | Amazon.in |

### How it works (No wiring needed):
1. Plug the smart plug into the wall socket.
2. Plug your demo appliances into the smart plug.
3. Flash the plug with **Tasmota firmware** (open source) to expose a local HTTP API.
4. NexWatt polls the Tasmota API every 2 seconds:
   ```
   GET http://<plug-ip>/cm?cmnd=Status%2010
   → Returns JSON with voltage, current, power, energy, power factor
   ```
5. Same cross-validation logic applies.

> [!TIP]
> **For fastest setup:** Buy the Tuya plug, flash Tasmota using  
> [tuya-convert](https://github.com/ct-Open-Source/tuya-convert) (no soldering),  
> and NexWatt reads the data via the local network. Total time: ~45 minutes.

---

## 11. Judge Q&A for IoT Module <a id="judge-qa"></a>

### Q: *"This is just one room. How does it scale to a full campus?"*
> **Answer:** *"Each hostel room costs ₹800 to instrument. For a 500-room campus,  
> that's ₹4 Lakhs — a one-time investment that saves ₹25 Lakhs annually.  
> ROI payback is under 2 months. At scale, we'd use LoRaWAN sub-metering  
> nodes on each floor's distribution board instead of per-room sensors."*

### Q: *"Can students tamper with the device?"*
> **Answer:** *"The PZEM-004T is wired inline inside the extension board casing.  
> It's sealed. Unplugging it is equivalent to cutting their own power —  
> self-defeating. At institutional scale, the meter sits inside locked  
> electrical panels on each floor."*

### Q: *"What if Wi-Fi goes down?"*
> **Answer:** *"The ESP32 firmware has a 60-reading local buffer. When Wi-Fi  
> reconnects, it bulk-uploads the missed readings with timestamps.  
> No data is lost."*

### Q: *"Is this accurate enough for billing?"*
> **Answer:** *"The PZEM-004T v3.0 has ±1% accuracy on active power and  
> ±0.5% on voltage — comparable to commercial IEC 62053-21 Class 1  
> energy meters. For behavioral monitoring and comparative analytics,  
> this exceeds requirements."*
