import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapStore, useAppStore } from '../../store';
import { mapApi } from '../../services/api';

const BRAND_COLORS = {
  IOCL: '#f97316', BPCL: '#3b82f6', HPCL: '#22c55e',
  SHELL: '#eab308', NAYARA: '#8b5cf6', RELIANCE: '#7c3aed',
};

function FuelBadge({ fuel }) {
  const colors = {
    AVAILABLE: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    LOW: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    OUT: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  };
  const c = colors[fuel.status] || colors.OUT;
  return (
    <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
      {fuel.type}
    </span>
  );
}

export default function StationCard({ station, onRouteClick }) {
  const navigate = useNavigate();
  const { selectedStation, setSelectedStation, addToCompare, compareList } = useMapStore();
  const { user } = useAppStore();
  const [routing, setRouting] = useState(false);
  const isSelected = selectedStation?.id === station.id;
  const inCompare = compareList.some(x => x.id === station.id);
  const color = BRAND_COLORS[station.brand] || '#64748b';
  const meta = station._meta || {};

  const handleRoute = async (e) => {
    e.stopPropagation();
    if (onRouteClick) {
      setRouting(true);
      try { await onRouteClick(station); } finally { setRouting(false); }
    }
  };

  const stationRating = parseFloat(station.rating || station.ratingValue || 0);
  const isOpen = station.isOpen !== undefined ? station.isOpen : station.open_now;
  const open24Hours = station.open24Hours !== undefined ? station.open24Hours : false;

  return (
    <div
      onClick={() => { setSelectedStation(station); navigate(`/station/${station.id}`); }}
      style={{
        background: isSelected ? 'rgba(79,70,229,0.05)' : '#f8fafc',
        border: `1px solid ${isSelected ? 'rgba(79,70,229,0.25)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: 8,
        cursor: 'pointer', transition: 'var(--transition)',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: isOpen ? '#22c55e' : '#ef4444',
            }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {station.name}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', paddingLeft: 14 }}>{station.area}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isOpen
            ? <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: '999px' }}>
                {open24Hours ? '24/7' : 'OPEN'}
              </span>
            : <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: '999px' }}>CLOSED</span>
          }
        </div>
      </div>

      {/* Meta */}
      {(meta.distanceKm !== undefined) && (
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#64748b', marginBottom: 8, paddingLeft: 14 }}>
          <span>📍 {meta.distanceKm} km</span>
          <span>⏱ {meta.etaMinutes} min</span>
          <span style={{ color: '#f59e0b' }}>★ {stationRating > 0 ? stationRating.toFixed(1) : 'New'}</span>
          {meta.currentQueueMinutes > 0 && <span>🚗 {meta.currentQueueMinutes}min queue</span>}
        </div>
      )}

      {/* Fuel badges */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10, paddingLeft: 14 }}>
        {(station.fuels || []).map(f => <FuelBadge key={f.type} fuel={f} />)}
      </div>

      {/* Stock bar for best fuel */}
      {station.fuels?.[0] && (
        <div style={{ paddingLeft: 14, marginBottom: 10 }}>
          <div className="stock-bar">
            <div className="stock-bar-fill" style={{
              width: `${station.fuels[0].stockPercent}%`,
              background: station.fuels[0].stockPercent > 60 ? '#22c55e' : station.fuels[0].stockPercent > 25 ? '#f59e0b' : '#ef4444',
            }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, paddingLeft: 14 }}>
        <button
          className="btn btn-primary"
          onClick={handleRoute}
          disabled={routing || !station.isOpen}
          style={{ flex: 1, fontSize: 12, padding: '7px 0', justifyContent: 'center' }}
        >
          {routing ? '…' : '🗺️ Route'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={e => { e.stopPropagation(); navigate(`/station/${station.id}`); }}
          style={{ fontSize: 12, padding: '7px 12px' }}
        >
          Details
        </button>
        {compareList.length < 3 && !inCompare && (
          <button
            className="btn btn-ghost"
            onClick={e => { e.stopPropagation(); addToCompare(station); }}
            style={{ fontSize: 11, padding: '7px 8px' }}
            title="Add to compare"
          >
            ⊕
          </button>
        )}
      </div>
    </div>
  );
}
