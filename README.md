#IoT-Based  CPR Training Manikin (CS3513)

An advanced, high-precision IoT-enabled CPR (Cardiopulmonary Resuscitation) training manikin. This project integrates multiple sensors to monitor chest compression depth, rate, force, hand placement, and complete chest recoil in real time. Powered by an ESP32 microcontroller, the training metrics are processed locally, displayed on-body, and streamed wirelessly to a reactive web dashboard for grading and analysis.

Developed in collaboration with and sponsored by Archi-tronic Co., Ltd.
---

## Getting Started
🚀 How It Works

[Sensor Layer]                                 [Gateway & Backend]           [Frontend]
- FSR 406 (Hand Release)         ---Analog--->  
- 4x Load Cells + HX711 (Force)  ---Digital--> [ESP32] --Serial/Wi-Fi--> [Node.js Server] --WebSockets--> [Web Dashboard]
- MPU6050 (Depth via IMU)        ----I2C----->                                |
- INA226 (Battery Monitor)       ----I2C----->                             (SQL)
                                                                              v
                                                                        [PostgreSQL]
#1. Sensor Acquisition & Data Fusion

Hand Release & Verification (FSR 406): Placed on the chest plate, the thin-film force sensitive resistor confirms physical touch. It is programmed as a logical interlock to prevent software drift and false compression detections.

Compression Force & Hand Position: Four 50kg Load Cells are configured in a quad layout. Their small analog millivolt ($mV$) outputs are amplified and converted to digital signals using the high-resolution 24-bit HX711 ADC module to calculate total force in kilograms ($kg$) and analyze compression symmetry.

Displacement Depth (MPU6050 GY-521): The integrated 3-axis accelerometer and gyroscope measure rapid downward velocity to accurately calculate chest compression depth in centimeters ($cm$).

Power & Diagnostic Monitoring (INA226): Measures real-time voltage and current draw from the dual 18650 battery stack to accurately estimate and display battery percentage.

2. Microcontroller Processing (ESP32)

The ESP32 NodeMCU (ESP-WROOM-32) serves as the central hub, executing high-frequency calculations:

Calculates instant Beats Per Minute (BPM) and total compression count.

Analyzes Chest Recoil Quality (ensuring complete release of pressure between compression strokes).

Determines hand placement balance based on relative readings across the quad load cell configuration.

Manages immediate local feedback using a 1.3" I2C OLED Display (system metrics, battery voltage, percentage, and FSR state) and a 10-Segment RGB LED Bar (real-time depth threshold tiers).

3. Firmware Logic Flow

The microcontroller state machine transitions between Pressing and Releasing phases:

                  [ Idle State ]
                        |
                        v (FSR > Threshold && Force > Limit)
                 [ Pressing State ]
                        | 
                        |---> Continuous Sample: Peak Force / Peak FSR
                        v (Release Detected)
                 [ Releasing State ]
                        |
                        |---> Evaluate Chest Recoil
                        |---> Update BPM & Repetition Count
                        |---> Reset IMU variables (velocity, depth, peakDepth)
                        v
                  [ Update Displays & Send Data ]


Compression Start (nowPressing Criteria): Initiated only when the FSR 406 registers touch and total force exceeds the predefined target threshold.

During Pressing: The system monitors and logs the peak force and peak FSR displacement.

Upon Release: The system evaluates chest recoil, calculates physical metrics, streams updates, and resets integration variables (velocity, depth, and peak displacement) for the next cycle.

4. Gateway & Live Web Dashboard

Data packets are serialized and transmitted via Bluetooth, serial connection, or Wi-Fi to a Node.js Gateway.

MQTT & WebSockets Protocols: Built on low-overhead MQTT for fast IoT transmissions and persistent WebSockets for low-latency live browser updates (replacing standard HTTP polling to avoid lag).

Data Storage: Final training performance histories are written directly into a PostgreSQL Database for subsequent evaluation.
### 1. Create PostgreSQL Database

```bash
psql -U postgres -c "CREATE DATABASE cpr_trainer;"
psql -U postgres -d cpr_trainer -f backend/database/schema.sql
```

### 2. Configure Environment

Edit `backend/.env` to match your PostgreSQL configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cpr_trainer
DB_USER=postgres
DB_PASSWORD=your_password
COM_PORT=COM3
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Setup Database and Admin User

