import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stationsApi, mapApi } from '../services/api';
import { useMapStore } from '../store';
import MiniMap from '../components/map/MiniMap';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'EV'];
const STATUSES = ['open', 'all'];
const RADII = [2, 5, 10, 20];
const BRAND_COLORS = { IOCL: '#f97316', BPCL: '#3b82f6', HPCL: '#22c55e', SHELL: '#eab308', NAYARA: '#8b5cf6' };

function getStockColor(pct) {
  if (pct > 60) return '#22c55e';
  if (pct > 25) return '#f59e0b';
  return '#ef4444';
}
function getStatusBadge(s) {
  if (s.isOpen) return { label: s.open24Hours ? 'OPEN 24/7' : 'OPEN', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  return { label: 'CLOSED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
}

function StationRow({ station, onRoute, onDetails, rank }) {
  const badge = getStatusBadge(station);
  const meta = station._meta || {};
  const bestFuel = (station.fuels || []).find(f => f.status !== 'OUT') || station.fuels?.[0];

  return (
    <div style={{
      background: rank === 0 ? 'rgba(79,70,229,0.04)' : '#ffffff',
      border: `1px solid ${rank === 0 ? 'rgba(79,70,229,0.2)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      display: 'flex', gap: 16, alignItems: 'flex-start',
      transition: 'var(--transition)',
      cursor: 'pointer',
      marginBottom: 12,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = rank === 0 ? 'rgba(79,70,229,0.2)' : 'rgba(0,0,0,0.08)'}
      onClick={() => onDetails(station.id)}
    >
      {/* Rank badge */}
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: rank === 0 ? '#4f46e5' : '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
        color: rank === 0 ? '#fff' : '#64748b',
      }}>
        {rank === 0 ? '★' : rank + 1}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{station.name}</span>
          <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
          {bestFuel && bestFuel.stockPercent < 30 && bestFuel.stockPercent > 0 && (
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>LOW STOCK</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
          {station.area} · {station.address?.split(',').slice(0, 2).join(',')}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
          {meta.distanceKm !== undefined && (
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distance</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{meta.distanceKm} km</div>
            </div>
          )}
          {meta.etaMinutes !== undefined && (
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Travel Time</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{meta.etaMinutes} mins</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>★ {station.rating}</div>
          </div>
          {meta.smartScore !== undefined && (
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#4f46e5' }}>{meta.smartScore}</div>
            </div>
          )}
        </div>

        {/* Fuel tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(station.fuels || []).map(f => (
            <span key={f.type} style={{
              padding: '3px 10px', borderRadius: '999px', fontSize: 11, fontWeight: 600,
              background: f.status === 'AVAILABLE' ? 'rgba(79,70,229,0.1)' : f.status === 'LOW' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.08)',
              color: f.status === 'AVAILABLE' ? '#4f46e5' : f.status === 'LOW' ? '#f59e0b' : '#ef4444',
            }}>
              {f.type}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          className="btn btn-ghost"
          onClick={e => { e.stopPropagation(); onRoute(station); }}
          style={{ padding: '7px 14px', fontSize: 12 }}
        >
          🗺️ Route
        </button>
        <button
          className="btn btn-primary"
          onClick={e => { e.stopPropagation(); onDetails(station.id); }}
          style={{ padding: '7px 14px', fontSize: 12 }}
        >
          Details
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
  const [radius, setRadius] = useState(10);
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState('smartScore');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedLoc, setSearchedLoc] = useState(null);
  const [searchLabel, setSearchLabel] = useState('');
  const [view, setView] = useState('list');
  const autocompleteTimer = useRef(null);

  useEffect(() => {
    if (!userLocation) locateUser();
  }, []);

  const fetchSuggestions = async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await mapApi.autocomplete(q, userLocation?.lat, userLocation?.lng);
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
    setQuery(s.placeName);
    setSearchedLoc({ lat: s.lat, lng: s.lng });
    setSearchLabel(s.text);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    const loc = searchedLoc || userLocation;
    if (!loc) { locateUser(); return; }
    setLoading(true);
    try {
      const params = {
        lat: loc.lat, lng: loc.lng, radiusKm: radius,
        ...(fuelType && { fuelType }),
        ...(status === 'open' && { openNow: true }),
        ...(brand && { brand }),
        ...(sort !== 'smartScore' && { sort })
      };
      const res = await stationsApi.nearby(params);
      if (res.success) setStations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) handleSearch();
  }, [userLocation]);

  const handleRoute = (station) => {
    navigate(`/map?stationId=${station.id}`);
  };
  const handleDetails = (id) => navigate(`/station/${id}`);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 60 }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--color-border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>
            Find Fuel Near You
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32 }}>
            Search nearby stations by fuel type, distance, and real-time availability in Mumbai.
          </p>

          {/* Search bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 16px',
            display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            maxWidth: 860, margin: '0 auto', position: 'relative',
          }}>
            {/* Location input */}
            <div style={{ flex: '2 1 240px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '9px 12px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 21c-4-5-8-9.5-8-11a8 8 0 0116 0c0 1.5-4 6-8 11z"/></svg>
                <input
                  className="input"
                  value={query}
                  onChange={onQueryChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter area, station or city…"
                  style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', fontSize: 14 }}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: '#ffffff', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', marginTop: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden',
                }}>
                  {suggestions.slice(0, 5).map((s) => (
                    <div key={s.id} onClick={() => pickSuggestion(s)} style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'var(--transition)',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 600 }}>{s.text}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.placeName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fuel type */}
            <select value={fuelType} onChange={e => setFuelType(e.target.value)} className="input" style={{ flex: '1 1 120px', background: '#ffffff', fontSize: 13 }}>
              <option value="">Fuel Type</option>
              {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Status */}
            <select value={status} onChange={e => setStatus(e.target.value)} className="input" style={{ flex: '1 1 120px', background: '#ffffff', fontSize: 13 }}>
              <option value="all">All Status</option>
              <option value="open">Open Now</option>
            </select>

            {/* Radius */}
            <select value={radius} onChange={e => setRadius(Number(e.target.value))} className="input" style={{ flex: '0 0 90px', background: '#ffffff', fontSize: 13 }}>
              {RADII.map(r => <option key={r} value={r}>{r} km</option>)}
            </select>

            {/* Brand */}
            <select value={brand} onChange={e => setBrand(e.target.value)} className="input" style={{ flex: '1 1 120px', background: '#ffffff', fontSize: 13 }}>
              <option value="">All Brands</option>
              {Object.keys(BRAND_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="input" style={{ flex: '1 1 120px', background: '#ffffff', fontSize: 13 }}>
              <option value="smartScore">Smart Score</option>
              <option value="rating">Top Rated</option>
            </select>

            <button onClick={handleSearch} disabled={loading} className="btn btn-primary" style={{ flex: '0 0 auto', padding: '10px 22px', fontSize: 14, fontWeight: 600 }}>
              {loading ? '…' : '🔍 Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left: list */}
        <div>
          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                {loading ? 'Searching…' : `${stations.length} stations found${searchLabel ? ` near ${searchLabel}` : ' nearby'}`}
              </div>
              {!loading && stations.length > 0 && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Sorted by smart availability score</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['list', 'map'].map(v => (
                <button key={v} onClick={() => v === 'map' ? navigate('/map') : setView(v)}
                  className={`btn ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '6px 14px', fontSize: 12, textTransform: 'capitalize' }}>
                  {v === 'list' ? '☰ List' : '🗺️ Map'}
                </button>
              ))}
            </div>
          </div>

          {/* Best pick banner */}
          {!loading && stations.length > 0 && (
            <div style={{
              background: 'rgba(79,70,229,0.05)',
              border: '1px solid rgba(79,70,229,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontSize: 12,
              color: '#4f46e5',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ★ BEST AVAILABLE NEARBY
            </div>
          )}

          {/* Skeleton loader */}
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[80, 60, 60, 50].map((w, j) => <div key={j} className="skeleton" style={{ height: 32, width: w }} />)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Station rows */}
          {!loading && stations.map((s, i) => (
            <StationRow key={s.id} station={s} rank={i} onRoute={handleRoute} onDetails={handleDetails} />
          ))}

          {!loading && stations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No stations found</div>
              <div style={{ fontSize: 14 }}>Try expanding the radius or removing filters</div>
              <button onClick={() => { setFuelType(''); setStatus('all'); setRadius(20); handleSearch(); }}
                className="btn btn-ghost" style={{ marginTop: 20 }}>Clear Filters</button>
            </div>
          )}
        </div>

        {/* Right: live map preview + closest pin */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Live Traffic View</span>
              <Link to="/map" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Full Map →</Link>
            </div>
            {userLocation ? (
              <MiniMap 
                center={userLocation} 
                markers={stations} 
                zoom={12} 
                height={280} 
                onClick={() => navigate('/map')} 
              />
            ) : (
              <div style={{
                height: 280, background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, cursor: 'pointer'
              }} onClick={() => navigate('/map')}>
                <div style={{ fontSize: 36, opacity: 0.3 }}>🗺️</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  <span style={{ color: '#4f46e5' }}>Open Interactive Map</span>
                </div>
              </div>
            )}
            {stations[0] && (
              <div style={{ padding: '14px 18px', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Closest Fuel Station</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{stations[0]._meta?.distanceKm} km · {stations[0].name}</div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>Availability Legend</div>
            {[['#22c55e', 'Available'], ['#f59e0b', 'Low Stock'], ['#ef4444', 'Out of Stock'], ['#8b5cf6', 'EV Station']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
