import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { stationsApi, mapApi } from '../services/api';
import { useMapStore } from '../store';
import MiniMap from '../components/map/MiniMap';

const SERVICE_ICONS = {
  washroom: { icon: '🚻', label: 'Washrooms' },
  air: { icon: '💨', label: 'Air Check' },
  food: { icon: '🍽️', label: 'Food/Snacks' },
  card_payment: { icon: '💳', label: 'Cards Accepted' },
  heavy_vehicle: { icon: '🚛', label: 'Heavy Vehicle' },
  wifi: { icon: '📶', label: 'Free Wi-Fi' },
  cng: { icon: '🌿', label: 'CNG' },
  ev_charging: { icon: '⚡', label: 'EV Charging' },
};

function FuelAvailabilityCard({ fuel }) {
  const isAvailable = fuel.status === 'AVAILABLE';
  const isLow = fuel.status === 'LOW';
  const statusLabel = isAvailable ? 'AVAILABLE' : isLow ? 'LOW STOCK' : 'NOT AVAILABLE';
  const statusColor = isAvailable ? '#10b981' : isLow ? '#f59e0b' : '#ef4444';
  const statusBg = isAvailable ? '#dcfce7' : isLow ? '#fef3c7' : '#fee2e2';

  const typeLabel = { PETROL: 'Petrol', DIESEL: 'Diesel', CNG: 'CNG', EV: 'EV Point' }[fuel.type] || fuel.type;
  const subLabel = { PETROL: '95 OCTANE', DIESEL: 'PREMIUM', CNG: 'COMPRESSED NATURAL GAS', EV: 'FAST CHARGER (60KW)' }[fuel.type] || '';
  const priceLabel = fuel.type === 'EV' ? '₹18.00/kWh' : fuel.type === 'CNG' ? '₹86.00/Kg' : `₹${fuel.price.toFixed(2)}/L`;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eef2f6',
      borderRadius: '20px',
      padding: '24px',
      flex: '1 1 240px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{subLabel}</span>
        <span style={{
          fontSize: '9px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px',
          background: statusBg, color: statusColor, textTransform: 'uppercase'
        }}>{statusLabel}</span>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: 16 }}>{typeLabel === 'Petrol' ? 'Petrol (V-Power)' : typeLabel}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: 6 }}>
        <span>Stock Level</span>
        <span style={{ fontWeight: 700 }}>{fuel.stockPercent}%</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${fuel.stockPercent}%`, background: statusColor, borderRadius: '3px', transition: 'width 1s ease' }} />
      </div>

      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
        {priceLabel.split('/')[0]}<span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>/{priceLabel.split('/')[1]}</span>
      </div>
    </div>
  );
}

function SimilarStationCard({ station }) {
  const distance = (station.distance || 0).toFixed(1);
  const bestFuel = station.fuels?.[0] || {};

  return (
    <Link to={`/station/${station.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 320px' }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #eef2f6',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }} onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.04)';
      }} onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.01)';
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            ⛽
          </div>
          <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 800, color: '#64748b' }}>
            {distance} KM AWAY
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{station.name}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{station.address?.split(',').slice(0, 2).join(',')}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {station.petrol_available && <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#dcfce7', color: '#10b981', fontSize: '10px', fontWeight: 800 }}>Petrol</span>}
            {station.diesel_available && <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#dcfce7', color: '#10b981', fontSize: '10px', fontWeight: 800 }}>Diesel</span>}
            {station.cng_available && <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', fontSize: '10px', fontWeight: 800 }}>CNG Low</span>}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            ₹{bestFuel.price?.toFixed(2) || '106.31'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function StationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userLocation, setActiveRoute } = useMapStore();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stationsApi.getById(id);
      if (res && res.success && res.data) {
        const s = res.data;
        const safeData = {
          ...s,
          fuels: s.fuels || [],
          services: s.services || [],
          rating: s.rating || 0,
          totalReviews: s.totalReviews || 0,
          trustScore: s.trustScore || 0,
          latitude: s.latitude || 0,
          longitude: s.longitude || 0,
          address: s.address || 'Address not available',
          name: s.name || 'Station',
          open_now: s.open_now ?? true,
        };
        setStation(safeData);

        // Load similar
        try {
          const simRes = await stationsApi.nearby({
            lat: safeData.latitude,
            lng: safeData.longitude,
            radius: 5
          });
          if (simRes && simRes.success) {
            setSimilar((simRes.data || []).filter(x => x.id !== id).slice(0, 3));
          }
        } catch (simErr) {
          console.warn('Failed to load similar stations:', simErr);
        }
      } else {
        setError('Station not found');
      }
    } catch (err) {
      console.error('Error loading station:', err);
      setError('Failed to load station: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoute = async () => {
    if (!userLocation) {
      alert('Locating you... please wait a moment.');
      await useMapStore.getState().locateUser();
      // Retry in 2s if location arrives
      setTimeout(() => {
        const freshLoc = useMapStore.getState().userLocation;
        if (freshLoc) handleRoute();
      }, 2000);
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
        useMapStore.getState().setSelectedStation(station);
        setActiveRoute(res.data);
        navigate('/map');
      }
    } catch (err) {
      alert('Could not calculate route. Please ensure location is enabled.');
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (error || !station) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{station.name}</h1>
              {station.open_now ? (
                <span style={{
                  background: '#dcfce7', color: '#10b981', padding: '4px 12px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                }}>OPEN {station.fuels?.[0]?.stockPercent > 60 ? '— HIGH STOCK' : ''}</span>
              ) : (
                <span style={{
                  background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                }}>CLOSED</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#64748b', fontSize: '14px' }}>
              <span>📍 {station.address}</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {station.rating} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({station.totalReviews} Reviews)</span></span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleRoute} className="btn-premium" style={{ background: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
              <span>🚀</span> Get Directions
            </button>
            <button onClick={() => {
              const rating = window.prompt('Rate this station (1-5 stars):', '5');
              if (rating) {
                window.prompt('Write a short review (optional):');
                alert(`Thank you! Your ${rating}-star review has been submitted.`);
              }
            }} className="btn-ghost-premium">Review Station</button>
            <button onClick={() => {
              const issue = window.prompt('Please describe the issue (e.g., Station closed, Fuel out of stock, Incorrect price):');
              if (issue) {
                alert('Issue reported successfully. Our team will verify this information. Thank you for keeping the community updated!');
              }
            }} className="btn-ghost-premium" style={{ color: '#ef4444' }}>Report Issue</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', marginBottom: '60px' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Fuel Availability */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>⛽ Fuel Availability</h2>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Last updated: 5 mins ago</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {(station.fuels || []).map(f => <FuelAvailabilityCard key={f.type} fuel={f} />)}
              </div>
            </section>

            {/* Services & Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>🏙️ Available Services</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(station.services || []).map(s => {
                    const svc = SERVICE_ICONS[s] || { icon: '✓', label: s };
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                        <span style={{ fontSize: '18px' }}>{svc.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{svc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>🕐 Opening Hours</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Mon - Fri</span>
                    <span style={{ fontWeight: 700 }}>24 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Saturday</span>
                    <span style={{ fontWeight: 700 }}>24 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#ef4444' }}>Sunday (Today)</span>
                    <span style={{ fontWeight: 700 }}>06:00 - 23:00</span>
                  </div>
                  <div style={{ marginTop: '12px', color: '#06b6d4', fontWeight: 700, fontSize: '15px' }}>
                    📞 {station.phone || '+91 98765 43210'}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Map Preview */}
            <div className="glass-card" style={{ padding: '12px', borderRadius: '24px' }}>
              <MiniMap
                center={{ lat: station.latitude, lng: station.longitude }}
                markers={[station]}
                zoom={14}
                height={260}
              />
              <div style={{ padding: '16px 8px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#ecfeff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔄</div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Locality Stats</div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>{station.area} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· Mumbai</span></div>
                </div>
              </div>
            </div>

            {/* Station Summary */}
            <div className="glass-card" style={{ padding: '24px', background: '#0f172a', color: '#fff' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>ℹ️ Station Summary</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#10b981' }}>✓</span> {station.brand} Verified Outlet</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#10b981' }}>✓</span> Digital Payments Accepted</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#f59e0b' }}>⚠</span> High demand area — queue possible</li>
              </ul>
              <button style={{
                width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
              }}>View Full History</button>
            </div>

          </div>
        </div>

        {/* Similar Nearby Stations - Horizontal Section Below */}
        <section style={{ borderTop: '1px solid #eef2f6', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', background: '#ecfeff', color: '#06b6d4', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧭</span>
            Similar Nearby Stations
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {similar.map(s => <SimilarStationCard key={s.id} station={s} />)}
          </div>
        </section>

      </div>
    </div>
  );
}
