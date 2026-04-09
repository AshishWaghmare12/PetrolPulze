const predictPrices = asyncHandler(async (req, res) => {
  const { stationId, fuelType } = req.query;
  const basePrice = 100.0;
  const days = 7;
  const forecast = [];
  let currentPrice = basePrice;

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.45) * 1.5;
    currentPrice += change;
    forecast.push({
      day: i === 0 ? 'Today' : `Day ${i}`,
      price: parseFloat(currentPrice.toFixed(2)),
      trend: change > 0 ? 'UP' : 'DOWN'
    });
  }

  res.json({
    success: true,
    data: { forecast, confidence: 0.92 }
  });
});

const predictQueue = asyncHandler(async (req, res) => {
  const waitTime = Math.floor(Math.random() * 20);
  res.json({
    success: true,
    data: { waitTimeMinutes: waitTime, status: waitTime > 15 ? 'HIGH' : 'LOW' }
  });
});

const optimizeRoute = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng, fuelType } = req.query;
  const { Station } = require('../models');
  const { haversineDistance } = require('../utils/geo');

  // Find stations near the mid-point or along the general path
  // For a hackathon, we'll fetch all active stations and filter by distance from the line
  const allStations = await Station.findAll({ where: { isActive: true } });

  const oLat = parseFloat(originLat);
  const oLng = parseFloat(originLng);
  const dLat = parseFloat(destLat);
  const dLng = parseFloat(destLng);

  const directDistance = haversineDistance(oLat, oLng, dLat, dLng);

  // Simple heuristic: find stations whose (Dist to Origin + Dist to Destination) 
  // is not much greater than direct distance
  const recommendations = allStations
    .map(s => {
      const sLat = parseFloat(s.latitude);
      const sLng = parseFloat(s.longitude);
      const distO = haversineDistance(oLat, oLng, sLat, sLng);
      const distD = haversineDistance(dLat, dLng, sLat, sLng);
      const totalDist = distO + distD;
      const detour = totalDist - directDistance;

      const fuel = (s.fuels || []).find(f => f.type === (fuelType || 'PETROL'));
      const price = fuel ? fuel.price : 106.31;

      return {
        id: s.id,
        name: s.name,
        area: s.area,
        price,
        distanceFromRoute: parseFloat(detour.toFixed(2)),
        savings: parseFloat((Math.random() * 5).toFixed(2)) // Mock savings relative to avg
      };
    })
    .filter(s => s.distanceFromRoute < 5) // Only within 5km of the straight line
    .sort((a, b) => a.price - b.price);

  res.json({
    success: true,
    data: {
      directDistance: parseFloat(directDistance.toFixed(2)),
      totalStationsAnalyzed: allStations.length,
      cheapestAlongRoute: recommendations.slice(0, 10)
    }
  });
});

const getAIInsights = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { insight: "Fuel prices in Mumbai are expected to drop by 0.5% due to increased supply from western corridors." }
  });
});

module.exports = {
  predictPrice: predictPrices, // Map to both for compatibility
  predictPrices,
  predictQueue,
  optimizeRoute,
  getAIInsights
};
