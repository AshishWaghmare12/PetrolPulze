/**
 * Haversine distance between two lat/lng points in kilometers
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Smart Nearest Ranking Engine
 * Score = open(40) + availability(25) + invETA(20) + invDistance(10) + rating(5)
 */
const smartRankStations = (stations, userLat, userLng) => {
  const scored = stations.map((s) => {
    const dist = haversineDistance(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude));
    const etaMin = dist * 3; // rough estimate: 3 min/km urban

    // Open score
    const openScore = s.isOpen ? 40 : 0;

    // Availability score (best fuel stock)
    const maxStock = Math.max(...(s.fuels || []).map((f) => f.stockPercent || 0), 0);
    const availScore = (maxStock / 100) * 25;

    // Inverse ETA score (closer = higher)
    const etaScore = Math.max(0, (1 - etaMin / 30)) * 20;

    // Inverse distance score
    const distScore = Math.max(0, (1 - dist / 10)) * 10;

    // Rating score
    const ratingScore = ((parseFloat(s.rating) - 1) / 4) * 5;

    const totalScore = openScore + availScore + etaScore + distScore + ratingScore;

    return {
      ...s.toJSON ? s.toJSON() : s,
      _meta: {
        distanceKm: Math.round(dist * 10) / 10,
        etaMinutes: Math.round(etaMin),
        smartScore: Math.round(totalScore),
      },
    };
  });

  return scored.sort((a, b) => b._meta.smartScore - a._meta.smartScore);
};

/**
 * Filter stations within bounding box
 */
const filterByBounds = (stations, neLat, neLng, swLat, swLng) => {
  return stations.filter(
    (s) =>
      s.latitude >= swLat &&
      s.latitude <= neLat &&
      s.longitude >= swLng &&
      s.longitude <= neLng
  );
};

/**
 * Get current hour bucket for queue prediction
 */
const getQueueBucket = () => {
  const h = new Date().getHours();
  if (h < 6) return '00-06';
  if (h < 9) return '06-09';
  if (h < 12) return '09-12';
  if (h < 15) return '12-15';
  if (h < 18) return '15-18';
  if (h < 21) return '18-21';
  return '21-24';
};

/**
 * Compute Trust Score from station data fields
 */
const computeTrustScore = (station) => {
  let score = 0;
  if (station.verified) score += 30;
  if (station.sourceLastCheckedAt) {
    const hoursAgo = (Date.now() - new Date(station.sourceLastCheckedAt)) / 3600000;
    score += hoursAgo < 6 ? 30 : hoursAgo < 24 ? 20 : hoursAgo < 72 ? 10 : 5;
  }
  if (station.totalReviews > 50) score += 20;
  else if (station.totalReviews > 10) score += 10;
  if (station.phone) score += 10;
  if (station.imageUrl) score += 10;
  return Math.min(score, 100);
};

module.exports = {
  haversineDistance,
  smartRankStations,
  filterByBounds,
  getQueueBucket,
  computeTrustScore,
};
