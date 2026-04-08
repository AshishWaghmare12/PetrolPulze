# ⛽ PetrolPulze X

**Mumbai's smartest fuel station finder** — Real-time availability, Mapbox routing, Smart Nearest Ranking, EV tracking, Compare Drawer, Drive-Time Reachability Rings, and Community Reports.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Mapbox account (free tier works)

---

### 1. Clone & Install

```bash
git clone <your-repo>
cd petrolpulze-x

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

---

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/petrolpulze_x
JWT_SECRET=your_super_secret_jwt_min_32_chars_here
JWT_EXPIRES_IN=7d
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91...   # Your Mapbox token
FRONTEND_URL=http://localhost:5173
```

**Get Mapbox Token:**
1. Sign up at https://mapbox.com
2. Account → Access Tokens → Create token
3. Enable all public scopes (maps, geocoding, directions, isochrone)

---

### 3. Setup Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE petrolpulze_x;"

# Run migrations + seed 50 Mumbai stations
cd backend
npm run seed
```

Expected output:
```
✅ Connected to database
✅ Tables recreated
✅ Admin user created: admin@petrolpulze.com
✅ Test user created
   Seeded 10/50 stations
   Seeded 20/50 stations
   ...
🎉 Seed complete!
   Admin: admin@petrolpulze.com / Admin@12345
   Test:  test@petrolpulze.com / Test@12345
```

---

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91...   # Same Mapbox token
VITE_API_URL=http://localhost:5000/api
```

---

### 5. Run

```bash
# Terminal 1 - Backend API
cd backend && npm run dev
# → API running on http://localhost:5000

# Terminal 2 - Frontend
cd frontend && npm run dev
# → App running on http://localhost:5173
```

Open http://localhost:5173 🎉

---

## 📁 Project Structure

```
petrolpulze-x/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app (cors, helmet, rate-limit)
│   │   ├── server.js              # Entry point
│   │   ├── config/
│   │   │   └── database.js        # Sequelize + PostgreSQL config
│   │   ├── models/
│   │   │   ├── User.js            # JWT auth + bcrypt
│   │   │   ├── Station.js         # Full station schema (JSONB fuels)
│   │   │   ├── CommunityReport.js # Community reports
│   │   │   └── index.js           # Associations
│   │   ├── controllers/
│   │   │   ├── authController.js      # register/login/me
│   │   │   ├── stationController.js   # All 8 station endpoints
│   │   │   ├── mapController.js       # Mapbox API wrappers
│   │   │   └── reportController.js    # Community reports
│   │   ├── middlewares/
│   │   │   ├── auth.js            # JWT middleware
│   │   │   └── errorHandler.js    # Centralized errors + asyncHandler
│   │   ├── routes/
│   │   │   └── index.js           # All routes
│   │   ├── utils/
│   │   │   ├── geo.js             # Haversine + Smart Ranking Engine
│   │   │   └── pagination.js      # Pagination helpers
│   │   └── seed/
│   │       ├── stationData.js     # 50 real Mumbai stations
│   │       └── index.js           # Seed script
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx               # React entry
    │   ├── App.jsx                # Router
    │   ├── index.css              # Design system (Syne + DM Sans)
    │   ├── store/
    │   │   └── index.js           # Zustand (useAppStore + useMapStore)
    │   ├── services/
    │   │   └── api.js             # Axios service layer
    │   ├── pages/
    │   │   ├── HomePage.jsx       # Landing page with animations
    │   │   ├── MapPage.jsx        # Main map dashboard
    │   │   ├── FindFuelPage.jsx   # Search + list view
    │   │   ├── StationDetailPage.jsx  # Full station detail
    │   │   ├── AboutPage.jsx      # 3D canvas about page
    │   │   └── AuthPage.jsx       # Login / Register
    │   └── components/
    │       ├── layout/
    │       │   └── Navbar.jsx
    │       ├── map/
    │       │   └── MapView.jsx    # Mapbox GL JS map
    │       └── stations/
    │           ├── StationCard.jsx
    │           └── CompareDrawer.jsx
    └── .env.example
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/saved-stations` | Save/unsave a station |

### Stations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stations` | List all (paginated) |
| GET | `/api/stations/search` | Search with filters |
| GET | `/api/stations/nearby` | Smart-ranked nearby stations |
| GET | `/api/stations/nearest` | Single nearest station |
| GET | `/api/stations/:id` | Full station details |
| GET | `/api/stations/:id/similar` | 3 similar stations |

**Query Parameters for `/nearby`:**
```
lat=19.1776&lng=72.8328   # Required
radiusKm=10               # Default: 5
fuelType=PETROL           # PETROL|DIESEL|CNG|EV
openNow=true
brand=IOCL                # IOCL|BPCL|HPCL|SHELL|NAYARA
page=1&limit=20
sort=nearest|rating|name|availability
```

### Map
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/markers` | Map markers (minimal data) |
| GET | `/api/map/route` | Mapbox Directions route |
| GET | `/api/map/geocode` | Geocode an address |
| GET | `/api/map/autocomplete` | Place autocomplete |
| GET | `/api/map/isochrone` | Drive-time reachability rings |

### Community Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Submit a report |
| GET | `/api/reports?stationId=` | Get station reports |

---

## 📊 Sample API Responses

### GET /api/stations/nearby?lat=19.1776&lng=72.8328&radiusKm=5

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "uuid-here",
      "name": "Shell V-Power - Andheri West",
      "brand": "SHELL",
      "area": "Andheri West",
      "latitude": "19.1334",
      "longitude": "72.8328",
      "isOpen": true,
      "open24Hours": true,
      "rating": "4.8",
      "fuels": [
        { "type": "PETROL", "price": 110.50, "stockPercent": 96, "status": "AVAILABLE" },
        { "type": "DIESEL", "price": 94.00, "stockPercent": 90, "status": "AVAILABLE" },
        { "type": "EV", "price": 17.50, "stockPercent": 85, "status": "AVAILABLE" }
      ],
      "services": ["air", "washroom", "card_payment", "ev_charging", "food", "wifi"],
      "trustScore": 98,
      "_meta": {
        "distanceKm": 1.2,
        "etaMinutes": 4,
        "smartScore": 87,
        "currentQueueMinutes": 3
      }
    }
  ]
}
```

