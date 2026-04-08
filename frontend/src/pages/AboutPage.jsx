import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CarSVG = ({ color = '#1e40af', facing = 'left', scale = 1 }) => {
  const flip = facing === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
  return (
    <svg width={56 * scale} height={24 * scale} viewBox="0 0 56 24" style={{ transform: flip, display: 'block' }}>
      <rect x="4" y="10" width="48" height="12" rx="4" fill={color} />
      <path d="M14 10 L17 4 L39 4 L42 10Z" fill={color} opacity="0.9" />
      <rect x="18" y="5" width="8" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="28" y="5" width="9" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
      <circle cx="15" cy="22" r="4" fill="#1e293b" />
      <circle cx="15" cy="22" r="2" fill="#475569" />
      <circle cx="41" cy="22" r="4" fill="#1e293b" />
      <circle cx="41" cy="22" r="2" fill="#475569" />
    </svg>
  );
};

const TruckSVG = ({ color = '#15803d' }) => (
  <svg width="90" height="28" viewBox="0 0 90 28" style={{ display: 'block' }}>
    <rect x="58" y="6" width="28" height="20" rx="4" fill={color} />
    <rect x="64" y="8" width="10" height="8" rx="1" fill="rgba(255,255,255,0.55)" />
    <rect x="2" y="8" width="58" height="18" rx="3" fill={color} opacity="0.85" />
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

const HighwayScene = () => {
  const vehicles = [
    { id: 1, comp: <CarSVG color="#1e40af" facing="left" />, lane: 28, dur: 9, delay: 0, dir: 'left' },
    { id: 2, comp: <CarSVG color="#dc2626" facing="left" scale={0.9} />, lane: 35, dur: 7, delay: 2.5, dir: 'left' },
    { id: 3, comp: <CarSVG color="#92400e" facing="left" />, lane: 29, dur: 11, delay: 5, dir: 'left' },
    { id: 4, comp: <TruckSVG color="#15803d" />, lane: 25, dur: 16, delay: 1, dir: 'truck' },
    { id: 5, comp: <CarSVG color="#7c3aed" facing="left" scale={0.85} />, lane: 38, dur: 8, delay: 7, dir: 'left' },
    { id: 6, comp: <CarSVG color="#0e7490" facing="left" />, lane: 30, dur: 10, delay: 12, dir: 'left' },
    { id: 7, comp: <CarSVG color="#be185d" facing="right" />, lane: 6, dur: 10, delay: 1.5, dir: 'right' },
    { id: 8, comp: <CarSVG color="#065f46" facing="right" scale={1.1} />, lane: 15, dur: 8, delay: 4, dir: 'right' },
    { id: 9, comp: <CarSVG color="#1d4ed8" facing="right" />, lane: 8, dur: 12, delay: 8, dir: 'right' },
    { id: 10, comp: <BusSVG color="#7c3aed" />, lane: 12, dur: 14, delay: 3, dir: 'right' },
    { id: 11, comp: <CarSVG color="#b45309" facing="right" scale={0.9} />, lane: 18, dur: 9, delay: 11, dir: 'right' },
    { id: 12, comp: <CarSVG color="#f59e0b" facing="right" />, lane: 6, dur: 7, delay: 17, dir: 'right' },
  ];

  return (
    <div className="highway-scene" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Sky gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #e0e7ff 0%, #e0f2fe 30%, #f0f9ff 60%, var(--color-bg) 100%)',
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
              background: `hsl(${230 + (i % 5) * 8}, 45%, ${35 + (i % 3) * 5}%)`,
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
              ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06))'
              : 'linear-gradient(270deg, transparent, rgba(0,0,0,0.06))',
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

// ── Scroll-animated section wrapper
function RevealSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const TEAM_VALUES = [
  { icon: '🎯', title: 'Mission First', desc: 'Every feature we ship must reduce fuel anxiety for at least one category of Mumbai driver.' },
  { icon: '🔬', title: 'Data Integrity', desc: 'We never show stale data without a disclaimer. Trust is earned, not assumed.' },
  { icon: '🤝', title: 'Community Built', desc: 'Our best data comes from drivers who report in real time. We amplify that signal.' },
  { icon: '⚡', title: 'Speed Obsessed', desc: 'A 3-second map load costs a driver 30 seconds of anxiety. We optimise ruthlessly.' },
];

const TIMELINE = [
  { year: '2024 Q1', label: 'Problem Identified', desc: '3 founders stranded on the Mumbai-Pune expressway. PetrolPulze is conceived.' },
  { year: '2024 Q2', label: 'MVP Launched', desc: 'Basic station finder with 20 manually verified Mumbai locations goes live.' },
  { year: '2024 Q3', label: 'Mapbox Migration', desc: 'Rebuilt on Mapbox GL JS. Directions, isochrones, and real-time routing added.' },
  { year: '2024 Q4', label: 'PetrolPulze X', desc: 'Full intelligence stack — smart ranking, heatmaps, EV tracking, community reports.' },
  { year: '2025', label: 'City Expansion', desc: 'Pune, Thane, Nashik and the full Western Highway corridor coming next.' },
];

function PowerCore({ hovered, setHovered }) {
  const coreRef = useRef(null);

  return (
    <div
      ref={coreRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', width: 280, height: 280, margin: '0 auto',
        perspective: '1000px',
      }}
    >
      {/* Outer ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '3px solid rgba(79,70,229,0.3)',
        animation: 'spin 20s linear infinite',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.5s ease',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {[...Array(12)].map((_, i) => (
            <line
              key={i} x1="140" y1="0" x2="140" y2="30"
              transform={`rotate(${i * 30} 140 140)`}
              stroke="rgba(79,70,229,0.4)" strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Middle ring */}
      <div style={{
        position: 'absolute', inset: 40, borderRadius: '50%',
        border: '2px solid rgba(124,58,237,0.4)',
        animation: 'spin 12s linear infinite reverse',
        boxShadow: hovered ? '0 0 60px rgba(79,70,229,0.5)' : '0 0 30px rgba(79,70,229,0.2)',
        transition: 'box-shadow 0.5s ease',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          {[...Array(8)].map((_, i) => (
            <circle
              key={i} cx="100" cy="100" r="80"
              fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1"
              strokeDasharray="4 8"
              transform={`rotate(${i * 45} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Inner glow */}
      <div style={{
        position: 'absolute', inset: 70, borderRadius: '50%',
        background: hovered
          ? 'radial-gradient(circle, rgba(79,70,229,0.4) 0%, rgba(124,58,237,0.2) 50%, transparent 70%)'
          : 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)',
        animation: hovered ? 'pulse 1s ease-in-out infinite' : 'pulse 3s ease-in-out infinite',
        transition: 'background 0.5s ease',
      }} />

      {/* Core */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        boxShadow: hovered
          ? '0 0 80px rgba(79,70,229,0.8), inset 0 0 30px rgba(255,255,255,0.3)'
          : '0 0 40px rgba(79,70,229,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 0.5s ease',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
          animation: hovered ? 'pulse 0.5s ease-in-out infinite' : 'pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* Energy particles */}
      {hovered && [...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          background: i % 2 === 0 ? '#4f46e5' : '#7c3aed',
          animation: `particle${i} 1.5s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
          boxShadow: '0 0 10px currentColor',
        }} />
      ))}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes particle0 { 0% { transform: translate(-50%, -50%) translateY(-100px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translateY(-100px) scale(1); opacity: 0; } }
        @keyframes particle1 { 0% { transform: translate(-50%, -50%) translateX(100px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translateX(100px) scale(1); opacity: 0; } }
        @keyframes particle2 { 0% { transform: translate(-50%, -50%) translateY(100px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translateY(100px) scale(1); opacity: 0; } }
        @keyframes particle3 { 0% { transform: translate(-50%, -50%) translateX(-100px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translateX(-100px) scale(1); opacity: 0; } }
        @keyframes particle4 { 0% { transform: translate(-50%, -50%) translate(70px, -70px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translate(70px, -70px) scale(1); opacity: 0; } }
        @keyframes particle5 { 0% { transform: translate(-50%, -50%) translate(-70px, 70px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) translate(-70px, 70px) scale(1); opacity: 0; } }
      `}</style>
    </div>
  );
}

function DataNode({ icon, label, desc, x, y, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)',
      opacity: visible ? 1 : 0, transition: `opacity 0.6s ease ${delay}s`,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 32px rgba(79,70,229,0.15)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.15)'; }}
      >
        <span style={{ fontSize: 28, marginBottom: 4 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5' }}>{label}</span>
      </div>
      {visible && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 8, padding: '8px 12px', background: '#0f172a', color: '#fff',
          borderRadius: 'var(--radius-md)', fontSize: 11, whiteSpace: 'nowrap',
          animation: 'fadeIn 0.3s ease',
        }}>
          {desc}
        </div>
      )}
    </div>
  );
}

function DhurandharSection() {
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    const section = sectionRef.current;
    if (section) { section.addEventListener('mousemove', handleMouseMove); }
    return () => { if (section) section.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  const nodes = [
    { icon: '🤖', label: 'AI Engine', desc: 'Smart price prediction', x: 15, y: 25, delay: 0 },
    { icon: '🗺️', label: 'Live Maps', desc: 'Real-time routing', x: 80, y: 20, delay: 0.1 },
    { icon: '👥', label: 'Community', desc: 'Live queue reports', x: 10, y: 70, delay: 0.2 },
    { icon: '📊', label: 'Heatmaps', desc: 'Demand patterns', x: 85, y: 75, delay: 0.3 },
    { icon: '⚡', label: 'EV Ready', desc: 'Charging stations', x: 50, y: 12, delay: 0.15 },
  ];

  return (
    <section ref={sectionRef} style={{
      padding: '160px 24px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(79,70,229,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(79,70,229,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        transform: `perspective(500px) rotateX(60deg) translateY(${mousePos.y}px) translateX(${mousePos.x}px)`,
        transformOrigin: 'center top',
      }} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
          borderRadius: '50%', background: 'rgba(79,70,229,0.3)',
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-30px); opacity: 0.8; } }
      `}</style>

      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)',
          borderRadius: '999px', padding: '8px 20px', marginBottom: 32,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Introducing Dhurandhar</span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20,
          textShadow: '0 0 60px rgba(79,70,229,0.5)',
        }}>
          The Mumbai<br />
          <span style={{
            background: 'linear-gradient(135deg, #4f46e5, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Fuel Engine</span>
        </h2>

        <p style={{
          fontSize: 16, color: '#94a3b8', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Powered by real-time data, community intelligence, and AI predictions —
          Dhurandhar is our high-performance core that keeps Mumbai moving.
        </p>

        {/* Power Core */}
        <div style={{ position: 'relative', height: 320, marginBottom: 48 }}>
          <PowerCore hovered={hovered} setHovered={setHovered} />

          {/* Data Nodes orbiting */}
          {nodes.map(node => (
            <DataNode key={node.label} {...node} />
          ))}

          {/* Connecting lines */}
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {nodes.map((node, i) => (
              <line
                key={i}
                x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`}
                stroke="rgba(79,70,229,0.15)" strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </svg>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { n: '60+', l: 'Fuel Stations' },
            { n: '50K+', l: 'Active Drivers' },
            { n: '99.9%', l: 'Uptime' },
            { n: '< 2s', l: 'Response Time' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#4f46e5' }}>{s.n}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-bg)', overflowX: 'hidden' }}>

      {/* ─── 3D HERO ─── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '80px 24px',
      }}>
        <HighwayScene />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
          background: 'linear-gradient(transparent, var(--color-bg))',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 800 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)',
            borderRadius: '999px', padding: '6px 16px', marginBottom: 32,
            animation: 'fadeIn 0.8s ease',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Our Story</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 8vw, 88px)',
            fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
            animation: 'fadeIn 0.8s ease 0.1s both',
          }}>
            Empowering the<br />
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Next Transition</span>
          </h1>

          <p style={{
            fontSize: 18, color: '#64748b', maxWidth: 580, margin: '24px auto 48px',
            lineHeight: 1.7, animation: 'fadeIn 0.8s ease 0.2s both',
          }}>
            We're building India's most intelligent fuel network — connecting real-time
            availability, routing intelligence, battery health, and station databases to help
            every driver find their next fill without anxiety.
          </p>

          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', animation: 'fadeIn 0.8s ease 0.3s both' }}>
            {[['50,000+', 'App Users'], ['100%', 'Data Verified']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#4f46e5' }}>{v}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Mission</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
                  Zero Fuel Anxiety<br />on Every Road
                </h2>
                <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.8, marginBottom: 20 }}>
                  India has 6.3 million kilometres of road. Millions of drivers face daily
                  uncertainty about where their next fuel stop will be, whether it'll be open,
                  and whether the price is fair.
                </p>
                <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.8 }}>
                  PetrolPulze X combines live station data, community intelligence, and
                  Mapbox routing to give every driver the confidence of knowing exactly
                  where they're going — and that fuel will be there when they arrive.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { n: '60+', l: 'Mumbai stations' },
                  { n: '4', l: 'Fuel types tracked' },
                  { n: '< 2s', l: 'Nearest station find' },
                  { n: '24/7', l: 'Live data updates' },
                ].map(({ n, l }) => (
                  <div key={l} style={{
                    background: '#ffffff', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', padding: '28px 24px', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#4f46e5', marginBottom: 8 }}>{n}</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── ROUTING INTELLIGENCE ─── */}
      <section style={{ padding: '120px 24px', background: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Routing Intelligence</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
                How the Engine Works
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                Our Smart Nearest Ranking Engine scores every station across five dimensions
                in under 100ms, using Mapbox directions and real-time station data.
              </p>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, position: 'relative' }}>
            {[
              { icon: '🟢', label: 'Open Status', weight: '40%', desc: 'Is the station currently open or 24/7?' },
              { icon: '⛽', label: 'Availability', weight: '25%', desc: 'Best fuel stock percentage across fuel types' },
              { icon: '⏱️', label: 'Drive ETA', weight: '20%', desc: 'Mapbox directions real-time travel time' },
              { icon: '📏', label: 'Distance', weight: '10%', desc: 'Haversine straight-line distance as fallback' },
              { icon: '⭐', label: 'Rating', weight: '5%', desc: 'Community-verified quality score' },
            ].map((item, i) => (
              <RevealSection key={item.label} delay={i * 0.08}>
                <div style={{
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '24px 18px', textAlign: 'center',
                  height: '100%',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#4f46e5', marginBottom: 6 }}>{item.weight}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DATA TRUST ─── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <div>
                {/* Trust score visual */}
                <div style={{
                  background: '#ffffff', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', padding: 32,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Station Trust Score
                  </div>
                  {[
                    { label: 'Verified by team', pts: 30, achieved: true },
                    { label: 'Updated < 6 hours ago', pts: 30, achieved: true },
                    { label: '50+ community reviews', pts: 20, achieved: true },
                    { label: 'Phone number on file', pts: 10, achieved: true },
                    { label: 'Photo verified', pts: 10, achieved: false },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: row.achieved ? 'rgba(79,70,229,0.15)' : '#f8fafc',
                        border: `1px solid ${row.achieved ? 'rgba(79,70,229,0.3)' : 'rgba(0,0,0,0.08)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 12,
                      }}>
                        {row.achieved ? '✓' : '·'}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, color: row.achieved ? '#0f172a' : '#94a3b8' }}>{row.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: row.achieved ? '#4f46e5' : '#94a3b8' }}>+{row.pts}</div>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 20, padding: '14px 18px',
                    background: 'rgba(79,70,229,0.08)', borderRadius: 'var(--radius-md)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>Total Trust Score</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>90 / 100</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Data Trust</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>
                  Trust Score:<br />Transparency First
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.8, marginBottom: 20 }}>
                  Every station gets a Trust Score from 0–100. It factors in team verification,
                  data freshness, review count, and contact completeness.
                </p>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.8 }}>
                  We never hide stale data — we surface it honestly with a freshness indicator
                  so you always know how recent the information is before you drive 6 km.
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── COMMUNITY ─── */}
      <section style={{ padding: '120px 24px', background: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Community</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Built by Drivers,<br />for Drivers
              </h2>
            </div>
          </RevealSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {TEAM_VALUES.map((v, i) => (
              <RevealSection key={v.title} delay={i * 0.1}>
                <div style={{
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', padding: 28,
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DHURANDHAR POWER CORE ─── */}
      <DhurandharSection />

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: '120px 24px', textAlign: 'center',
        background: '#ffffff', borderTop: '1px solid var(--color-border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 800, height: 400,
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <RevealSection>
          <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Ready to Drive<br />
              <span style={{ color: '#4f46e5' }}>Smarter?</span>
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', marginBottom: 44, lineHeight: 1.7 }}>
              Join the thousands of Mumbai drivers who never stress about fuel.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/map" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700 }}>
                Open Live Map →
              </Link>
              <Link to="/auth?tab=register" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 15 }}>
                Create Account
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
