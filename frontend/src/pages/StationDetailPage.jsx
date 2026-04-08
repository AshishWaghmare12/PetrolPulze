import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { stationsApi, mapApi, reportsApi } from '../services/api';
import { useAppStore, useMapStore } from '../store';
import MiniMap from '../components/map/MiniMap';
import NavigationPanel from '../components/map/NavigationPanel';

const BRAND_COLORS = {
  IOCL: '#f97316', BPCL: '#3b82f6', HPCL: '#22c55e',
  SHELL: '#eab308', NAYARA: '#8b5cf6', RELIANCE: '#7c3aed', OTHER: '#64748b',
};

const SERVICE_ICONS = {
  air: { icon: '💨', label: 'Air Check' },
  washroom: { icon: '🚻', label: 'Washrooms' },
  card_payment: { icon: '💳', label: 'Cards Accepted' },
  puncture: { icon: '🔧', label: 'Puncture Repair' },
  ev_charging: { icon: '⚡', label: 'EV Charging' },
  food: { icon: '🍽️', label: 'Food & Snacks' },
  atm: { icon: '🏧', label: 'ATM' },
  cctv: { icon: '📷', label: 'CCTV' },
  wifi: { icon: '📶', label: 'Free Wi-Fi' },
  cng: { icon: '🌿', label: 'CNG' },
};

function AnimatedTrustGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score || 0), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => s >= 80 ? '#4f46e5' : s >= 60 ? '#f59e0b' : '#ef4444';
  const color = getColor(animatedScore);

  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color }}>{animatedScore}</span>
        <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Trust</span>
      </div>
    </div>
  );
}

function AIPricePrediction({ station }) {
  if (!station || !station.fuels || station.fuels.length === 0) return null;
  const insights = station._meta?.aiInsights;
  if (!insights) return null;

  const sampleFuel = station.fuels.find(f => f.price > 0);
  if (!sampleFuel) return null;

  const currentPrice = sampleFuel.price;
  const { next7DaysHigh, next7DaysLow, priceTrend, recommendation } = insights;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.08))',
      border: '1px solid rgba(79,70,229,0.2)', borderRadius: 'var(--radius-lg)', padding: 16, marginTop: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Intelligence</span>
        <span style={{ 
          marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: priceTrend === 'RISING' ? '#ef4444' : '#22c55e', color: '#fff' 
        }}>
          {priceTrend}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Next 7 Days High</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#ef4444' }}>₹{next7DaysHigh.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Next 7 Days Low</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#22c55e' }}>₹{next7DaysLow.toFixed(2)}</div>
        </div>
      </div>
      
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
        "{recommendation}"
      </div>

      <div style={{
        marginTop: 10, height: 4, borderRadius: 2, background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: `${((currentPrice - next7DaysLow) / (next7DaysHigh - next7DaysLow)) * 100}%`,
          top: -4, width: 12, height: 12, borderRadius: '50%', background: '#4f46e5', border: '2px solid #fff',
          transform: 'translateX(-50%)',
        }} />
      </div>
    </div>
  );
}

function CommunityChat({ stationId }) {
  const [messages, setMessages] = useState([
    { id: 1, user: 'DriverMike', text: 'Queue is about 15 mins right now', time: '2m ago', queue: 15 },
    { id: 2, user: 'FuelFinder', text: 'Thanks! Heading there now', time: '1m ago' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const msg = { id: Date.now(), user: 'You', text: newMsg, time: 'now' };
    setMessages(prev => [...prev, msg]);
    setNewMsg('');
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{
        position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(79,70,229,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, zIndex: 1000,
      }}>
        💬
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 320, height: 400, borderRadius: 'var(--radius-xl)',
      background: '#ffffff', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>💬 Live Queue Chat</div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.user === 'You' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', background: m.user === 'You' ? '#4f46e5' : '#f1f5f9',
            color: m.user === 'You' ? '#fff' : '#0f172a', borderRadius: 12, padding: '8px 12px', fontSize: 13,
          }}>
            {m.user !== 'You' && <div style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', marginBottom: 2 }}>{m.user}</div>}
            <div>{m.text}</div>
            {m.queue && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>⏱️ ~{m.queue} min</div>}
            <div style={{ fontSize: 9, opacity: 0.7, marginTop: 4 }}>{m.time}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
        <input
          value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Ask about queue..."
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }}
        />
        <button onClick={handleSend} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}>Send</button>
      </div>
    </div>
  );
}

