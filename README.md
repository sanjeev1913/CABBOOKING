# 🚗 Chalte Chalo — Car Booking App

A real-time ride-booking web application inspired by Uber, built with a **React** frontend and a **Node.js + Socket.IO** backend. Customers can book rides and track their rider live on a map, while riders can manage their duty status and accept ride offers in real time.

---

## 📁 Project Architecture

```
carbooking app/
├── Ride_Booking_Frontend/       # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerDashboard.jsx   # Customer ride booking UI
│   │   │   └── RiderDashboard.jsx      # Rider duty management UI
│   │   ├── services/
│   │   │   ├── api.js                  # REST API calls (auth, rides)
│   │   │   └── socket.js               # Socket.IO client management
│   │   ├── App.jsx                     # Root component & routing
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── vite.config.js
│   └── package.json
│
└── Ride_Booking_Server/         # Node.js + Express Backend
    ├── app.js                          # App entry point & server setup
    ├── config/
    │   └── connect.js                  # MongoDB connection
    ├── controllers/
    │   ├── auth.js                     # Auth logic (sign in / register)
    │   ├── ride.js                     # Ride CRUD logic
    │   └── sockets.js                  # Real-time Socket.IO event handlers
    ├── middleware/
    │   ├── authentication.js           # JWT auth middleware
    │   ├── error-handler.js            # Global error handler
    │   └── not-found.js                # 404 handler
    ├── models/
    │   ├── User.js                     # User schema (customer/rider)
    │   └── Ride.js                     # Ride schema
    ├── routes/
    │   ├── auth.js                     # /auth routes
    │   └── ride.js                     # /ride routes
    ├── errors/                         # Custom error classes
    ├── utils/                          # Helper utilities
    ├── .env                            # Environment variables (not committed)
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 19, Vite, React-Leaflet, Socket.IO Client |
| Backend     | Node.js, Express.js, Socket.IO                |
| Database    | MongoDB (via Mongoose)                        |
| Auth        | JWT (Access + Refresh Tokens)                 |
| Maps        | Leaflet.js + React-Leaflet                    |
| Real-time   | Socket.IO (WebSockets)                        |
| Dev Tools   | Nodemon, ESLint                               |

---

## 🔧 Backend Development

### Server Setup (`app.js`)
- Express app with CORS enabled
- HTTP server wrapped with **Socket.IO** for real-time communication
- Routes mounted at `/auth` and `/ride`
- Global error handling middleware

### REST API Endpoints

#### Auth (`/auth`)
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/auth/signin`        | Login or auto-register by phone & role |
| POST   | `/auth/refresh-token` | Get a new access token               |

#### Rides (`/ride`) — Protected by JWT
| Method | Endpoint                    | Description              |
|--------|---------------------------  |--------------------------|
| POST   | `/ride/create`              | Create a new ride        |
| PATCH  | `/ride/accept/:rideId`      | Rider accepts a ride     |
| PATCH  | `/ride/update/:rideId`      | Update ride status       |
| GET    | `/ride/rides`               | Get user's ride history  |

### Database Models

#### User
```js
{ role: "customer" | "rider", phone: String (unique) }
```

#### Ride
```js
{
  vehicle: "bike" | "auto" | "cabEconomy" | "cabPremium",
  pickup: { address, latitude, longitude },
  drop:   { address, latitude, longitude },
  distance: Number,
  fare: Number,
  customer: ObjectId (ref: User),
  rider: ObjectId (ref: User),
  status: "SEARCHING_FOR_RIDER" | "START" | "ARRIVED" | "COMPLETED",
  otp: String
}
```

### Real-time Socket Events (`controllers/sockets.js`)

All socket connections are authenticated via JWT passed in the `access_token` header.

#### Rider Events
| Event            | Direction       | Description                              |
|------------------|-----------------|------------------------------------------|
| `goOnDuty`       | Client → Server | Rider marks themselves available with GPS coords |
| `goOffDuty`      | Client → Server | Rider goes offline                       |
| `updateLocation` | Client → Server | Rider sends updated GPS position         |

