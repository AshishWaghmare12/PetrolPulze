import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../../store';
import { mapApi, aiApi } from '../../services/api';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MUMBAI_CENTER = [72.8328, 19.1776];
const BRAND_COLORS = {
  IOCL: '#f59e0b', BPCL: '#4f46e5', HPCL: '#10b981',
  SHELL: '#eab308', NAYARA: '#8b5cf6', RELIANCE: '#ef4444', OTHER: '#64748b',
};

export default function MapView({ onStationSelect, height = '100%' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const popupRef = useRef(null);
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  const {
    selectedStation, setSelectedStation, setMapRef,
    activeRoute, isochrones, userLocation,
  } = useMapStore();

  const [mapReady, setMapReady] = useState(false);

  // Init map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: MUMBAI_CENTER,
      zoom: 12,
      attributionControl: false,
    });
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.current.on('load', () => {
      setMapRef(map.current);
      setMapReady(true);
      loadAllMarkers();

      // Add 3D buildings layer
      if (!map.current.getLayer('3d-buildings')) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout['text-field'])?.id;

        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
              'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );
      }

      // Add Mapbox Traffic
      map.current.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      });
      map.current.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        paint: {
          'line-width': 2,
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'], '#10b981',
            ['==', ['get', 'congestion'], 'moderate'], '#f59e0b',
            ['==', ['get', 'congestion'], 'heavy'], '#ef4444',
            ['==', ['get', 'congestion'], 'severe'], '#b91c1c',
            'transparent'
          ]
        }
      }, '3d-buildings');
    });

    map.current.on('moveend', () => {
      const bounds = map.current.getBounds();
      loadMarkersInBounds(bounds);
    });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, []);

  const loadAllMarkers = async () => {
    try {
      const res = await mapApi.markers();
      if (res.success) renderMarkers(res.data);
    } catch (err) { console.error('Markers error:', err); }
  };

  const loadMarkersInBounds = async (bounds) => {
    try {
      const res = await mapApi.markers({
        neLat: bounds.getNorth(), neLng: bounds.getEast(),
        swLat: bounds.getSouth(), swLng: bounds.getWest(),
      });
      if (res.success) renderMarkers(res.data);
    } catch {}
  };

  const renderMarkers = useCallback((stations) => {
    if (!map.current) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    stations.forEach((station) => {
      const color = BRAND_COLORS[station.brand] || '#64748b';
      const hasEV = station.fuels?.some((f) => f.type === 'EV' && f.status === 'AVAILABLE');
      const isOpen = station.isOpen !== undefined ? station.isOpen : station.open_now;

      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      
      const inner = document.createElement('div');
      inner.className = 'marker-inner';
      inner.style.cssText = `
        width: 100%; height: 100%; border-radius: 50%;
        background: ${isOpen ? '#ffffff' : '#f1f5f9'};
        border: 2px solid ${isOpen ? color : '#94a3b8'};
        color: ${isOpen ? color : '#94a3b8'};
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        box-shadow: 0 4px 12px ${isOpen ? color + '40' : 'rgba(0,0,0,0.1)'};
        opacity: ${isOpen ? '1' : '0.8'};
      `;
      inner.innerHTML = hasEV ? '⚡' : '⛽';
      el.appendChild(inner);

      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.15) translateY(-4px)';
        inner.style.boxShadow = `0 8px 16px ${color}60`;
        showPopup(station, [parseFloat(station.longitude), parseFloat(station.latitude)]);
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1) translateY(0)';
        inner.style.boxShadow = `0 4px 12px ${station.isOpen ? color + '40' : 'rgba(0,0,0,0.1)'}`;
      });
      el.addEventListener('click', () => {
        setSelectedStation(station);
        if (onStationSelect) onStationSelect(station);
        highlightMarker(station.id, color);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([parseFloat(station.longitude), parseFloat(station.latitude)])
        .addTo(map.current);
      markersRef.current[station.id] = marker;
    });
  }, []);

  const highlightMarker = (id, color) => {
    Object.entries(markersRef.current).forEach(([sid, marker]) => {
      const el = marker.getElement();
      const inner = el.querySelector('.marker-inner');
      if (!inner) return;
      if (sid === id) {
        inner.style.transform = 'scale(1.25) translateY(-6px)';
        el.style.zIndex = '100';
        inner.style.boxShadow = `0 12px 24px ${color}80, 0 0 0 4px ${color}33`;
      } else {
        inner.style.transform = 'scale(1) translateY(0)';
        el.style.zIndex = '1';
        inner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }
    });
  };

  const showPopup = (station, lngLat) => {
    if (popupRef.current) popupRef.current.remove();
    const bestFuel = station.fuels?.find((f) => f.status === 'AVAILABLE');
    const rating = parseFloat(station.rating || station.ratingValue || 0);
    const isOpen = station.isOpen !== undefined ? station.isOpen : station.open_now;

    popupRef.current = new mapboxgl.Popup({ closeButton: false, offset: 12 })
      .setLngLat(lngLat)
      .setHTML(`
        <div style="font-family:'Inter',sans-serif; padding: 12px 14px; width: 220px; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; gap: 10px;">
            <div style="font-weight:700; font-size: 13px; color: #0f172a; line-height: 1.3; font-family:'Space Grotesk',sans-serif;">${station.name}</div>
            <div style="font-size: 10px; color: #64748b; white-space: nowrap; margin-top: 2px;">${station.area}</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
            <span style="background: ${isOpen ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}; color: ${isOpen ? '#10b981' : '#ef4444'}; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase;">
              ${isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            ${bestFuel ? `<span style="font-size: 12px; color: #4f46e5; font-weight: 700;">₹${bestFuel.price}</span>` : ''}
            <div style="display: flex; align-items: center; gap: 3px; font-size: 11px; color: #f59e0b; font-weight: 700; margin-left: auto;">
              <span>★</span>
              <span>${rating > 0 ? rating.toFixed(1) : 'New'}</span>
            </div>
          </div>
        </div>
      `)
      .addTo(map.current);
  };

  // Route layer
  useEffect(() => {
    if (!map.current || !mapReady) return;
    if (map.current.getSource('route')) {
      if (map.current.getLayer('route-line')) map.current.removeLayer('route-line');
      if (map.current.getLayer('route-glow')) map.current.removeLayer('route-glow');
      map.current.removeSource('route');
    }
    if (!activeRoute || !activeRoute.geometry || !activeRoute.geometry.coordinates) return;

    try {
      map.current.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: activeRoute.geometry },
      });
      map.current.addLayer({
        id: 'route-glow',
        type: 'line', source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#4f46e5', 'line-width': 10, 'line-opacity': 0.18 },
      });
      map.current.addLayer({
        id: 'route-line',
        type: 'line', source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#4f46e5', 'line-width': 4, 'line-opacity': 0.9 },
      });

      const coords = activeRoute.geometry.coordinates;
      if (coords && coords.length > 0) {
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    } catch (err) {
      console.error('Mapbox Route Layer Error:', err);
    }
  }, [activeRoute, mapReady]);

  // Isochrone layer
  useEffect(() => {
    if (!map.current || !mapReady) return;
    ['iso-2','iso-1','iso-0'].forEach(id => { if (map.current.getLayer(id)) map.current.removeLayer(id); });
    if (map.current.getSource('isochrone')) map.current.removeSource('isochrone');
    if (!isochrones?.length) return;

    map.current.addSource('isochrone', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: isochrones },
    });
    const fills = ['rgba(139,92,246,0.10)','rgba(59,130,246,0.10)','rgba(79,70,229,0.10)'];
    isochrones.forEach((_, i) => {
      map.current.addLayer({
        id: `iso-${i}`, type: 'fill', source: 'isochrone',
        filter: ['==', ['index-of', ['to-string', ['get', 'contour']], ['literal', String(isochrones[i].properties.contour)]], 0],
        paint: { 'fill-color': fills[i % fills.length], 'fill-opacity': 1 },
      });
    });
  }, [isochrones, mapReady]);

  // User location
  useEffect(() => {
    if (!map.current || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.cssText = `
      width: 14px; height: 14px; background: #4f46e5; border-radius: 50%;
      border: 3px solid rgba(79,70,229,0.25);
      box-shadow: 0 0 0 8px rgba(79,70,229,0.1);
    `;
    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    
    // Only fly if no active route (MapPage handles complex logic)
    if (!activeRoute) {
       map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13, duration: 1500 });
    }
  }, [userLocation, activeRoute]);

  // Smart Route Optimizer
  const optimizeRoute = async (destination) => {
    if (!userLocation) { alert('Enable location first'); return; }
    setOptimizing(true);
    try {
      const res = await aiApi.optimizeRoute(
        userLocation.lat, userLocation.lng,
        destination.lat, destination.lng,
        'PETROL'
      );
      if (res.success) {
        setRouteOptimization(res.data);
      }
    } catch (err) { console.error('Optimization error:', err); }
    setOptimizing(false);
  };

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Map Controls */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {selectedStation && (
          <button onClick={() => optimizeRoute({ lat: selectedStation.latitude, lng: selectedStation.longitude })} disabled={optimizing} style={{
            padding: '10px 14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontWeight: 600, color: '#fff', cursor: optimizing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            {optimizing ? 'Optimizing...' : 'Find Cheapest'}
          </button>
        )}
      </div>

      {/* Route Optimization Panel */}
      {routeOptimization && (
        <div style={{
          position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 10,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
          backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,0.5)', padding: 16,
          boxShadow: '0 8px 32px rgba(79,70,229,0.15)', maxHeight: 300, overflow: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>⚡ Cheapest Along Route</div>
            <button onClick={() => setRouteOptimization(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            Analyzed {routeOptimization.totalStationsAnalyzed} stations • Direct: {routeOptimization.directDistance}km
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {routeOptimization.cheapestAlongRoute?.slice(0, 5).map((station, i) => (
              <div key={station.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 10,
                background: i === 0 ? 'rgba(79,70,229,0.08)' : 'transparent',
                borderRadius: 'var(--radius-md)', border: i === 0 ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: i === 0 ? '#4f46e5' : '#64748b', width: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{station.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{station.area} • {station.distanceFromRoute}km detour</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#10b981' }}>₹{station.price}</div>
                  {station.savings > 0 && <div style={{ fontSize: 10, color: '#10b981' }}>Save ₹{station.savings}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg)', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--color-border)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading map…</div>
        </div>
      )}
    </div>
  );
}
