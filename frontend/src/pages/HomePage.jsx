import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMapStore } from '../store';


const CarSVG = ({ color = '#1e40af', facing = 'left', scale = 1 }) => {
  const flip = facing === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
  return (
    <svg width={56 * scale} height={24 * scale} viewBox="0 0 56 24" style={{ transform: flip, display: 'block' }}>
      {/* Body */}
      <rect x="4" y="10" width="48" height="12" rx="4" fill={color} />
      {/* Roof */}
      <path d="M14 10 L17 4 L39 4 L42 10Z" fill={color} opacity="0.9" />
      {/* Windows */}
      <rect x="18" y="5" width="8" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="28" y="5" width="9" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
      {/* Wheels */}
      <circle cx="15" cy="22" r="4" fill="#1e293b" />
      <circle cx="15" cy="22" r="2" fill="#475569" />
      <circle cx="41" cy="22" r="4" fill="#1e293b" />
      <circle cx="41" cy="22" r="2" fill="#475569" />
    </svg>
  );
};

const TruckSVG = ({ color = '#15803d' }) => (
  <svg width="90" height="28" viewBox="0 0 90 28" style={{ display: 'block' }}>
    {/* Cab */}
    <rect x="58" y="6" width="28" height="20" rx="4" fill={color} />
    <rect x="64" y="8" width="10" height="8" rx="1" fill="rgba(255,255,255,0.55)" />
    {/* Trailer */}
    <rect x="2" y="8" width="58" height="18" rx="3" fill={color} opacity="0.85" />
    {/* Wheels */}
    <circle cx="12" cy="26" r="4" fill="#1e293b" />
    <circle cx="28" cy="26" r="4" fill="#1e293b" />
    <circle cx="52" cy="26" r="4" fill="#1e293b" />
    <circle cx="75" cy="26" r="4" fill="#1e293b" />
  </svg>
);

const BusSVG = ({ color = '#7c3aed' }) => (
  <svg width="70" height="26" viewBox="0 0 70 26" style={{ display: 'block' }}>
    <rect x="2" y="4" width="66" height="18" rx="4" fill={color} />
    {[10, 22, 34, 46, 58].map(x => (
      <rect key={x} x={x} y="6" width="8" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
    ))}
    <circle cx="14" cy="24" r="4" fill="#1e293b" />
    <circle cx="56" cy="24" r="4" fill="#1e293b" />
  </svg>
);

/* ─────────────────────────────────────────────
   PARALLAX HIGHWAY SCENE*/
