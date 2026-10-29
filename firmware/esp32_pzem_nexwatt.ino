/*
 * =========================================================================
 *  NexWatt IoT Firmware — ESP32 + PZEM-004T v3.0
 *  Dexathon 2026 — The Logic Lords
 * =========================================================================
 *
 *  Reads voltage, current, power, energy, frequency, and power factor
 *  from the PZEM-004T every 2 seconds and HTTP-POSTs the telemetry
 *  JSON to the NexWatt server over Wi-Fi.
 *
 *  Hardware Wiring:
 *    PZEM TX  →  ESP32 GPIO16 (Serial2 RX)
 *    PZEM RX  →  ESP32 GPIO17 (Serial2 TX)
 *    PZEM 5V  →  ESP32 VIN
 *    PZEM GND →  ESP32 GND
 *
 *  Required Libraries (install via Arduino Library Manager):
 *    1. PZEM-004Tv30  (by Jakub Mandula)
 *    2. WiFi           (built into ESP32 board package)
 *    3. HTTPClient     (built into ESP32 board package)
 *
 *  Board: ESP32 Dev Module
 *  Upload Speed: 115200
 * =========================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PZEM004Tv30.h>

// ======================== CONFIGURATION ========================

// Wi-Fi credentials (use your phone hotspot for demo day)
const char* WIFI_SSID     = "NexWatt-Demo";
const char* WIFI_PASSWORD = "nexwatt2026";

// NexWatt server endpoint
// For demo: Use your laptop's IP on the hotspot network
// Common hotspot gateway IPs: 192.168.43.1 (Android), 172.20.10.1 (iPhone)
const char* NEXWATT_SERVER = "http://192.168.43.1:5050";

// Device identity (matches room assignment in NexWatt)
const char* DEVICE_ID = "room-402";

// Reading interval in milliseconds
const unsigned long READ_INTERVAL_MS = 2000;  // 2 seconds

// Offline buffer size (readings cached when Wi-Fi is down)
const int BUFFER_SIZE = 60;

// ======================== HARDWARE SETUP ========================

// PZEM-004T on Hardware Serial2
// GPIO16 = RX2 (receives from PZEM TX)
// GPIO17 = TX2 (sends to PZEM RX)
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

// ======================== STATE VARIABLES ========================

unsigned long lastReadTime = 0;
bool wifiConnected = false;

// Offline buffer for storing readings when Wi-Fi is unavailable
struct Reading {
  float voltage;
  float current;
  float power;
  float energy;
  float frequency;
  float pf;
  unsigned long timestamp;
  bool valid;
};

Reading offlineBuffer[BUFFER_SIZE];
int bufferHead = 0;
int bufferCount = 0;

// Status LED (built-in LED on most ESP32 boards)
#define LED_PIN 2

// ======================== SETUP ========================

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println();
  Serial.println("=========================================");
  Serial.println("  NexWatt IoT Smart Energy Monitor v1.0");
  Serial.println("  Dexathon 2026 — The Logic Lords");
  Serial.println("=========================================");
  Serial.println();

  // Connect to Wi-Fi
  connectWiFi();
}

// ======================== MAIN LOOP ========================

void loop() {
  // Maintain Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(LED_PIN, LOW);
    connectWiFi();
  }

  // Read PZEM sensor at fixed interval
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;
    readAndSend();
  }
}

// ======================== WI-FI CONNECTION ========================

void connectWiFi() {
  Serial.printf("[NexWatt IoT] Connecting to WiFi: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    // Blink LED while connecting
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    digitalWrite(LED_PIN, HIGH);  // Solid ON = connected
    Serial.println();
    Serial.printf("[NexWatt IoT] WiFi connected! IP: %s\n",
                  WiFi.localIP().toString().c_str());
    Serial.printf("[NexWatt IoT] Server target: %s\n", NEXWATT_SERVER);
    Serial.println();

    // Flush any buffered offline readings
    flushOfflineBuffer();
  } else {
    Serial.println();
    Serial.println("[NexWatt IoT] WiFi connection failed. Will retry...");
  }
}

// ======================== READ PZEM & SEND ========================

void readAndSend() {
  // Read all parameters from PZEM-004T
  float voltage   = pzem.voltage();
  float current   = pzem.current();
  float power     = pzem.power();
  float energy    = pzem.energy();
  float frequency = pzem.frequency();
  float pf        = pzem.pf();

  // Check if readings are valid (NaN means sensor communication error)
  if (isnan(voltage) || isnan(current) || isnan(power)) {
    Serial.println("[NexWatt IoT] PZEM read error — check wiring!");
    // Blink LED rapidly to indicate sensor error
    for (int i = 0; i < 6; i++) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(100);
    }
    return;
  }

  // Print to Serial Monitor for debugging
  Serial.printf("[NexWatt IoT] V=%.1f I=%.2f P=%.1f E=%.3f F=%.2f PF=%.2f\n",
                voltage, current, power, energy, frequency, pf);

  // Build JSON payload
  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"voltage\":" + String(voltage, 1) + ",";
  json += "\"current\":" + String(current, 3) + ",";
  json += "\"power_w\":" + String(power, 1) + ",";
  json += "\"energy_kwh\":" + String(energy, 4) + ",";
  json += "\"frequency\":" + String(frequency, 2) + ",";
  json += "\"power_factor\":" + String(pf, 2) + ",";
  json += "\"uptime_s\":" + String(millis() / 1000);
  json += "}";

  // Send via HTTP POST if connected
  if (wifiConnected && WiFi.status() == WL_CONNECTED) {
    sendToServer(json);
  } else {
    // Buffer offline
    bufferReading(voltage, current, power, energy, frequency, pf);
    Serial.printf("[NexWatt IoT] Offline — buffered (%d/%d)\n",
                  bufferCount, BUFFER_SIZE);
  }
}

// ======================== HTTP POST ========================

void sendToServer(String json) {
  HTTPClient http;
  String url = String(NEXWATT_SERVER) + "/api/iot/ingest";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);  // 3 second timeout

  int httpCode = http.POST(json);

  if (httpCode == 200) {
    Serial.printf("[NexWatt IoT] POST → %d OK\n", httpCode);
    // Quick LED blink to indicate successful transmission
    digitalWrite(LED_PIN, LOW);
    delay(50);
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.printf("[NexWatt IoT] POST failed → %d\n", httpCode);
  }

  http.end();
}

// ======================== OFFLINE BUFFER ========================

void bufferReading(float v, float i, float p, float e, float f, float pf) {
  offlineBuffer[bufferHead].voltage   = v;
  offlineBuffer[bufferHead].current   = i;
  offlineBuffer[bufferHead].power     = p;
  offlineBuffer[bufferHead].energy    = e;
  offlineBuffer[bufferHead].frequency = f;
  offlineBuffer[bufferHead].pf        = pf;
  offlineBuffer[bufferHead].timestamp = millis();
  offlineBuffer[bufferHead].valid     = true;

  bufferHead = (bufferHead + 1) % BUFFER_SIZE;
  if (bufferCount < BUFFER_SIZE) bufferCount++;
}

void flushOfflineBuffer() {
  if (bufferCount == 0) return;

  Serial.printf("[NexWatt IoT] Flushing %d buffered readings...\n", bufferCount);

  int start = (bufferHead - bufferCount + BUFFER_SIZE) % BUFFER_SIZE;
  int flushed = 0;

  for (int i = 0; i < bufferCount; i++) {
    int idx = (start + i) % BUFFER_SIZE;
    if (!offlineBuffer[idx].valid) continue;

    String json = "{";
    json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    json += "\"voltage\":" + String(offlineBuffer[idx].voltage, 1) + ",";
    json += "\"current\":" + String(offlineBuffer[idx].current, 3) + ",";
    json += "\"power_w\":" + String(offlineBuffer[idx].power, 1) + ",";
    json += "\"energy_kwh\":" + String(offlineBuffer[idx].energy, 4) + ",";
    json += "\"frequency\":" + String(offlineBuffer[idx].frequency, 2) + ",";
    json += "\"power_factor\":" + String(offlineBuffer[idx].pf, 2) + ",";
    json += "\"buffered\":true,";
    json += "\"uptime_s\":" + String(offlineBuffer[idx].timestamp / 1000);
    json += "}";

    sendToServer(json);
    offlineBuffer[idx].valid = false;
    flushed++;
    delay(100);  // Avoid flooding the server
  }

  bufferCount = 0;
  bufferHead = 0;
  Serial.printf("[NexWatt IoT] Flushed %d readings successfully.\n", flushed);
}