You can run the full setup script to initialize the database and admin user automatically:

```bash
cd backend
node scripts/setup_db.js
```
(Default Admin - username: admin / password: admin1234)

To generate mock data for testing, you can also run:
```bash
node scripts/seed_demo_data.js
```

### 5. Start Backend Server

```bash
cd backend
npm start
```

### 6. Run Unit Tests (TDD)

```bash
cd backend
npm test
```

### 7. Open Web Dashboard

Open your browser and navigate to: **http://localhost:3000/login.html**

---

## Project Structure

```
CPR-Trainer Monitoring System/
├── backend/
│   ├── config/             (Database config)
│   ├── middlewares/        (Error handling middleware)
│   ├── routes/             (Express routers: auth, cpr, session)
│   ├── scripts/            (Setup and seed scripts)
│   ├── services/           (Serial, WebSocket, State services)
│   ├── tests/              (Jest unit tests)
│   ├── utils/              (Helper functions e.g., Excel export)
│   ├── app.js              (Express app setup)
│   ├── server.js           (Entry point & Service initialization)
│   ├── auth.js             (Authentication middleware)
│   ├── package.json
│   └── .env                (Configuration)
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html              (Login, Admin, and Dashboard pages)
│
└── esp32/
    └── cpr_trainer.ino
```

---

## Key Features

1. Real-time Monitoring: Uses WebSocket to stream data (Force, Depth, BPM, Battery) instantly from ESP32 to the browser without polling.
2. Battery Status: Displays live battery percentage of the ESP32 directly on the web dashboard.
3. Batch Data Export: Administrators can select multiple training sessions and export them as a single multi-sheet Excel (.xlsx) file.
4. Historical Tracking: Stores all compression data into a PostgreSQL database for post-training analysis.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET  | `/api/auth/me` | Get current user info |
| GET  | `/api/cpr/live` | Latest CPR data (HTTP fallback) |
| GET  | `/api/cpr/history` | Last 100 records |
| POST | `/api/sessions/start` | Start training session |
| POST | `/api/sessions/end` | End session and calculate stats |
| GET  | `/api/sessions` | List all sessions |
| GET  | `/api/sessions/:id` | View session details |
| DELETE | `/api/sessions/:id` | Delete a session |
| POST | `/api/sessions/export/batch` | Export selected sessions to Excel (.xlsx) |

*(Real-time data is served primarily via WebSocket at ws://localhost:3000)*

---

## Database Schema

### users
| Column | Type | Note |
|--------|------|------|
| id | SERIAL PK | |
| username | VARCHAR(50) | UNIQUE |
| password_hash | TEXT | bcrypt |
| role | VARCHAR(20) | 'admin' |
| created_at | TIMESTAMP | |

### sessions
| Column | Type | Note |
|--------|------|------|
| id | SERIAL PK | |
| admin_id | INTEGER | FK to users |
| trainee_name | VARCHAR(100) | |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | null = active |
| total_compressions | INTEGER | |
| avg_force_kg | NUMERIC | |
| avg_depth_cm | NUMERIC | |
| avg_bpm | NUMERIC | |
| good_count | INTEGER | |
| overall_score | VARCHAR | Example: "85%" |

### compressions
| Column | Type | Note |
|--------|------|------|
| id | SERIAL PK | |
| session_id | INTEGER | FK to sessions |
| seq | INTEGER | Sequence number |
| force_kg | NUMERIC | |
| depth_cm | NUMERIC | |
| bpm | NUMERIC | |
| force_status | VARCHAR | GOOD / TOO LIGHT / TOO HARD |
| rate_status | VARCHAR | GOOD RATE / TOO SLOW / TOO FAST |
| recoil | VARCHAR | GOOD / BAD |
| fsr_value | INTEGER | |
| recorded_at | TIMESTAMP | |

---

## Notes

- Close the Serial Monitor in Arduino IDE before running `node server.js` to avoid port conflict.
- The JSON string from the ESP32 must be output on a single line per record.
- Match `COM_PORT` in `.env` with the port shown in your Device Manager.
- Ensure the PostgreSQL service is running before starting the Node server.

---

## CPR Standards

| Parameter | Target |
|-----------|--------|
| Force | 5.25 - 6.3 kg |
| Depth | 5.0 - 6.0 cm |
| Rate | 100 - 120 BPM |
| Recoil | Full recoil (GOOD) |
