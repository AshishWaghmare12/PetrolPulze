const axios = require('axios');
const { asyncHandler } = require('../middlewares/errorHandler');

const MAPBOX_TOKEN = () => process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE = 'https://api.mapbox.com';

// GET /api/map/markers
const getMarkers = asyncHandler(async (req, res) => {
  const { Station } = require('../models');
  const { Op } = require('sequelize');
  const { neLat, neLng, swLat, swLng } = req.query;

  const where = { isActive: true };
  if (neLat && neLng && swLat && swLng) {
    where.latitude = { [Op.between]: [parseFloat(swLat), parseFloat(neLat)] };
    where.longitude = { [Op.between]: [parseFloat(swLng), parseFloat(neLng)] };
  }

  const stations = await Station.findAll({
    where,
    attributes: ['id', 'name', 'brand', 'latitude', 'longitude', 'isOpen', 'rating', 'fuels', 'open24Hours'],
  });

  res.json({ success: true, data: stations });
});

// GET /api/map/route?originLat=&originLng=&destLat=&destLng=
const getRoute = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng, profile = 'driving-traffic' } = req.query;

  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ success: false, message: 'Origin and destination coordinates required' });
  }

  const url = `${MAPBOX_BASE}/directions/v5/mapbox/${profile}/${originLng},${originLat};${destLng},${destLat}`;
  const { data } = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN(),
      geometries: 'geojson',
      steps: true,
      overview: 'full',
      annotations: 'duration,distance,speed',
    },
  });

  if (!data.routes || data.routes.length === 0) {
    return res.status(404).json({ success: false, message: 'No route found' });
  }

  const route = data.routes[0];
  res.json({
    success: true,
    data: {
      geometry: route.geometry,
      distanceMeters: route.distance,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationSeconds: route.duration,
      durationMinutes: Math.ceil(route.duration / 60),
      steps: route.legs[0]?.steps?.map((s) => ({
        instruction: s.maneuver?.instruction,
        distanceM: s.distance,
        durationS: s.duration,
        type: s.maneuver?.type,
      })),
    },
  });
});

// GET /api/map/distance (matrix)
const getDistance = asyncHandler(async (req, res) => {
  const { originLat, originLng, destinations } = req.query;

  if (!originLat || !originLng || !destinations) {
    return res.status(400).json({ success: false, message: 'Origin and destinations required' });
  }

  let destArray;
  try {
    destArray = JSON.parse(destinations);
  } catch {
    return res.status(400).json({ success: false, message: 'destinations must be JSON array of {lat,lng}' });
  }

  const coordString = [`${originLng},${originLat}`, ...destArray.map((d) => `${d.lng},${d.lat}`)].join(';');

  const url = `${MAPBOX_BASE}/directions-matrix/v1/mapbox/driving/${coordString}`;
  const { data } = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN(),
      sources: '0',
      annotations: 'duration,distance',
    },
  });

  res.json({
    success: true,
    data: {
      durations: data.durations?.[0]?.slice(1),
      distances: data.distances?.[0]?.slice(1),
    },
  });
});

// GET /api/map/geocode?address=
const geocode = asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ success: false, message: 'address is required' });

  const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const { data } = await axios.get(url, {
    params: { access_token: MAPBOX_TOKEN(), country: 'IN', limit: 5 },
  });

  res.json({
    success: true,
    data: data.features.map((f) => ({
      placeId: f.id,
      placeName: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
      type: f.place_type,
    })),
  });
});

// GET /api/map/autocomplete?q=
const autocomplete = asyncHandler(async (req, res) => {
  const { q, lat, lng } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'q is required' });

  const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`;
  const params = {
    access_token: MAPBOX_TOKEN(),
    country: 'IN',
    limit: 8,
    types: 'place,neighborhood,locality,address',
    autocomplete: true,
  };
  if (lat && lng) params.proximity = `${lng},${lat}`;

  const { data } = await axios.get(url, { params });

  res.json({
    success: true,
    data: data.features.map((f) => ({
      id: f.id,
      text: f.text,
      placeName: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
    })),
  });
});

// GET /api/map/isochrone?lat=&lng=&minutes=
const getIsochrone = asyncHandler(async (req, res) => {
  const { lat, lng, minutes = '5,10,15', profile = 'driving' } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

  const url = `${MAPBOX_BASE}/isochrone/v1/mapbox/${profile}/${lng},${lat}`;
  const { data } = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN(),
      contours_minutes: minutes,
      polygons: true,
      denoise: 1,
    },
  });

  res.json({ success: true, data: data.features });
});

// GET /api/map/place-search?q=&lat=&lng=
const placeSearch = asyncHandler(async (req, res) => {
  const { q, lat, lng } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'q is required' });

  const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`;
  const params = { access_token: MAPBOX_TOKEN(), country: 'IN', limit: 10 };
  if (lat && lng) params.proximity = `${lng},${lat}`;

  const { data } = await axios.get(url, { params });
  res.json({
    success: true,
    data: data.features.map((f) => ({
      id: f.id,
      name: f.text,
      fullName: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
      bbox: f.bbox,
    })),
  });
});

module.exports = { getMarkers, getRoute, getDistance, geocode, autocomplete, getIsochrone, placeSearch };
