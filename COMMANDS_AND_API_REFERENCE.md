# CPR-Trainer Monitoring System
## Commands and API Reference

This document provides a consolidated list of terminal commands for server management and a reference for the REST APIs used in the system.

---

## 1. Server Management Commands

Run these commands in the terminal. Make sure your terminal is inside the `backend/` directory of the project.

### Start the Server
Starts the Node.js backend server and connects to the PostgreSQL database and ESP32 Serial port.
```bash
cd backend
npm start
```

### Stop the Server
To stop a running server, go to the terminal where the server is running and press:
```text
Ctrl + C
```
*Note: You must stop the server before uploading new code to the ESP32 via Arduino IDE, because the server locks the COM port.*

### Install Dependencies
If you downloaded the code to a new machine, you need to install the required Node modules first.
```bash
cd backend
npm install
```

### Reset Database (Warning: Deletes all data)
Re-creates the database tables and inserts the default admin account.
```bash
node scripts/setup_db.js
```

---

## 2. REST API Reference

Base URL for all APIs: `http://localhost:3001`
Note: Except for the login endpoint, all APIs require authentication via cookies (the server will return 401 Unauthorized if no valid session cookie is present).

### Authentication

**Login**
*   **Endpoint:** `/api/auth/login`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
      "username": "admin",
      "password": "admin1234"
    }
    ```
*   **Description:** Authenticates the user and sets an HTTP-only cookie.

**Logout**
*   **Endpoint:** `/api/auth/logout`
*   **Method:** `POST`
*   **Description:** Clears the session cookie.

---

### System Status

**Check Server and Serial Status**
*   **Endpoint:** `/api/status`
*   **Method:** `GET`
*   **Description:** Returns the current server status, serial connection status, and active session ID.
*   **Response:**
    ```json
    {
      "server": "online",
      "serialConnected": true,
      "totalRecords": 100,
      "activeSessionId": null
    }
    ```

---

### CPR Training Sessions

**Start a New Session**
*   **Endpoint:** `/api/sessions/start`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
      "trainee_name": "Trainee Name Here"
    }
    ```
*   **Description:** Starts a new training session and creates a record in the database.

**End Active Session**
*   **Endpoint:** `/api/sessions/end`
*   **Method:** `POST`
*   **Description:** Ends the currently active session, calculates averages and the final score, and saves them to the database.
*   **Response:** Returns a summary JSON containing total compressions, average force, average depth, average BPM, and the calculated score percentage.

**Get Active Session Info**
*   **Endpoint:** `/api/sessions/active`
*   **Method:** `GET`
*   **Description:** Checks if there is a session currently running.

**Get All Past Sessions**
*   **Endpoint:** `/api/sessions`
*   **Method:** `GET`
*   **Description:** Returns a list of all completed sessions from the database.

**Export Batch Sessions (Excel)**
*   **Endpoint:** `/api/sessions/export/batch`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
      "sessionIds": [1, 2, 3]
    }
    ```
*   **Description:** Generates and downloads an Excel (.xlsx) file containing the data of the requested sessions.

---

### CPR Data Streams

**Get Real-time History (Memory)**
*   **Endpoint:** `/api/cpr/history`
*   **Method:** `GET`
*   **Description:** Returns an array of the last 100 compressions stored in the server's memory.

**Reset In-Memory Data**
*   **Endpoint:** `/api/cpr/reset`
*   **Method:** `POST`
*   **Description:** Clears the in-memory arrays for the live dashboard charts. (Does not affect database records).
