import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stationsApi, mapApi } from '../services/api';
import { useMapStore } from '../store';
import MiniMap from '../components/map/MiniMap';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'EV'];
const RADII = [
  { value: 5, label: 'Within 5 KM' },
  { value: 10, label: 'Within 10 KM' },
  { value: 25, label: 'Within 25 KM' },
  { value: 50, label: 'Within 50 KM' },
  { value: 9999, label: 'Any Distance' },
];

function getStatusBadge(s) {
  if (s.open_now) return { label: s.open24Hours ? 'OPEN 24/7' : 'OPEN', color: '#10b981', bg: '#f0fdf4' };
  return { label: 'CLOSED', color: '#ef4444', bg: '#fef2f2' };
}

function FilterDropdown({ value, onChange, options, icon, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: '1 1 160px', minWidth: '140px' }}>
      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '14px' }}>
        {icon}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '52px',
          padding: '0 36px 0 44px',
          background: '#f8fafc',
          border: '1px solid #eef2f6',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#0f172a',
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={e => e.target.style.borderColor = '#06b6d4'}
        onBlur={e => e.target.style.borderColor = '#eef2f6'}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '12px' }}>
        ▼
      </div>
    </div>
  );
}

function StationRow({ station, onRoute, onDetails, rank }) {
  const badge = getStatusBadge(station);
  const dist = station.distance || 0;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eef2f6',
      borderRadius: '24px',
      padding: '24px',
      display: 'flex', gap: 20, alignItems: 'center',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      marginBottom: 16,
      boxShadow: rank === 0 ? '0 8px 24px rgba(79,70,229,0.06)' : 'none'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#eef2f6';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => onDetails(station.id)}
    >
      <div style={{
        width: rank === 0 ? '56px' : '44px', height: rank === 0 ? '56px' : '44px',
        borderRadius: '16px', flexShrink: 0,
        background: rank === 0 ? '#4f46e5' : '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: rank === 0 ? 20 : 16,
        color: rank === 0 ? '#fff' : '#64748b',
        boxShadow: rank === 0 ? '0 4px 12px rgba(79,70,229,0.3)' : 'none'
      }}>
        {rank === 0 ? '★' : rank + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>{station.name}</span>
          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, background: badge.bg, color: badge.color, textTransform: 'uppercase' }}>
            {badge.label}
          </span>
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: 12 }}>
          {station.area} · {station.address}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(station.fuels || []).map(f => (
            <span key={f.type} style={{
              padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
              background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0'
            }}>
              {f.type}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
            {dist.toFixed(1)} km
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          className="btn-premium"
          onClick={e => { e.stopPropagation(); onRoute(station); }}
          style={{ padding: '12px 22px', fontSize: 13, background: '#06b6d4', borderRadius: '14px' }}
        >
          🗺️ Route
        </button>
      </div>
    </div>
  );
}

