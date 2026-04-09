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
        const lat = userLocation?.lat || 19.1235; // Default Mumbai
        const lng = userLocation?.lng || 72.8872;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/pumps/nearby?lat=${lat}&lng=${lng}&radius=10`);
        const data = await res.json();
        if (data.success) {
          setNearbyPumps(data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch nearby pumps for landing:', err);
      }
    };
    fetchNearby();
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

      {/* ══════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════ */}
      <section style={{
        padding: '110px 24px',
        background: 'linear-gradient(180deg, var(--color-surface) 0%, rgba(79,70,229,0.03) 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <Reveal dir="left">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>The Problem</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20, color: 'var(--color-text)' }}>
                Highway Fuel<br />Anxiety is Real
              </h2>
              <p style={{ fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: 32 }}>
                Highway travel in India often becomes burdensome when travelers run out of fuel far from cities.
                In many cases, drivers are unsure which nearby petrol pumps are operational, what type of fuel is available,
                or whether sufficient fuel stock exists at that station. The lack of real-time fuel information leads to
                wasted travel, panic situations, and inefficient fuel management on Indian roads.
              </p>
              <div style={{ display: 'flex', gap: 40 }}>
                {[['95%', "of stranded drivers had a nearby open station they didn't know about"],
                ['45min', 'average delay caused by wrong fuel stop info']].map(([v, l]) => (
                  <div key={v}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#4f46e5' }}>{v}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-dim)', maxWidth: 150, marginTop: 6, lineHeight: 1.5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Real station list preview */}
          <Reveal dir="right" delay={0.15}>
            <div>
              <div style={{ padding: '8px 14px', background: 'rgba(79,70,229,0.08)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4f46e5', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best Available Nearby</span>
              </div>

              {nearbyPumps.length > 0 ? (
                nearbyPumps.map((station, idx) => (
                  <StationPreviewCard key={station.id} station={station} delay={idx * 0.1} />
                ))
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 14 }}>
                  Locating nearby stations...
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════ */}
      <section style={{
        padding: '110px 24px',
        background: 'linear-gradient(180deg, rgba(79,70,229,0.03) 0%, var(--color-bg) 100%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Intelligence Layer</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: 16 }}>
                Real-time Network<br />at Your Fingertips
              </h2>
              <p style={{ fontSize: 16, color: 'var(--color-text-dim)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Never make fuel stops guesswork. PetroPluze is always on the
                map, ready to find your optimal route.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.07} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAP SECTION
      ══════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Map mockup */}
          <Reveal dir="left">
            <div style={{
              background: '#1e293b',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              aspectRatio: '4/3',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
            }}>
              {/* Mock map */}
              <div style={{
                inset: 0, position: 'absolute',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                overflow: 'hidden',
              }}>
                {/* Grid lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={`${(i / 11) * 100}%`} x2="100%" y2={`${(i / 11) * 100}%`} stroke="#4f46e5" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`v${i}`} x1={`${(i / 11) * 100}%`} y1="0" x2={`${(i / 11) * 100}%`} y2="100%" stroke="#4f46e5" strokeWidth="0.5" />
                  ))}
                </svg>
                {/* Route line */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <path d="M 80 200 Q 180 120 280 160 Q 350 180 400 120" stroke="#4f46e5" strokeWidth="3" fill="none" strokeDasharray="8,4" opacity="0.8" />
                  <circle cx="80" cy="200" r="5" fill="#4f46e5" />
                </svg>
                {/* Station markers */}
                {[[40, 40, '#4f46e5'], [65, 65, '#4f46e5'], [75, 30, '#f59e0b'], [55, 50, '#4f46e5']].map(([lx, ly, c], i) => (
                  <div key={i} style={{
                    position: 'absolute', left: `${lx}%`, top: `${ly}%`,
                    width: 28, height: 28, borderRadius: '50%',
                    background: c + '22', border: `2px solid ${c}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12,
                    transform: 'translate(-50%,-50%)',
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  }}>⛽</div>
                ))}
              </div>
              {/* LIVE badge */}
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, color: '#4f46e5', fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', animation: 'pulse 2s infinite' }} />
                LIVE MAP
              </div>
              {/* Bottom info card */}
              <div style={{
                position: 'absolute', bottom: 14, right: 14,
                background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-md)',
                padding: '10px 14px', fontSize: 12, boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ color: 'var(--color-text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selected Station</div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>Shell V-Power · Andheri W</div>
                <div style={{ color: '#4f46e5', marginTop: 2, fontWeight: 600 }}>6 min · 2.4 km</div>
              </div>
            </div>
          </Reveal>

          <Reveal dir="right" delay={0.1}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Map Intelligence</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20, color: 'var(--color-text)' }}>
                Connected Roads,<br />Smarter Ecosystems
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: 32 }}>
                Our map intelligence calculates distances, predicts queue times,
                draws reachability rings, and routes you to the optimal station
                in real time — powered by Mapbox.
              </p>
              {[
                { icon: '📡', t: 'Dynamic Rerouting', d: 'Recalculates route if selected station closes or runs out.' },
                { icon: '⏱️', t: 'Pre-Drive Best Time', d: 'Queue predictions based on historical time-of-day data.' },
              ].map(item => (
                <div key={item.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.t}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-dim)', lineHeight: 1.6 }}>{item.d}</div>
                  </div>
                </div>
              ))}
              <button onClick={handleExplore} className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15, fontWeight: 700, borderRadius: 'var(--radius-lg)', marginTop: 8 }}>
                Open Map →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          JOURNEY TO ZERO ANXIETY
      ══════════════════════════════════════ */}
      <section style={{ padding: '110px 24px', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Our Mission</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 18, color: 'var(--color-text)' }}>
              Journey to Zero Anxiety
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-text-dim)', lineHeight: 1.7, marginBottom: 60, maxWidth: 560, margin: '0 auto 60px' }}>
              We're building towards a future where no driver worries about fuel on the road.
            </p>
          </Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap' }}>
            {[
              ['🗺️', '1 Platform', 'Launched today'],
              ['🏙️', '1 City', 'Mumbai'],
              ['📍', '0.1 km', 'Precision'],
              ['📊', '50+', 'Stations'],
              ['🚗', '100%', 'Reliable'],
            ].map(([icon, val, sub], i) => (
              <StatItem key={val} value={`${icon} ${val}`} label={sub} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DARK CTA BAND (matches screenshot)
      ══════════════════════════════════════ */}
      <section style={{
        padding: '90px 24px',
        background: 'var(--color-navy)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle highway in background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(79,70,229,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Next Transition</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
              Empowering the{' '}
              <span style={{ color: '#4f46e5' }}>Next</span> Transition
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 16 }}>
              We're building a reliable fuel network — real-time availability,
              and station data to help every driver.
            </p>
            <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginBottom: 44 }}>
              {[['100%', 'Data Verified']].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#4f46e5' }}>{v}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 28 }}>
              Drive Smarter with PetroPluze
            </h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/auth" className="btn btn-ghost" style={{ padding: '13px 26px', fontSize: 15, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Login</Link>
              <Link to="/auth?tab=register" className="btn btn-primary" style={{ padding: '13px 26px', fontSize: 15, fontWeight: 700 }}>Sign Up →</Link>
            </div>
          </Reveal>
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
