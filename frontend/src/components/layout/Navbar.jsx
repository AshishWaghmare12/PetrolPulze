import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="9" fill="#4f46e5"/>
    <path d="M16 6L22 13L16 20L10 13Z" fill="white" opacity="0.95"/>
    <path d="M16 20V27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="16" cy="27" r="2" fill="white"/>
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 24 }}>
          <Logo />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 18,
            color: 'var(--color-text)', letterSpacing: '-0.02em',
          }}>
            PetrolPulze
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[{ to: '/map', label: 'Map' }, { to: '/find-fuel', label: 'Find Fuel' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
              color: isActive(to) ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
              background: isActive(to) ? 'var(--color-primary-light)' : 'transparent',
              transition: 'var(--transition)',
            }}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