const HighwayScene = () => {
  const vehicles = [
    // Going left (top lanes) — cars moving right→left
    { id: 1, comp: <CarSVG color="#1e40af" facing="left" />, lane: 28, dur: 9, delay: 0, dir: 'left' },
    { id: 2, comp: <CarSVG color="#dc2626" facing="left" scale={0.9} />, lane: 35, dur: 7, delay: 2.5, dir: 'left' },
    { id: 3, comp: <CarSVG color="#92400e" facing="left" />, lane: 29, dur: 11, delay: 5, dir: 'left' },
    { id: 4, comp: <TruckSVG color="#15803d" />, lane: 25, dur: 16, delay: 1, dir: 'truck' },
    { id: 5, comp: <CarSVG color="#7c3aed" facing="left" scale={0.85} />, lane: 38, dur: 8, delay: 7, dir: 'left' },
    { id: 6, comp: <CarSVG color="#0e7490" facing="left" />, lane: 30, dur: 10, delay: 12, dir: 'left' },
    // Going right (bottom lanes) — cars moving left→right
    { id: 7, comp: <CarSVG color="#be185d" facing="right" />, lane: 6, dur: 10, delay: 1.5, dir: 'right' },
    { id: 8, comp: <CarSVG color="#065f46" facing="right" scale={1.1} />, lane: 15, dur: 8, delay: 4, dir: 'right' },
    { id: 9, comp: <CarSVG color="#1d4ed8" facing="right" />, lane: 8, dur: 12, delay: 8, dir: 'right' },
    { id: 10, comp: <BusSVG color="#7c3aed" />, lane: 12, dur: 14, delay: 3, dir: 'right' },
    { id: 11, comp: <CarSVG color="#b45309" facing="right" scale={0.9} />, lane: 18, dur: 9, delay: 11, dir: 'right' },
    { id: 12, comp: <CarSVG color="#f59e0b" facing="right" />, lane: 6, dur: 7, delay: 17, dir: 'right' },
  ];

  return (
    <div className="highway-scene" aria-hidden="true">
      {/* Sky gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
      }} />

      {/* Distant hills/horizon */}
      <div style={{ position: 'absolute', bottom: '38%', left: 0, right: 0, height: 60 }}>
        <svg width="100%" height="60" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 60 Q180 20 360 40 Q540 55 720 30 Q900 10 1080 35 Q1260 55 1440 25 L1440 60Z" fill="rgba(79,70,229,0.08)" />
          <path d="M0 60 Q200 35 400 50 Q600 60 800 40 Q1000 25 1200 45 Q1350 55 1440 38 L1440 60Z" fill="rgba(79,70,229,0.05)" />
        </svg>
      </div>

      {/* Trees (parallax layer 1 - slow) */}
      <div style={{ position: 'absolute', bottom: '33%', left: 0, right: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 0, width: '200%', animation: 'cloudDrift 60s linear infinite' }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{
              width: 28, flexShrink: 0,
              height: i % 3 === 0 ? 40 : i % 3 === 1 ? 50 : 35,
              background: `hsl(${130 + (i % 5) * 8}, 45%, ${35 + (i % 3) * 5}%)`,
              borderRadius: '50% 50% 4px 4px',
              margin: `0 ${8 + (i % 4) * 4}px`,
              opacity: 0.7,
            }} />
          ))}
        </div>
      </div>

      {/* Road surface */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%',
        background: 'linear-gradient(180deg, #9ca3af 0%, #6b7280 40%, #4b5563 100%)',
      }}>
        {/* Road markings */}
        <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.2)' }} />
        {/* Center dashes */}
        <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, overflow: 'hidden', height: 4 }}>
          <div style={{
            display: 'flex', gap: '40px', width: '200%',
            animation: 'cloudDrift 2s linear infinite',
          }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.6)', borderRadius: 2, flexShrink: 0 }} />
            ))}
          </div>
        </div>
        {/* Bottom dashes */}
        <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, overflow: 'hidden', height: 4 }}>
          <div style={{
            display: 'flex', gap: '40px', width: '200%',
            animation: 'cloudDrift 2.5s linear infinite reverse',
          }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2, flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* VEHICLES */}
      {vehicles.map(v => (
        <div key={v.id} style={{
          position: 'absolute',
          bottom: `${v.lane}%`,
          animationName: v.dir === 'left' ? 'carLeft' : v.dir === 'right' ? 'carRight' : 'truckLeft',
          animationDuration: `${v.dur}s`,
          animationDelay: `${v.delay}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          transform: v.dir === 'right' ? 'translateX(-20vw)' : 'translateX(110vw)',
        }}>
          {/* Speed blur shadow */}
          <div style={{
            position: 'absolute',
            top: '30%',
            [v.dir === 'left' ? 'right' : 'left']: '100%',
            width: 30,
            height: '40%',
            background: v.dir === 'left'
              ? 'linear-gradient(90deg, transparent, var(--color-border))'
              : 'linear-gradient(270deg, transparent, var(--color-border))',
          }} />
          {v.comp}
        </div>
      ))}

      {/* Atmospheric fog at road horizon */}
      <div style={{
        position: 'absolute', bottom: '38%', left: 0, right: 0, height: 40,
        background: 'linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.6) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom fade to page bg */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        background: 'linear-gradient(transparent, var(--color-bg))',
      }} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   STAT COUNTER with animation
───────────────────────────────────────────── */
const StatItem = ({ value, label, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(12px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#4f46e5', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, dir = 'up' }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const from = dir === 'left' ? 'translateX(-24px)' : dir === 'right' ? 'translateX(24px)' : 'translateY(24px)';
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : from,
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>{children}</div>
  );
};

/* ─────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, accent = '#4f46e5', delay = 0 }) => {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${hov ? accent + '40' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          transition: 'all 0.25s ease',
          transform: hov ? 'translateY(-4px)' : 'none',
          boxShadow: hov ? `0 8px 32px ${accent}18` : 'var(--shadow-sm)',
          cursor: 'default',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-lg)',
          background: accent + '14', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 22, marginBottom: 16,
          border: `1px solid ${accent}20`,
        }}>{icon}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--color-text)' }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </Reveal>
  );
};

const FEATURES = [
  { icon: '🗺️', title: 'Drive-Time Reachability', desc: 'See exactly which stations are reachable in 5, 10, or 15 minutes with real-time isochrones.', accent: '#4f46e5' },
  { icon: '📊', title: 'Real-time Stock Tracking', desc: 'Check verified fuel stock percentages and availability for Petrol, Diesel, CNG, and EV.', accent: '#06bd7a' },
  { icon: '🚨', title: 'Easy to Find Petrol Pump', desc: 'One-tap access to find the closest verified open station when you\'re running on fumes.', accent: '#ef4444' },
  { icon: '🔍', title: 'Smart Proximity Search', desc: 'Intelligently ranked results based on distance, open status, and verified user ratings.', accent: '#f59e0b' },
  { icon: '⚡', title: 'Multi-Fuel Support', desc: 'Seamlessly filter through networks for EVs, CNG vehicles, and traditional internal combustion.', accent: '#7c3aed' },
  { icon: '🛡️', title: 'Station Trust Scores', desc: 'Reliability ratings based on verified data freshness to ensure you always find a functional pump.', accent: '#4f46e5' },
];

/* ─────────────────────────────────────────────
   STATION PREVIEW CARD (dynamic data)
───────────────────────────────────────────── */
const StationPreviewCard = ({ station, delay = 0 }) => (
  <Reveal delay={delay}>
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      boxShadow: 'var(--shadow-sm)', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 2 }}>{station.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{station.area}</div>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: '999px', fontSize: 10, fontWeight: 700,
          background: station.open_now ? '#dcfce7' : '#fee2e2',
          color: station.open_now ? '#15803d' : '#dc2626'
        }}>
          {station.open_now ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
        <span>📍 {parseFloat(station.distanceKm || 0).toFixed(1)} km</span>
        <span>⏱ {Math.round((station.distanceKm || 0) * 3)} min</span>
        <span style={{ color: '#f59e0b' }}>★ {station.rating || 4.5}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {station.petrol_available && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>Petrol</span>}
        {station.diesel_available && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>Diesel</span>}
        {station.ev_charging_available && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: 11, fontWeight: 600, background: '#dbf4ff', color: '#0369a1' }}>EV</span>}
      </div>
    </div>
  </Reveal>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { locateUser, userLocation } = useMapStore();
  const [heroVisible, setHeroVisible] = useState(false);
  const [nearbyPumps, setNearbyPumps] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch real nearby pumps
  useEffect(() => {
    const fetchNearby = async () => {
      try {
        // Use user location if available, otherwise fallback to Mumbai Center for demo
        const lat = userLocation?.lat || 19.1235;
        const lng = userLocation?.lng || 72.8872;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/pumps/nearby?lat=${lat}&lng=${lng}&radius=10`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setNearbyPumps(data.data.slice(0, 3));
        } else {
          // Fallback: If no pumps found within 10km, try a wider radius
          const wideRes = await fetch(`${import.meta.env.VITE_API_URL}/pumps/nearby?lat=${lat}&lng=${lng}&radius=50`);
          const wideData = await wideRes.json();
          if (wideData.success) setNearbyPumps(wideData.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch nearby pumps for landing:', err);
      }
    };

    // Delay fetching slightly to allow store to hydrate
    const t = setTimeout(fetchNearby, 500);
    return () => clearTimeout(t);
  }, [userLocation]);

  const handleExplore = () => { locateUser(); navigate('/map'); };

  return (
    <div style={{ background: 'var(--color-bg)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════
          HERO — Full viewport with highway
      ══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '120px 24px 80px',
      }}>
        {/* Animated highway scene */}
        <HighwayScene />

        {/* Checker pattern overlay (light) */}
        <div className="checker-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820 }}>

          {/* Badge */}


          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 8vw, 88px)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            color: 'var(--color-text)',
            marginBottom: 20,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity'
          }}>
            Never Run Out of Fuel
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>on the Highway Again</span>
          </h1>



          {/* CTA buttons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'none' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.3s',
          }}>
            <button onClick={handleExplore} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 700, borderRadius: 'var(--radius-lg)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Explore Map
            </button>
            <Link to="/find-fuel" className="btn btn-navy" style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--radius-lg)' }}>
              Find Fuel →
            </Link>
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="#4f46e5" /><path d="M16 6L22 13L16 20L10 13Z" fill="white" /><path d="M16 20V27" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>PetroPluze</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>© PetroPluze · Colloquium 2026</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Highway Assistance'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
