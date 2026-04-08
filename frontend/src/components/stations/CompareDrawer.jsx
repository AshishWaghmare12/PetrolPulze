import { useMapStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export default function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useMapStore();
  const navigate = useNavigate();
  if (compareList.length === 0) return null;

  const cols = compareList.length;
  const gridTemplate = `140px repeat(${cols}, 1fr)`;

  const Row = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 8, padding: '9px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
  const Cell = ({ children }) => <div style={{ textAlign: 'center', fontSize: 13 }}>{children}</div>;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
      background: '#ffffff', border: '1px solid var(--color-border)',
      borderRadius: '20px 20px 0 0', padding: '20px 24px',
      boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
      animation: 'slideIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
          ⚖ Compare Stations ({cols}/3)
        </h3>
        <button onClick={clearCompare} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>Clear All</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 8, marginBottom: 8 }}>
          <div />
          {compareList.map((s) => (
            <div key={s.id} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{s.area}</div>
              <button onClick={() => removeFromCompare(s.id)}
                style={{ fontSize: 10, color: '#ef4444', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
        </div>
        <Row label="Status">
          {compareList.map(s => (
            <Cell key={s.id}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                background: s.isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                color: s.isOpen ? '#22c55e' : '#ef4444' }}>
                {s.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </Cell>
          ))}
        </Row>
        <Row label="Rating">
          {compareList.map(s => <Cell key={s.id}><span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {parseFloat(s.rating).toFixed(1)}</span></Cell>)}
        </Row>
        <Row label="Distance">
          {compareList.map(s => <Cell key={s.id}>{s._meta?.distanceKm ? `${s._meta.distanceKm} km` : '—'}</Cell>)}
        </Row>
        <Row label="ETA">
          {compareList.map(s => <Cell key={s.id}>{s._meta?.etaMinutes ? `${s._meta.etaMinutes} min` : '—'}</Cell>)}
        </Row>
        <Row label="Petrol Price">
          {compareList.map(s => { const f = s.fuels?.find(x => x.type === 'PETROL'); return <Cell key={s.id}>{f ? `₹${f.price}` : '—'}</Cell>; })}
        </Row>
        <Row label="Smart Score">
          {compareList.map(s => <Cell key={s.id}><span style={{ color: '#4f46e5', fontWeight: 700 }}>{s._meta?.smartScore || '—'}</span></Cell>)}
        </Row>
        <Row label="Trust Score">
          {compareList.map(s => <Cell key={s.id}><span style={{ color: s.trustScore > 80 ? '#4f46e5' : s.trustScore > 60 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{s.trustScore}%</span></Cell>)}
        </Row>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        {compareList.map(s => (
          <button key={s.id} className="btn btn-primary" style={{ fontSize: 13 }}
            onClick={() => navigate(`/station/${s.id}`)}>View {s.name.split(' ')[0]}</button>
        ))}
      </div>
    </div>
  );
}