function FuelCard({ fuel }) {
  const statusColor = fuel.status === 'AVAILABLE' ? '#22c55e' : fuel.status === 'LOW' ? '#f59e0b' : '#ef4444';
  const barColor = fuel.stockPercent > 60 ? '#22c55e' : fuel.stockPercent > 25 ? '#f59e0b' : '#ef4444';
  const typeLabel = { PETROL: 'Petrol', DIESEL: 'Diesel', CNG: 'CNG', EV: 'EV Point' }[fuel.type] || fuel.type;
  const subLabel = { PETROL: 'UNLEADED / 91 OCTANE', DIESEL: 'HIGH CETANE', CNG: 'COMPRESSED NATURAL GAS', EV: 'FAST CHARGER' }[fuel.type] || '';
  const unit = fuel.type === 'EV' ? '/kWh' : '/L';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      flex: '1 1 200px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{subLabel}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{typeLabel}</div>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: '999px', fontSize: 10, fontWeight: 700,
          background: `${statusColor}20`, color: statusColor,
        }}>
          {fuel.status === 'AVAILABLE' ? 'AVAILABLE' : fuel.status === 'LOW' ? 'LOW STOCK' : 'NOT AVAILABLE'}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
          <span>Stock Level</span>
          <span style={{ fontWeight: 600 }}>{fuel.stockPercent}%</span>
        </div>
        <div className="stock-bar">
          <div className="stock-bar-fill" style={{ width: `${fuel.stockPercent}%`, background: barColor }} />
        </div>
      </div>

      {fuel.price > 0 && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
          ₹{fuel.price}
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
        </div>
      )}
    </div>
  );
}

