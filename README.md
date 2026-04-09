# PetroPluze - Mumbai's Smartest Fuel Finder

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAshishWaghmare12%2FPetrolPulze&root-directory=frontend)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AshishWaghmare12/PetrolPulze)

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
- **NPM / Yarn**

---

## ⚙️ Project Setup

1. **Clone the repository**
2. **Install dependencies** for both frontend and backend.
3. **Configure Environment Variables** (see below).

---

## 🚀 Environment Variables setup

You need to provide your Mapbox key for the routing and maps to work.

### Backend (`backend/.env`)
Ensure your `backend/.env` file contains at least:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=supersecret123
JWT_EXPIRES_IN=7d
MAPBOX_ACCESS_TOKEN=your_mapbox_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
Ensure your `frontend/.env` file contains:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_key
```

---

## 💻 Running the Application

### 1️⃣ Start Backend
```bash
cd backend
npm install
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
- Global rebranding to **PetroPluze**.
- Integrated real-time data fetching for landing pages.
- Standardized UI components and refined animations.
