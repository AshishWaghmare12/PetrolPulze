const routeService = require('../services/routeService');

exports.getRoute = async (req, res, next) => {
  try {
    const { sourceLat, sourceLng, destLat, destLng } = req.query;

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required query parameters: sourceLat, sourceLng, destLat, destLng' 
      });
    }

    const routeData = await routeService.getRouteOrFallback(sourceLat, sourceLng, destLat, destLng);
    res.json({
      success: true,
      message: 'Route calculated successfully',
      data: routeData
    });

  } catch (error) {
    next(error);
  }
};
