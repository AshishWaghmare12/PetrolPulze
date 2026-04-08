const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/predict', aiController.predictPrice);

module.exports = router;
