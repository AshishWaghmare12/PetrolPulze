import { create } from 'zustand';

const DEFAULT_LOCATION = { lat: 19.1776, lng: 72.8328 }; // Andheri, Mumbai

export const useAppStore = create((set, get) => ({
  // Auth
  user: null,
  token: localStorage.getItem('ppx_token') || null,
  setUser: (user) => set({ user }),
  setToken: (token) => { localStorage.setItem('ppx_token', token); set({ token }); },
  logout: () => { localStorage.removeItem('ppx_token'); set({ user: null, token: null }); },
}));

export const useMapStore = create((set, get) => ({
  // Location
  userLocation: null,
  isLocating: false,
  locateUser: () => {
    set({ isLocating: true });
    if (!navigator.geolocation) {
      set({ userLocation: DEFAULT_LOCATION, isLocating: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude }, isLocating: false }),
      () => set({ userLocation: DEFAULT_LOCATION, isLocating: false }),
      { timeout: 8000, enableHighAccuracy: true }
    );
  },

  // Map ref
  mapRef: null,
  setMapRef: (ref) => set({ mapRef: ref }),

  // Filters
  filters: { fuelType: null, openNow: false, brand: null, maxDistance: 10 },
  setFilters: (updates) => set((s) => ({ filters: { ...s.filters, ...updates } })),
  resetFilters: () => set({ filters: { fuelType: null, openNow: false, brand: null, maxDistance: 10 } }),

  // Stations
  selectedStation: null,
  setSelectedStation: (s) => set({ selectedStation: s }),

  // Route
  activeRoute: null,
  setActiveRoute: (route) => set({ activeRoute: route }),
  clearRoute: () => set({ activeRoute: null }),

  // Compare
  compareList: [],
  addToCompare: (station) => set((s) => {
    if (s.compareList.find((x) => x.id === station.id)) return s;
    if (s.compareList.length >= 3) return s;
    return { compareList: [...s.compareList, station] };
  }),
  removeFromCompare: (id) => set((s) => ({ compareList: s.compareList.filter((x) => x.id !== id) })),
  clearCompare: () => set({ compareList: [] }),

  // Emergency mode
  emergencyMode: false,
  setEmergencyMode: (v) => set({ emergencyMode: v }),

  // Isochrones (reachability rings)
  isochrones: null,
  setIsochrones: (data) => set({ isochrones: data }),
  clearIsochrones: () => set({ isochrones: null }),
  showReachabilityRings: false,
  toggleReachabilityRings: () => set((s) => ({ showReachabilityRings: !s.showReachabilityRings })),

  // Heatmap
  showHeatmap: false,
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),

  // UI
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  compareDrawerOpen: false,
  setCompareDrawerOpen: (v) => set({ compareDrawerOpen: v }),
}));
