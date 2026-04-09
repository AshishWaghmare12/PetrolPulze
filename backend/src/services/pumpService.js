const readJson = require('../utils/readJson');
const writeJson = require('../utils/writeJson');
const haversine = require('../utils/haversine');

class PumpService {
  async getAll() {
    return await readJson();
  }

  async getById(id) {
    const pumps = await readJson();
    return pumps.find(p => p.id === id);
  }

  async search(query) {
    const pumps = await readJson();
    const q = query.toLowerCase();
    return pumps.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.area?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  }

  async filter(filters) {
    let pumps = await readJson();

    if (filters.petrol === 'true') pumps = pumps.filter(p => p.petrol_available);
    if (filters.diesel === 'true') pumps = pumps.filter(p => p.diesel_available);
    if (filters.cng === 'true') pumps = pumps.filter(p => p.cng_available);
    if (filters.ev === 'true') pumps = pumps.filter(p => p.ev_charging_available);
    if (filters.open === 'true') pumps = pumps.filter(p => p.open_now);

    if (filters.area) {
      pumps = pumps.filter(p => p.area?.toLowerCase() === filters.area.toLowerCase());
    }
    if (filters.brand) {
      pumps = pumps.filter(p => p.brand?.toLowerCase() === filters.brand.toLowerCase());
    }

    return pumps;
  }

  async getNearby(lat, lng, radius = 5, filters = {}) {
    const pumps = await readJson();
    
    // 1. Initial distance map
    let results = pumps.map(p => {
      const distance = haversine(
        parseFloat(lat),
        parseFloat(lng),
        p.latitude,
        p.longitude
      );
      return { ...p, distance };
    });

    // 2. Filter by distance
    results = results.filter(p => p.distance <= radius);

    // 3. Apply business filters
    if (filters.fuelType) {
      const type = filters.fuelType.toUpperCase();
      results = results.filter(p => {
        // Handle both older boolean fields and newer fuels array
        if (type === 'PETROL' && p.petrol_available) return true;
        if (type === 'DIESEL' && p.diesel_available) return true;
        if (type === 'CNG' && p.cng_available) return true;
        if (type === 'EV' && p.ev_charging_available) return true;
        
        return p.fuels?.some(f => f.type === type && f.status !== 'OUT');
      });
    }

    if (filters.openNow === 'true' || filters.openNow === true) {
      results = results.filter(p => p.open_now || p.isOpen);
    }

    if (filters.brand) {
      results = results.filter(p => p.brand?.toLowerCase() === filters.brand.toLowerCase());
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  async updateStatus(id, updateData) {
    const pumps = await readJson();
    const index = pumps.findIndex(p => p.id === id);
    if (index === -1) return null;

    const allowedUpdates = [
      'petrol_available', 'diesel_available', 'cng_available',
      'ev_charging_available', 'open_now', 'queue_level'
    ];

    const updatedPump = { ...pumps[index], updated_at: new Date().toISOString() };

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updatedPump[key] = updateData[key];
      }
    }

    pumps[index] = updatedPump;
    await writeJson(pumps);
    return updatedPump;
  }

  async getAreas() {
    const pumps = await readJson();
    const areas = [...new Set(pumps.map(p => p.area).filter(Boolean))];
    return areas.sort();
  }

  async getBrands() {
    const pumps = await readJson();
    const brands = [...new Set(pumps.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  }
}

module.exports = new PumpService();
