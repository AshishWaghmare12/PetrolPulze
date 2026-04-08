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
    compareList, toggleReachabilityRings,
  } = useMapStore();

  const fetchNearby = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const res = await stationsApi.nearby({
        lat: userLocation.lat, lng: userLocation.lng,
        radiusKm: filters.maxDistance || 10,
        ...(filters.fuelType && { fuelType: filters.fuelType }),
        ...(filters.openNow && { openNow: true }),
        ...(filters.brand && { brand: filters.brand }),
      });
      if (res.success) setStations(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userLocation, filters]);

  useEffect(() => { fetchNearby(); }, [fetchNearby]);
  useEffect(() => { if (!userLocation) locateUser(); }, []);

  // Handle ?stationId=xxx from Find Fuel page
  useEffect(() => {
    const sid = searchParams.get('stationId');
    if (sid && stations.length > 0) {
      const s = stations.find(x => x.id === sid);
      if (s) setSelectedStation(s);
    }
  }, [searchParams, stations]);

  const handleAutocomplete = (q) => {
    setSearchQ(q);
    clearTimeout(acTimer.current);
    if (q.length < 2) { setAutocompleteResults([]); setShowAutocomplete(false); return; }
    acTimer.current = setTimeout(async () => {
      try {
        const res = await mapApi.autocomplete(q, userLocation?.lat, userLocation?.lng);
        setAutocompleteResults(res.data || []);
        setShowAutocomplete(true);
      } catch {}
    }, 280);
  };

  const handleRecenter = () => {
    if (userLocation && mapRef) {
      mapRef.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
    } else if (!userLocation) {
      locateUser();
    }
  };

  const handleStationRoute = async (station) => {
    if (!userLocation) { locateUser(); return; }
    try {
      const res = await mapApi.route({
        originLat: userLocation.lat, originLng: userLocation.lng,
        destLat: station.latitude, destLng: station.longitude,
      });
      if (res.success) { setActiveRoute(res.data); setSelectedStation(station); }
    } catch (err) { console.error('Route error:', err); }
  };

  const handleReachabilityRings = async () => {
    if (!userLocation) return;
    if (isochrones) { clearIsochrones(); return; }
    try {
      const res = await mapApi.isochrone({ lat: userLocation.lat, lng: userLocation.lng, minutes: '5,10,15' });
      if (res.success) setIsochrones(res.data);
    } catch {}
  };

  const C = 'var(--color-';

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 60, overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 360, flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
              Nearby Fuel Stations
              {stations.length > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{stations.length} found</span>}
            </h2>
            <button onClick={locateUser} disabled={isLocating} className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px', gap: 4 }}>
              {isLocating
                ? <div style={{ width: 12, height: 12, border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : '📍'} Locate
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
                background: '#ffffff', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', marginTop: 4, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              }}>
                {autocompleteResults.slice(0, 5).map((r) => (
                  <div key={r.id}
                    onMouseDown={() => { setSearchQ(r.placeName); setShowAutocomplete(false); }}
                    style={{ padding: '9px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    📍 {r.text} <span style={{ color: '#94a3b8', fontSize: 11 }}>— {r.placeName?.split(',').slice(-2).join(',')}</span>
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
                  borderColor: filters.fuelType === ft ? '#4f46e5' : 'rgba(0,0,0,0.08)',
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
              {[2,5,10,15,20].map(r => <option key={r} value={r}>{r}km</option>)}
            </select>
          </div>

          {/* Intelligence tools */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={handleReachabilityRings}
              className={`btn ${isochrones ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}>
              🔵 Drive Rings
            </button>
            <button onClick={() => navigate('/find-fuel')}
              className="btn btn-ghost" style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}>
              🔍 Find Fuel
            </button>
          </div>
        </div>

        {/* Station list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {activeRoute && <NavigationPanel activeRoute={activeRoute} onClear={clearRoute} />}

          {/* Best overall banner */}
          {!loading && stations.length > 0 && (
            <div style={{
              background: 'linear-gradient(120deg, rgba(79,70,229,0.07), rgba(6,182,212,0.05))',
              border: '1px solid rgba(79,70,229,0.18)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 10, cursor: 'pointer',
            }} onClick={() => navigate(`/station/${stations[0].id}`)}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                ⭐ Best Overall Near You
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{stations[0].name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {stations[0]._meta?.distanceKm} km · {stations[0]._meta?.etaMinutes} min · ★ {parseFloat(stations[0].rating).toFixed(1)}
              </div>
            </div>
          )}

          {loading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 8 }}>
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
                  <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                    {userLocation ? 'No stations found nearby' : 'Enable location to find stations'}
                  </div>
                  {!userLocation && (
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={locateUser}>📍 Enable Location</button>
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
          onClick={handleRecenter}
          className="btn"
          style={{ 
            position: 'absolute', bottom: 32, right: 32, zIndex: 10, 
            width: 48, height: 48, borderRadius: '50%', background: '#ffffff', 
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', 
            cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}
          title="My Location"
        >
          🎯
        </button>

        {/* Selected station bottom card */}
        {selectedStation && (
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#ffffff', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: '16px 20px',
            minWidth: 320, maxWidth: 420,
            boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Selected Station</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{selectedStation.name}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{selectedStation.area}</div>
              </div>
              <button onClick={() => setSelectedStation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, marginBottom: 14 }}>
              {selectedStation._meta?.distanceKm && <>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Distance</div>
                  <div style={{ fontWeight: 700 }}>{selectedStation._meta.distanceKm} km</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>ETA</div>
                  <div style={{ fontWeight: 700 }}>{selectedStation._meta.etaMinutes} min</div>
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
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b' }}>Legend</div>
          {[['#22c55e', 'Full / Available'], ['#f59e0b', 'Low Stock'], ['#ef4444', 'Out of Stock'], ['#8b5cf6', 'EV Station']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              <span style={{ color: '#64748b', fontSize: 12 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {compareList.length > 0 && <CompareDrawer />}
    </div>
  );
}