#### Customer Events
| Event              | Direction       | Description                               |
|--------------------|-----------------|-------------------------------------------|
| `subscribeToZone`  | Client → Server | Customer subscribes to nearby rider updates |
| `searchrider`      | Client → Server | Start searching for riders for a ride     |
| `cancelRide`       | Client → Server | Cancel an active ride search              |

#### Shared Events
| Event                      | Direction       | Description                              |
|----------------------------|-----------------|------------------------------------------|
| `nearbyriders`             | Server → Client | List of riders within 60km               |
| `rideOffer`                | Server → Rider  | Offer a ride to a nearby rider           |
| `rideAccepted`             | Client → Server | Rider accepts the ride offer             |
| `subscribeToriderLocation` | Client → Server | Subscribe to live rider GPS updates      |
| `riderLocationUpdate`      | Server → Client | Rider's current GPS position             |
| `rideData`                 | Server → Client | Full ride details                        |
| `rideCanceled`             | Server → Client | Notify that ride was canceled            |

---

## 🎨 Frontend Development

### Components

#### `App.jsx`
- Landing page with the **Chalte Chalo** branding
- Navigation with Ride / Drive / Business / About links
- Animated car hero section
- Role selection: **Rider** or **Driver (Customer)**

#### `CustomerDashboard.jsx`
- Phone-based login (no password)
- Map view showing pickup/drop location selection
- Vehicle type selection (Bike, Auto, Economy, Premium)
- Real-time nearby rider pins on the map
- Ride booking, fare estimation, and Live OTP-verified pickup
- Live rider location tracking on the map

#### `RiderDashboard.jsx`
- Phone-based login
- GPS-based On Duty / Off Duty toggle
- Incoming ride offer notifications
- Ride acceptance and status update flow (Start → Arrived → Complete)

### Services

#### `services/api.js`
- `loginAPI(phone, role)` — Authenticates via REST and returns a JWT access token

#### `services/socket.js`
- `initializeSocket(token)` — Connects to the Socket.IO server with JWT auth
- `getSocket()` — Returns the active socket instance
- `disconnectSocket()` — Cleanly disconnects the socket

---

## ⚙️ Project Setup and Configuration

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/sanjeev1913/carbookingapp.git
cd carbookingapp
```

### 2. Backend Configuration

Navigate to the server folder and install dependencies:

```bash
cd Ride_Booking_Server
npm install
```

Create a `.env` file in `Ride_Booking_Server/`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ride_booking
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=4d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=30d
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Frontend Configuration

Navigate to the frontend folder and install dependencies:

```bash
cd ../Ride_Booking_Frontend
npm install
```

> The frontend connects to `http://127.0.0.1:3000` by default. No additional configuration is needed for local development.

---

## ▶️ Project Execution

### Start the Backend

```bash
cd Ride_Booking_Server
npm run start
```

The backend server will start at: **`http://localhost:3000`**

> Uses `nodemon` — the server auto-restarts on file changes.

### Start the Frontend

Open a **new terminal** and run:

```bash
cd Ride_Booking_Frontend
npm run dev
```

The frontend will be available at: **`http://localhost:5173`**

### Access the App

1. Open `http://localhost:5173` in your browser
2. Choose **Rider** or **Driver** from the home screen
3. Enter your phone number to sign in (auto-registers on first use)
4. Start booking or accepting rides!

---

## 🔒 Security Notes

- The `.env` file is **never committed** to version control
- All Socket.IO connections are authenticated using JWT
- Tokens are short-lived (4 days) with refresh token support (30 days)
- CORS is enabled for all origins in development — restrict this in production

---

## � Team

This project was collaboratively developed by the following team members:

| Name | Role | Email |
|------|------|-------|
| **Sanjeev Kumar** | Team Lead | sanjeevkumar191384@gmail.com |
| **Sanjay kushwaha** | Member | 
| **Sitanshu ranjan** | Member |
 

---

## �📄 License

This project is licensed under the MIT License.

---

> Built with ❤️ by [sanjeev1913](https://github.com/sanjeev1913)
