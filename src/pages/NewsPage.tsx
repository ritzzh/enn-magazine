import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsAPI } from '../lib/api';
import { getFileUrl } from '../lib/api';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import AdminPanel from '../components/AdminPanel';

const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Fraunces',serif" };

const GENRE_FILTERS = [
  { id: 'all',       label: 'All Stories',     icon: '◈' },
  { id: 'strategy',  label: 'Strategy',        icon: '▲' },
  { id: 'founder',   label: 'Founder',         icon: '✦' },
  { id: 'funding',   label: 'Funding',         icon: '◆' },
  { id: 'tech',      label: 'Tech & AI',       icon: '⬡' },
  { id: 'policy',    label: 'Policy',          icon: '⬛' },
  { id: 'community', label: 'Community',       icon: '◉' },
  { id: 'global',    label: 'Global Markets',  icon: '○' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').substring(0, 160);
}

export default function NewsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeGenre, search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (activeGenre !== 'all') params.tag = activeGenre;
      if (search) params.search = search;
      const r = await newsAPI.getAll(params);
      setPosts(r.data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const featured = posts.find(p => p.is_featured) || posts[0];
  const rest = posts.filter(p => p.id !== featured?.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .news-card{ animation: fadeUp .3s ease both; }
        .news-card:hover .news-title{ color: var(--gold-lt) !important; }
        .news-card:hover .news-thumb{ transform: scale(1.04); }
        .genre-btn:hover{ border-color: var(--gold) !important; color: var(--gold-lt) !important; }
        .news-tag{ transition: background .15s, color .15s; }
        .news-tag:hover{ background: rgba(200,146,42,.22) !important; color: var(--gold-lt) !important; }
        @media(min-width:900px){ .news-hero-grid{ grid-template-columns: 1.4fr 1fr !important; } }
        @media(min-width:700px){ .news-list-grid{ grid-template-columns: repeat(2,1fr) !important; } }
        @media(min-width:1050px){ .news-list-grid{ grid-template-columns: repeat(3,1fr) !important; } }
      `}</style>

      <TopBar />
      <Navbar
        onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }}
        onAdminClick={() => setShowAdmin(true)}
      />

      {/* Page header */}
      <section style={{ borderBottom: '1px solid var(--rule)', padding: 'clamp(2.5rem,6vw,4.5rem) 1.5rem clamp(2rem,4vw,3rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%,rgba(200,146,42,.07),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'pulse 1.4s ease infinite' }} />
            Live · ENN Newsroom
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ ...SERIF, fontWeight: 900, color: 'var(--white)', lineHeight: 1.05, marginBottom: '.5rem' }}>
                News & <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Insights</em>
              </h1>
              <p style={{ color: 'var(--dim)', fontSize: '1rem', maxWidth: 480 }}>
                Dispatches from the frontlines of Indian entrepreneurship.
              </p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search stories…"
                style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.08em', background: 'rgba(255,255,255,.05)', border: '1px solid var(--rule)', color: 'var(--white)', padding: '.5rem 1rem', borderRadius: 2, width: 200 }}
              />
              <button type="submit" style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.5rem .875rem', cursor: 'pointer', borderRadius: 2 }}>→</button>
            </form>
          </div>
        </div>
      </section>

      {/* Genre filter bar */}
      <div style={{ borderBottom: '1px solid var(--rule2)', background: 'rgba(0,0,0,.2)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '.25rem' }}>
          {GENRE_FILTERS.map(g => {
            const active = activeGenre === g.id;
            return (
              <button key={g.id} className="genre-btn"
                onClick={() => setActiveGenre(g.id)}
                style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent', color: active ? 'var(--gold-lt)' : 'var(--dim2)', padding: '.875rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '.4rem' }}
              >
                <span style={{ color: active ? 'var(--orange)' : 'inherit' }}>{g.icon}</span>
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(2rem,4vw,3.5rem) 1.5rem clamp(3rem,6vw,5rem)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 280, background: 'rgba(200,146,42,.04)', border: '1px solid var(--rule2)', animation: 'pulse 1.6s ease infinite' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--dim)' }}>
            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--dim2)' }}>No stories found</div>
            <button onClick={() => { setActiveGenre('all'); setSearch(''); setSearchInput(''); }} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.5rem 1.25rem', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        ) : (
          <>
            {/* Featured post hero */}
            {featured && (
              <div className="news-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '3rem', cursor: 'pointer' }}
                onClick={() => navigate(`/news/${featured.slug}`)}>
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--navy3)', borderBottom: '2px solid var(--gold)' }}>
                  {featured.cover_image ? (
                    <img src={getFileUrl(`covers/${featured.cover_image}`)} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease', display: 'block' }} className="news-thumb" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--navy3),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--rule)' }}>✦</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(5,10,26,.92) 0%,rgba(5,10,26,.3) 50%,transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                      {(featured.tags || []).slice(0, 3).map((t: string) => (
                        <span key={t} className="news-tag" style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(200,146,42,.18)', color: 'var(--gold)', padding: '.2rem .6rem', border: '1px solid rgba(200,146,42,.3)' }}>{t}</span>
                      ))}
                      <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--orange)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.2rem .6rem', border: '1px solid rgba(232,98,26,.3)', background: 'rgba(232,98,26,.1)' }}>Featured</span>
                    </div>
                    <h2 className="news-title" style={{ ...SERIF, fontWeight: 900, color: 'var(--white)', lineHeight: 1.15, marginBottom: '.5rem', transition: 'color .2s', fontSize: 'clamp(1.25rem,3vw,2rem)' }}>
                      {featured.title}
                    </h2>
                    <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', letterSpacing: '.1em' }}>
                      {featured.author_name} · {timeAgo(featured.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of remaining posts */}
            {rest.length > 0 && (
              <>
                <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem', paddingBottom: '.625rem', borderBottom: '1px solid var(--rule2)' }}>
                  <span style={{ color: 'var(--orange)' }}>✦</span> Latest Stories
                </div>
                <div className="news-list-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  {rest.map((post, i) => (
                    <NewsCard key={post.id} post={post} index={i} onClick={() => navigate(`/news/${post.slug}`)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
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

function NewsCard({ post, index, onClick }: { post: any; index: number; onClick: () => void }) {
  return (
    <div className="news-card" onClick={onClick}
      style={{ border: '1px solid var(--rule)', background: 'var(--card-bg)', cursor: 'pointer', transition: 'border-color .2s, transform .2s', animationDelay: `${index * 0.06}s`, overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.transform = ''; }}
    >
      {/* Thumb */}
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--navy3)' }}>
        {post.cover_image ? (
          <img src={getFileUrl(`covers/${post.cover_image}`)} alt={post.title} className="news-thumb" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--navy3),var(--navy2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rule)', fontSize: '2rem' }}>✦</div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '1.125rem 1.25rem 1.25rem' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.625rem' }}>
          {(post.tags || []).slice(0, 2).map((t: string) => (
            <span key={t} className="news-tag" style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(200,146,42,.1)', color: 'var(--gold)', padding: '.18rem .5rem', border: '1px solid rgba(200,146,42,.2)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
        <h3 className="news-title" style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, color: 'var(--white)', lineHeight: 1.2, marginBottom: '.5rem', fontSize: '1.0625rem', transition: 'color .2s' }}>
          {post.title}
        </h3>
        <p style={{ color: 'var(--dim2)', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt || stripHtml(post.content)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim2)' }}>
            {post.author_name} · {timeAgo(post.created_at)}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', color: 'var(--dim2)', display: 'flex', gap: '.75rem' }}>
            <span>♥ {post.like_count}</span>
            <span>💬 {post.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
