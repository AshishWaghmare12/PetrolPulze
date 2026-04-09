# PetrolPulze - Mumbai's Smartest Fuel Finder

A polished, hackathon-ready full-stack web application designed to help users discover, filter, and plan routes to petrol pumps across Mumbai.

## Features
- **Real-Time Availability**: Find stations with stock of Petrol, Diesel, CNG, or EV charging.
- **Smart Map Integration**: Powered by Mapbox for intelligent distance, ETA calculation, and dynamic route optimization.
- **Advanced Station Details**: Side-by-side comparison, AI-based mock price trends, services available, and queue length indicator.
- **Dark Mode Aesthetic**: A highly polished, modern UI layout giving a premium vibe.

---

## 🛠 Prerequisites

Before starting the project, ensure you have the following installed:
- **Node.js** (v18+)
- **PostgreSQL** (v13+)
- **NPM / Yarn**

---

## ⚙️ PostgreSQL Database Setup

1. **Install and Start PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/) and start the service.
2. **Open psql or PgAdmin**:
   ```sql
   -- Create a database matching the config in backend/.env
   CREATE DATABASE petrolpulze;
   
   -- Provide you have a user with credentials configured OR use postgres
   -- Make sure to update the credentials in backend/.env to match your setup!
   ```

---

## 🚀 Environment Variables setup

You need to provide your Mapbox key for the routing and maps to work.

### Backend (`backend/.env`)
Ensure your `backend/.env` file contains at least:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_db_password@localhost:5432/petrolpulze
JWT_SECRET=supersecret123
JWT_EXPIRES_IN=7d
MAPBOX_ACCESS_TOKEN=your_mapbox_key
FRONTEND_URL=http://localhost:5173
```
*(Update `postgres:your_db_password` to match your local PostgreSQL credentials)*

### Frontend (`frontend/.env`)
Ensure your `frontend/.env` file contains:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_key
```

---

## 💻 Running the Application

### 1️⃣ Setup & Seed Backend (Database)
```bash
cd backend
npm install

# Run the database seeding explicitly (Drops old data, recreates tables & inserts realistic Mumbai stations)
npm run seed

# Start development server on port 5000
npm run dev
```

### 2️⃣ Start Frontend (React + Vite)
Open a new terminal window:
```bash
cd frontend
npm install

# Start the frontend app on port 5173
npm run dev
```

Your app will be available at: **http://localhost:5173**

---

## 📝 Changes Made
- Transformed design into a dark, modern aesthetic.
- Removed arbitrary AI-marketing texts and the pseudo "About" page from all routes and UI navigation menus.
- Configured a local PostgreSQL connection mapping and integrated `npm run seed` for bulk realistic data ingestion.
- Implemented and fully wired the standalone Station Details view (`/station/:id`) featuring a live Mapbox preview component.
- Implemented responsive smart markers on the main Map page properly linked to popup routes.
- Adjusted UI layouts, cleaned up React warnings, and stripped unutilized placeholders.
