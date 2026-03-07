# Chalte Chalo – Full App Walkthrough

## Project Overview

**Chalte Chalo** is a full-stack MERN cab booking application (similar to Uber/Ola) with:
- Real-time ride matching via **Socket.io**
- Live map tracking using **Leaflet / OpenStreetMap**
- Separate **Rider** and **Driver** dashboards
- JWT-based authentication with role-based routing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Maps | Leaflet + OpenStreetMap |
| Auth | JWT + bcrypt |

---

## ✅ End-to-End Test Results

| Feature | Status |
|---------|--------|
| Landing Page | ✅ Working |
| Rider Registration | ✅ Working |
| Driver Registration (with vehicle info) | ✅ Working |
| Login (auto role-based redirect) | ✅ Working |
| Rider Dashboard (map, request ride) | ✅ Working |
| Driver Dashboard (toggle online, accept rides) | ✅ Working |
| Ride History Page | ✅ Working |
| Logout | ✅ Working |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### Step 1 – Backend
```bash
cd d:\newcarbookingapp\backend
npm install
node server.js
```
Backend runs at: **http://localhost:5000**

### Step 2 – Frontend
```bash
cd d:\newcarbookingapp\frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
newcarbookingapp/
├── backend/
│   ├── controllers/      # authController, rideController, driverController
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # User, Driver, Ride schemas
│   ├── routes/           # auth, rides, drivers routes
│   ├── socket/           # Socket.io event handlers
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Navbar, MapView, RideCard, StatusBadge, etc.
    │   ├── context/      # AuthContext, SocketContext, RideContext
    │   ├── pages/        # LandingPage, LoginPage, RegisterPage,
    │   │                 # RiderDashboard, DriverDashboard,
    │   │                 # RideTrackingPage, RideHistoryPage
    │   └── services/     # api.js, authService, rideService, driverService
    ├── index.html
    └── vite.config.js
```

---

## 🔐 Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 🧍 Rider | rider@test.com | password123 |
| 🚗 Driver | driver@test.com | password123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rides/request` | Request a ride |
| PUT | `/api/rides/:id/accept` | Driver accepts ride |
| PUT | `/api/rides/:id/start` | Driver starts ride |
| PUT | `/api/rides/:id/complete` | Complete ride |
| GET | `/api/rides/history` | Ride history |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/drivers/toggle-status` | Go online/offline |
| GET | `/api/drivers/nearby` | Find nearby drivers |

---

> Built with ❤️ using the MERN Stack  
> © 2024 Chalte Chalo
