import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import AdminPanel from '../components/AdminPanel';

const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Fraunces',serif" };

const SUBJECTS = [
  'General Enquiry',
  'Magazine Subscription',
  'Editorial Submission',
  'Advertising & Partnerships',
  'Press & Media',
  'Technical Support',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAdmin, setShowAdmin] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await contactAPI.submit(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <TopBar />
      <Navbar
        onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }}
        onAdminClick={() => setShowAdmin(true)}
      />

      {/* Hero banner */}
      <section style={{
        borderBottom: '1px solid var(--rule)',
        padding: 'clamp(3rem,8vw,6rem) 1.5rem clamp(2.5rem,6vw,4rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 0%,rgba(200,146,42,.07),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          <span>✦</span> Get In Touch <span>✦</span>
        </div>
        <h1 style={{ ...SERIF, fontWeight: 900, color: 'var(--white)', margin: '0 auto .75rem', maxWidth: 560, lineHeight: 1.1 }}>
          Contact <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>ENN</em>
        </h1>
        <p style={{ color: 'var(--dim)', maxWidth: 480, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
          Questions, partnerships, editorial pitches — we read every message.
        </p>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) 1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '3rem' }}>
        <style>{`
          @media(min-width:800px){ .contact-grid{ grid-template-columns: 1fr 420px !important; } }
          .contact-input:focus{ outline:none; border-color:var(--gold)!important; background:rgba(255,255,255,.08)!important; box-shadow:0 0 0 2px rgba(200,146,42,.12); }
        `}</style>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>

          {/* Form */}
          <div>
            {success ? (
              <div style={{ border: '1px solid rgba(74,222,128,.25)', background: 'rgba(74,222,128,.05)', padding: '2.5rem', textAlign: 'center', animation: 'fadeUp .4s ease' }}>
                <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✦</div>
                <div style={{ ...SERIF, fontSize: '1.5rem', fontWeight: 900, color: 'var(--white)', marginBottom: '.5rem' }}>Message Received</div>
                <p style={{ color: 'var(--dim)', marginBottom: '1.5rem' }}>
                  Thank you for reaching out. We'll get back to you within 2–3 business days.
                </p>
                <button onClick={() => setSuccess(false)} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.625rem 1.5rem', cursor: 'pointer' }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--rule2)' }}>
                  <span style={{ color: 'var(--orange)' }}>✦</span> Your Details
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Full Name *">
                    <input className="contact-input" required value={form.name} onChange={update('name')} placeholder="Ravi Sharma" style={inputStyle} />
                  </Field>
                  <Field label="Email Address *">
                    <input className="contact-input" required type="email" value={form.email} onChange={update('email')} placeholder="ravi@example.com" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Phone (optional)">
                    <input className="contact-input" value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" style={inputStyle} />
                  </Field>
                  <Field label="Subject *">
                    <select className="contact-input" required value={form.subject} onChange={update('subject')} style={inputStyle}>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Message *">
                  <textarea className="contact-input" required value={form.message} onChange={update('message')} placeholder="Tell us what's on your mind..." rows={6} style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }} />
                </Field>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', padding: '.875rem 1rem', ...MONO, fontSize: '0.75rem', letterSpacing: '.06em' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ ...MONO, fontSize: '0.8125rem', letterSpacing: '.16em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '.875rem 2rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, transition: 'background .2s', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', alignSelf: 'flex-start' }}>
                  {loading ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { icon: '✉', label: 'Editorial', value: 'editorial@enn.in', note: 'Story pitches & submissions' },
              { icon: '◈', label: 'Partnerships', value: 'partners@enn.in', note: 'Advertising & brand deals' },
              { icon: '✦', label: 'General', value: 'hello@enn.in', note: 'Everything else' },
            ].map(item => (
              <div key={item.label} style={{ border: '1px solid var(--rule)', padding: '1.25rem 1.5rem', background: 'rgba(200,146,42,.03)', transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
              >
                <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.5rem' }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ color: 'var(--gold-lt)', fontSize: '0.9375rem', marginBottom: '.25rem' }}>{item.value}</div>
                <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)' }}>{item.note}</div>
              </div>
            ))}

            <div style={{ border: '1px solid var(--rule2)', padding: '1.25rem 1.5rem', marginTop: '.5rem' }}>
              <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.75rem' }}>✦ Response Times</div>
              {[
                ['General enquiries', '2–3 business days'],
                ['Editorial pitches', '5–7 business days'],
                ['Partnerships', '1–2 business days'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.375rem 0', borderBottom: '1px solid var(--rule2)', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--dim)' }}>{k}</span>
                  <span style={{ ...MONO, fontSize: '0.75rem', color: 'var(--gold)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {showAuth && (
        <AuthModal mode={authMode} onModeChange={setAuthMode} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={() => {}} />
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid var(--rule)',
  color: 'var(--white)',
  padding: '.625rem .875rem',
  fontSize: '0.9375rem',
  fontFamily: "'Space Grotesk',sans-serif",
  borderRadius: 2,
  width: '100%',
  transition: 'all .2s',
};
