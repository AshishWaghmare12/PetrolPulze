const pumpService = require('../services/pumpService');

exports.getAllPumps = async (req, res, next) => {
  try {
    const pumps = await pumpService.getAll();
    res.json({ success: true, message: 'Stations fetched successfully', data: pumps });
  } catch (error) {
    next(error);
  }
};

exports.getPumpById = async (req, res, next) => {
  try {
    const pump = await pumpService.getById(req.params.id);
    if (!pump) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, message: 'Station fetched successfully', data: pump });
  } catch (error) {
    next(error);
  }
};

exports.searchPumps = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required' });
    }
    const pumps = await pumpService.search(q);
    res.json({ success: true, message: 'Stations fetched successfully', data: pumps });
  } catch (error) {
    next(error);
  }
};

exports.filterPumps = async (req, res, next) => {
  try {
    const pumps = await pumpService.filter(req.query);
    res.json({ success: true, message: 'Stations filtered successfully', data: pumps });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyPumps = async (req, res, next) => {
  try {
    const { lat, lng, radius, radiusKm } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }
    
    // Support both naming conventions
    const searchRadius = parseFloat(radiusKm || radius || 5);
    
    const pumps = await pumpService.getNearby(lat, lng, searchRadius, req.query);
    res.json({ success: true, message: 'Nearby stations fetched successfully', data: pumps });
  } catch (error) {
    next(error);
  }
};

exports.updatePumpStatus = async (req, res, next) => {
  try {
    const pump = await pumpService.updateStatus(req.params.id, req.body);
    if (!pump) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, message: 'Station status updated successfully', data: pump });
  } catch (error) {
    next(error);
  }
};

exports.getAreas = async (req, res, next) => {
  try {
    const areas = await pumpService.getAreas();
    res.json({ success: true, message: 'Areas fetched successfully', data: areas });
  } catch (error) {
    next(error);
  }
};

exports.getBrands = async (req, res, next) => {
  try {
    const brands = await pumpService.getBrands();
    res.json({ success: true, message: 'Brands fetched successfully', data: brands });
  } catch (error) {
    next(error);
  }
};
