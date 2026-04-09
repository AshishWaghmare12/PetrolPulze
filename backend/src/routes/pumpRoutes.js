const express = require('express');
const router = express.Router();
const pumpController = require('../controllers/pumpController');

router.get('/search', pumpController.searchPumps);
router.get('/filter', pumpController.filterPumps);
router.get('/nearby', pumpController.getNearbyPumps);
router.get('/areas', pumpController.getAreas);
router.get('/brands', pumpController.getBrands);
router.get('/:id', pumpController.getPumpById);
router.get('/', pumpController.getAllPumps);
router.patch('/:id/status', pumpController.updatePumpStatus);

module.exports = router;
