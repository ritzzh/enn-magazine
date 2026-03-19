import { useState } from 'react';
import { magazineAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Props {
  magazine: any;
  isLoggedIn: boolean;
  onClose: () => void;
  onDone: () => void;
}

const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;
const inputCss: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem',
  background: 'rgba(255,255,255,.05)', border: '1px solid var(--rule)',
  color: 'var(--white)', fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.9375rem',
};

export default function DownloadModal({ magazine, isLoggedIn, onClose, onDone }: Props) {
  const { user } = useAuth();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = isLoggedIn ? {} : { name, email, phone: phone || undefined };
      const r = await magazineAPI.download(magazine.id, payload);
      triggerDownload(r.data.downloadUrl, r.data.fileName);
      setDone(true);
      setTimeout(onDone, 2200);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,10,26,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '1rem' }}
      onClick={onClose}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div style={{ background: 'var(--navy2)', border: '1px solid var(--rule)', width: '100%', maxWidth: 460, padding: '2rem', position: 'relative', animation: 'fadeUp .22s ease' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--dim2)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '.25rem' }}>✕</button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ ...SERIF, fontSize: '1.375rem', fontWeight: 900, color: 'var(--white)', marginBottom: '.5rem' }}>Download Started!</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--dim)' }}>Your magazine is downloading. Enjoy reading!</p>
          </div>
        ) : (
          <>
            <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.875rem' }}>
              <span>✦</span> Download Magazine
            </div>
            <h2 style={{ ...SERIF, fontSize: '1.375rem', fontWeight: 900, color: 'var(--white)', marginBottom: '.25rem' }}>{magazine?.title || 'ENN Magazine'}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--dim)', marginBottom: '1.5rem' }}>{magazine?.month} {magazine?.year} Edition</p>

            {isLoggedIn ? (
              <div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--dim)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                  Signed in as <strong style={{ color: 'var(--gold)' }}>{user?.name}</strong>. Your download will be recorded automatically.
                </p>
                <form onSubmit={handleDownload}>
                  {error && <div style={{ background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)', padding: '.65rem 1rem', fontSize: '0.875rem', color: 'var(--orange)', marginBottom: '1rem', borderRadius: 2 }}>{error}</div>}
                  <button type="submit" disabled={loading} style={{ width: '100%', ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', padding: '.8rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
                    {loading ? 'Preparing...' : '↓ Download Now'}
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--dim)', lineHeight: 1.65 }}>Provide your details to download this issue for free.</p>

                <div>
                  <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Full Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={inputCss} />
                </div>
                <div>
                  <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputCss} />
                </div>
                <div>
                  <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'block', marginBottom: '.375rem' }}>Phone (optional)</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputCss} />
                </div>

                {error && <div style={{ background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)', padding: '.65rem 1rem', fontSize: '0.875rem', color: 'var(--orange)', borderRadius: 2 }}>{error}</div>}

                <button type="submit" disabled={loading} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', padding: '.8rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)', marginTop: '.25rem' }}>
                  {loading ? 'Preparing...' : '↓ Get Free Download'}
                </button>

                <p style={{ fontSize: '0.8125rem', color: 'var(--dim2)', textAlign: 'center', lineHeight: 1.5 }}>No spam — occasional updates from ENN only.</p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
