# ⚡ NexWatt — Dexathon 2026 Presentation Slides Content
## Team: The Logic Lords | Theme: Open Innovation (Software Track)
### Institution: Sathyabama Institute of Science and Technology

---

## SLIDE 1: TITLE PAGE

### Header:
* **DEXATHON 2026** — Sathyabama Institute of Science and Technology

### Slide Title:
# NexWatt
### Subtitle:
**Intelligent Demand-Side Energy Management & Campus Conservation Platform**

### Details:
* **Team Name:** The Logic Lords
* **Theme:** Open Innovation — NexWatt
* **PS Category:** Software Track (with IoT Hardware Verification)
* **Team ID:** [Your Team ID]
* **Alignment:** Bureau of Energy Efficiency (BEE) & Mission LiFE India

> **Speaker Note (10 sec):**  
> *"Respected judges, we are Team The Logic Lords. Today, we present NexWatt — an intelligent energy management platform that transforms passive electricity conservation into a verified, competitive, and measurable campus movement."*

---

## SLIDE 2: IDEA TITLE & PROBLEM STATEMENT

### Slide Title:
# Idea Title: Demand-Side Energy Management (DSM) for Campuses

### Problem Statement:
* **Invisible Wastage:** Students leave fans, ACs at 18°C, and empty chargers running unnecessarily without knowing the financial cost.
* **Campus Scale Loss:** In a university like Sathyabama with 2,000+ hostel rooms, unnoticed standby and behavioral waste costs over **₹25 Lakhs per year**.
* **The Verification Gap:** Standard green apps rely on passive checklists where students can simply lie to earn points.

### Proposed Solution:
* **NexWatt** is a dual-perspective web platform that bridges **student gamification** with **university micro-grid peak shaving** and **physical IoT anti-cheat verification**.

### Key Features:
1. **Daily Action Protocol:** Micro-habit logging with instant ₹ and kWh ticker.
2. **NexWatt Mystery Room:** Interactive 2.5D visual room to diagnose and neutralize phantom loads.
3. **Energy Impact Garden:** Living botanical terrarium that evolves across 5 stages based on verified kWh saved.
4. **Power Pact:** Sathyabama inter-hostel conservation league (Block C vs Block A vs Block B).
5. **BEE Star Simulator:** Models exact ROI of upgrading to 5-star BLDC fans and inverter ACs.
6. **Live IoT Anti-Cheat Monitor:** ESP32 + PZEM-004T sensor feeds real room power to catch fake claims.

### Innovation and Uniqueness:
* Unlike ordinary to-do list apps, NexWatt pairs **biophilic gamification** with **physical electrical sensor cross-validation** and an **Institutional ESG Dashboard** for university facility managers.

> **Speaker Note (30 sec):**  
> *"Most sustainability apps fail because they are boring to-do lists that students cheat on. NexWatt solves this through a dual-perspective ecosystem: students play through an interactive Mystery Room, an evolving Living Garden, and inter-hostel leagues, while physical IoT sensors verify every claim in real time."*

---

## SLIDE 3: TECHNICAL APPROACH & ARCHITECTURE

### Slide Title:
# Technical Approach & System Architecture

### Technologies Used:
* **Frontend:** Semantic HTML5, CSS3 Glassmorphism theme, Vanilla JavaScript (ES6+), Chart.js.
* **Backend:** Python 3 REST API microservice (zero-dependency, fast, lightweight).
* **Hardware & IoT Layer:** ESP32 DevKit v1 + PZEM-004T v3.0 AC energy sensor (230V, 100A CT).
* **Communication Protocol:** HTTP REST & MQTT telemetry over local Wi-Fi.

### Implementation Process:
1. **IoT Sensor Ingestion:** PZEM-004T measures Voltage, Current, Active Power (W), Energy (kWh), and Power Factor every 2 seconds.
2. **Signature Matching Engine:** Server compares live wattage against appliance power signatures (AC: 800–1,800W; Fan: 50–85W; Charger: 3–15W).
3. **Cross-Validation:** If a student claims "AC turned off" but power stays above 800W, the claim is flagged **⚠️ UNVERIFIED**.
4. **Biophilic Feedback:** Verified kWh feeds the dynamic SVG botanical terrarium and hostel leaderboard.
5. **Campus Micro-Grid Telemetry:** Aggregates wing data into a 24-hour load curve for campus facility management.

### System Workflow:
```
[PZEM-004T 230V AC Sensor] ──UART──► [ESP32 DevKit] ──Wi-Fi / JSON──► [Python Backend]
                                                                             │
    ┌─────────────────────────────────┬──────────────────────────────────────┘
    ▼                                 ▼
[Anti-Cheat Cross-Validation]   [Campus Load Shaving (kW)]
    │                                 │
    ▼                                 ▼
[Living Garden & Power Pact]    [NAAC ESG Compliance Slip]
```

> **Speaker Note (30 sec):**  
> *"Our tech stack is lean and robust. A ₹800 PZEM sensor reads the actual electrical mains, feeds the ESP32, and POSTs JSON telemetry to our Python backend. Our signature engine detects whether an AC compressor or fan is truly off, making the habit tracker tamper-proof."*

---

## SLIDE 4: FEASIBILITY AND VIABILITY

### Slide Title:
# Feasibility, Viability & Mitigation Strategy

### Feasibility of the Idea:
* **Low-Cost Prototyping:** The complete single-room IoT smart meter costs **under ₹1,200**.
* **Zero Cloud Dependency:** Runs on local Python with zero paid subscriptions or third-party cloud lock-in.
* **Non-Invasive Deployment:** Installs inline with existing hostel extension boards or floor distribution boxes.

