const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityReport = sequelize.define(
  'CommunityReport',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'WRONG_INFO',
        'CLOSED',
        'NO_STOCK',
        'PRICE_UPDATE',
        'QUEUE_UPDATE',
        'OTHER'
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fuelType: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    reportedPrice: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'community_reports',
    timestamps: true,
  }
);

module.exports = CommunityReport;
