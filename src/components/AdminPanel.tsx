import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../lib/api';
import RichTextEditor from './RichTextEditor';

interface Props { onClose: () => void; onRefresh: () => void; }
type Tab = 'dashboard' | 'magazines' | 'publish' | 'users' | 'downloads' | 'news' | 'contacts';

/* ── Shared style tokens ──────────────────────────────────────────────────── */
const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Fraunces',serif" };

const inputCss: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  background: 'rgba(255,255,255,.06)',
  border: '1px solid var(--rule)',
  color: 'var(--white)',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: '0.9375rem',
  borderRadius: 2,
};

/* ── Field — MUST be defined outside all tab components to avoid remount ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem', paddingBottom: '.625rem', borderBottom: '1px solid var(--rule2)' }}>
      <span style={{ color: 'var(--orange)' }}>✦</span> {children}
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────────── */
function DashboardTab({ stats }: { stats: any }) {
  if (!stats) return (
    <div style={{ color: 'var(--dim)', padding: '3rem', textAlign: 'center', ...MONO, fontSize: '0.75rem', letterSpacing: '.15em', textTransform: 'uppercase' }}>
      Loading dashboard...
    </div>
  );

  const cards = [
    { n: stats.totalUsers,        l: 'Total Users',    icon: '👥' },
    { n: stats.totalDownloads,    l: 'Downloads',      icon: '↓'  },
    { n: stats.totalMagazines,    l: 'Magazines',      icon: '📄' },
    { n: stats.totalNewsPosts,    l: 'News Posts',     icon: '✦'  },
    { n: stats.totalLikes,        l: 'Total Likes',    icon: '♥'  },
    { n: stats.totalComments,     l: 'Comments',       icon: '💬' },
    { n: stats.newContactRequests,l: 'New Contacts',   icon: '✉'  },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(s => (
          <div key={s.l}
            style={{ background: 'var(--navy)', border: '1px solid var(--rule)', padding: '1.25rem 1rem', textAlign: 'center', transition: 'border-color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
          >
            <div style={{ fontSize: '1.375rem', marginBottom: '.35rem' }}>{s.icon}</div>
            <div style={{ ...SERIF, fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1, marginBottom: '.3rem' }}>{s.n}</div>
            <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--dim2)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Top magazines */}
      <div style={{ marginBottom: '2rem' }}>
        <SectionHead>Top Magazines by Downloads</SectionHead>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Magazine', 'Month / Year', 'Downloads', 'Likes'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.popularMagazines?.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--rule2)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,146,42,.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '.75rem', fontSize: '0.9375rem', color: 'var(--white)' }}>{m.title}</td>
                  <td style={{ padding: '.75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--gold)' }}>{m.month} {m.year}</td>
                  <td style={{ padding: '.75rem', ...SERIF, fontSize: '1.125rem', fontWeight: 900, color: 'var(--orange)' }}>{m.download_count}</td>
                  <td style={{ padding: '.75rem', ...SERIF, fontSize: '1.125rem', fontWeight: 900, color: 'var(--gold)' }}>{m.like_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent downloads */}
      <div>
        <SectionHead>Recent Downloads</SectionHead>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Name / Email', 'Magazine', 'Date'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentDownloads?.slice(0, 10).map((d: any) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--rule2)' }}>
                  <td style={{ padding: '.625rem .75rem' }}>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--white)' }}>{d.guest_name || d.user_name || '—'}</div>
                    <div style={{ ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', marginTop: 2 }}>{d.guest_email || ''}</div>
                  </td>
                  <td style={{ padding: '.625rem .75rem', fontSize: '0.875rem', color: 'var(--dim)' }}>{d.magazine_title} · {d.month} {d.year}</td>
                  <td style={{ padding: '.625rem .75rem', ...MONO, fontSize: '0.75rem', color: 'var(--dim2)' }}>{new Date(d.downloaded_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Publish ─────────────────────────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CATS   = ['Strategy','Founder Profile','Community','Sector X-Ray','General'];

function PublishTab({ onPublished, editMag, onDone }: {
  onPublished: () => void;
  editMag?: any;
  onDone?: () => void;
}) {
  const [form, setForm] = useState({
    title:          editMag?.title          || '',
    headline:       editMag?.headline       || '',
    description:    editMag?.description    || '',
    category:       editMag?.category       || 'General',
    month:          editMag?.month          || '',
    year:           editMag?.year?.toString() || new Date().getFullYear().toString(),
    release_date:   editMag?.release_date   || '',
    cover_gradient: editMag?.cover_gradient || 'linear-gradient(160deg,#0C1535 0%,#0A1530 100%)',
    is_featured:    editMag?.is_featured    ? 'true' : 'false',
    is_published:   editMag?.is_published !== false ? 'true' : 'false',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile,   setPdfFile]   = useState<File | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [coverName, setCoverName] = useState('');
  const [pdfName,   setPdfName]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
      if (coverFile) fd.append('cover', coverFile);
      if (pdfFile)   fd.append('pdf',   pdfFile);

      if (editMag) {
        await adminAPI.updateMagazine(editMag.id, fd);
        setSuccess('Magazine updated successfully!');
        onDone?.();
      } else {
        await adminAPI.createMagazine(fd);
        setSuccess('Magazine published!');
        setForm({ title:'', headline:'', description:'', category:'General', month:'', year: new Date().getFullYear().toString(), release_date:'', cover_gradient:'linear-gradient(160deg,#0C1535 0%,#0A1530 100%)', is_featured:'false', is_published:'true' });
        setCoverFile(null); setPdfFile(null); setCoverName(''); setPdfName('');
      }
      onPublished();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Controlled updater — keeps reference stable so inputs don't lose focus
  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionHead>{editMag ? 'Edit Magazine' : 'Publish New Magazine'}</SectionHead>

      <div className="grid-2">
        <Field label="Magazine Title *">
          <input value={form.title} onChange={update('title')} placeholder="e.g. ENN March 2026" required style={inputCss} />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={update('category')} style={inputCss}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Headline / Cover Story *">
        <input value={form.headline} onChange={update('headline')} placeholder="The main cover headline for this issue" required style={inputCss} />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={update('description')} placeholder="Brief description of this issue..." rows={3} style={{ ...inputCss, resize: 'vertical' }} />
      </Field>

      <div className="grid-3">
        <Field label="Month *">
          <select value={form.month} onChange={update('month')} required style={inputCss}>
            <option value="">Select month</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Year *">
          <input type="number" value={form.year} onChange={update('year')} min="2020" max="2035" required style={inputCss} />
        </Field>
        <Field label="Release Date">
          <input type="date" value={form.release_date} onChange={update('release_date')} style={inputCss} />
        </Field>
      </div>

      <div className="grid-2">
        <Field label="Cover Image (JPG / PNG)">
          <label style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            padding: '0.625rem 0.875rem',
            background: 'rgba(255,255,255,.06)', border: '1px solid var(--rule)',
            cursor: 'pointer', transition: 'border-color .2s',
            fontSize: '0.9375rem', color: coverName ? 'var(--white)' : 'var(--dim2)',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
          >
            <span style={{ ...MONO, fontSize: '0.75rem', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.25rem .6rem', whiteSpace: 'nowrap' }}>Choose File</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {coverName || (editMag?.cover_image ? `Current: ${editMag.cover_image}` : 'No file chosen')}
            </span>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0] || null; setCoverFile(f); setCoverName(f?.name || ''); }} />
          </label>
        </Field>

        <Field label="PDF File">
          <label style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            padding: '0.625rem 0.875rem',
            background: 'rgba(255,255,255,.06)', border: '1px solid var(--rule)',
            cursor: 'pointer', transition: 'border-color .2s',
            fontSize: '0.9375rem', color: pdfName ? 'var(--white)' : 'var(--dim2)',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
          >
            <span style={{ ...MONO, fontSize: '0.75rem', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.25rem .6rem', whiteSpace: 'nowrap' }}>Choose File</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {pdfName || (editMag?.pdf_file ? `Current: ${editMag.pdf_file}` : 'No file chosen')}
            </span>
            <input type="file" accept="application/pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0] || null; setPdfFile(f); setPdfName(f?.name || ''); }} />
          </label>
        </Field>
      </div>

      <Field label="Cover Gradient (CSS)">
        <input value={form.cover_gradient} onChange={update('cover_gradient')} placeholder="linear-gradient(160deg,#0C1535,#0A1530)" style={inputCss} />
        <div style={{ height: 28, marginTop: '.25rem', background: form.cover_gradient, border: '1px solid var(--rule)', borderRadius: 2 }} />
      </Field>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--dim)' }}>
          <input type="checkbox" checked={form.is_featured === 'true'} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked ? 'true' : 'false' }))} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
          Mark as Featured
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--dim)' }}>
          <input type="checkbox" checked={form.is_published === 'true'} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked ? 'true' : 'false' }))} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
          Published (visible on site)
        </label>
      </div>

      {error   && <div style={{ background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)', padding: '.75rem 1rem', fontSize: '0.9375rem', color: 'var(--orange)', borderRadius: 2 }}>{error}</div>}
      {success && <div style={{ background: 'rgba(200,146,42,.1)',  border: '1px solid rgba(200,146,42,.3)', padding: '.75rem 1rem', fontSize: '0.9375rem', color: 'var(--gold)',   borderRadius: 2 }}>{success}</div>}

      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <button type="submit" disabled={loading} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', padding: '.75rem 1.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
          {loading ? 'Saving...' : editMag ? '✓ Update Magazine' : '✦ Publish Magazine'}
        </button>
        {editMag && onDone && (
          <button type="button" onClick={onDone} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--dim)', border: '1px solid var(--rule)', padding: '.75rem 1.25rem', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/* ── Magazines list ───────────────────────────────────────────────────────── */
function MagazinesTab({ onRefresh }: { onRefresh: () => void }) {
  const [magazines, setMagazines] = useState<any[]>([]);
  const [editMag,   setEditMag]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const r = await adminAPI.getMagazines(); setMagazines(r.data.magazines); }
    catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this magazine? This cannot be undone.')) return;
    await adminAPI.deleteMagazine(id);
    load(); onRefresh();
  };

  if (editMag) return <PublishTab onPublished={() => { load(); onRefresh(); }} editMag={editMag} onDone={() => setEditMag(null)} />;

  return (
    <div>
      <SectionHead>All Magazines ({magazines.length})</SectionHead>
      {loading ? (
        <div style={{ color: 'var(--dim2)', padding: '2rem', ...MONO, fontSize: '0.75rem', textTransform: 'uppercase' }}>Loading...</div>
      ) : (
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Title', 'Month / Year', 'Category', 'DLs', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {magazines.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--rule2)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,146,42,.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '.75rem' }}>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--white)', fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--dim2)', marginTop: 2 }}>{m.headline?.substring(0, 45)}…</div>
                  </td>
                  <td style={{ padding: '.75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{m.month} {m.year}</td>
                  <td style={{ padding: '.75rem' }}>
                    <span style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', color: 'var(--orange)', ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', padding: '.25rem .5rem', whiteSpace: 'nowrap' }}>{m.category}</span>
                  </td>
                  <td style={{ padding: '.75rem', ...SERIF, fontSize: '1.125rem', fontWeight: 900, color: 'var(--orange)' }}>{m.download_count}</td>
                  <td style={{ padding: '.75rem', whiteSpace: 'nowrap' }}>
                    {m.is_published
                      ? <span style={{ color: '#4ade80', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>● Live</span>
                      : <span style={{ color: 'var(--dim2)', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>○ Draft</span>
                    }
                    {m.is_featured ? <span style={{ marginLeft: '.5rem', color: 'var(--gold)' }}>★</span> : null}
                  </td>
                  <td style={{ padding: '.75rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button onClick={() => setEditMag(m)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.35rem .75rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(m.id)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', padding: '.35rem .75rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Users ───────────────────────────────────────────────────────────────── */
function UsersTab() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const toggleRole = async (u: any) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${u.name} a ${newRole}?`)) return;
    await adminAPI.updateUserRole(u.id, newRole);
    setUsers(users.map(x => x.id === u.id ? { ...x, role: newRole } : x));
  };

  return (
    <div>
      <SectionHead>Users ({users.length})</SectionHead>
      {loading ? (
        <div style={{ color: 'var(--dim2)', padding: '2rem', ...MONO, fontSize: '0.75rem', textTransform: 'uppercase' }}>Loading...</div>
      ) : (
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--rule2)' }}>
                  <td style={{ padding: '.7rem .75rem', fontSize: '0.9375rem', color: 'var(--white)' }}>{u.name}</td>
                  <td style={{ padding: '.7rem .75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--dim)' }}>{u.email}</td>
                  <td style={{ padding: '.7rem .75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--dim2)' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '.7rem .75rem' }}>
                    <span style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: u.role === 'admin' ? 'rgba(232,98,26,.15)' : 'rgba(200,146,42,.1)', border: `1px solid ${u.role === 'admin' ? 'rgba(232,98,26,.3)' : 'var(--rule)'}`, color: u.role === 'admin' ? 'var(--orange)' : 'var(--gold)', padding: '.25rem .5rem' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '.7rem .75rem', ...MONO, fontSize: '0.75rem', color: 'var(--dim2)' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '.7rem .75rem' }}>
                    <button onClick={() => toggleRole(u)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(200,146,42,.08)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.35rem .75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {u.role === 'admin' ? '→ User' : '→ Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Downloads ───────────────────────────────────────────────────────────── */
function DownloadsTab() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    adminAPI.getDownloads().then(r => setDownloads(r.data.downloads)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHead>Download Log ({downloads.length})</SectionHead>
      {loading ? (
        <div style={{ color: 'var(--dim2)', padding: '2rem', ...MONO, fontSize: '0.75rem', textTransform: 'uppercase' }}>Loading...</div>
      ) : (
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Name', 'Email', 'Phone', 'Magazine', 'Type', 'Date'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {downloads.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--rule2)' }}>
                  <td style={{ padding: '.625rem .75rem', fontSize: '0.9375rem', color: 'var(--white)' }}>{d.guest_name || d.user_name || '—'}</td>
                  <td style={{ padding: '.625rem .75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--dim)' }}>{d.guest_email || '—'}</td>
                  <td style={{ padding: '.625rem .75rem', ...MONO, fontSize: '0.8125rem', color: 'var(--dim2)' }}>{d.guest_phone || '—'}</td>
                  <td style={{ padding: '.625rem .75rem', fontSize: '0.875rem', color: 'var(--dim)' }}>{d.title} · {d.month} {d.year}</td>
                  <td style={{ padding: '.625rem .75rem' }}>
                    <span style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: d.user_id ? 'rgba(200,146,42,.1)' : 'rgba(255,255,255,.05)', border: '1px solid var(--rule)', color: d.user_id ? 'var(--gold)' : 'var(--dim2)', padding: '.25rem .5rem' }}>
                      {d.user_id ? 'Member' : 'Guest'}
                    </span>
                  </td>
                  <td style={{ padding: '.625rem .75rem', ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', whiteSpace: 'nowrap' }}>
                    {new Date(d.downloaded_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Main admin panel ─────────────────────────────────────────────────────── */
export default function AdminPanel({ onClose, onRefresh }: Props) {
  const { user } = useAuth();
  const [tab,   setTab]   = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      adminAPI.dashboard().then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'publish',   label: 'Publish'   },
    { id: 'magazines', label: 'Magazines' },
    { id: 'news',      label: 'News'      },
    { id: 'users',     label: 'Users'     },
    { id: 'downloads', label: 'Downloads' },
    { id: 'contacts',  label: 'Contacts'  },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(5,10,26,.92)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', backdropFilter: 'blur(12px)', overflowY: 'auto', padding: '1rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}`}</style>
      <div style={{ background: 'var(--navy2)', border: '1px solid var(--rule)', width: '100%', maxWidth: 1100, animation: 'fadeUp .25s ease', marginBottom: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--rule)', background: 'rgba(200,146,42,.04)', flexWrap: 'wrap', gap: '.75rem' }}>
          <div>
            <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.25rem' }}>✦ Admin Panel</div>
            <div style={{ ...SERIF, fontSize: '1.375rem', fontWeight: 900, color: 'var(--white)' }}>ENN Dashboard</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--rule)', color: 'var(--dim2)', cursor: 'pointer', fontSize: '1.125rem', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--white)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim2)'; e.currentTarget.style.borderColor = 'var(--rule)'; }}
          >✕</button>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', background: 'rgba(0,0,0,.2)', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: tab === t.id ? '2px solid var(--orange)' : '2px solid transparent', color: tab === t.id ? 'var(--gold-lt)' : 'var(--dim2)', padding: '0.875rem 1.25rem', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {tab === 'dashboard' && <DashboardTab stats={stats} />}
          {tab === 'publish'   && <PublishTab   onPublished={() => { onRefresh(); adminAPI.dashboard().then(r => setStats(r.data)).catch(() => {}); }} />}
          {tab === 'magazines' && <MagazinesTab onRefresh={onRefresh} />}
          {tab === 'news'      && <NewsTab />}
          {tab === 'users'     && <UsersTab />}
          {tab === 'downloads' && <DownloadsTab />}
          {tab === 'contacts'  && <ContactsTab />}
        </div>
      </div>
    </div>
  );
}

/* ── News Tab ─────────────────────────────────────────────────────────────── */
const NEWS_TAGS_OPTIONS = ['strategy','founder','funding','tech','policy','community','global','startup','leadership'];

function NewsTab() {
  const [posts,    setPosts]   = useState<any[]>([]);
  const [loading,  setLoading] = useState(true);
  const [editPost, setEditPost]= useState<any | null>(null);
  const [showForm, setShowForm]= useState(false);

  const load = () => {
    adminAPI.getNews().then(r => setPosts(r.data.posts)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this news post?')) return;
    await adminAPI.deleteNews(id);
    load();
  };

  if (showForm || editPost) {
    return <NewsPostForm post={editPost} onDone={() => { setEditPost(null); setShowForm(false); load(); }} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionHead>News Posts ({posts.length})</SectionHead>
        <button onClick={() => setShowForm(true)} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
          + New Post
        </button>
      </div>
      {loading ? (
        <div style={{ color: 'var(--dim2)', padding: '2rem', ...MONO, fontSize: '0.75rem' }}>Loading…</div>
      ) : (
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                {['Title', 'Tags', 'Status', 'Likes', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim2)', padding: '.625rem .75rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--rule2)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,146,42,.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '.75rem' }}>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--white)', fontWeight: 500, maxWidth: 260 }}>{p.title}</div>
                    <div style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', marginTop: 2 }}>{p.author_name}</div>
                  </td>
                  <td style={{ padding: '.75rem' }}>
                    <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap', maxWidth: 160 }}>
                      {(p.tags ? p.tags.split(',').filter(Boolean) : []).slice(0, 3).map((t: string) => (
                        <span key={t} style={{ ...MONO, fontSize: '0.5625rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(200,146,42,.1)', color: 'var(--gold)', padding: '.15rem .4rem', border: '1px solid rgba(200,146,42,.2)' }}>{t.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '.75rem', whiteSpace: 'nowrap' }}>
                    {p.is_published
                      ? <span style={{ color: '#4ade80', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>● Live</span>
                      : <span style={{ color: 'var(--dim2)', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>○ Draft</span>
                    }
                    {p.is_featured ? <span style={{ marginLeft: '.5rem', color: 'var(--gold)' }}>★</span> : null}
                  </td>
                  <td style={{ padding: '.75rem', ...SERIF, fontSize: '1.125rem', fontWeight: 900, color: 'var(--gold)' }}>{p.like_count}</td>
                  <td style={{ padding: '.75rem', ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', whiteSpace: 'nowrap' }}>
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '.75rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button onClick={() => setEditPost(p)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.35rem .75rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', padding: '.35rem .75rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewsPostForm({ post, onDone }: { post?: any; onDone: () => void }) {
  const [title,       setTitle]       = useState(post?.title || '');
  const [content,     setContent]     = useState(post?.content || '');
  const [excerpt,     setExcerpt]     = useState(post?.excerpt || '');
  const [tags,        setTags]        = useState<string[]>(post?.tags ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
  const [isPublished, setIsPublished] = useState(post?.is_published !== 0);
  const [isFeatured,  setIsFeatured]  = useState(post?.is_featured === 1);
  const [coverFile,   setCoverFile]   = useState<File | null>(null);
  const [coverName,   setCoverName]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Title and content are required'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', content);
      fd.append('excerpt', excerpt);
      fd.append('tags', tags.join(','));
      fd.append('is_published', isPublished ? 'true' : 'false');
      fd.append('is_featured', isFeatured ? 'true' : 'false');
      if (coverFile) fd.append('cover', coverFile);

      if (post) {
        await adminAPI.updateNews(post.id, fd);
      } else {
        await adminAPI.createNews(fd);
      }
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onDone} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule)', color: 'var(--dim)', padding: '.375rem .875rem', cursor: 'pointer' }}>← Back</button>
        <SectionHead>{post ? 'Edit News Post' : 'Write New Post'}</SectionHead>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Field label="Headline *">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Your compelling headline…" required style={inputCss} />
        </Field>

        <Field label="Excerpt (shown on cards)">
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A 1–2 sentence summary…" rows={2} style={{ ...inputCss, resize: 'vertical' }} />
        </Field>

        <Field label="Cover Image">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <label style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'var(--gold-pale)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.5rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Choose Image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverName(f.name); } }} />
            </label>
            <span style={{ ...MONO, fontSize: '0.6875rem', color: 'var(--dim2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {coverName || (post?.cover_image ? `Current: ${post.cover_image}` : 'No file chosen')}
            </span>
          </div>
        </Field>

        <Field label="Tags">
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {NEWS_TAGS_OPTIONS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)}
                style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', background: tags.includes(t) ? 'rgba(200,146,42,.2)' : 'rgba(255,255,255,.04)', border: `1px solid ${tags.includes(t) ? 'var(--gold)' : 'var(--rule)'}`, color: tags.includes(t) ? 'var(--gold)' : 'var(--dim2)', padding: '.35rem .75rem', cursor: 'pointer', transition: 'all .15s' }}
              >{t}</button>
            ))}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ width: 14, height: 14 }} />
            Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', ...MONO, fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: 14, height: 14 }} />
            Featured
          </label>
        </div>

        <Field label="Content *">
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your full story here. Use the toolbar to format headings, add links, quotes…" />
        </Field>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', padding: '.875rem 1rem', ...MONO, fontSize: '0.75rem' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: '.75rem' }}>
          <button type="submit" disabled={loading} style={{ ...MONO, fontSize: '0.8125rem', letterSpacing: '.14em', textTransform: 'uppercase', background: loading ? 'rgba(200,146,42,.5)' : 'var(--gold)', color: 'var(--navy)', border: 'none', padding: '.625rem 1.75rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            {loading ? 'Saving…' : (post ? 'Update Post' : 'Publish Post')}
          </button>
          <button type="button" onClick={onDone} style={{ ...MONO, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule)', color: 'var(--dim)', padding: '.625rem 1.25rem', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* ── Contacts Tab ──────────────────────────────────────────────────────────── */
function ContactsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => adminAPI.getContacts().then(r => setContacts(r.data.contacts)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await adminAPI.updateContactStatus(id, status);
    setContacts(contacts.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contact request?')) return;
    await adminAPI.deleteContact(id);
    setContacts(contacts.filter(c => c.id !== id));
  };

  const statusColor: Record<string, string> = { new: 'var(--orange)', read: 'var(--gold)', replied: '#4ade80' };

  return (
    <div>
      <SectionHead>Contact Requests ({contacts.filter(c => c.status === 'new').length} new)</SectionHead>
      {loading ? (
        <div style={{ color: 'var(--dim2)', padding: '2rem', ...MONO, fontSize: '0.75rem' }}>Loading…</div>
      ) : contacts.length === 0 ? (
        <div style={{ color: 'var(--dim2)', padding: '3rem', textAlign: 'center', ...MONO, fontSize: '0.75rem', letterSpacing: '.15em', textTransform: 'uppercase' }}>No contact requests yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {contacts.map(c => (
            <div key={c.id} style={{ border: `1px solid ${c.status === 'new' ? 'rgba(232,98,26,.3)' : 'var(--rule2)'}`, background: c.status === 'new' ? 'rgba(232,98,26,.03)' : 'transparent', transition: 'border-color .2s' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.875rem 1rem', cursor: 'pointer', flexWrap: 'wrap' }}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                <div style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.1em', textTransform: 'uppercase', color: statusColor[c.status], minWidth: 52 }}>
                  {c.status === 'new' ? '● New' : c.status === 'read' ? '◉ Read' : '✓ Done'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--white)', fontWeight: 500 }}>{c.name}
                    <span style={{ ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', fontWeight: 400, marginLeft: '.5rem' }}>{c.email}</span>
                  </div>
                  <div style={{ ...MONO, fontSize: '0.75rem', color: 'var(--gold)', marginTop: 2 }}>{c.subject}</div>
                </div>
                <div style={{ ...MONO, fontSize: '0.625rem', color: 'var(--dim2)', whiteSpace: 'nowrap' }}>
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <span style={{ ...MONO, fontSize: '0.75rem', color: 'var(--dim2)' }}>{expanded === c.id ? '▲' : '▼'}</span>
              </div>

              {/* Expanded message */}
              {expanded === c.id && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--rule2)' }}>
                  <p style={{ color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem', marginTop: '.875rem', fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>{c.message}</p>
                  {c.phone && (
                    <div style={{ ...MONO, fontSize: '0.75rem', color: 'var(--dim2)', marginBottom: '.875rem' }}>Phone: {c.phone}</div>
                  )}
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {c.status !== 'read' && (
                      <button onClick={() => updateStatus(c.id, 'read')} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(200,146,42,.1)', border: '1px solid var(--rule)', color: 'var(--gold)', padding: '.35rem .875rem', cursor: 'pointer' }}>Mark Read</button>
                    )}
                    {c.status !== 'replied' && (
                      <button onClick={() => updateStatus(c.id, 'replied')} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', color: '#4ade80', padding: '.35rem .875rem', cursor: 'pointer' }}>Mark Replied</button>
                    )}
                    <a href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                      style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.25)', color: 'var(--orange)', padding: '.35rem .875rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                      Reply via Email
                    </a>
                    <button onClick={() => handleDelete(c.id)} style={{ ...MONO, fontSize: '0.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', padding: '.35rem .875rem', cursor: 'pointer', marginLeft: 'auto' }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
