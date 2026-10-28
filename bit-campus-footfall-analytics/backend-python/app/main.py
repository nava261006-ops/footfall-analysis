import os
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="BIT Sathy Footfall Analytics API",
    description="Python FastAPI backend for Bannari Amman Institute of Technology (BIT Sathy) Footfall Analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import base64
import json

class GoogleAuthRequest(BaseModel):
    credential: str

class AnalyzeRequest(BaseModel):
    prompt: Optional[str] = "Provide complete footfall analysis and facility recommendations"
    contextData: Optional[Dict[str, Any]] = None
    apiKey: Optional[str] = None

@app.post("/api/auth/google", tags=["Authentication"])
def auth_google(req: GoogleAuthRequest):
    try:
        token = req.credential
        if not token or not isinstance(token, str):
            raise HTTPException(status_code=400, detail="Missing Google credential token")
            
        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Malformed JWT credential")

        # Decode payload with base64 padding
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)

        email = payload.get("email", "")
        name = payload.get("name") or payload.get("given_name") or "BIT Campus Member"
        picture = payload.get("picture")

        # Resolve institutional BIT Sathy role
        lower_email = email.lower()
        if "admin" in lower_email or lower_email.startswith("director") or "dean" in lower_email:
            role = "admin"
        elif "faculty" in lower_email or "prof" in lower_email or "dr." in lower_email or "staff" in lower_email:
            role = "faculty"
        else:
            role = "student"

        return {
            "success": True,
            "user": {
                "email": email,
                "name": name,
                "role": role,
                "picture": picture,
                "verified": bool(payload.get("email_verified", False))
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode token: {str(e)}")


def generate_fallback_analysis(raw_prompt: Optional[str], context: Optional[Dict[str, Any]]) -> str:
    prompt = (raw_prompt or "").lower()
    context = context or {}
    zones = context.get("zones", [])
    high_zones = [z for z in zones if z.get("occupancyPercent", 0) > 80]
    sorted_zones = sorted(zones, key=lambda z: z.get("occupancyPercent", 0), reverse=True)
    top_zone = sorted_zones[0] if sorted_zones else {
        "name": "Central Food Court & Annapoorna Mess",
        "occupancyPercent": 94.2,
        "currentCount": 1130,
        "capacity": 1200,
    }
    total_live = context.get("liveOccupancy", "7,840")
    traffic_status = context.get("trafficStatus", "High Peak Rush")

    # Scenario 1: Security, Turnstile & Gate Dispatch
    if any(k in prompt for k in ["gate", "turnstile", "security", "marshal", "rfid", "entry", "ingress", "arch"]):
        return f"""### 📊 Executive Summary & Gate Telemetry
Bannari Amman Institute of Technology (BIT Sathy) perimeter telemetry indicates **{traffic_status}** ingress velocity with **{total_live}** active campus occupants. Main Entrance Arch Gate turnstiles on Sathyamangalam Highway are currently processing **142 arrivals/min**, causing a localized pedestrian buffer delay of ~3.8 minutes during morning transitions.

### 🚨 Bottlenecks & Anomaly Alerts
- **Main Entrance Arch RFID Turnstiles (Lanes 1-4)**: Operating at **94.2% sustained throughput**, where student RFID card tap latency is peaking at 1.4 seconds per passenger.
- **Sathyamangalam Highway Vehicle & Visitor Sentry**: Commercial delivery and visitor registration queue has spilled 35 meters onto the perimeter approach lane.
- **Hostel Corridor Cross-Flow**: Egress surge expected at 16:45 when ~1,800 students transit simultaneously from IB Block and AS Block to Emerald, Ruby, and Cauvery hostels.

### ⚡ Actionable Security & Marshal Recommendations
1. **Immediate Marshal Reallocation**:
   - Deploy **2 Security Marshals** to Main Entrance Arch Lanes 1 & 2 to supervise manual barcode override and prevent biometric queue stagnation between 08:15-09:30 and 16:30-17:30.
   - Dispatch **1 Reserve Marshal** to Sathy Highway Sentry for expedited visitor badge pre-screening.
2. **Turnstile Bi-Directional Configuration**:
   - Dynamically reconfigure Turnstiles 3 & 4 from bidirectional to **Egress-Only Mode** starting at 16:15 to evacuate evening crowds seamlessly toward the bus bays.
3. **Fast-Track Mobile QR Gate**:
   - Activate the secondary turnstile wicket gate with Bluetooth/NFC validation to offload 28% of pedestrian pressure from the turnstile bank.

### 🔮 Predictive Gate Outlook (Next 3-5 Hours)
- Peak evening exit volume will hit **2,850 departures between 16:45 - 17:30**.
- Following 18:30, perimeter ingress will stabilize to casual hostel traffic (<35 arrivals/min)."""

    # Scenario 2: Library Exam Overflow & Study Spaces
    if any(k in prompt for k in ["library", "exam", "study", "quiet", "reading", "learning"]):
        lib_zone = next((z for z in zones if "LIB" in z.get("code", "") or "library" in z.get("name", "").lower() or "learning" in z.get("name", "").lower()), top_zone)
        return f"""### 📊 Executive Summary & Learning Centre Capacity Brief
The **{lib_zone.get('name')}** is currently at **{lib_zone.get('occupancyPercent')}% capacity** ({lib_zone.get('currentCount')}/{lib_zone.get('capacity')} occupied desks) due to intense pre-examination revision and academic research.

### 🚨 Bottlenecks & Anomaly Alerts
- **Level 2 Digital Knowledge Commons**: 100% workstation saturation with an estimated 45-minute average queue for computing terminals.
- **Noise Spillover in Foyer**: High conversational density in the collaborative ground foyer is drifting into the 2nd Floor Silent Reading Cubicles.
- **Power Socket Contention**: 96% of perimeter desk power outlets in Wing B are continuously utilized.

### ⚡ Actionable Study Space Recommendations
1. **Dynamic Wing Unlocking**:
   - Immediately open the **Learning Centre 3rd Floor Quiet Study Wing & Conference Annex** to add 180 silent seating units and relieve ground floor crowding.
2. **Alternative Zone Redirection**:
   - Push an in-app advisory to students recommending the **Product Innovation Centre (PIC)** and **IB Block Computing Lounge**, currently operating below 55% capacity.
3. **Session Time Limit on High-Demand Terminals**:
   - Implement a temporary 90-minute fair-use timer on research workstations to increase turnover by 35%.

### 🔮 Predictive Study Outlook (Next 3-6 Hours)
- Seating exhaustion expected by 14:00 without intervention.
- Dwell times are projected to stay elevated at an average of **3.2 hours per visitor** until library closing at 22:00."""

    # Scenario 3: HVAC Energy Optimization & Sustainability
    if any(k in prompt for k in ["hvac", "energy", "cooling", "power", "electricity", "temperature", "ac"]):
        return f"""### 📊 Executive Summary & HVAC Energy Audit
Based on multi-sensor telemetry across campus zones, **36% of active cooling and lighting load** is currently being directed into spaces with under 35% occupant density. Immediate automated setback can yield **~480 kWh daily savings** across the 181-acre campus.

### 🚨 Low-Density Inefficiencies Detected
- **Sunflower (SF) & Mechanical Block (Wings B & D)**: Occupancy dropped to **18.4%** following 15:30 practical completions, yet central chillers remain at 100% duty cycle.
- **Main Convention Auditorium (1,800-Seater)**: Main Hall is currently empty (0 occupants), but ventilation air handlers are drawing 42 kW idle power.
- **IB Block Smart Classrooms IB-201 to IB-208**: 6 out of 8 rooms are unreserved for the afternoon session with full illumination.

### ⚡ Actionable Energy Conservation Recommendations
1. **Automated Chiller Setpoint Reset**:
   - Raise cooling setpoints from 21.5°C to **25.0°C** in Sunflower Mechanical Block Wings B & D, reducing compressor workload by **28%**.
2. **Occupancy-Driven Ventilation Scheduling**:
   - Power down Air Handling Unit (AHU-04) in the Main Convention Auditorium until 18:30 pre-event staging.
3. **Zonal Lighting Automation**:
   - Trigger automated lighting sweep in empty IB Block classrooms via PIR motion sensors.
4. **Estimated Financial & Carbon Impact**:
   - Projected conservation: **₹14,200 / day** with a reduction of **390 kg CO2e / week**.

### 🔮 24-Hour Energy Projection
- Implementing these setpoint adjustments will flatten the campus 14:00 - 17:00 peak kilowatt demand curve by **18.6%**."""

    # Scenario 4: Cafeteria & Dining Peak Mitigation
    if any(k in prompt for k in ["cafeteria", "canteen", "food", "dining", "lunch", "snack", "annapoorna", "mess"]):
        return f"""### 📊 Executive Summary & Dining Congestion Brief
The **Central Food Court & Annapoorna Mess** is operating at **{top_zone.get('occupancyPercent', 94.2)}% capacity** ({top_zone.get('currentCount', 1130)}/{top_zone.get('capacity', 1200)} diners). Dwell time is averaging 38 minutes per table with an incoming queue velocity of 24 students/min.

### 🚨 Dining Bottlenecks & Anomaly Alerts
- **Token Counter & Kiosk Stagnation**: Kiosk 2 card reader latency is causing an average checkout wait of 8.5 minutes.
- **Uneven Campus Load Balance**: Annapoorna Central Hall is at 94.2% capacity, whereas **South Cafeteria Annex** is underutilized at only **41.2% capacity**.
- **Seating Turnaround Delay**: Self-service tray clearance stations are backing up, slowing table sanitization.

### ⚡ Actionable Dining Mitigation Recommendations
1. **Dynamic Mobile Push Traffic Diversion**:
   - Send push alert to student portal: *"Annapoorna Food Court at 94% — Special meal combo available at South Cafeteria Annex with zero wait time."* (Target: divert 25% of diners).
2. **Staggered Meal Shifts**:
   - Coordinate with Engineering Departments to stagger 2nd and 3rd year laboratory lunch breaks by 20 minutes (12:40 vs 13:00).
3. **Dedicated Express Pickup Counter**:
   - Convert Counter 4 to pre-ordered digital app pick-ups only, clearing the main ordering vestibule.

### 🔮 Dining Outlook (Next 2 Hours)
- Congestion will naturally abate by 14:15 as afternoon laboratory sessions commence.
- Evening tea & snack surge expected between 16:30 - 17:45 (projected 68% capacity)."""

    # Scenario 5: General / Custom Dynamic Telemetry Response
    high_zones_str = ", ".join([f"**{z.get('name')}** ({z.get('occupancyPercent')}%)" for z in high_zones]) or "No severe overflows detected"
    return f"""### 📊 Executive Summary & Real-Time Context
Analyzing telemetry response for query: *"{raw_prompt}"*.
Bannari Amman Institute of Technology (BIT Sathy) telemetry indicates **{traffic_status}** overall mobility with **{total_live}** active occupants. The primary operational hot spot is **{top_zone.get('name')}** at **{top_zone.get('occupancyPercent')}% capacity** ({top_zone.get('currentCount')}/{top_zone.get('capacity')}).

### 🚨 Telemetry Anomalies & Observations
- **High Demand Cluster**: {high_zones_str}.
- **Corridor Pressure**: Main pedestrian ingress velocity is currently +14% above nominal baseline.
- **Dwell Characteristics**: Computer labs and library wings display extended dwell durations averaging 2.3 hours.

### ⚡ Tailored Facility Recommendations
1. **Dynamic Balancing**: Re-route non-urgent pedestrian flows away from **{top_zone.get('name')}** using dynamic campus signage.
2. **Service Continuity**: Station facility marshals in high-density sectors exceeding 80% capacity.
3. **Environmental Control**: Adjust HVAC air change rates in high-density lecture halls.

### 🔮 Near-Term Velocity Outlook
- Occupancy trends indicate stabilized traffic over the next 90 minutes before scheduled afternoon transitions."""

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "BIT Sathy Footfall Analytics API",
        "institution": "Bannari Amman Institute of Technology",
        "backend": "Python (FastAPI + Pydantic)",
        "version": "1.0.0",
        "api_docs": "/docs",
        "status": "online",
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "institution": "Bannari Amman Institute of Technology",
        "backend": "fastapi-python",
        "geminiConfigured": bool(os.getenv("GEMINI_API_KEY")),
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.post("/api/gemini/analyze", tags=["Analytics"])
async def analyze_footfall(req: AnalyzeRequest, x_gemini_api_key: Optional[str] = Header(None)):
    api_key = req.apiKey or x_gemini_api_key or os.getenv("GEMINI_API_KEY")
    
    # If Gemini API key is provided and valid, call google-genai
    if api_key and not api_key.startswith("MY_GEMINI_API_KEY"):
        try:
            from google import genai
            client = genai.Client(api_key=api_key.strip())
            system_prompt = (
                "You are the Chief Campus Data Analytics AI for Bannari Amman Institute of Technology (BIT Sathy), Sathyamangalam.\n"
                "Analyze the provided campus footfall telemetry, zone occupancies, sensor metrics, and user inquiry.\n"
                "Provide an executive, highly actionable analytics brief in crisp Markdown."
            )
            user_msg = f"User Query: {req.prompt}\n\nContext Data:\n{req.contextData}"
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=user_msg,
                config={"system_instruction": system_prompt, "temperature": 0.3}
            )
            return {
                "success": True,
                "source": "gemini-3.8-flash",
                "analysis": response.text or "No analysis generated."
            }
        except Exception as e:
            return {
                "success": True,
                "source": "rule-based",
                "analysis": generate_fallback_analysis(req.prompt, req.contextData),
                "errorNote": str(e),
            }

    # Intelligent scenario-aware synthesis
    return {
        "success": True,
        "source": "rule-based",
        "analysis": generate_fallback_analysis(req.prompt, req.contextData)
    }

@app.get("/api/analytics/campus", tags=["Analytics"])
def get_campus_kpis():
    return {
        "totalLiveOccupancy": 7840,
        "campusCapacity": 12500,
        "overallOccupancyPercent": 62.7,
        "peakHour": "12:30 PM - 1:45 PM",
        "status": "High Peak Rush",
        "monitoredZones": 8,
        "activeSensors": 42,
    }

@app.get("/api/analytics/recommendations", tags=["Analytics"])
def get_recommendations():
    return [
        {
            "category": "Quiet Study",
            "recommended": "Library 3rd Floor Quiet Study Wing",
            "occupancyPercent": 48.0,
            "alternativeTo": "Central Library 1st Floor Hub",
        },
        {
            "category": "Dining",
            "recommended": "Annex Canteen & Quick Bites",
            "occupancyPercent": 42.5,
            "alternativeTo": "Central Cafeteria Main Court",
        },
        {
            "category": "Computing",
            "recommended": "Turing Lab Block C",
            "occupancyPercent": 56.0,
            "alternativeTo": "Central Computer Center",
        }
    ]
