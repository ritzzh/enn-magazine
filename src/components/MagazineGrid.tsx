import { getFileUrl } from '../lib/api';

interface Props {
  magazines: any[];
  onMagazineClick: (mag: any) => void;
  onDownloadClick: (mag: any) => void;
  isLoading: boolean;
  onFilterChange: (filter: any) => void;
}

const CATEGORIES = ['Strategy', 'Founder Profile', 'Community', 'Sector X-Ray', 'General'];
const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;

function CoverCard({ mag, onClick, onDownload }: { mag: any; onClick: () => void; onDownload: () => void }) {
  const coverUrl = mag.cover_image ? getFileUrl(`covers/${mag.cover_image}`) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform .3s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
    >
      <div onClick={onClick}
        style={{ aspectRatio: '3/4', background: mag.cover_gradient || 'var(--card-bg)', border: '1px solid var(--rule2)', overflow: 'hidden', position: 'relative', transition: 'border-color .25s, box-shadow .25s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,146,42,.4)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,.45)';
          const overlay = e.currentTarget.querySelector('.pdf-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '1';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
          const overlay = e.currentTarget.querySelector('.pdf-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '0';
        }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={mag.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(200,146,42,.1) 0%,transparent 60%)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,146,42,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,146,42,.04) 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '1rem .75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ ...MONO, fontSize: '0.625rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.4rem' }}>{mag.month} {mag.year}</div>
              <div style={{ ...SERIF, fontSize: '1rem', fontWeight: 900, color: 'var(--white)', lineHeight: 1, marginBottom: 2 }}>
                <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>E</em>NN
              </div>
              <span style={{ ...MONO, fontSize: '0.5rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.5rem', display: 'block' }}>Magazine</span>
              <div style={{ width: 20, height: 1, background: 'var(--gold)', margin: '0 auto .5rem' }} />
              <div style={{ ...SERIF, fontSize: '0.5625rem', fontStyle: 'italic', color: 'rgba(245,242,236,.7)', lineHeight: 1.35, textAlign: 'center', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '.5rem' }}>{mag.headline}</div>
              <div style={{ ...MONO, fontSize: '0.5rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--orange)', color: '#fff', padding: '.15rem .4rem', display: 'inline-block' }}>{mag.category}</div>
            </div>
          </>
        )}
        <div className="pdf-overlay" style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'rgba(5,10,26,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .25s', flexDirection: 'column', gap: '.5rem' }}>
          <div style={{ fontSize: '1.75rem' }}>📄</div>
          <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--white)' }}>Read Issue</div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem 0 0', gap: '.5rem' }}>
        <span style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim2)' }}>{mag.month} {mag.year}</span>
        <button onClick={e => { e.stopPropagation(); onDownload(); }}
          style={{ background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem', transition: 'all .2s', flexShrink: 0 }}
          title="Download"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold-pale)'; e.currentTarget.style.color = 'var(--gold)'; }}
        >↓</button>
      </div>
    </div>
  );
}

export default function MagazineGrid({ magazines, onMagazineClick, onDownloadClick, isLoading, onFilterChange }: Props) {
  const years = [...new Set(magazines.map(m => m.year))].sort((a, b) => b - a);

  return (
    <>
      <style>{`
        .grid-section { padding: 2.5rem 1.25rem 3.5rem; max-width: 1200px; margin: 0 auto; }
        @media (min-width: 640px)  { .grid-section { padding: 3rem 2rem 4rem; } }
        @media (min-width: 1024px) { .grid-section { padding: 3rem 3rem 4rem; } }
        .covers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; }
        @media (min-width: 480px) { .covers-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); } }
        @media (min-width: 768px) { .covers-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; } }
      `}</style>

      <section className="grid-section" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <span>✦</span> Magazine Archive
            </div>
            <h2 style={{ ...SERIF, fontSize: 'clamp(1.375rem,3vw,1.75rem)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-.02em' }}>All Issues</h2>
          </div>

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <select onChange={e => onFilterChange((p: any) => ({ ...p, year: e.target.value ? parseInt(e.target.value) : undefined }))}
              style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)', color: 'var(--dim)', padding: '.5rem .875rem', cursor: 'pointer', width: 'auto' }}>
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select onChange={e => onFilterChange((p: any) => ({ ...p, category: e.target.value || undefined }))}
              style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)', color: 'var(--dim)', padding: '.5rem .875rem', cursor: 'pointer', width: 'auto' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dim2)', ...MONO, fontSize: '0.75rem', letterSpacing: '.18em', textTransform: 'uppercase' }}>Loading issues...</div>
        ) : magazines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dim2)', ...MONO, fontSize: '0.75rem', letterSpacing: '.18em', textTransform: 'uppercase' }}>No magazines found</div>
        ) : years.map(year => {
          const yearMags = magazines.filter(m => m.year === year);
          if (!yearMags.length) return null;
          return (
            <div key={year} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ ...SERIF, fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{year}</div>
                <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--dim2)' }}>Edition</div>
                <div style={{ marginLeft: 'auto', ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--orange)', background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', padding: '.2rem .6rem' }}>
                  {yearMags.length} {yearMags.length === 1 ? 'Issue' : 'Issues'}
                </div>
              </div>
              <div className="covers-grid">
                {yearMags.map(mag => (
                  <CoverCard key={mag.id} mag={mag} onClick={() => onMagazineClick(mag)} onDownload={() => onDownloadClick(mag)} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
