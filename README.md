# CPR Trainer Monitoring System

CPR Training Device and Web Application System
Monitors, analyzes, and stores real-time CPR data using ESP32, PostgreSQL, and WebSockets.

---

## Getting Started

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
