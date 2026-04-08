import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ppx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Return res.data so callers ko success aur data proper mile
api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  updateSaved: (data) => api.patch('/auth/saved-stations', data),
};

export const stationsApi = {
  getAll:    (params) => api.get('/stations', { params }),
  search:    (params) => api.get('/stations/search', { params }),
  nearby:    (params) => api.get('/stations/nearby', { params }),
  nearest:   (params) => api.get('/stations/nearest', { params }),
  getById:   (id)     => api.get(`/stations/${id}`),
  getSimilar:(id)     => api.get(`/stations/${id}/similar`),
};

export const mapApi = {
  markers:    (params) => api.get('/map/markers', { params }),
  route:      (params) => api.get('/map/route', { params }),
  distance:   (params) => api.get('/map/distance', { params }),
  geocode:    (address) => api.get('/map/geocode', { params: { address } }),
  autocomplete: (q, lat, lng) => api.get('/map/autocomplete', { params: { q, lat, lng } }),
  isochrone:  (params) => api.get('/map/isochrone', { params }),
  placeSearch:(params) => api.get('/map/place-search', { params }),
};

export const reportsApi = {
  create:       (data)      => api.post('/reports', data),
  getByStation: (stationId) => api.get('/reports', { params: { stationId } }),
};

export const aiApi = {
  predictPrices: (city, fuelType) => api.get('/ai/predict', { params: { city, fuelType } }),
  predictQueue: (city, hour, day) => api.get('/ai/queue', { params: { city, hour, day } }),
  optimizeRoute: (originLat, originLng, destLat, destLng, fuelType) => 
    api.get('/ai/optimize-route', { params: { originLat, originLng, destLat, destLng, fuelType } }),
  getInsights: (lat, lng) => api.get('/ai/insights', { params: { lat, lng } }),
};

export default api;
