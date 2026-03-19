import { Link } from 'react-router-dom';

const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;

const NAV_LINKS = [
  { label: 'Magazine Archive', to: '/' },
  { label: 'Latest Issue',     to: '/' },
  { label: 'News & Insights',  to: '/news' },
  { label: 'About ENN',        to: '/about' },
  { label: 'Contact',          to: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use',   to: '/terms' },
  { label: 'Cookie Policy',  to: '/cookies' },
];

const linkStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  color: 'var(--dim)',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '.5rem',
  transition: 'color .2s',
};

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2rem; }
        @media (min-width: 640px)  { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px)  { .footer-grid { grid-template-columns: 1.4fr 1fr 1fr; } }
        .footer-inner { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem 1.5rem; }
        @media (min-width: 640px)  { .footer-inner { padding: 3rem 2rem 1.5rem; } }
        @media (min-width: 1024px) { .footer-inner { padding: 3rem 3rem 1.5rem; } }
        .footer-link:hover { color: var(--gold-lt) !important; }
      `}</style>

      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--rule)', background: 'var(--navy2)' }}>
        <div className="footer-inner">
          <div className="footer-grid">

            <div>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <div style={{ ...SERIF, fontSize: '1.5rem', fontWeight: 900, color: 'var(--white)', marginBottom: '.3rem' }}>
                  <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>E</em>NN
                </div>
              </Link>
              <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.875rem' }}>
                Entrepreneur News Network
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--dim)', lineHeight: 1.7, maxWidth: 300 }}>
                India's premier monthly magazine for entrepreneurs, founders, and business leaders. Stories that inspire and strategies that deliver.
              </p>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '.75rem' }}>
                {['X', 'in', 'f'].map(icon => (
                  <div key={icon} style={{ width: 34, height: 34, border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--dim2)'; }}
                  >{icon}</div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.875rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ color: 'var(--orange)' }}>*</span> Navigation
              </div>
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to} className="footer-link" style={linkStyle}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.875rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ color: 'var(--orange)' }}>*</span> Legal
              </div>
              {LEGAL_LINKS.map(link => (
                <Link key={link.label} to={link.to} className="footer-link" style={linkStyle}>
                  {link.label}
                </Link>
              ))}
              <div style={{ marginTop: '1.5rem', ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.5rem' }}>
                Contact
              </div>
              <a href="mailto:hello@enn.in" className="footer-link" style={{ ...linkStyle, fontSize: '0.875rem' }}>hello@enn.in</a>
              <a href="mailto:editorial@enn.in" className="footer-link" style={{ ...linkStyle, fontSize: '0.875rem' }}>editorial@enn.in</a>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--rule2)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
            <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim2)' }}>
              (c) {new Date().getFullYear()} Entrepreneur News Network - All Rights Reserved
            </div>
            <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <span style={{ color: 'var(--orange)' }}>*</span> For Founders - By Founders
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
