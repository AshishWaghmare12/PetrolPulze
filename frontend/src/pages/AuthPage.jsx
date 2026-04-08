import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { authApi } from '../services/api';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setToken, user } = useAppStore();

  useEffect(() => { if (user) navigate('/map'); }, [user]);
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await (tab === 'login' ? authApi.login : authApi.register)(form);
      setToken(res.token); setUser(res.user); navigate('/map');
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>

      {/* Left — dark hero panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '80px 60px', background: '#0f172a',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}/>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(rgba(79,70,229,0.08), transparent 70%)', pointerEvents: 'none' }}/>

        {/* Status pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)', borderRadius: '999px', padding: '6px 14px', marginBottom: 40, alignSelf: 'flex-start' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"><rect x="2" y="3" width="7" height="20" rx="1"/><rect x="9" y="8" width="7" height="15" rx="1"/><rect x="16" y="6" width="7" height="17" rx="1"/></svg>
          <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700 }}>STATUS</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Diesel available</span>
        </div>

        {/* PetrolPulze wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="#4f46e5"/><path d="M16 6L22 13L16 20L10 13Z" fill="white"/><path d="M16 20V27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="16" cy="27" r="2" fill="white"/></svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff' }}>PetrolPulze</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,4vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20 }}>
          Smarter<br/>
          Highway <span style={{ color: '#4f46e5' }}>Travel</span><br/>
          Starts Here
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
          Access real-time fuel availability and find nearby stations on India's highways. Never run dry on your journey again.
        </p>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ display: 'flex' }}>
            {['#4f46e5','#f59e0b','#7c3aed'].map((c, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #0f172a', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{String.fromCharCode(65+i)}</div>
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Joined by <strong style={{ color: '#fff' }}>10k+</strong> travelers today</span>
        </div>

        {/* Distance pill */}
        <div style={{ position: 'absolute', bottom: 40, right: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧭</div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Distance</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>2.4 km away</div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 60px', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 32, boxShadow: 'var(--shadow-xs)' }}>
            {[['login','Login'],['register','Sign Up']].map(([t,l]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14,
                background: tab === t ? 'var(--color-navy)' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                transition: 'var(--transition)',
              }}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit}>
            {tab === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <input name="name" value={form.name} onChange={handle} className="input" placeholder="Alex Morgan" required style={{ background: '#fff' }}/>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="name@company.com" required style={{ paddingLeft: 34, background: '#fff' }}/>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="••••••••" required minLength={6} style={{ paddingLeft: 34, background: '#fff' }}/>
              </div>
            </div>

            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 14, height: 14 }}/> Remember me
                </label>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>Forgot Password?</button>
              </div>
            )}
            {tab === 'register' && <div style={{ height: 20 }}/>}

            {error && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn btn-navy" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 'var(--radius-lg)' }}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Login to Map →' : 'Create Account →'}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}/>
          </div>

          <button style={{ width: '100%', padding: '11px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-xs)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>
                {tab === 'login' ? 'Create an account' : 'Login'}
              </button>
            </span>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center' }}>
            {['🔒 SSL Secure', '🔐 Encrypted', '📡 24/7 Support'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#94a3b8' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
