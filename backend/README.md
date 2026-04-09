# PetrolPulze X - Backend

A lightweight Node.js + Express backend using file-based JSON storage for the PetrolPulze X smart fuel station finder. No database required.

## Prerequisites
- Node.js (v16+)
- npm or yarn

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the `backend` directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your `MAPBOX_ACCESS_TOKEN` in the `.env` file for routing support.

3. **Start the Server**
   - For development (with auto-reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

## Data File

Pump data is stored at `data/petrolPumps.json`. You can modify this file manually or use the status update API to mock real-time updates.

## Available APIs

### **Pumps**
- `GET /api/pumps` - Fetch all stations
- `GET /api/pumps/:id` - Fetch station detail by ID
- `GET /api/pumps/search?q=keyword` - Search by name, address, area, or brand
- `GET /api/pumps/filter?petrol=true&diesel=false&cng=true&ev=false&open=true&area=Bandra&brand=HP` - Filter stations
- `GET /api/pumps/nearby?lat=19.0&lng=72.8&radius=10` - Find nearby stations by coordinates
- `GET /api/pumps/areas` - Get all available areas
- `GET /api/pumps/brands` - Get all available brands
- `PATCH /api/pumps/:id/status` - Update specific fields (e.g. `{"open_now": false, "queue_level": "none"}`)

### **Routes**
- `GET /api/route?sourceLat=...&sourceLng=...&destLat=...&destLng=...` - Calculate route between two points using Mapbox (falls back to Haversine straight-line distance if API fails).
