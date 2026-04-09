# PetroPluze - Mumbai's Smartest Fuel Finder

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAshishWaghmare12%2FPetrolPulze)

A polished, hackathon-ready full-stack web application for discovering fuel stations in Mumbai.

## 🚀 One-Click Deployment (Vercel)

This project is now optimized for a **Unified Full-Stack Deployment** on Vercel.

### 1. Vercel Settings
- **Root Directory**: Project Root (leave blank)
- **Framework Preset**: Other / Vite
- **Build Command**: `npm run build`
- **Output Directory**: `public`

### 2. Environment Variables
Add these in the Vercel dashboard:
- `VITE_MAPBOX_ACCESS_TOKEN`: (Your pk.xxx token)
- `MAPBOX_ACCESS_TOKEN`: (Your sk.xxx token)
- `NODE_ENV`: `production`

---

## 🛠 Features
- **Real-Time Availability**: Petrol, Diesel, CNG, and EV status.
- **Smart Routing**: Mapbox-powered ETA and route optimization.
- **Unified Backend**: Express API running on Vercel Serverless.
- **Premium UI**: Modern dark-mode aesthetic.

## 💻 Local Development
1. `npm run install-backend`
2. `cd frontend && npm install && npm run dev`
