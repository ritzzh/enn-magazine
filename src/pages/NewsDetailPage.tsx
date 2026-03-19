import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { newsAPI, getFileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import AdminPanel from '../components/AdminPanel';

const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Fraunces',serif" };

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

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [anonName, setAnonName] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAdmin, setShowAdmin] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    newsAPI.getBySlug(slug)
      .then(r => {
        setPost(r.data);
        setLiked(r.data.userLiked);
        setLikeCount(r.data.like_count);
        setComments(r.data.comments || []);
      })
      .catch(() => navigate('/news'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    try {
      const r = await newsAPI.like(post.id);
      setLiked(r.data.liked);
      setLikeCount(r.data.likeCount);
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const r = await newsAPI.comment(post.id, newComment, isLoggedIn ? undefined : (anonName || 'Anonymous'));
      setComments([r.data.comment, ...comments]);
      setNewComment(''); setAnonName('');
    } catch {}
    setPosting(false);
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim()) return;
    try {
      const r = await newsAPI.comment(post.id, replyText, isLoggedIn ? undefined : 'Anonymous', parentId);
      setComments(comments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), r.data.comment] } : c));
      setReplyTo(null); setReplyText('');
    } catch {}
  };

  const handleUpvote = async (commentId: number) => {
    try {
      const r = await newsAPI.upvoteComment(commentId);
      setComments(comments.map(c => c.id === commentId ? { ...c, upvotes: r.data.upvotes } : c));
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 36, height: 36, border: '2px solid rgba(200,146,42,.3)', borderTop: '2px solid #C8922A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!post) return null;

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .news-body h2,.news-body h3{font-family:'Fraunces',serif;color:var(--white);margin:2rem 0 .75rem;line-height:1.2;}
        .news-body h2{font-size:clamp(1.25rem,2.5vw,1.625rem);font-weight:900;}
        .news-body h3{font-size:clamp(1.0625rem,2vw,1.25rem);font-weight:700;}
        .news-body p{color:var(--dim);line-height:1.8;margin-bottom:1.25rem;font-size:1.0625rem;}
        .news-body a{color:var(--gold);text-decoration:underline;text-underline-offset:3px;}
        .news-body a:hover{color:var(--gold-lt);}
        .news-body ul,.news-body ol{color:var(--dim);padding-left:1.5rem;margin-bottom:1.25rem;line-height:1.8;}
        .news-body li{margin-bottom:.35rem;}
        .news-body blockquote{border-left:3px solid var(--gold);margin:2rem 0;padding:.875rem 1.5rem;background:rgba(200,146,42,.04);font-family:'Fraunces',serif;font-size:1.125rem;color:var(--gold-lt);font-style:italic;line-height:1.6;}
        .news-body img{max-width:100%;height:auto;display:block;margin:1.5rem 0;border:1px solid var(--rule);}
        .news-body strong{color:var(--white);}
        .comment-input:focus{outline:none;border-color:var(--gold)!important;box-shadow:0 0 0 2px rgba(200,146,42,.12);}
      `}</style>

      <TopBar />
      <Navbar
        onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }}
        onAdminClick={() => setShowAdmin(true)}
      />

      {/* Back breadcrumb */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <Link to="/news" style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'inline-flex', alignItems: 'center', gap: '.4rem', textDecoration: 'none', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim2)')}
        >← News</Link>
      </div>

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', animation: 'fadeUp .4s ease' }}>
        {/* Tags */}
        {(post.tags || []).length > 0 && (
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {post.tags.map((t: string) => (
              <Link key={t} to={`/news?tag=${t}`} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(200,146,42,.12)', color: 'var(--gold)', padding: '.25rem .625rem', border: '1px solid rgba(200,146,42,.25)', textDecoration: 'none', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,146,42,.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,146,42,.12)')}
              >{t}</Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ ...SERIF, fontWeight: 900, color: 'var(--white)', lineHeight: 1.1, marginBottom: '1rem', fontSize: 'clamp(1.75rem,5vw,2.75rem)' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--rule2)' }}>
          <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim2)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ color: 'var(--orange)' }}>✦</span>
            {post.author_name}
          </div>
          <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', letterSpacing: '.08em' }}>
            {timeAgo(post.created_at)}
          </div>
          <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)' }}>
            ♥ {likeCount} · 💬 {comments.length}
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div style={{ marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <img src={getFileUrl(`covers/${post.cover_image}`)} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 520, objectFit: 'cover' }} />
          </div>
        )}

        {/* Body */}
        <div className="news-body" dangerouslySetInnerHTML={{ __html: post.content }} style={{ marginBottom: '2.5rem' }} />

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 0', borderTop: '1px solid var(--rule2)', borderBottom: '1px solid var(--rule2)', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleLike}
            style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: liked ? 'rgba(200,146,42,.15)' : 'transparent', border: `1px solid ${liked ? 'var(--gold)' : 'var(--rule)'}`, color: liked ? 'var(--gold)' : 'var(--dim)', padding: '.5rem 1.125rem', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '.4rem' }}
            onMouseEnter={e => { if (!liked) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; } }}
            onMouseLeave={e => { if (!liked) { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--dim)'; } }}
          >
            {liked ? '♥' : '♡'} {likeCount} {liked ? 'Liked' : 'Like'}
          </button>

          <button onClick={handleShare}
            style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: copyDone ? 'rgba(74,222,128,.1)' : 'transparent', border: `1px solid ${copyDone ? 'rgba(74,222,128,.3)' : 'var(--rule)'}`, color: copyDone ? '#4ade80' : 'var(--dim)', padding: '.5rem 1.125rem', cursor: 'pointer', transition: 'all .2s' }}
          >{copyDone ? '✓ Copied' : '⇪ Share'}</button>

          <div style={{ flex: 1 }} />
          <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', letterSpacing: '.1em' }}>
            {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Comments */}
        <section>
          <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem', paddingBottom: '.625rem', borderBottom: '1px solid var(--rule2)' }}>
            <span style={{ color: 'var(--orange)' }}>✦</span> Discussion ({comments.length})
          </div>

          {/* Comment form */}
          <form onSubmit={handleComment} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {!isLoggedIn && (
              <input className="comment-input" value={anonName} onChange={e => setAnonName(e.target.value)} placeholder="Your name (optional)" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)', color: 'var(--white)', padding: '.625rem .875rem', fontSize: '0.9375rem', fontFamily: "'Space Grotesk',sans-serif", transition: 'all .2s' }} />
            )}
            <textarea className="comment-input" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={isLoggedIn ? `Comment as ${user?.name}…` : 'Share your thoughts…'} rows={4} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)', color: 'var(--white)', padding: '.625rem .875rem', fontSize: '0.9375rem', fontFamily: "'Space Grotesk',sans-serif", resize: 'vertical', transition: 'all .2s' }} />
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
              <button type="submit" disabled={posting || !newComment.trim()} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '.5rem 1.25rem', cursor: posting ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: posting ? .6 : 1, clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
                {posting ? 'Posting…' : 'Post Comment'}
              </button>
              {!isLoggedIn && (
                <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', letterSpacing: '.08em' }}>
                  or <button type="button" onClick={() => setShowAuth(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontSize: '0.6875rem', letterSpacing: '.08em', padding: 0 }}>sign in</button> to comment as yourself
                </span>
              )}
            </div>
          </form>

          {/* Comment list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {comments.map(c => (
              <CommentBlock key={c.id} comment={c} onUpvote={handleUpvote}
                isReplying={replyTo === c.id}
                onReplyToggle={() => setReplyTo(replyTo === c.id ? null : c.id)}
                replyText={replyText}
                onReplyChange={setReplyText}
                onReplySubmit={() => handleReply(c.id)}
              />
            ))}
          </div>
        </section>
      </article>

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

function CommentBlock({ comment, onUpvote, isReplying, onReplyToggle, replyText, onReplyChange, onReplySubmit }: {
  comment: any;
  onUpvote: (id: number) => void;
  isReplying: boolean;
  onReplyToggle: () => void;
  replyText: string;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
}) {
  return (
    <div style={{ borderLeft: '2px solid var(--rule2)', paddingLeft: '1.125rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: 'var(--gold-lt)', fontWeight: 700 }}>{comment.author_name}</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', color: 'var(--dim2)', letterSpacing: '.08em' }}>{timeAgo(comment.created_at)}</span>
      </div>
      <p style={{ color: 'var(--dim)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '.625rem' }}>{comment.content}</p>
      <div style={{ display: 'flex', gap: '.875rem' }}>
        <button onClick={() => onUpvote(comment.id)} style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--dim2)', cursor: 'pointer', transition: 'color .2s', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim2)')}
        >▲ {comment.upvotes}</button>
        <button onClick={onReplyToggle} style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--dim2)', cursor: 'pointer', transition: 'color .2s', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim2)')}
        >{isReplying ? 'Cancel' : '↩ Reply'}</button>
      </div>

      {isReplying && (
        <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <textarea value={replyText} onChange={e => onReplyChange(e.target.value)} placeholder="Write a reply…" rows={3}
            style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--rule)', color: 'var(--white)', padding: '.5rem .75rem', fontSize: '0.875rem', fontFamily: "'Space Grotesk',sans-serif", resize: 'vertical' }} />
          <button onClick={onReplySubmit} style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6875rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.4rem 1rem', cursor: 'pointer', alignSelf: 'flex-start', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }}>
            Post Reply
          </button>
        </div>
      )}

      {/* Replies */}
      {(comment.replies || []).length > 0 && (
        <div style={{ marginTop: '.875rem', display: 'flex', flexDirection: 'column', gap: '.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--rule2)' }}>
          {comment.replies.map((r: any) => (
            <div key={r.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6875rem', color: 'var(--gold)', fontWeight: 700 }}>{r.author_name}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.625rem', color: 'var(--dim2)' }}>{timeAgo(r.created_at)}</span>
              </div>
              <p style={{ color: 'var(--dim2)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
