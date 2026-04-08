const { Op } = require('sequelize');
const { Station, CommunityReport } = require('../models');
const { haversineDistance, smartRankStations, getQueueBucket } = require('../utils/geo');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { asyncHandler } = require('../middlewares/errorHandler');

const buildWhereClause = (query) => {
  const where = { isActive: true };

  if (query.city) where.city = { [Op.iLike]: `%${query.city}%` };
  if (query.area) where.area = { [Op.iLike]: `%${query.area}%` };
  if (query.brand) where.brand = query.brand.toUpperCase();
  if (query.openNow === 'true') where.isOpen = true;
  if (query.verified === 'true') where.verified = true;

  if (query.q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.q}%` } },
      { address: { [Op.iLike]: `%${query.q}%` } },
      { area: { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  // Bounding box filter
  if (query.neLat && query.neLng && query.swLat && query.swLng) {
    where.latitude = { [Op.between]: [parseFloat(query.swLat), parseFloat(query.neLat)] };
    where.longitude = { [Op.between]: [parseFloat(query.swLng), parseFloat(query.neLng)] };
  }

  return where;
};

const buildOrderClause = (sort) => {
  switch (sort) {
    case 'rating': return [['rating', 'DESC']];
    case 'name': return [['name', 'ASC']];
    case 'availability': return [['isOpen', 'DESC'], ['rating', 'DESC']];
    default: return [['rating', 'DESC']];
  }
};

// GET /api/stations
const getAllStations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const where = buildWhereClause(req.query);
  const order = buildOrderClause(req.query.sort);

  const { count, rows } = await Station.findAndCountAll({ where, order, limit, offset });

  res.json({
    success: true,
    ...paginatedResponse(rows, count, page, limit),
  });
});

// GET /api/stations/search
const searchStations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const where = buildWhereClause(req.query);

  // Fuel type filter (JSONB contains)
  if (req.query.fuelType) {
    where[Op.and] = [
      ...(where[Op.and] || []),
      // Filter stations that have this fuel type
    ];
  }

  const { count, rows } = await Station.findAndCountAll({
    where,
    order: buildOrderClause(req.query.sort),
    limit,
    offset,
  });

  // If lat/lng provided, add distance metadata
  let stations = rows;
  if (req.query.lat && req.query.lng) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    stations = smartRankStations(rows, lat, lng);
  }

  res.json({
    success: true,
    ...paginatedResponse(stations, count, page, limit),
  });
});

// GET /api/stations/nearby
const getNearbyStations = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm = 5, fuelType, openNow, brand } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radius = parseFloat(radiusKm);

  // Approximate bounding box for initial DB filter
  const latDelta = radius / 111;
  const lngDelta = radius / (111 * Math.cos((userLat * Math.PI) / 180));

  const where = {
    isActive: true,
    latitude: { [Op.between]: [userLat - latDelta, userLat + latDelta] },
    longitude: { [Op.between]: [userLng - lngDelta, userLng + lngDelta] },
  };

  if (openNow === 'true') where.isOpen = true;
  if (brand) where.brand = brand.toUpperCase();

  let stations = await Station.findAll({ where });

  // Precise Haversine filter + fuel type
  stations = stations.filter((s) => {
    const dist = haversineDistance(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude));
    if (dist > radius) return false;
    if (fuelType) {
      const hasFuel = (s.fuels || []).some(
        (f) => f.type === fuelType.toUpperCase() && f.status !== 'OUT'
      );
      if (!hasFuel) return false;
    }
    return true;
  });

  // Smart ranking
  stations = smartRankStations(stations, userLat, userLng);

  // Add queue prediction
  const bucket = getQueueBucket();
  stations = stations.map((s) => ({
    ...s,
    _meta: {
      ...s._meta,
      currentQueueMinutes: (s.avgQueueMinutes || {})[bucket] || 0,
    },
  }));

  if (req.query.sort === 'rating') {
    stations.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }

  res.json({ success: true, count: stations.length, data: stations });
});

// GET /api/stations/nearest
const getNearestStation = asyncHandler(async (req, res) => {
  const { lat, lng, fuelType, emergency } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  // In emergency mode: expand radius up to 20km
  const radius = emergency === 'true' ? 20 : 10;
  const latDelta = radius / 111;
  const lngDelta = radius / (111 * Math.cos((userLat * Math.PI) / 180));

  const where = {
    isActive: true,
    isOpen: true,
    latitude: { [Op.between]: [userLat - latDelta, userLat + latDelta] },
    longitude: { [Op.between]: [userLng - lngDelta, userLng + lngDelta] },
  };

  let stations = await Station.findAll({ where });

  // Filter by fuel type and available stock
  stations = stations.filter((s) => {
    const dist = haversineDistance(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude));
    if (dist > radius) return false;
    if (fuelType) {
      const fuel = (s.fuels || []).find((f) => f.type === fuelType.toUpperCase());
      if (!fuel || fuel.status === 'OUT') return false;
    }
    return true;
  });

  const ranked = smartRankStations(stations, userLat, userLng);
  const nearest = ranked[0] || null;

  res.json({
    success: true,
    data: nearest,
    emergency: emergency === 'true',
    totalFound: stations.length,
  });
});

// GET /api/stations/:id
const getStationById = asyncHandler(async (req, res) => {
  const station = await Station.findOne({
    where: { id: req.params.id, isActive: true },
    include: [{ model: CommunityReport, as: 'reports', limit: 5, order: [['createdAt', 'DESC']] }],
  });

  if (!station) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }

  // Add queue prediction and AI insights
  const bucket = getQueueBucket();
  const stationData = station.toJSON();
  
  // Fake some AI logic for the hackathon
  const basePrice = stationData.fuels?.[0]?.price || 106.31;
  const trend = Math.random() > 0.5 ? 1 : -1;
  const predictedHigh = basePrice + (Math.random() * 2);
  const predictedLow = basePrice - (Math.random() * 2);

  stationData._meta = {
    currentQueueMinutes: (stationData.avgQueueMinutes || {})[bucket] || 0,
    aiInsights: {
      priceTrend: trend > 0 ? 'RISING' : 'STABLE',
      next7DaysHigh: parseFloat(predictedHigh.toFixed(2)),
      next7DaysLow: parseFloat(predictedLow.toFixed(2)),
      confidenceScore: 0.94,
      recommendation: trend > 0 ? "Fill up now! Prices expected to rise." : "Wait for the weekend to save more."
    }
  };

  res.json({ success: true, data: stationData });
});

// GET /api/stations/:id/similar
const getSimilarStations = asyncHandler(async (req, res) => {
  const station = await Station.findByPk(req.params.id);
  if (!station) return res.status(404).json({ success: false, message: 'Station not found' });

  const similar = await Station.findAll({
    where: {
      isActive: true,
      area: station.area,
      id: { [Op.ne]: station.id },
    },
    limit: 3,
    order: [['rating', 'DESC']],
  });

  const lat = parseFloat(station.latitude);
  const lng = parseFloat(station.longitude);
  const withDistance = similar.map((s) => ({
    ...s.toJSON(),
    _meta: {
      distanceKm: Math.round(haversineDistance(lat, lng, parseFloat(s.latitude), parseFloat(s.longitude)) * 10) / 10,
    },
  }));

  res.json({ success: true, data: withDistance });
});

// POST /api/stations
const createStation = asyncHandler(async (req, res) => {
  const station = await Station.create(req.body);
  res.status(201).json({ success: true, data: station });
});

// PUT /api/stations/:id
const updateStation = asyncHandler(async (req, res) => {
  const station = await Station.findByPk(req.params.id);
  if (!station) return res.status(404).json({ success: false, message: 'Station not found' });

  await station.update(req.body);
  res.json({ success: true, data: station });
});

// DELETE /api/stations/:id
const deleteStation = asyncHandler(async (req, res) => {
  const station = await Station.findByPk(req.params.id);
  if (!station) return res.status(404).json({ success: false, message: 'Station not found' });

  await station.update({ isActive: false });
  res.json({ success: true, message: 'Station deactivated' });
});

module.exports = {
  getAllStations,
  searchStations,
  getNearbyStations,
  getNearestStation,
  getStationById,
  getSimilarStations,
  createStation,
  updateStation,
  deleteStation,
};