export default function StationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { userLocation, setSelectedStation, setActiveRoute, addToCompare } = useMapStore();

  const [station, setStation] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routing, setRouting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ type: 'WRONG_INFO', message: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const loadingRef = useRef(true);

  useEffect(() => {
    loadingRef.current = true;
    loadStation();
    return () => { loadingRef.current = false; };
  }, [id]);

  const loadStation = async () => {
    setLoading(true);
    setError(null);
    loadingRef.current = true;

    const timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        setError('Request timed out. Please try again.');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 15000);

    try {
      const [stRes, simRes] = await Promise.all([
        stationsApi.getById(id),
        stationsApi.getSimilar(id)
      ]);

      clearTimeout(timeoutId);
      loadingRef.current = false;

      if (stRes?.success && stRes?.data) {
        const safeStation = {
          ...stRes.data,
          name: stRes.data.name || 'Unknown Station',
          address: stRes.data.address || '',
          area: stRes.data.area || '',
          city: stRes.data.city || '',
          brand: stRes.data.brand || 'OTHER',
          fuels: stRes.data.fuels || [],
          services: stRes.data.services || [],
          latitude: stRes.data.latitude || 0,
          longitude: stRes.data.longitude || 0,
          rating: stRes.data.rating || 0,
          totalReviews: stRes.data.totalReviews || 0,
          trustScore: stRes.data.trustScore || 0,
          isOpen: stRes.data.isOpen ?? true,
          open24Hours: stRes.data.open24Hours ?? false,
          verified: stRes.data.verified ?? false,
          timings: stRes.data.timings || {},
          phone: stRes.data.phone || '',
          sourceLastCheckedAt: stRes.data.sourceLastCheckedAt,
          dataDisclaimer: stRes.data.dataDisclaimer || '',
          dataFreshness: stRes.data.dataFreshness || 'UNKNOWN',
          _meta: stRes.data._meta || {},
        };
        setStation(safeStation);
        setSelectedStation(safeStation);
        setSaved(user?.savedStations?.includes(safeStation.id));
      } else {
        setError('Station not found');
      }
      if (simRes?.success) setSimilar(simRes.data || []);
    } catch (err) {
      console.error('Error loading station:', err);
      setError(err.message === 'timeout' ? 'Request timed out. Please try again.' : 'Failed to load station details.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleRoute = async () => {
    if (!userLocation) { alert('Enable location first'); return; }
    setRouting(true);
    try {
      const res = await mapApi.route({
        originLat: userLocation.lat, originLng: userLocation.lng,
        destLat: station.latitude, destLng: station.longitude,
      });
      if (res.success) {
        setActiveRoute(res.data);
        navigate('/map');
      }
    } catch (err) { console.error(err); }
    finally { setRouting(false); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await reportsApi.create({ stationId: station.id, ...report });
      setReportDone(true);
      setTimeout(() => { setReportOpen(false); setReportDone(false); }, 2000);
    } catch { }
    finally { setReportSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 32 }} />
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 160, flex: '1 1 200px', borderRadius: 16 }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 100, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⛽</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>{error || 'Station Not Found'}</h2>
        <button onClick={() => loadStation()} className="btn btn-primary" style={{ marginRight: 12 }}>Retry</button>
        <Link to="/find-fuel" className="btn btn-ghost">Back to Search</Link>
        <CommunityChat stationId={id} />
      </div>
    );
  }

  const brandColor = BRAND_COLORS[station.brand] || '#64748b';
  const isOpen = station.isOpen;
  const meta = station._meta || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 60 }}>

      {/* ── Header ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        padding: '32px 24px 28px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link to="/find-fuel" style={{ color: '#94a3b8', textDecoration: 'none' }}>Find Fuel</Link>
            <span>›</span>
            <span style={{ color: '#64748b' }}>{station.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              {/* Status + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {station.name}
                </h1>
                <span style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: 11, fontWeight: 700,
                  background: isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                  color: isOpen ? '#22c55e' : '#ef4444',
                  border: `1px solid ${isOpen ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {isOpen ? (station.open24Hours ? 'OPEN 24/7' : 'OPEN') : 'CLOSED'}
                  {station.fuels?.[0]?.stockPercent > 60 ? ' · HIGH STOCK' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#64748b', flexWrap: 'wrap' }}>
                <span>📍 {station.address}</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {parseFloat(station.rating).toFixed(1)}</span>
                <span style={{ color: '#94a3b8' }}>({station.totalReviews} reviews)</span>
                {station.verified && <span style={{ color: '#4f46e5', fontSize: 12 }}>✓ Verified</span>}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={handleRoute} disabled={routing} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                {routing ? '…' : '🗺️ In-App Route'}
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${parseFloat(station.latitude)},${parseFloat(station.longitude)}`, '_blank')}
                className="btn btn-ghost"
                style={{ padding: '10px 16px', background: '#f8fafc', color: '#0f172a', fontWeight: 600 }}
              >
                G Maps
              </button>
              <button onClick={() => addToCompare(station)} className="btn btn-ghost" style={{ padding: '10px 16px' }}>
                ⚖ Compare
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="btn btn-ghost" style={{ padding: '10px 16px' }}>
                🔗 Share
              </button>
              <button onClick={() => setReportOpen(true)} className="btn btn-ghost" style={{ padding: '10px 16px', color: '#f59e0b' }}>
                ⚠ Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

        {/* Left column */}
        <div>
          {/* Fuel Availability */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>⛽ Fuel Availability</h2>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Last updated: {station.sourceLastCheckedAt
                  ? new Date(station.sourceLastCheckedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                  : 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {(station.fuels || []).map(f => <FuelCard key={f.type} fuel={f} />)}
            </div>
            {station.dataDisclaimer && (
              <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                ⚠ {station.dataDisclaimer}
              </div>
            )}
          </section>

          {/* Services */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🛠️ Available Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {(station.services || []).map(s => {
                const svc = SERVICE_ICONS[s] || { icon: '✓', label: s };
                return (
                  <div key={s} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#ffffff', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: 18 }}>{svc.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{svc.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Opening Hours */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🕐 Opening Hours</h2>
            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {[
                ['Mon – Fri', station.timings?.weekdays],
                ['Saturday', station.timings?.saturday],
                ['Sunday', station.timings?.sunday],
              ].map(([day, hours]) => (
                <div key={day} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 18px', borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 14, color: '#64748b' }}>{day}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: station.open24Hours ? '#4f46e5' : '#0f172a' }}>
                    {station.open24Hours ? '24 Hours' : (hours || '—')}
                  </span>
                </div>
              ))}
              {station.phone && (
                <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <span>📞</span>
                  <a href={`tel:${station.phone}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>{station.phone}</a>
                </div>
              )}
            </div>
          </section>

          {/* Similar Stations */}
          {similar.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📍 Similar Nearby Stations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {similar.map(s => (
                  <Link key={s.id} to={`/station/${s.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#ffffff', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: 18, transition: 'var(--transition)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{s.name}</div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{s._meta?.distanceKm} km away</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{s.area}, {s.address?.split(',').slice(-2).join(',')}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {(s.fuels || []).slice(0, 3).map(f => (
                            <span key={f.type} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 10, fontWeight: 600, background: 'rgba(79,70,229,0.1)', color: '#4f46e5' }}>{f.type}</span>
                          ))}
                        </div>
                        {s.fuels?.[0]?.price && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>₹{s.fuels[0].price}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          {/* Mini map / location card */}
          <div style={{
            background: '#ffffff', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 16,
          }}>
            {/* Live Mapbox Map */}
            <MiniMap
              center={{ lat: station.latitude, lng: station.longitude }}
              markers={[station]}
              zoom={14}
              height={180}
              onClick={() => navigate('/map')}
            />

            {/* Distance card */}
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧭</div>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Distance</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                    {userLocation ? `${station._meta?.distanceKm || '—'} km` : 'Enable location'}
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400, marginLeft: 6 }}>
                      {userLocation ? `· ${station._meta?.etaMinutes || '—'} min` : ''}
                    </span>
                  </div>
                </div>
                <button onClick={() => navigate('/map')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>↗</button>
              </div>
              {!activeRoute && (
                <button onClick={handleRoute} disabled={routing || !isOpen} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontWeight: 700 }}>
                  {routing ? 'Getting route…' : '🗺️ Navigate to Station'}
                </button>
              )}
            </div>
          </div>

          {/* Active Route Navigation Panel */}
          {activeRoute && <NavigationPanel activeRoute={activeRoute} onClear={() => setActiveRoute(null)} />}

          {/* Glassmorphism Premium Sidebar */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 16,
            boxShadow: '0 8px 32px rgba(79,70,229,0.1)',
          }}>
            {/* Dynamic Trust Score Gauge */}
            <AnimatedTrustGauge score={station.trustScore} />

            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>ℹ️ Station Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🏷️', text: `Brand: ${station.brand}` },
                { icon: '🕒', text: `Data: ${station.dataFreshness}`, color: station.dataFreshness === 'LIVE' ? '#4f46e5' : station.dataFreshness === 'RECENT' ? '#22c55e' : '#f59e0b' },
                { icon: '📍', text: `${station.area}, ${station.city}` },
                ...(meta.currentQueueMinutes > 0 ? [{ icon: '🚗', text: `Est. queue: ${meta.currentQueueMinutes} min`, color: '#f59e0b' }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>{item.icon}</span>
                  <span style={{ color: item.color || '#64748b' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* AI Price Prediction */}
            <AIPricePrediction station={station} />
          </div>

          {/* Found incorrect info */}
          <button onClick={() => setReportOpen(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            padding: '10px', fontSize: 13, color: '#64748b', cursor: 'pointer',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#64748b'; }}
          >
            ⚠ Found incorrect info? Report it
          </button>
        </div>
      </div>

      {/* Floating Chat Button */}
      <CommunityChat stationId={station.id} />

      {/* ── Report Modal ── */}
      {reportOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 440, width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Report an Issue</h3>
              <button onClick={() => setReportOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
            </div>

            {reportDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, color: '#4f46e5' }}>Report submitted. Thank you!</div>
              </div>
            ) : (
              <form onSubmit={handleReport}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Issue Type</label>
                  <select className="input" value={report.type} onChange={e => setReport(r => ({ ...r, type: e.target.value }))}>
                    <option value="WRONG_INFO">Wrong Information</option>
                    <option value="CLOSED">Station Closed</option>
                    <option value="NO_STOCK">No Stock / Out of Fuel</option>
                    <option value="PRICE_UPDATE">Price Update</option>
                    <option value="QUEUE_UPDATE">Queue / Wait Time Update</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Details (optional)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={report.message}
                    onChange={e => setReport(r => ({ ...r, message: e.target.value }))}
                    placeholder="Describe the issue…"
                    style={{ resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setReportOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={reportSubmitting} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {reportSubmitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
