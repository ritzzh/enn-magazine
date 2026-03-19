const TICKER = [
  { label: 'Latest Issue',    value: 'March 2026' },
  { label: 'For Founders',    value: 'By Founders' },
  { label: 'ENN Magazine',    value: 'Monthly Edition' },
  { label: 'Strategy',        value: 'Insights' },
  { label: 'Founder Profiles',value: 'In-Depth' },
  { label: 'Sector X-Ray',    value: 'Analysis' },
  { label: 'Community',       value: 'Stories' },
  { label: 'Innovation',      value: 'Leadership' },
];

export default function TopBar() {
  const MONO = { fontFamily: "'Space Mono',monospace" } as React.CSSProperties;
  return (
    <>
      <style>{`
        @keyframes scrolltb { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.3;transform:scale(.8);} }
      `}</style>
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(200,146,42,0.07)',
        borderBottom: '1px solid var(--rule)',
        height: 34,
        display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '1.5rem', overflow: 'hidden',
      }}>
        {/* Live indicator */}
        <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'pulse 1.4s ease infinite' }} />
          LIVE
        </div>

        {/* Scrolling ticker */}
        <div style={{ flex: 1, overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)' }}>
          <div style={{ display: 'flex', gap: '2.5rem', animation: 'scrolltb 28s linear infinite', whiteSpace: 'nowrap' }}>
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                {item.label} <span style={{ color: 'var(--gold-lt)' }}>{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
