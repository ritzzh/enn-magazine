import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  mode: 'login' | 'register';
  onModeChange: (m: 'login' | 'register') => void;
  onClose: () => void;
  onSuccess: () => void;
}

const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;
const inputCss: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem',
  background: 'rgba(255,255,255,.05)', border: '1px solid var(--rule)',
  color: 'var(--white)', fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.9375rem',
};

export default function AuthModal({ mode, onModeChange, onClose, onSuccess }: Props) {
  const { login, register } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(name, email, password, phone || undefined);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,10,26,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '1rem' }}
      onClick={onClose}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div style={{ background: 'var(--navy2)', border: '1px solid var(--rule)', width: '100%', maxWidth: 440, padding: '2rem', position: 'relative', animation: 'fadeUp .22s ease' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--dim2)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '.25rem' }}>✕</button>

        <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.875rem' }}>
          <span>✦</span> ENN Magazine
        </div>

        <h2 style={{ ...SERIF, fontSize: '1.625rem', fontWeight: 900, color: 'var(--white)', marginBottom: '.25rem' }}>
          {mode === 'login' ? 'Welcome Back' : 'Join ENN'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--dim)', marginBottom: '1.75rem' }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={inputCss} />
            </div>
          )}
          <div>
            <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputCss} />
          </div>
          {mode === 'register' && (
            <div>
              <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Phone (optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputCss} />
            </div>
          )}
          <div>
            <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputCss} />
          </div>

          {error && (
            <div style={{ background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)', padding: '.65rem 1rem', fontSize: '0.875rem', color: 'var(--orange)', borderRadius: 2 }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', padding: '.8rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)', marginTop: '.25rem', transition: 'background .2s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-lt)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(200,146,42,.5)' : 'var(--gold)'; }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule2)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--dim)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline', padding: 0 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
