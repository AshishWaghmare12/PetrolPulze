const sequelize = require('../config/database');
const User = require('./User');
const Station = require('./Station');
const CommunityReport = require('./CommunityReport');

// Associations
User.hasMany(CommunityReport, { foreignKey: 'userId', as: 'reports' });
CommunityReport.belongsTo(User, { foreignKey: 'userId', as: 'reporter' });

Station.hasMany(CommunityReport, { foreignKey: 'stationId', as: 'reports' });
CommunityReport.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

module.exports = {
  sequelize,
  User,
  Station,
  CommunityReport,
};
