const { CommunityReport, Station } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');

// POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const { stationId, type, message, fuelType, reportedPrice } = req.body;

  const station = await Station.findByPk(stationId);
  if (!station) return res.status(404).json({ success: false, message: 'Station not found' });

  const report = await CommunityReport.create({
    stationId,
    userId: req.user?.id || null,
    type,
    message,
    fuelType,
    reportedPrice,
  });

  res.status(201).json({ success: true, data: report, message: 'Report submitted. Thank you!' });
});

// GET /api/reports?stationId=
const getReports = asyncHandler(async (req, res) => {
  const { stationId } = req.query;
  const where = { status: 'PENDING' };
  if (stationId) where.stationId = stationId;

  const reports = await CommunityReport.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  res.json({ success: true, data: reports });
});

module.exports = { createReport, getReports };
