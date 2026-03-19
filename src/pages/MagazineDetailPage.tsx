import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { magazineAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import DownloadModal from '../components/DownloadModal';
import AdminPanel from '../components/AdminPanel';

const MONO  = { fontFamily: "'Space Mono',monospace"  } as React.CSSProperties;
const SERIF = { fontFamily: "'Fraunces',serif" }        as React.CSSProperties;
const inputCss: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem',
  background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)',
  color: 'var(--white)', fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.9375rem',
};

export default function MagazineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [magazine,  setMagazine]  = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments,  setComments]  = useState<any[]>([]);
  const [newComment,setNewComment]= useState('');
  const [anonName,  setAnonName]  = useState('');
  const [posting,   setPosting]   = useState(false);
  const [replyTo,   setReplyTo]   = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showAuth,  setShowAuth]  = useState(false);
  const [authMode,  setAuthMode]  = useState<'login'|'register'>('login');
  const [showDL,    setShowDL]    = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [copyDone,  setCopyDone]  = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    magazineAPI.getById(id)
      .then(r => { setMagazine(r.data); setLiked(r.data.userLiked); setLikeCount(r.data.like_count); setComments(r.data.comments || []); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    try { const r = await magazineAPI.like(id!); setLiked(r.data.liked); setLikeCount(r.data.likeCount); } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const r = await magazineAPI.comment(id!, newComment, isLoggedIn ? undefined : (anonName || 'Anonymous'));
      setComments([r.data.comment, ...comments]); setNewComment(''); setAnonName('');
    } catch {}
    setPosting(false);
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim()) return;
    try {
      const r = await magazineAPI.comment(id!, replyText, isLoggedIn ? undefined : 'Anonymous', parentId);
      setComments(comments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), r.data.comment] } : c));
      setReplyTo(null); setReplyText('');
    } catch {}
  };

  const handleUpvote = async (commentId: number) => {
    try { const r = await magazineAPI.upvoteComment(commentId); setComments(comments.map(c => c.id === commentId ? { ...c, upvotes: r.data.upvotes } : c)); } catch {}
  };

  const pageUrl = window.location.href;
  const shareText = encodeURIComponent(`Check out this ENN Magazine issue: ${magazine?.title}`);
  const shareUrl  = encodeURIComponent(pageUrl);
  const coverUrl  = magazine?.cover_image ? `/uploads/covers/${magazine.cover_image}` : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(200,146,42,.3)', borderTop: '2px solid #C8922A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );
  if (!magazine) return null;

  return (
    <>
      <style>{`
        .detail-hero-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; max-width: 1200px; margin: 0 auto; width: 100%; }
        @media (min-width: 768px) { .detail-hero-grid { grid-template-columns: auto 1fr; gap: 2.5rem; } }
        .detail-cover { width: 100%; max-width: 200px; margin: 0 auto; }
        @media (min-width: 768px) { .detail-cover { width: 200px; margin: 0; } }
        .detail-section { padding: 2.5rem 1.25rem; }
        @media (min-width: 640px)  { .detail-section { padding: 3rem 2rem; } }
        @media (min-width: 1024px) { .detail-section { padding: 3.5rem 3rem; } }
        .share-bar { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .comments-section { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
        @media (min-width: 640px)  { .comments-section { padding: 3rem 2rem 5rem; } }
        @media (min-width: 1024px) { .comments-section { padding: 3rem 3rem 5rem; } }
      `}</style>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
        <Navbar onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }} onAdminClick={() => setShowAdmin(true)} />

        {/* ── Hero Banner ────────────────────────────────────────── */}
        <div className="detail-section" style={{ position: 'relative', minHeight: 380, background: magazine.cover_gradient || 'linear-gradient(160deg,#0C1535,#0A1530)', borderBottom: '1px solid var(--rule)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          {coverUrl && <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, filter: 'blur(4px)' }} />}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg,rgba(5,10,26,.96) 0%,rgba(5,10,26,.75) 55%,rgba(5,10,26,.4) 100%)' }} />

          <div className="detail-hero-grid" style={{ position: 'relative', zIndex: 2 }}>
            {/* Cover card */}
            <div className="detail-cover">
              <div style={{ aspectRatio: '3/4', border: '1px solid var(--rule)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,.6)', background: magazine.cover_gradient || 'var(--card-bg)', cursor: 'pointer', transition: 'transform .3s' }}
                onClick={() => setShowDL(true)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                {coverUrl
                  ? <img src={coverUrl} alt={magazine.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1.25rem', textAlign: 'center' }}>
                      <div style={{ ...MONO, fontSize: '0.625rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.5rem' }}>{magazine.month} {magazine.year}</div>
                      <div style={{ ...SERIF, fontSize: 28, fontWeight: 900, color: 'var(--white)', lineHeight: 1 }}><em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>E</em>NN</div>
                      <div style={{ ...MONO, fontSize: '0.5625rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold)', margin: '.25rem 0 1rem' }}>Magazine</div>
                      <div style={{ width: 26, height: 1, background: 'var(--gold)', margin: '0 auto .75rem' }} />
                      <div style={{ ...SERIF, fontSize: '0.625rem', fontStyle: 'italic', color: 'rgba(245,242,236,.75)', lineHeight: 1.35 }}>{magazine.headline}</div>
                    </div>
                  )
                }
                <div style={{ background: 'var(--orange)', padding: '.28rem .65rem', ...MONO, fontSize: '0.5625rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', textAlign: 'center' }}>{magazine.category}</div>
              </div>
            </div>

            {/* Info */}
            <div>
              <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                <span style={{ width: 18, height: 1, background: 'var(--orange)', display: 'inline-block' }} /> {magazine.month} {magazine.year} Edition
              </div>
              <h1 style={{ ...SERIF, fontSize: 'clamp(1.25rem,3vw,2.25rem)', fontWeight: 900, color: 'var(--white)', lineHeight: 1.1, marginBottom: '.6rem' }}>{magazine.headline}</h1>
              <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>{magazine.title}</div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--dim)', lineHeight: 1.75, maxWidth: 500, marginBottom: '1.5rem' }}>
                {magazine.description || 'A curated edition of Entrepreneur News Network, for founders by founders.'}
              </p>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button onClick={() => setShowDL(true)} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', padding: '.65rem 1.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
                  ↓ Download
                </button>
                <button onClick={handleLike} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: liked ? 'rgba(232,98,26,.15)' : 'transparent', color: liked ? 'var(--orange)' : 'var(--dim)', border: `1px solid ${liked ? 'rgba(232,98,26,.4)' : 'var(--rule)'}`, padding: '.65rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  {liked ? '♥' : '♡'} {likeCount}
                </button>
                <button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--dim)', border: '1px solid var(--rule)', padding: '.65rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  💬 {comments.length}
                </button>
              </div>

              {/* Share */}
              <div className="share-bar">
                <span style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--dim2)' }}>Share:</span>
                {[
                  { label: 'WhatsApp', href: `https://wa.me/?text=${shareText}%20${shareUrl}`, color: '#25D366', bg: 'rgba(37,211,102,.1)', border: 'rgba(37,211,102,.25)' },
                  { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, color: '#0A66C2', bg: 'rgba(10,102,194,.1)', border: 'rgba(10,102,194,.25)' },
                  { label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, color: '#1DA1F2', bg: 'rgba(29,161,242,.1)', border: 'rgba(29,161,242,.25)' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '.3rem .8rem', ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity .2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '.75')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                  >{s.label}</a>
                ))}
                <button onClick={() => { navigator.clipboard.writeText(pageUrl); setCopyDone(true); setTimeout(() => setCopyDone(false), 2000); }}
                  style={{ background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: copyDone ? 'var(--orange)' : 'var(--gold)', padding: '.3rem .8rem', ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}>
                  {copyDone ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.25rem 1.25rem 0' }}>
          <button onClick={() => navigate('/')} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--dim2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem', transition: 'color .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim2)'; }}
          >← Back to Archive</button>
        </div>

        {/* ── Comments ────────────────────────────────────────────── */}
        <div id="comments" className="comments-section">
          <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <span>✦</span> Discussion
            </div>
            <h2 style={{ ...SERIF, fontSize: 'clamp(1.375rem,3vw,1.75rem)', fontWeight: 900, color: 'var(--white)', marginBottom: '.3rem' }}>Reader Comments</h2>
            <p style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dim2)' }}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'} · Anonymous welcome
            </p>
          </div>

          {/* Comment form */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--rule)', padding: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ color: 'var(--orange)' }}>✦</span>
              {isLoggedIn ? `Comment as ${user?.name}` : 'Leave a Comment'}
            </div>
            <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {!isLoggedIn && (
                <input value={anonName} onChange={e => setAnonName(e.target.value)} placeholder="Your name (optional — defaults to Anonymous)" style={inputCss} />
              )}
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your thoughts about this issue..." rows={4} style={{ ...inputCss, resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={posting || !newComment.trim()}
                  style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', padding: '.65rem 1.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)', opacity: (posting || !newComment.trim()) ? .5 : 1 }}>
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {/* Comment list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--dim2)', ...MONO, fontSize: '0.75rem', letterSpacing: '.16em', textTransform: 'uppercase', border: '1px solid var(--rule2)' }}>
                No comments yet · Be the first to share your thoughts
              </div>
            ) : comments.map(comment => (
              <div key={comment.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--rule2)', padding: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SERIF, fontSize: '0.9375rem', fontWeight: 900, color: 'var(--navy)', flexShrink: 0 }}>
                    {(comment.author_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--white)' }}>{comment.author_name || 'Anonymous'}</div>
                    <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', color: 'var(--dim2)', marginTop: 2 }}>
                      {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '.75rem' }}>{comment.content}</p>

                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                  <button onClick={() => handleUpvote(comment.id)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(200,146,42,.07)', border: '1px solid var(--rule2)', color: 'var(--gold)', padding: '.3rem .75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                    ▲ {comment.upvotes || 0}
                  </button>
                  <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'transparent', border: 'none', color: 'var(--dim2)', cursor: 'pointer' }}>
                    {replyTo === comment.id ? '✕ Cancel' : '↩ Reply'}
                  </button>
                  {(comment.replies?.length > 0) && (
                    <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)' }}>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                  )}
                </div>

                {replyTo === comment.id && (
                  <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--rule)' }}>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." rows={2} style={{ ...inputCss, marginBottom: '.5rem', resize: 'vertical' }} />
                    <button onClick={() => handleReply(comment.id)} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', padding: '.45rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                      Post Reply
                    </button>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingLeft: '1.125rem', borderLeft: '2px solid var(--rule2)', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.35rem' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-lt),var(--orange-lt))', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SERIF, fontSize: '0.75rem', fontWeight: 900, color: 'var(--navy)', flexShrink: 0 }}>
                            {(reply.author_name || 'A')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--white)' }}>{reply.author_name || 'Anonymous'}</span>
                          <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)' }}>
                            {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--dim)', lineHeight: 1.65 }}>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Footer />

        {showAuth   && <AuthModal mode={authMode} onModeChange={setAuthMode} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        {showDL     && <DownloadModal magazine={magazine} isLoggedIn={isLoggedIn} onClose={() => setShowDL(false)} onDone={() => setShowDL(false)} />}
        {showAdmin  && <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={() => {}} />}
      </main>
    </>
  );
}
