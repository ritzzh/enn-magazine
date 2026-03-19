import { getFileUrl } from '../lib/api';

interface Props {
  magazine: any;
  onDownload: () => void;
  onReadMore: () => void;
}

export default function FeaturedSpotlight({ magazine, onDownload, onReadMore }: Props) {
  const coverUrl = magazine.cover_image ? getFileUrl(`covers/${magazine.cover_image}`) : null;
  const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
  const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;

  return (
    <>
      <style>{`
        .spotlight-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
        @media (min-width: 768px) {
          .spotlight-grid { grid-template-columns: auto 1fr; gap: 3rem; }
        }
        .cover-card-wrap { width: 100%; max-width: 280px; margin: 0 auto; }
        @media (min-width: 768px) { .cover-card-wrap { width: 260px; margin: 0; } }
        .spotlight-section { padding: 2.5rem 1.25rem; }
        @media (min-width: 640px)  { .spotlight-section { padding: 3rem 2rem; } }
        @media (min-width: 1024px) { .spotlight-section { padding: 3.5rem 3rem; } }
      `}</style>

      <section className="spotlight-section" style={{
        position: 'relative', zIndex: 1,
        borderBottom: '1px solid var(--rule)',
        background: 'linear-gradient(135deg,rgba(232,98,26,.06) 0%,transparent 50%)',
        overflow: 'hidden',
      }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', ...SERIF, fontSize: 'clamp(80px,14vw,180px)', fontWeight: 900, letterSpacing: '-.04em', color: 'rgba(200,146,42,0.025)', whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>FEATURED</div>

        <div className="spotlight-grid">
          {/* Cover card */}
          <div style={{ position: 'relative' }}>
            <div className="cover-card-wrap">
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--rule)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.5)', transition: 'transform .35s ease, box-shadow .35s ease', cursor: 'pointer' }}
                onClick={onReadMore}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) rotate(.4deg)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 36px 80px rgba(0,0,0,.6)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(0,0,0,.5)'; }}
              >
                <div style={{ aspectRatio: '3/4', background: magazine.cover_gradient || 'var(--card-bg)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                  {coverUrl ? (
                    <img src={coverUrl} alt={magazine.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(200,146,42,.15) 0%,transparent 50%,rgba(232,98,26,.08) 100%)' }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,146,42,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(200,146,42,.06) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%' }}>
                        <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.75rem' }}>— {magazine.month} {magazine.year} —</div>
                        <div style={{ ...SERIF, fontSize: 32, fontWeight: 900, color: 'var(--white)', lineHeight: 1 }}><em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>E</em>NN</div>
                        <div style={{ ...MONO, fontSize: '0.625rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', margin: '.4rem 0 1.25rem' }}>Magazine</div>
                        <div style={{ width: 36, height: 1, background: 'var(--gold)', margin: '0 auto 1.25rem' }} />
                        <div style={{ ...SERIF, fontSize: '0.9375rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--white)', lineHeight: 1.35, marginBottom: '1rem' }}>{magazine.headline}</div>
                        <div style={{ display: 'inline-block', ...MONO, fontSize: '0.625rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'var(--orange)', color: '#fff', padding: '.2rem .6rem' }}>{magazine.category}</div>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={e => { e.stopPropagation(); onDownload(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', background: 'linear-gradient(135deg,var(--gold),var(--orange))', padding: '.75rem', ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >↓ Download PDF</button>
              </div>

              {/* Latest badge */}
              <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.75rem', background: 'var(--orange)', color: '#fff', ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.3rem .65rem', clipPath: 'polygon(0 0,100% 0,100% 100%,6px 100%)', zIndex: 3 }}>Latest</div>
            </div>
          </div>

          {/* Info panel */}
          <div>
            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
              <span style={{ width: 22, height: 1, background: 'var(--orange)', display: 'inline-block' }} /> Featured Issue
            </div>

            <h2 style={{ ...SERIF, fontSize: 'clamp(1.375rem,2.5vw,2.125rem)', fontWeight: 900, color: 'var(--white)', lineHeight: 1.1, marginBottom: '.65rem', letterSpacing: '-.01em' }}>
              {magazine.headline}
            </h2>

            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
              {magazine.title} · {magazine.month} {magazine.year}
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--dim)', lineHeight: 1.75, marginBottom: '1.5rem', maxWidth: 520 }}>
              {magazine.description || "A curated edition of Entrepreneur News Network — packed with founder stories, market insights, and strategic analysis for India's next generation of business leaders."}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[{ n: magazine.download_count || 0, l: 'Downloads' }, { n: magazine.like_count || 0, l: 'Likes' }].map(s => (
                <div key={s.l} style={{ background: 'rgba(200,146,42,.08)', border: '1px solid var(--rule)', padding: '.5rem 1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <span style={{ ...SERIF, fontSize: '1.375rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                  <span style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)' }}>{s.l}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button onClick={onReadMore} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', padding: '.75rem 1.75rem', border: 'none', cursor: 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)', transition: 'background .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-lt)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; }}
              >Read & Discuss →</button>
              <button onClick={onDownload} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: 'transparent', color: 'var(--dim)', border: '1px solid var(--rule)', padding: '.75rem 1.75rem', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-lt)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.borderColor = 'var(--rule)'; }}
              >↓ Download PDF</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
