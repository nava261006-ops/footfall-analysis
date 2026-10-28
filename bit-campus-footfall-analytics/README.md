# BIT Sathy Campus Footfall Analytics
A crowd density, zone occupancy, and footfall telemetry platform designed for the **Bannari Amman Institute of Technology (BIT Sathy)** 181-acre campus in Sathyamangalam.
The project has been separated into clean, modular, independent directories for the frontend and backends.

---

## 📁 Repository Structure

```
bit-campus-footfall-analytics/
├── frontend/               # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── src/                # UI Components, Charts, Live Campus Map, Telemetry
│   ├── public/             # Static public assets
│   ├── index.html          # HTML Entrypoint
│   ├── package.json        # Frontend dependencies & scripts
│   ├── tsconfig.json       # Frontend TypeScript configuration
│   └── vite.config.ts      # Vite config with API proxy to backend
│
├── backend/                # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   └── server.ts       # Express server, CORS, Gemini 3.8 Flash AI analytics
│   ├── package.json        # Node backend dependencies & scripts
│   ├── tsconfig.json       # Node backend TypeScript configuration
│   └── .env.example        # Port & GEMINI_API_KEY
│
├── backend-python/         # Python + FastAPI Backend (Alternative)
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py         # FastAPI app, CORS, Gemini AI & rule-based analytics
│   ├── requirements.txt    # Python dependencies (FastAPI, Uvicorn, etc.)
│   ├── run.py              # Python backend runner script
│   └── .env.example        # Port & GEMINI_API_KEY
│
├── package.json            # Root monorepo runner with concurrent scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Running Both Together)

You can run both the frontend and backend simultaneously from the root directory with a single command!

### Option A: Frontend + Node.js Express Backend (Default)

1. **Install dependencies**:
   ```powershell
   npm.cmd run install:all
   ```

2. **Start both concurrently**:
   ```powershell
   npm.cmd run dev
   ```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Node.js Backend**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

*(The frontend automatically proxies `/api/*` requests to `http://localhost:3000`)*

---

### Option B: Frontend + Python FastAPI Backend

1. **Install Python backend dependencies**:
   ```powershell
   python -m pip install -r backend-python/requirements.txt
   ```

2. **Install frontend dependencies**:
   ```powershell
   cd frontend
   npm.cmd install
   cd ..
   ```

3. **Start both concurrently**:
   ```powershell
   npm.cmd run dev:python
   ```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🛠️ Running Services Independently

You can also run each service in its own dedicated terminal window:

### 1. Frontend Terminal
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Runs at [http://localhost:5173](http://localhost:5173).

> **Note**: To route frontend API calls to Python FastAPI (port 8000) instead of Node.js (port 3000), set `VITE_API_URL=http://localhost:8000` in `frontend/.env` or run `$env:VITE_API_URL="http://localhost:8000"; npm.cmd run dev`.

### 2. Node.js Backend Terminal
```powershell
cd backend
npm.cmd install
npm.cmd run dev
```
Runs at [http://localhost:3000](http://localhost:3000).

### 3. Python FastAPI Backend Terminal
```powershell
cd backend-python
python -m pip install -r requirements.txt
python run.py
```
Runs at [http://127.0.0.1:8000](http://127.0.0.1:8000) with API Docs at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🔑 Environment Variables

- In `backend/.env` or `backend-python/.env`:
  ```ini
  GEMINI_API_KEY="your-gemini-api-key"
  ```
  *(If no API key is provided, the backend seamlessly falls back to local statistical telemetry heuristics so the app continues functioning offline!)*
