const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define(
  'Station',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.ENUM(
        'IOCL',
        'BPCL',
        'HPCL',
        'SHELL',
        'NAYARA',
        'RELIANCE',
        'ESSAR',
        'PETRO',
        'OTHER'
      ),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: 'Mumbai',
    },
    state: {
      type: DataTypes.STRING(100),
      defaultValue: 'Maharashtra',
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: { min: -90, max: 90 },
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: { min: -180, max: 180 },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    timings: {
      type: DataTypes.JSONB,
      defaultValue: {
        weekdays: '06:00 - 22:00',
        saturday: '06:00 - 22:00',
        sunday: '07:00 - 21:00',
      },
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    open24Hours: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 4.0,
      validate: { min: 1.0, max: 5.0 },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Fuel availability
    fuels: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: '[{ type: PETROL|DIESEL|CNG|EV, price, stockPercent, status: AVAILABLE|LOW|OUT, lastUpdated }]',
    },
    // Services / amenities
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'air, washroom, card_payment, puncture, ev_charging, food, atm, cctv',
    },
    // Smart scoring fields
    trustScore: {
      type: DataTypes.INTEGER,
      defaultValue: 70,
      validate: { min: 0, max: 100 },
    },
    dataFreshness: {
      type: DataTypes.ENUM('LIVE', 'RECENT', 'STALE', 'UNKNOWN'),
      defaultValue: 'UNKNOWN',
    },
    // Queue prediction model input
    avgQueueMinutes: {
      type: DataTypes.JSONB,
      defaultValue: {
        '00-06': 0,
        '06-09': 8,
        '09-12': 4,
        '12-15': 3,
        '15-18': 5,
        '18-21': 10,
        '21-24': 2,
      },
    },
    // Source tracking
    sourceType: {
      type: DataTypes.ENUM('MANUAL', 'CROWDSOURCED', 'API', 'SCRAPED'),
      defaultValue: 'MANUAL',
    },
    sourcePlaceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sourceLastCheckedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Data disclaimer
    dataDisclaimer: {
      type: DataTypes.TEXT,
      defaultValue: 'Prices and availability are community-reported. Verify before visiting.',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'stations',
    timestamps: true,
    indexes: [
      { fields: ['latitude', 'longitude'] },
      { fields: ['area'] },
      { fields: ['city'] },
      { fields: ['brand'] },
      { fields: ['isOpen'] },
      { fields: ['slug'] },
    ],
  }
);

module.exports = Station;
