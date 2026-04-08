const { v4: uuidv4 } = require('uuid');

/**
 * Real-ish Station Data for Maharashtra (Mumbai, Pune, Nashik, Thane)
 * Brand: IOCL, BPCL, HPCL, Shell, Nayara
 */
const stations = [
  // --- MUMBAI ---
  {
    name: "IOCL Swagat Fuel Center",
    brand: "IOCL",
    address: "Link Road, Near Infinity Mall, Malad West",
    area: "Malad West",
    city: "Mumbai",
    latitude: 19.1844,
    longitude: 72.8341,
    phone: "022-28821234",
    verified: true,
    trustScore: 92,
    dataFreshness: "LIVE",
    fuels: [
      { type: "PETROL", price: 106.31, stockPercent: 85, status: "AVAILABLE" },
      { type: "DIESEL", price: 94.27, stockPercent: 70, status: "AVAILABLE" },
      { type: "CNG", price: 89.50, stockPercent: 40, status: "LOW" }
    ],
    services: ["air", "washroom", "card_payment", "cctv"]
  },
  {
    name: "BPCL Petrol Pump - Bandra",
    brand: "BPCL",
    address: "S.V. Road, Bandra West, Near Lucky Restaurant",
    area: "Bandra West",
    city: "Mumbai",
    latitude: 19.0544,
    longitude: 72.8402,
    phone: "022-26405566",
    verified: true,
    trustScore: 88,
    dataFreshness: "RECENT",
    fuels: [
      { type: "PETROL", price: 106.31, stockPercent: 90, status: "AVAILABLE" },
      { type: "DIESEL", price: 94.27, stockPercent: 95, status: "AVAILABLE" }
    ],
    services: ["air", "card_payment", "atm"]
  },
  {
    name: "HPCL Auto Care",
    brand: "HPCL",
    address: "Worli Naka, Dr. Annie Besant Road",
    area: "Worli",
    city: "Mumbai",
    latitude: 19.0176,
    longitude: 72.8184,
    phone: "022-24931122",
    verified: true,
    trustScore: 95,
    dataFreshness: "LIVE",
    fuels: [
      { type: "PETROL", price: 106.31, stockPercent: 100, status: "AVAILABLE" },
      { type: "DIESEL", price: 94.27, stockPercent: 100, status: "AVAILABLE" },
      { type: "EV", price: 18.00, stockPercent: 100, status: "AVAILABLE" }
    ],
    services: ["air", "washroom", "ev_charging", "food", "cctv"]
  },
  // --- PUNE ---
  {
    name: "Shell Select - Baner",
    brand: "SHELL",
    address: "Baner Road, Opposite Balewadi High Street",
    area: "Baner",
    city: "Pune",
    latitude: 18.5590,
    longitude: 73.7797,
    phone: "020-27293344",
    verified: true,
    trustScore: 98,
    dataFreshness: "LIVE",
    fuels: [
      { type: "PETROL", price: 108.45, stockPercent: 95, status: "AVAILABLE" },
      { type: "DIESEL", price: 96.12, stockPercent: 90, status: "AVAILABLE" }
    ],
    services: ["air", "washroom", "card_payment", "food", "wifi"]
  },
  {
    name: "IOCL Pune University Station",
    brand: "IOCL",
    address: "Ganeshkhind Road, Near University Circle",
    area: "Shivajinagar",
    city: "Pune",
    latitude: 18.5362,
    longitude: 73.8340,
    phone: "020-25658899",
    verified: true,
    trustScore: 85,
    dataFreshness: "RECENT",
    fuels: [
      { type: "PETROL", price: 105.90, stockPercent: 60, status: "AVAILABLE" },
      { type: "CNG", price: 87.00, stockPercent: 20, status: "LOW" }
    ],
    services: ["air", "card_payment"]
  },
  // --- NASHIK ---
  {
    name: "Nayara Energy - Nashik",
    brand: "NAYARA",
    address: "Mumbai-Agra Highway, Pathardi Phata",
    area: "Pathardi Phata",
    city: "Nashik",
    latitude: 19.9572,
    longitude: 73.7650,
    phone: "0253-2391122",
    verified: false,
    trustScore: 72,
    dataFreshness: "STALE",
    fuels: [
      { type: "PETROL", price: 107.10, stockPercent: 40, status: "AVAILABLE" },
      { type: "DIESEL", price: 95.00, stockPercent: 30, status: "LOW" }
    ],
    services: ["washroom", "puncture"]
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const formattedStations = stations.map(s => ({
      id: uuidv4(),
      slug: s.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
      ...s,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOpen: true,
      open24Hours: s.city === "Mumbai",
      isActive: true,
      fuels: JSON.stringify(s.fuels),
      avgQueueMinutes: JSON.stringify({
        '00-06': 0, '06-09': 10, '09-12': 5, '12-15': 2, '15-18': 8, '18-21': 15, '21-24': 3
      }),
      timings: JSON.stringify({
        weekdays: '06:00 - 23:00', saturday: '06:00 - 23:00', sunday: '07:00 - 22:00'
      })
    }));

    // Clear existing stations to rewrite as requested
    await queryInterface.bulkDelete('stations', null, {});
    return queryInterface.bulkInsert('stations', formattedStations);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('stations', null, {});
  }
};
