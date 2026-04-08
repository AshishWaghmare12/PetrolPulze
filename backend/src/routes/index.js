const router = require('express').Router();
const authController = require('../controllers/authController');
const stationController = require('../controllers/stationController');
const mapController = require('../controllers/mapController');
const reportController = require('../controllers/reportController');
const aiController = require('../controllers/aiController');
const { authenticate, optionalAuth, requireAdmin } = require('../middlewares/auth');

// --- AUTH ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getMe);
router.patch('/auth/saved-stations', authenticate, authController.updateSavedStations);

// --- STATIONS ---
router.get('/stations', stationController.getAllStations);
router.get('/stations/search', stationController.searchStations);
router.get('/stations/nearby', stationController.getNearbyStations);
router.get('/stations/nearest', stationController.getNearestStation);
router.get('/stations/:id', stationController.getStationById);
router.get('/stations/:id/similar', stationController.getSimilarStations);
router.post('/stations', authenticate, requireAdmin, stationController.createStation);
router.put('/stations/:id', authenticate, requireAdmin, stationController.updateStation);
router.delete('/stations/:id', authenticate, requireAdmin, stationController.deleteStation);

// --- MAP ---
router.get('/map/markers', mapController.getMarkers);
router.get('/map/route', mapController.getRoute);
router.get('/map/distance', mapController.getDistance);
router.get('/map/geocode', mapController.geocode);
router.get('/map/autocomplete', mapController.autocomplete);
router.get('/map/isochrone', mapController.getIsochrone);
router.get('/map/place-search', mapController.placeSearch);

// --- REPORTS ---
router.post('/reports', optionalAuth, reportController.createReport);
router.get('/reports', reportController.getReports);

// --- AI ENGINE ---
router.get('/ai/predict', aiController.predictPrices);
router.get('/ai/queue', aiController.predictQueue);
router.get('/ai/optimize-route', aiController.optimizeRoute);
router.get('/ai/insights', aiController.getAIInsights);

// --- HEALTH ---
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

module.exports = router;
