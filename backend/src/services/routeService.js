const axios = require('axios');
const haversine = require('../utils/haversine');

class RouteService {
  async getRouteOrFallback(sourceLat, sourceLng, destLat, destLng) {
    const fallbackDistance = haversine(
      parseFloat(sourceLat), parseFloat(sourceLng),
      parseFloat(destLat), parseFloat(destLng)
    );

    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return this._fallbackResponse(sourceLat, sourceLng, destLat, destLng, fallbackDistance);
    }

    try {
      // Mapbox Directions API expects coordinates as lng,lat
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLng},${sourceLat};${destLng},${destLat}`;
      const response = await axios.get(url, {
        params: {
          alternatives: false,
          geometries: 'geojson',
          overview: 'full',
          steps: true,
          access_token: token
        }
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const steps = route.legs?.[0]?.steps?.map(step => ({
          instruction: step.maneuver.instruction,
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          distanceM: step.distance,
          durationS: step.duration
        })) || [];

        return {
          distance: parseFloat((route.distance / 1000).toFixed(2)), // in km
          duration: Math.ceil(route.duration / 60), // in minutes
          geometry: route.geometry,
          steps: steps,
          source: { lat: parseFloat(sourceLat), lng: parseFloat(sourceLng) },
          destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
          type: 'mapbox'
        };
      } else {
        return this._fallbackResponse(sourceLat, sourceLng, destLat, destLng, fallbackDistance);
      }
    } catch (error) {
      console.error('Mapbox API Error:', error.response?.data || error.message);
      return this._fallbackResponse(sourceLat, sourceLng, destLat, destLng, fallbackDistance);
    }
  }

  _fallbackResponse(sLat, sLng, dLat, dLng, distance) {
    return {
      distance: distance,
      duration: Math.ceil((distance / 40) * 60), // assuming avg speed 40km/h
      geometry: null,
      source: { lat: parseFloat(sLat), lng: parseFloat(sLng) },
      destination: { lat: parseFloat(dLat), lng: parseFloat(dLng) },
      type: 'haversine_fallback'
    };
  }
}

module.exports = new RouteService();
