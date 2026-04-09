import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapView from '../components/map/MapView';
import StationCard from '../components/stations/StationCard';
import CompareDrawer from '../components/stations/CompareDrawer';
import NavigationPanel from '../components/map/NavigationPanel';
import { useMapStore } from '../store';
import { stationsApi, mapApi } from '../services/api';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'EV'];
const BRANDS = ['IOCL', 'BPCL', 'HPCL', 'SHELL', 'NAYARA'];

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const acTimer = useRef(null);

  const {
    filters, setFilters, userLocation, locateUser, isLocating,
    activeRoute, setActiveRoute, clearRoute, mapRef,
    selectedStation, setSelectedStation,
    isochrones, setIsochrones, clearIsochrones,
    compareList,
  } = useMapStore();

  const [isShowingRecommended, setIsShowingRecommended] = useState(false);
  const [featuredStations, setFeaturedStations] = useState([]);

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (userLocation) {
        res = await stationsApi.nearby({
          lat: userLocation.lat, lng: userLocation.lng,
          radiusKm: filters.maxDistance || 10,
          ...(filters.fuelType && { fuelType: filters.fuelType }),
          ...(filters.openNow && { openNow: true }),
          ...(filters.brand && { brand: filters.brand }),
        });
      }

      if (res && res.success && res.data?.length > 0) {
        setStations(res.data);
        setIsShowingRecommended(false);
      } else {
        // Fallback: Get top-rated stations as "Recommended"
        const featuredRes = await stationsApi.search({ sort: 'rating', limit: 8 });
        if (featuredRes.success) {
          setStations(featuredRes.data || []);
          setIsShowingRecommended(true);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userLocation, filters]);

  useEffect(() => { fetchNearby(); }, [fetchNearby]);

  useEffect(() => {
    if (!userLocation) {
      locateUser();
    } else if (mapRef && !activeRoute && !selectedStation) {
      mapRef.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
    }
  }, [userLocation, activeRoute]);

  // Handle ?stationId=xxx&route=true from Find Fuel page
  useEffect(() => {
    const sid = searchParams.get('stationId');
    const autoRoute = searchParams.get('route') === 'true';

    if (sid && stations.length > 0) {
      const s = stations.find(x => x.id === sid);
      if (s) {
        setSelectedStation(s);
        if (autoRoute && userLocation) {
          handleStationRoute(s);
        }
      }
    }
  }, [searchParams, stations, userLocation]);

  const handleAutocomplete = (q) => {
    setSearchQ(q);
    clearTimeout(acTimer.current);
    if (q.length < 2) { setAutocompleteResults([]); setShowAutocomplete(false); return; }
    acTimer.current = setTimeout(async () => {
      try {
        const res = await mapApi.autocomplete(q, userLocation?.lat, userLocation?.lng);
        setAutocompleteResults(res.data || []);
        setShowAutocomplete(true);
      } catch { }
    }, 280);
  };

  const handleLocateNearest = async () => {
    // 1. Just locate the user to get current coordinates
    await locateUser();

    // We need to wait for userLocation to be set, but satisfy it immediately if possible
    let loc = userLocation;
    if (!loc) {
      // Fallback for immediate click
      setTimeout(async () => {
        const freshLoc = useMapStore.getState().userLocation;
        if (freshLoc) findNearest(freshLoc);
      }, 1000);
      return;
    }
    findNearest(loc);
  };

  const findNearest = async (loc) => {
    try {
      setLoading(true);
      const res = await stationsApi.nearby({
        lat: loc.lat, lng: loc.lng,
        radius: 9999, // Find the absolute nearest
        limit: 1
      });
      if (res.success && res.data?.length > 0) {
        const nearest = res.data[0];
        setSelectedStation(nearest);
        if (mapRef) {
          mapRef.flyTo({ center: [nearest.longitude, nearest.latitude], zoom: 16, pitch: 45 });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStationRoute = async (station) => {
    if (!userLocation) {
      await locateUser();
      // Use setInterval/Timeout to check if location was found, then proceed
      const checkLoc = setInterval(() => {
        const freshLoc = useMapStore.getState().userLocation;
        if (freshLoc) {
          clearInterval(checkLoc);
          handleStationRoute(station); // Retry with location
        }
      }, 500);
      setTimeout(() => clearInterval(checkLoc), 5000); // Timeout after 5s
      return;
    }

    try {
      const res = await mapApi.route({
        sourceLat: userLocation.lat,
        sourceLng: userLocation.lng,
        destLat: station.latitude,
        destLng: station.longitude,
      });
      if (res.success) {
        setActiveRoute(res.data);
        setSelectedStation(station);
        // Scroll navigation panel into view if needed
        document.querySelector('.sidebar-content')?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Route mapping unavailable for this location.');
      }
    } catch (err) {
      console.error('Route error:', err);
      alert('Could not calculate route. Please check your connection.');
    }
  };

  const handleReachabilityRings = async () => {
    if (!userLocation) return;
    if (isochrones) { setIsochrones(null); return; }
    try {
      const res = await mapApi.isochrone({ lat: userLocation.lat, lng: userLocation.lng, minutes: '5,10,15' });
      if (res.success) setIsochrones(res.data);
    } catch { }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 60, overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 360, flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 20,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
              Nearby Fuel Stations
              {stations.length > 0 && <span style={{ color: 'var(--color-text-dim)', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{stations.length} found</span>}
            </h2>
            <button onClick={handleLocateNearest} disabled={isLocating} className="btn-premium" style={{ fontSize: 11, padding: '6px 14px', gap: 6 }}>
              {isLocating
                ? <div style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : '🚀'} Locate Nearest
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              className="input"
              placeholder="Search station, area, city…"
              value={searchQ}
              onChange={(e) => handleAutocomplete(e.target.value)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 180)}
              style={{ paddingLeft: 32, fontSize: 13 }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.5 }}>🔍</span>
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', marginTop: 4, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              }}>
                {autocompleteResults.slice(0, 5).map((r) => (
                  <div key={r.id}
                    onMouseDown={() => {
                      setSearchQ(r.name);
                      setSelectedStation(r);
                      setShowAutocomplete(false);
                      if (mapRef) mapRef.flyTo({ center: [r.longitude, r.latitude], zoom: 15 });
                    }}
                    style={{ padding: '9px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    📍 {r.name} <span style={{ color: '#94a3b8', fontSize: 11 }}>— {r.area}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fuel type pills */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
            {FUEL_TYPES.map((ft) => (
              <button key={ft}
                onClick={() => setFilters({ fuelType: filters.fuelType === ft ? null : ft })}
                style={{
                  padding: '5px 12px', borderRadius: '999px', border: '1px solid', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', transition: 'var(--transition)',
                  borderColor: filters.fuelType === ft ? '#4f46e5' : 'var(--color-border)',
                  background: filters.fuelType === ft ? 'rgba(79,70,229,0.12)' : 'transparent',
                  color: filters.fuelType === ft ? '#4f46e5' : 'var(--color-text-muted)',
                }}>
                {ft}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setFilters({ openNow: !filters.openNow })}
              className={`btn ${filters.openNow ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '6px 10px', flex: 1 }}>
              Open Now
            </button>
            <select className="input" value={filters.brand || ''} onChange={e => setFilters({ brand: e.target.value || null })}
              style={{ flex: 1, fontSize: 11, padding: '6px 8px' }}>
              <option value="">All Brands</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="input" value={filters.maxDistance} onChange={e => setFilters({ maxDistance: +e.target.value })}
              style={{ flex: '0 0 70px', fontSize: 11, padding: '6px 8px' }}>
              {[2, 5, 10, 15, 20, 50].map(r => <option key={r} value={r}>{r}km</option>)}
            </select>
          </div>
        </div>

        {/* Station list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {activeRoute && <NavigationPanel activeRoute={activeRoute} onClear={clearRoute} />}

          {loading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '90%', marginBottom: 6 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[70, 55, 55].map((w, j) => <div key={j} className="skeleton" style={{ height: 28, width: w, borderRadius: 8 }} />)}
                </div>
              </div>
            ))
            : stations.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>⛽</div>
                  <div style={{ color: 'var(--color-text-dim)', fontSize: 14, fontWeight: 600 }}>
                    {userLocation ? 'No stations found nearby' : 'Enable location to find stations'}
                  </div>
                  {!userLocation && (
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleLocateNearest}>🚀 Find Nearest Pump</button>
                  )}
                </div>
              )
              : stations.map((s) => <StationCard key={s.id} station={s} onRouteClick={handleStationRoute} />)
          }
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView onStationSelect={(s) => setSelectedStation(s)} height="100%" />

        {/* Recenter FAB */}
        <button
          onClick={handleLocateNearest}
          className="btn-premium"
          style={{
            position: 'absolute', bottom: 32, right: 32, zIndex: 30,
            width: 54, height: 54, borderRadius: '50%', background: '#0f172a',
            boxShadow: 'var(--shadow-lg)', border: 'none',
            cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Locate Nearest Pump"
        >
          🚀
        </button>

        {/* Selected station bottom card */}
        {selectedStation && (
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: '16px 20px',
            minWidth: 320, maxWidth: 420,
            boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.25s ease',
            zIndex: 40,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Selected Station</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{selectedStation.name}</div>
                <div style={{ color: 'var(--color-text-dim)', fontSize: 12, marginTop: 1 }}>{selectedStation.area}</div>
              </div>
              <button onClick={() => setSelectedStation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, marginBottom: 14 }}>
              {selectedStation.distance && <>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Distance</div>
                  <div style={{ fontWeight: 700 }}>{selectedStation.distance.toFixed(1)} km</div>
                </div>
              </>}
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Rating</div>
                <div style={{ fontWeight: 700, color: '#f59e0b' }}>★ {parseFloat(selectedStation.rating).toFixed(1)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 13, justifyContent: 'center' }}
                onClick={() => handleStationRoute(selectedStation)}>
                🗺 Start Route
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 13 }}
                onClick={() => navigate(`/station/${selectedStation.id}`)}>
                Details
              </button>
            </div>
          </div>
        )}

        {/* Availability legend */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.95)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 12,
          backdropFilter: 'blur(12px)',
          zIndex: 30,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-dim)' }}>Legend</div>
          {[['#22c55e', 'Available'], ['#f59e0b', 'Low Stock'], ['#ef4444', 'Out of Stock'], ['#8b5cf6', 'EV Station']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              <span style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