export default function FindFuelPage() {
  const navigate = useNavigate();
  const { userLocation, locateUser } = useMapStore();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fuelType, setFuelType] = useState('');
  const [status, setStatus] = useState('all');
  const [radius, setRadius] = useState(50);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedLoc, setSearchedLoc] = useState(null);
  const autocompleteTimer = useRef(null);

  useEffect(() => {
    if (!userLocation) locateUser();
  }, []);

  const fetchSuggestions = async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await mapApi.autocomplete(q);
      setSuggestions(res.data || []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
  };

  const onQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(autocompleteTimer.current);
    autocompleteTimer.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const pickSuggestion = (s) => {
    setQuery(s.name);
    setSearchedLoc({ lat: s.latitude, lng: s.longitude });
    setSuggestions([]);
    setShowSuggestions(false);
    handleSearch({ lat: s.latitude, lng: s.longitude });
  };

  const handleSearch = async (overrideLoc = null) => {
    const loc = overrideLoc || searchedLoc || userLocation;
    if (!loc) { locateUser(); return; }
    setLoading(true);
    try {
      const params = {
        lat: loc.lat, lng: loc.lng, radius: radius,
        ...(fuelType && { fuelType }),
        ...(status === 'open' && { openNow: true }),
      };
      const res = await stationsApi.nearby(params);
      if (res.success) {
        setStations((res.data || []).slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation && !searchedLoc) handleSearch();
  }, [userLocation, radius, fuelType, status]);

  const handleRoute = (station) => navigate(`/map?stationId=${station.id}&route=true`);
  const handleDetails = (id) => navigate(`/station/${id}`);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 80, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #eef2f6', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 12, color: '#0f172a' }}>
            Find the <span style={{ color: '#06b6d4' }}>Nearest</span> Fuel
          </h1>
          <p style={{ fontSize: 17, color: '#64748b', marginBottom: 48, maxWidth: 640, margin: '0 auto 48px' }}>
            Locate available stations across Mumbai. Optimized for speed and real-time accuracy.
          </p>

          {/* Redesigned Search bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '32px',
            padding: '16px',
            display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
            maxWidth: 1060, margin: '0 auto', position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.04)'
          }}>
            {/* Search Input Box */}
            <div style={{ flex: '3 1 340px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '18px', padding: '0 20px', height: '52px' }}>
                <span style={{ fontSize: '18px' }}>🔍</span>
                <input
                  className="input"
                  value={query}
                  onChange={onQueryChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                  placeholder="Enter location or station name..."
                  style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', fontSize: 15, width: '100%', fontWeight: 500 }}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                  background: '#ffffff', border: '1px solid #eef2f6',
                  borderRadius: '24px', padding: '8px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.12)', overflow: 'hidden',
                }}>
                  {suggestions.slice(0, 5).map((s) => (
                    <div key={s.id} onClick={() => pickSuggestion(s)} style={{
                      padding: '14px 20px', fontSize: 14, cursor: 'pointer',
                      borderRadius: '14px', transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.area} · {s.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Styled Dropdowns */}
            <FilterDropdown
              value={fuelType}
              onChange={setFuelType}
              options={FUEL_TYPES}
              icon="⛽"
              placeholder="Fuel Type"
            />

            <FilterDropdown
              value={status}
              onChange={setStatus}
              options={[{ value: 'all', label: 'All Stations' }, { value: 'open', label: 'Open Now' }]}
              icon="🕒"
              placeholder="Status"
            />

            <FilterDropdown
              value={radius}
              onChange={val => setRadius(Number(val))}
              options={RADII}
              icon="📍"
              placeholder="Distance"
            />

            <button onClick={() => handleSearch()} disabled={loading} className="btn-premium" style={{
              flex: '0 0 auto', height: '52px', padding: '0 32px', fontSize: 15, background: '#0f172a', borderRadius: '18px',
              boxShadow: '0 8px 16px rgba(15,23,42,0.15)'
            }}>
              {loading ? 'Searching...' : 'Find Fuel'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
            {loading ? 'Scanning Nearby...' : `Top ${stations.length} Closest Matches`}
          </h2>
          {stations.length > 0 && (
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Availability
            </div>
          )}
        </div>

        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: 120, background: '#ffffff', borderRadius: 24, marginBottom: 16, border: '1px solid #eef2f6' }} />
        ))}

        {!loading && stations.map((s, i) => (
          <StationRow key={s.id} station={s} rank={i} onRoute={handleRoute} onDetails={handleDetails} />
        ))}

        {!loading && stations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: 32, border: '1px solid #eef2f6' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⛽</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>No stations nearby</h3>
            <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 32 }}>Try using the "Any Distance" filter or searching for a different area.</p>
            <button onClick={() => { setFuelType(''); setStatus('all'); setRadius(9999); handleSearch(); }}
              className="btn-premium" style={{ background: '#0f172a', borderRadius: '16px' }}>Reset Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
