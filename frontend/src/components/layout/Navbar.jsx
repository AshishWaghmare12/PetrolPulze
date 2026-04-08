import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="9" fill="#4f46e5"/>
    <path d="M16 6L22 13L16 20L10 13Z" fill="white" opacity="0.95"/>
    <path d="M16 20V27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="16" cy="27" r="2" fill="white"/>
    <path d="M21 18L24 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M21 18V22H24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/map', label: 'Map' },
    { to: '/find-fuel', label: 'Find Fuel' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 24 }}>
          <Logo />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 17,
            color: '#0f172a', letterSpacing: '-0.02em',
          }}>
            PetrolPulze
          </span>
        </Link>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
              color: isActive(to) ? '#4f46e5' : '#64748b',
              background: isActive(to) ? 'var(--color-primary-light)' : 'transparent',
              transition: 'var(--transition)',
              position: 'relative',
            }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
            >{label}</Link>
          ))}
        </div>

        {/* Search bar (matches Map Intelligence screenshot) */}
        <div style={{
          flex: 1, maxWidth: 380, margin: '0 16px',
          display: 'none',
          alignItems: 'center', gap: 8,
          background: '#f1f5f9', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)', padding: '7px 14px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Search highway, city or station...</span>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Notification bell */}
              <button style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#f1f5f9', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              </button>
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff',
                cursor: 'pointer',
              }}
                onClick={() => { logout(); navigate('/'); }}
                title="Logout"
              >{user.name[0].toUpperCase()}</div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.name.split(' ')[0]}</div>
                {user.role === 'admin' && <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PRO MEMBER</div>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/auth" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Login</Link>
              <Link to="/auth?tab=register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
