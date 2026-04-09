import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const stationsApi = {
  // Uses /api/pumps now instead of /api/stations
  getAll:    (params) => api.get('/pumps', { params }),
  search:    (params) => api.get('/pumps/search', { params }), // queries 'q'
  nearby:    (params) => api.get('/pumps/nearby', { params }), // lat, lng, radius
  nearest:   (params) => api.get('/pumps/nearby', { params }), // route to same backend
  getById:   (id)     => api.get(`/pumps/${id}`),
  getSimilar:(id)     => api.get('/pumps/nearby', { params: { lat: 19.07, lng: 72.87, radius: 10 } }),
  updateStatus: (id, data) => api.patch(`/pumps/${id}/status`, data),
  getAreas:  () => api.get('/pumps/areas'),
  getBrands: () => api.get('/pumps/brands'),
};

export const mapApi = {
  markers:    (params) => api.get('/pumps', { params }),
  route:      (params) => api.get('/route', { params }), // sourceLat, sourceLng, destLat, destLng
  distance:   (params) => Promise.resolve({ data: [] }),
  geocode:    (address) => Promise.resolve({ data: [] }),
  autocomplete: (q, lat, lng) => api.get('/pumps/search', { params: { q, lat, lng } }),
  isochrone:  (params) => Promise.resolve({ data: [] }),
  placeSearch:(params) => Promise.resolve({ data: [] }),
};

export const reportsApi = {
  create:       (data)      => Promise.resolve({}),
  getByStation: (stationId) => Promise.resolve({ data: [] }),
};

export const aiApi = {
  predictPrices: (city, fuelType) => Promise.resolve({ data: [] }),
  predictQueue: (city, hour, day) => Promise.resolve({ data: [] }),
  optimizeRoute: (originLat, originLng, destLat, destLng, fuelType) => Promise.resolve({ data: [] }),
  getInsights: (lat, lng) => Promise.resolve({ data: [] }),
};

export const authApi = {
  register: (data) => Promise.resolve({}),
  login:    (data) => Promise.resolve({}),
  me:       ()     => Promise.resolve({}),
  updateSaved: (data) => Promise.resolve({}),
};

export default api;
