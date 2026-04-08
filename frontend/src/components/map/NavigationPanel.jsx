import React, { useState } from 'react';

const getManeuverIcon = (type) => {
  switch (type) {
    case 'turn': return '↪️';
    case 'new name': return '🛣️';
    case 'depart': return '🏁';
    case 'arrive': return '📍';
    case 'merge': return '🔀';
    case 'on ramp': return '↗️';
    case 'off ramp': return '↘️';
    case 'fork': return '🔱';
    case 'end of road': return '🛑';
    case 'continue': return '⬆️';
    case 'roundabout': return '🔄';
    default: return '➡️';
  }
};

export default function NavigationPanel({ activeRoute, onClear }) {
  const [expanded, setExpanded] = useState(true);

  if (!activeRoute || !activeRoute.steps) return null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 10,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div 
        style={{
          background: 'rgba(79,70,229,0.06)',
          padding: '11px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(79,70,229,0.1)' : 'none'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 6 }}>
            🗺️ Active Route {expanded ? '▼' : '▶'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            {activeRoute.distanceKm} km · {activeRoute.durationMinutes} min
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }} 
          className="btn btn-ghost" 
          style={{ fontSize: 11, padding: '4px 8px', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          ✕ Exit
        </button>
      </div>

      {expanded && (
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '10px 0' }}>
          {activeRoute.steps.map((step, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: 12, padding: '8px 14px',
              borderBottom: idx < activeRoute.steps.length - 1 ? '1px solid var(--color-border)' : 'none'
            }}>
              <div style={{ fontSize: 18, marginTop: 2 }}>{getManeuverIcon(step.type)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4 }}>
                  {step.instruction}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {step.distanceM > 1000 ? `${(step.distanceM / 1000).toFixed(1)} km` : `${Math.round(step.distanceM)} m`}
                  {step.durationS > 0 && ` · ${Math.ceil(step.durationS / 60)} min`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