### Strategies for Overcoming Challenges:
| Hackathon Challenge | How NexWatt Solves It |
| :--- | :--- |
| **"Students will lie on the checklist"** | Solved by inline **PZEM-004T IoT cross-validation** and power fingerprinting. |
| **"Users stop opening the app"** | Solved by **Living Garden** (virtual pet mechanics) and **Power Pact** (inter-hostel pride + Wi-Fi perks). |
| **"Are the savings numbers accurate?"** | Grounded in official **BEE standards** and the **CEA India factor (0.82 kg CO₂/kWh)**. |

### Viability of the Idea:
* **Scalable Architecture:** Easily expands from a 1-room demo to 2,000+ hostel rooms, university academic blocks, or corporate tech parks.
* **Immediate Payback:** Eliminating just 1.5 kWh/day per room yields a full ROI payback in **under 2 months**.
* **Regulatory Alignment:** Supports national goals under **Mission LiFE** and BEE Energy Conservation Building Codes (ECBC).

> **Speaker Note (25 sec):**  
> *"The hardware costs under ₹1,200 per room. We solved the biggest judge objection—student cheating—with physical IoT verification, and we solved user drop-off with gamified hostel wing rivalries and real university perks."*

---

## SLIDE 5: BUSINESS CANVAS & ECONOMIC MODEL

### Slide Title:
# Business Canvas & Institutional Scalability

### 1. Mission and Vision:
* **Mission:** Eliminate unnoticed electricity wastage through transparent cost awareness, behavioral gamification, and verified telemetry.
* **Vision:** Establish self-sustaining net-zero university campuses driven by student community action.

### 2. Market & Target Segments:
* **Primary:** Engineering colleges, central universities, and student hostels (starting with Sathyabama).
* **Secondary:** Corporate IT tech parks and gated residential housing societies with shared utility billing.

### 3. Business & Monetization Model (B2B SaaS):
* **Institutional Campus License:** Tiered annual SaaS subscription for university administrators for real-time demand-side micro-grid management.
* **Green Campus Compliance Tool:** Automated reporting modules for **NAAC Criterion 7.1.2** and NIRF Green Rankings.
* **BEE 5-Star Affiliate Marketplace:** Commission partnerships with energy-efficient appliance manufacturers (BLDC fans, inverter ACs).

### 4. Financial ROI for Sathyabama:
* **Annual Cost Savings:** **₹25.3 Lakhs/year** projected across campus hostels.
* **Implementation Cost (500 rooms):** ~₹4 Lakhs one-time IoT hardware rollout.
* **Net Year-1 Payback:** **> 500% Return on Investment (ROI)**.

> **Speaker Note (25 sec):**  
> *"NexWatt operates on a B2B institutional SaaS model. For a university like Sathyabama, spending ₹4 Lakhs on IoT sub-metering yields over ₹25 Lakhs in annual electricity bill reductions—a 500% ROI in year one alone."*

---

## SLIDE 6: IMPACT AND BENEFITS

### Slide Title:
# Environmental, Financial & Social Impact

### 1. Economic Benefits:
* **₹25.3 Lakhs / Year** in direct campus utility cost avoidance.
* **115.4 kW Peak Demand Shaving**: Directly reduces maximum demand penalty surcharges from the electricity board (TNEB).

### 2. Environmental Impact:
* **23.06 Tonnes** of $\text{CO}_2$ emissions abated annually.
* **1,059 Trees Equivalent** in atmospheric carbon sequestration.
* **340,000 Litres** of thermal power plant cooling water conserved at source.

### 3. Social & Educational Impact:
* Fosters active environmental citizenship through inter-hostel camaraderie.
* Replaces passive rules with positive reinforcement and social recognition.

### 4. Institutional Prestige:
* Provides audit-ready digital documentation for **NAAC Criterion 7.1.2 (Institutional Values & Social Responsibilities)** and national sustainability rankings.

> **Speaker Note (20 sec):**  
> *"The impact is triple-bottom-line: financially saving ₹25 Lakhs, environmentally eliminating 23 tonnes of carbon, and institutionally providing automated documentation for Sathyabama's NAAC Grade A+ green accreditation."*

---

## SLIDE 7: RESEARCH, STANDARDS & REFERENCES

### Slide Title:
# Research Work & Regulatory Grounding

### Scientific & Regulatory Standards Used:
* **Central Electricity Authority (CEA), India:**
  * Grid emission baseline factor: **$0.82\text{ kg CO}_2\text{ per kWh}$** (*CO₂ Baseline Database for the Indian Power Sector, Version 19*).
* **Bureau of Energy Efficiency (BEE), Ministry of Power, India:**
  * National Thermal Comfort Standard: **$24^\circ\text{C}$ default AC cooling set-point**.
  * Appliance Star Labeling: BLDC fan energy baseline ($28\text{W}$ vs $75\text{W}$).
* **Mission LiFE (Lifestyle for Environment):**
  * NITI Aayog & MoEFCC actionable energy-saving behavioral protocols.
* **Forestry Sequestration Benchmark:**
  * Average mature tree $\text{CO}_2$ absorption: **$21.77\text{ kg CO}_2\text{/year}$**.

### Project Repository & Live Prototype:
* **GitHub Repository:** `https://github.com/Cathlyn-Euinice/NexWatt`
* **Live Working Prototype:** `http://localhost:5050`
* **Team:** The Logic Lords (Dexathon 2026)

> **Speaker Note (15 sec):**  
> *"All of our algorithms and calculations are grounded in official Government of India data from BEE, CEA, and Mission LiFE. We invite the judges to test the live prototype right now at our desk. Thank you!"*