### GET /api/map/route?originLat=19.17&originLng=72.83&destLat=19.13&destLng=72.83

```json
{
  "success": true,
  "data": {
    "geometry": { "type": "LineString", "coordinates": [[72.83, 19.17], ...] },
    "distanceKm": 4.8,
    "durationMinutes": 12,
    "steps": [
      { "instruction": "Head south on Western Express Highway", "distanceM": 1200, "durationS": 180 }
    ]
  }
}
```

---

## 🧠 Intelligence Features

### Smart Nearest Ranking Engine
Ranks stations using a weighted score:
- **40%** — Open status (is it open right now?)
- **25%** — Fuel availability (best stock %)
- **20%** — Drive ETA (inverse, closer = higher)
- **10%** — Distance (Haversine)
- **5%** — Community rating

### Station Trust Score (0–100)
- +30 for team verification
- +30 for data freshness (< 6 hours)
- +20 for 50+ reviews
- +10 for phone number on file
- +10 for verified photo

### Live Queue Prediction
Uses time-of-day bucket model (00-06, 06-09, 09-12, etc.) stored per station.
Returns `currentQueueMinutes` based on current hour.

### Drive-Time Reachability Rings
Calls Mapbox Isochrone API for 5/10/15 minute drive-time polygons. Rendered as translucent overlays on the map.

---

## 🗄️ Database Schema

### `users` table
- id (UUID), name, email, password (bcrypt), role, savedStations (UUID[]), preferences (JSONB)

### `stations` table
- id, name, slug, brand, address, area, city, lat/lng
- fuels (JSONB array), services (string[])
- isOpen, open24Hours, timings (JSONB)
- rating, totalReviews, verified
- trustScore, dataFreshness
- avgQueueMinutes (JSONB by hour bucket)
- sourceType, sourcePlaceId, sourceLastCheckedAt

### `community_reports` table
- id, stationId, userId, type, message, fuelType, reportedPrice, status, upvotes

---

## 🔒 Security
- JWT tokens with configurable expiry
- bcrypt password hashing (salt rounds: 12)
- Helmet.js security headers
- CORS configured per environment
- Rate limiting (200 req / 15 min per IP)
- Admin-only station creation/edit/delete

---

## 🛠️ Development Commands

```bash
# Backend
npm run dev          # Nodemon dev server
npm run seed         # Reset DB + seed 50 stations
npm start            # Production server

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🚀 Production Deployment

### Backend (Railway / Render / Fly.io)
1. Set all env vars from `.env.example`
2. Set `NODE_ENV=production`
3. Run `npm run seed` once after first deploy
4. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output dir: `dist`
3. Set `VITE_MAPBOX_ACCESS_TOKEN` and `VITE_API_URL`

---

## 🗺️ Mapbox Services Used
| Feature | Service |
|---------|---------|
| Map rendering | Mapbox GL JS (dark-v11 style) |
| Place search & autocomplete | Mapbox Geocoding API v5 |
| Directions + ETA | Mapbox Directions API v5 |
| Drive-time rings | Mapbox Isochrone API v1 |
| Distance matrix | Mapbox Matrix API v1 |

---

## 🧪 Testing Checklist

After seeding:
- [ ] `GET /api/health` → `{ status: "ok" }`
- [ ] `POST /api/auth/login` with admin creds → JWT token
- [ ] `GET /api/stations?limit=5` → 5 stations
- [ ] `GET /api/stations/nearby?lat=19.1776&lng=72.8328` → Ranked list
- [ ] `GET /api/map/route?originLat=19.17&originLng=72.83&destLat=19.23&destLng=72.86` → Route geojson
- [ ] `GET /api/map/isochrone?lat=19.17&lng=72.83&minutes=5,10,15` → 3 polygon features
- [ ] `GET /api/map/autocomplete?q=andheri` → Place suggestions
- [ ] Frontend map loads with station markers
- [ ] Clicking a marker shows popup
- [ ] Route button draws blue line on map
- [ ] Drive Rings button shows isochrone polygons
- [ ] Compare drawer works (add 2-3 stations)
- [ ] Station detail page shows fuel cards
- [ ] Report modal submits successfully

---

## 📝 Migration Notes (from Google API version)

| Old (Google) | New (Mapbox) |
|-------------|-------------|
| `GOOGLE_MAPS_API_KEY` | `MAPBOX_ACCESS_TOKEN` |
| Google Maps JS SDK | `mapbox-gl` npm package |
| Places API autocomplete | `/api/map/autocomplete` |
| Distance Matrix API | Mapbox Matrix API |
| Directions API | Mapbox Directions API |
| Geocoding API | Mapbox Geocoding API v5 |
| `google.maps.Map` | `new mapboxgl.Map()` |
| `google.maps.Marker` | `new mapboxgl.Marker()` |
| `google.maps.Polyline` | GeoJSON line layer |

---

Built with ❤️ in Mumbai. **PetrolPulze X** — Never run out of fuel on the highway again.
