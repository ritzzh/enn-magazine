import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
  onAdminClick?: () => void;
}

const MONO: React.CSSProperties  = { fontFamily: "'Space Mono',monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Fraunces',serif" };

const NAV_ITEMS = [
  { label: 'Magazine', to: '/' },
  { label: 'News',     to: '/news' },
  { label: 'Contact',  to: '/contact' },
];

export default function Navbar({ onAuthClick, onAdminClick }: NavbarProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-subtitle { display: none !important; }
          .nav-divider  { display: none !important; }
          .nav-desktop  { display: none !important; }
        }
        @media (min-width: 641px) { .nav-mobile-menu { display: none !important; } }
        @media (max-width: 480px) { .nav-brand-text { font-size: 14px !important; } }
        .nav-link { text-decoration: none; transition: color .2s; }
        .nav-link:hover { color: var(--gold-lt) !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,10,26,0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--rule)',
        padding: '0 1.25rem',
        minHeight: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div>
              <div className="nav-brand-text" style={{ ...SERIF, fontSize: 18, fontWeight: 900, lineHeight: 1, color: 'var(--white)', letterSpacing: '-.01em' }}>
                <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>E</em>ntrepreneur News Network
              </div>
              <div className="nav-subtitle" style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 3 }}>
                For Founders · By Founders
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-divider" style={{ width: 1, height: 28, background: 'var(--rule)', margin: '0 .25rem' }} />
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '.125rem' }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.label} to={item.to} className="nav-link"
                style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.15em', textTransform: 'uppercase', color: isActive(item.to) ? 'var(--gold)' : 'var(--dim2)', padding: '.375rem .75rem', position: 'relative' }}>
                {item.label}
                {isActive(item.to) && (
                  <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, background: 'var(--orange)' }} />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          {isLoggedIn && user ? (
            <>
              <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)', display: 'none' }}
                className="nav-welcome">
                <span style={{ color: 'var(--gold-lt)' }}>{user.name.split(' ')[0]}</span>
              </div>
              <style>{`@media(min-width:640px){.nav-welcome{display:block!important}}`}</style>

              {user.role === 'admin' && (
                <button onClick={onAdminClick} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'rgba(232,98,26,.15)', color: 'var(--orange)', border: '1px solid rgba(232,98,26,.3)', padding: '.45rem 1rem', cursor: 'pointer', fontWeight: 700, transition: 'background .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,98,26,.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,98,26,.15)'; }}
                >Admin</button>
              )}

              <button onClick={logout} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--dim)', border: '1px solid var(--rule)', padding: '.45rem 1rem', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.borderColor = 'var(--rule)'; }}
              >Logout</button>
            </>
          ) : (
            <button onClick={onAuthClick} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', padding: '.45rem 1.1rem', border: 'none', cursor: 'pointer', fontWeight: 700, transition: 'background .2s', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-lt)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; }}
            >Login / Sign Up</button>
          )}

          {/* Mobile hamburger */}
          <button className="nav-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '.25rem', marginLeft: '.25rem' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 20, height: 1.5, background: 'var(--dim)', display: 'block', transition: 'all .2s' }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="nav-mobile-menu" style={{ background: 'rgba(5,10,26,.97)', borderBottom: '1px solid var(--rule)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}
              style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: isActive(item.to) ? 'var(--gold)' : 'var(--dim)', textDecoration: 'none', padding: '.5rem 0', borderBottom: '1px solid var(--rule2)' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
