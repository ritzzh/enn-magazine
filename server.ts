import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'enn_dev_secret_change_in_prod';
const PORT = process.env.PORT || 5174;

// In production (Docker) store DB in /app/data so it persists via volume mount.
// In dev keep it in the project root for convenience.
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/app/data/enn.db'
  : path.join(__dirname, 'data', 'enn.db');

const UPLOADS_DIR = process.env.NODE_ENV === 'production'
  ? '/app/uploads'
  : path.join(__dirname, 'uploads');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, 'covers'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, 'pdfs'), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Request logger ────────────────────────────────────────────────────────────
const LOG_COLORS: Record<string, string> = {
  GET: '\x1b[32m', POST: '\x1b[34m', PUT: '\x1b[33m',
  PATCH: '\x1b[35m', DELETE: '\x1b[31m',
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = LOG_COLORS[method] || '';
    const sc = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${DIM}${new Date().toISOString()}${RESET} ` +
      `${color}${method.padEnd(6)}${RESET} ` +
      `${originalUrl.padEnd(45)} ` +
      `${sc}${res.statusCode}${RESET} ${DIM}${ms}ms${RESET}`
    );
  });
  next();
}

// ── Database schema ───────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS magazines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    release_date TEXT,
    cover_image TEXT,
    pdf_file TEXT,
    cover_gradient TEXT DEFAULT 'linear-gradient(160deg,#0C1535 0%,#0A1530 100%)',
    is_featured INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magazine_id INTEGER NOT NULL,
    user_id INTEGER,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    ip_address TEXT,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (magazine_id) REFERENCES magazines(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magazine_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(magazine_id, user_id),
    FOREIGN KEY (magazine_id) REFERENCES magazines(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magazine_id INTEGER NOT NULL,
    user_id INTEGER,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (magazine_id) REFERENCES magazines(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  );

  CREATE TABLE IF NOT EXISTS comment_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER,
    guest_fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id)
  );

  CREATE TABLE IF NOT EXISTS news_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    tags TEXT DEFAULT '',
    author_id INTEGER,
    author_name TEXT DEFAULT 'ENN Editorial',
    is_published INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS news_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    news_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(news_id, user_id),
    FOREIGN KEY (news_id) REFERENCES news_posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS news_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    news_id INTEGER NOT NULL,
    user_id INTEGER,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news_posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES news_comments(id)
  );

  CREATE TABLE IF NOT EXISTS news_comment_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER,
    guest_fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES news_comments(id)
  );

  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Auth middleware ────────────────────────────────────────────────────────────
interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; name: string };
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET) as any; } catch {}
  }
  next();
}

function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ── File uploads ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'pdf'
      ? path.join(UPLOADS_DIR, 'pdfs')
      : path.join(UPLOADS_DIR, 'covers');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf')
      return cb(new Error('Only PDFs allowed'));
    if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/'))
      return cb(new Error('Only images allowed for cover'));
    cb(null, true);
  },
});

async function startServer() {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ── Auth routes ──────────────────────────────────────────────────────────────
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)'
    ).run(name, email, phone || null, hash);

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?')
      .get(result.lastInsertRowid) as any;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res
      .cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' })
      .json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res
      .cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' })
      .json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie('token').json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
    const user = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?')
      .get(req.user!.id) as any;
    res.json(user);
  });

  // ── Magazine routes ──────────────────────────────────────────────────────────
  app.get('/api/magazines', optionalAuth, (req: AuthRequest, res: Response) => {
    const { year, category } = req.query;
    let query = 'SELECT * FROM magazines WHERE is_published = 1';
    const params: any[] = [];
    if (year) { query += ' AND year = ?'; params.push(year); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY year DESC, release_date DESC, id DESC';

    const magazines = db.prepare(query).all(...params) as any[];
    const result = magazines.map(mag => {
      let userLiked = false;
      if (req.user) {
        userLiked = !!db.prepare('SELECT id FROM likes WHERE magazine_id = ? AND user_id = ?')
          .get(mag.id, req.user!.id);
      }
      return { ...mag, userLiked };
    });
    res.json({ magazines: result });
  });

  app.get('/api/magazines/:id', optionalAuth, (req: AuthRequest, res: Response) => {
    const mag = db.prepare('SELECT * FROM magazines WHERE id = ? AND is_published = 1')
      .get(req.params.id) as any;
    if (!mag) return res.status(404).json({ error: 'Not found' });

    let userLiked = false;
    if (req.user) {
      userLiked = !!db.prepare('SELECT id FROM likes WHERE magazine_id = ? AND user_id = ?')
        .get(mag.id, req.user!.id);
    }

    const comments = db.prepare(`
      SELECT c.*, u.name as user_name
      FROM comments c LEFT JOIN users u ON c.user_id = u.id
      WHERE c.magazine_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `).all(mag.id) as any[];

    const commentsWithReplies = comments.map(c => ({
      ...c,
      replies: db.prepare(`
        SELECT c.*, u.name as user_name FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ? ORDER BY c.created_at ASC
      `).all(c.id),
    }));

    res.json({ ...mag, userLiked, comments: commentsWithReplies });
  });

  app.post('/api/magazines/:id/download', optionalAuth, (req: AuthRequest, res: Response) => {
    const mag = db.prepare('SELECT * FROM magazines WHERE id = ? AND is_published = 1')
      .get(req.params.id) as any;
    if (!mag) return res.status(404).json({ error: 'Not found' });
    if (!mag.pdf_file) return res.status(400).json({ error: 'No PDF available for this issue yet' });

    const { name, email, phone } = req.body;
    if (!req.user && (!name || !email))
      return res.status(400).json({ error: 'Name and email are required to download' });

    db.prepare(`
      INSERT INTO downloads (magazine_id, user_id, guest_name, guest_email, guest_phone, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      mag.id, req.user?.id || null,
      req.user ? null : name, req.user ? null : email,
      phone || null, req.ip
    );
    db.prepare('UPDATE magazines SET download_count = download_count + 1 WHERE id = ?').run(mag.id);

    res.json({
      downloadUrl: `/uploads/pdfs/${mag.pdf_file}`,
      fileName: `ENN-${mag.month}-${mag.year}.pdf`,
    });
  });

  app.post('/api/magazines/:id/like', authenticate, (req: AuthRequest, res: Response) => {
    const magId = req.params.id;
    const userId = req.user!.id;
    const existing = db.prepare('SELECT id FROM likes WHERE magazine_id = ? AND user_id = ?')
      .get(magId, userId);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE magazine_id = ? AND user_id = ?').run(magId, userId);
      db.prepare('UPDATE magazines SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(magId);
    } else {
      db.prepare('INSERT INTO likes (magazine_id, user_id) VALUES (?, ?)').run(magId, userId);
      db.prepare('UPDATE magazines SET like_count = like_count + 1 WHERE id = ?').run(magId);
    }
    const mag = db.prepare('SELECT like_count FROM magazines WHERE id = ?').get(magId) as any;
    res.json({ liked: !existing, likeCount: mag.like_count });
  });

  // Comments — anonymous allowed
  app.post('/api/magazines/:id/comments', optionalAuth, (req: AuthRequest, res: Response) => {
    const { content, author_name, parent_id } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

    const displayName = req.user
      ? req.user.name
      : (author_name?.trim() || 'Anonymous');

    const result = db.prepare(`
      INSERT INTO comments (magazine_id, user_id, author_name, content, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, req.user?.id || null, displayName, content.trim(), parent_id || null);

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
    res.json({ comment });
  });

  app.post('/api/comments/:id/upvote', optionalAuth, (req: AuthRequest, res: Response) => {
    const commentId = req.params.id;
    const fp = req.user ? `user_${req.user.id}` : req.ip;
    const existing = db.prepare(
      'SELECT id FROM comment_upvotes WHERE comment_id = ? AND (user_id = ? OR guest_fingerprint = ?)'
    ).get(commentId, req.user?.id || null, fp);

    if (existing) return res.status(409).json({ error: 'Already upvoted' });
    db.prepare('INSERT INTO comment_upvotes (comment_id, user_id, guest_fingerprint) VALUES (?, ?, ?)')
      .run(commentId, req.user?.id || null, req.user ? null : fp);
    db.prepare('UPDATE comments SET upvotes = upvotes + 1 WHERE id = ?').run(commentId);

    const comment = db.prepare('SELECT upvotes FROM comments WHERE id = ?').get(commentId) as any;
    res.json({ upvotes: comment.upvotes });
  });

  // ── Admin routes ─────────────────────────────────────────────────────────────
  app.get('/api/admin/dashboard', authenticate, adminOnly, (req: AuthRequest, res: Response) => {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const totalDownloads = (db.prepare('SELECT COUNT(*) as c FROM downloads').get() as any).c;
    const totalMagazines = (db.prepare('SELECT COUNT(*) as c FROM magazines').get() as any).c;
    const totalLikes = (db.prepare('SELECT COALESCE(SUM(like_count),0) as c FROM magazines').get() as any).c;
    const totalComments = (db.prepare('SELECT COUNT(*) as c FROM comments').get() as any).c;
    const totalNewsPosts = (db.prepare('SELECT COUNT(*) as c FROM news_posts').get() as any).c;
    const newContactRequests = (db.prepare("SELECT COUNT(*) as c FROM contact_requests WHERE status = 'new'").get() as any).c;

    const recentDownloads = db.prepare(`
      SELECT d.*, m.title as magazine_title, m.month, m.year
      FROM downloads d LEFT JOIN magazines m ON d.magazine_id = m.id
      ORDER BY d.downloaded_at DESC LIMIT 20
    `).all();

    const popularMagazines = db.prepare(`
      SELECT id, title, month, year, download_count, like_count
      FROM magazines ORDER BY download_count DESC LIMIT 5
    `).all();

    const recentUsers = db.prepare(`
      SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10
    `).all();

    res.json({ totalUsers, totalDownloads, totalMagazines, totalLikes, totalComments, totalNewsPosts, newContactRequests, recentDownloads, popularMagazines, recentUsers });
  });

  app.get('/api/admin/magazines', authenticate, adminOnly, (_req, res) => {
    res.json({ magazines: db.prepare('SELECT * FROM magazines ORDER BY created_at DESC').all() });
  });

  app.post('/api/admin/magazines', authenticate, adminOnly,
    upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
    (req: AuthRequest, res: Response) => {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const { title, headline, description, category, month, year, release_date, cover_gradient, is_featured, is_published } = req.body;
      if (!title || !headline || !month || !year)
        return res.status(400).json({ error: 'Title, headline, month and year are required' });

      const result = db.prepare(`
        INSERT INTO magazines (title, headline, description, category, month, year, release_date, cover_image, pdf_file, cover_gradient, is_featured, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title, headline, description || '', category || 'General',
        month, parseInt(year), release_date || null,
        files?.cover?.[0]?.filename || null,
        files?.pdf?.[0]?.filename || null,
        cover_gradient || 'linear-gradient(160deg,#0C1535 0%,#0A1530 100%)',
        is_featured === 'true' ? 1 : 0,
        is_published === 'false' ? 0 : 1,
      );
      res.json({ magazine: db.prepare('SELECT * FROM magazines WHERE id = ?').get(result.lastInsertRowid) });
    }
  );

  app.put('/api/admin/magazines/:id', authenticate, adminOnly,
    upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
    (req: AuthRequest, res: Response) => {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const existing = db.prepare('SELECT * FROM magazines WHERE id = ?').get(req.params.id) as any;
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const { title, headline, description, category, month, year, release_date, cover_gradient, is_featured, is_published } = req.body;
      db.prepare(`
        UPDATE magazines SET title=?,headline=?,description=?,category=?,month=?,year=?,
          release_date=?,cover_image=?,pdf_file=?,cover_gradient=?,is_featured=?,is_published=?
        WHERE id=?
      `).run(
        title || existing.title, headline || existing.headline,
        description ?? existing.description, category || existing.category,
        month || existing.month, year ? parseInt(year) : existing.year,
        release_date || existing.release_date,
        files?.cover?.[0]?.filename || existing.cover_image,
        files?.pdf?.[0]?.filename || existing.pdf_file,
        cover_gradient || existing.cover_gradient,
        is_featured !== undefined ? (is_featured === 'true' ? 1 : 0) : existing.is_featured,
        is_published !== undefined ? (is_published === 'true' ? 1 : 0) : existing.is_published,
        req.params.id,
      );
      res.json({ magazine: db.prepare('SELECT * FROM magazines WHERE id = ?').get(req.params.id) });
    }
  );

  app.delete('/api/admin/magazines/:id', authenticate, adminOnly, (req: AuthRequest, res: Response) => {
    const mag = db.prepare('SELECT * FROM magazines WHERE id = ?').get(req.params.id) as any;
    if (!mag) return res.status(404).json({ error: 'Not found' });
    if (mag.cover_image) try { fs.unlinkSync(path.join(UPLOADS_DIR, 'covers', mag.cover_image)); } catch {}
    if (mag.pdf_file) try { fs.unlinkSync(path.join(UPLOADS_DIR, 'pdfs', mag.pdf_file)); } catch {}
    db.prepare('DELETE FROM magazines WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/users', authenticate, adminOnly, (_req, res) => {
    res.json({ users: db.prepare('SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC').all() });
  });

  app.patch('/api/admin/users/:id/role', authenticate, adminOnly, (req: Request, res: Response) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/downloads', authenticate, adminOnly, (_req, res) => {
    const downloads = db.prepare(`
      SELECT d.*, m.title, m.month, m.year, u.name as user_name
      FROM downloads d
      LEFT JOIN magazines m ON d.magazine_id = m.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.downloaded_at DESC LIMIT 100
    `).all();
    res.json({ downloads });
  });


  // ── Contact routes ─────────────────────────────────────────────────────────
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'Name, email, subject and message are required' });
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    db.prepare(
      'INSERT INTO contact_requests (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name.trim(), email.trim(), phone?.trim() || null, subject.trim(), message.trim());
    res.json({ success: true });
  });

  // ── News public routes ──────────────────────────────────────────────────────
  app.get('/api/news', optionalAuth, (req: AuthRequest, res: Response) => {
    const { tag, search, featured } = req.query;
    let query = 'SELECT * FROM news_posts WHERE is_published = 1';
    const params: any[] = [];
    if (tag) { query += ' AND (tags LIKE ? OR tags LIKE ? OR tags LIKE ? OR tags = ?)'; const t = tag as string; params.push(`%,${t},%`, `${t},%`, `%,${t}`, t); }
    if (search) { query += ' AND (title LIKE ? OR excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (featured === '1') { query += ' AND is_featured = 1'; }
    query += ' ORDER BY created_at DESC';
    const posts = db.prepare(query).all(...params) as any[];
    const result = posts.map(p => {
      let userLiked = false;
      if (req.user) { userLiked = !!db.prepare('SELECT id FROM news_likes WHERE news_id = ? AND user_id = ?').get(p.id, req.user!.id); }
      return { ...p, tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [], userLiked };
    });
    res.json({ posts: result });
  });

  app.get('/api/news/:slug', optionalAuth, (req: AuthRequest, res: Response) => {
    const post = db.prepare('SELECT * FROM news_posts WHERE (slug = ? OR id = ?) AND is_published = 1')
      .get(req.params.slug, req.params.slug) as any;
    if (!post) return res.status(404).json({ error: 'Not found' });
    let userLiked = false;
    if (req.user) { userLiked = !!db.prepare('SELECT id FROM news_likes WHERE news_id = ? AND user_id = ?').get(post.id, req.user!.id); }
    const comments = db.prepare('SELECT c.*, u.name as user_name FROM news_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.news_id = ? AND c.parent_id IS NULL ORDER BY c.created_at DESC').all(post.id) as any[];
    const commentsWithReplies = comments.map(c => ({ ...c, replies: db.prepare('SELECT c.*, u.name as user_name FROM news_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.parent_id = ? ORDER BY c.created_at ASC').all(c.id) }));
    res.json({ ...post, tags: post.tags ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [], userLiked, comments: commentsWithReplies });
  });

  app.post('/api/news/:id/like', authenticate, (req: AuthRequest, res: Response) => {
    const postId = req.params.id; const userId = req.user!.id;
    const existing = db.prepare('SELECT id FROM news_likes WHERE news_id = ? AND user_id = ?').get(postId, userId);
    if (existing) {
      db.prepare('DELETE FROM news_likes WHERE news_id = ? AND user_id = ?').run(postId, userId);
      db.prepare('UPDATE news_posts SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(postId);
    } else {
      db.prepare('INSERT INTO news_likes (news_id, user_id) VALUES (?, ?)').run(postId, userId);
      db.prepare('UPDATE news_posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
    }
    const post = db.prepare('SELECT like_count FROM news_posts WHERE id = ?').get(postId) as any;
    res.json({ liked: !existing, likeCount: post.like_count });
  });

  app.post('/api/news/:id/comments', optionalAuth, (req: AuthRequest, res: Response) => {
    const { content, author_name, parent_id } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    const displayName = req.user ? req.user.name : (author_name?.trim() || 'Anonymous');
    const result = db.prepare('INSERT INTO news_comments (news_id, user_id, author_name, content, parent_id) VALUES (?, ?, ?, ?, ?)').run(req.params.id, req.user?.id || null, displayName, content.trim(), parent_id || null);
    db.prepare('UPDATE news_posts SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.id);
    const comment = db.prepare('SELECT * FROM news_comments WHERE id = ?').get(result.lastInsertRowid);
    res.json({ comment });
  });

  app.post('/api/news-comments/:id/upvote', optionalAuth, (req: AuthRequest, res: Response) => {
    const commentId = req.params.id; const fp = req.user ? `user_${req.user.id}` : req.ip;
    const existing = db.prepare('SELECT id FROM news_comment_upvotes WHERE comment_id = ? AND (user_id = ? OR guest_fingerprint = ?)').get(commentId, req.user?.id || null, fp);
    if (existing) return res.status(409).json({ error: 'Already upvoted' });
    db.prepare('INSERT INTO news_comment_upvotes (comment_id, user_id, guest_fingerprint) VALUES (?, ?, ?)').run(commentId, req.user?.id || null, req.user ? null : fp);
    db.prepare('UPDATE news_comments SET upvotes = upvotes + 1 WHERE id = ?').run(commentId);
    const comment = db.prepare('SELECT upvotes FROM news_comments WHERE id = ?').get(commentId) as any;
    res.json({ upvotes: comment.upvotes });
  });

  // ── Admin: News routes ──────────────────────────────────────────────────────
  app.get('/api/admin/news', authenticate, adminOnly, (_req, res) => {
    res.json({ posts: db.prepare('SELECT * FROM news_posts ORDER BY created_at DESC').all() });
  });

  app.post('/api/admin/news', authenticate, adminOnly,
    upload.fields([{ name: 'cover', maxCount: 1 }]),
    (req: AuthRequest, res: Response) => {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const { title, content, excerpt, tags, is_published, is_featured } = req.body;
      if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const result = db.prepare('INSERT INTO news_posts (title, slug, content, excerpt, cover_image, tags, author_id, author_name, is_published, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        title, slug, content, excerpt || '', files?.cover?.[0]?.filename || null,
        tags || '', req.user!.id, req.user!.name,
        is_published === 'false' ? 0 : 1, is_featured === 'true' ? 1 : 0
      );
      res.json({ post: db.prepare('SELECT * FROM news_posts WHERE id = ?').get(result.lastInsertRowid) });
    }
  );

  app.put('/api/admin/news/:id', authenticate, adminOnly,
    upload.fields([{ name: 'cover', maxCount: 1 }]),
    (req: AuthRequest, res: Response) => {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const existing = db.prepare('SELECT * FROM news_posts WHERE id = ?').get(req.params.id) as any;
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const { title, content, excerpt, tags, is_published, is_featured } = req.body;
      db.prepare('UPDATE news_posts SET title=?,content=?,excerpt=?,cover_image=?,tags=?,is_published=?,is_featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(
        title || existing.title, content || existing.content, excerpt ?? existing.excerpt,
        files?.cover?.[0]?.filename || existing.cover_image, tags ?? existing.tags,
        is_published !== undefined ? (is_published === 'true' ? 1 : 0) : existing.is_published,
        is_featured !== undefined ? (is_featured === 'true' ? 1 : 0) : existing.is_featured,
        req.params.id
      );
      res.json({ post: db.prepare('SELECT * FROM news_posts WHERE id = ?').get(req.params.id) });
    }
  );

  app.delete('/api/admin/news/:id', authenticate, adminOnly, (req: AuthRequest, res: Response) => {
    const post = db.prepare('SELECT * FROM news_posts WHERE id = ?').get(req.params.id) as any;
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.cover_image) try { fs.unlinkSync(path.join(UPLOADS_DIR, 'covers', post.cover_image)); } catch {}
    db.prepare('DELETE FROM news_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // ── Admin: Contact routes ───────────────────────────────────────────────────
  app.get('/api/admin/contacts', authenticate, adminOnly, (_req, res) => {
    res.json({ contacts: db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC').all() });
  });

  app.patch('/api/admin/contacts/:id/status', authenticate, adminOnly, (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    db.prepare('UPDATE contact_requests SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/contacts/:id', authenticate, adminOnly, (req: Request, res: Response) => {
    db.prepare('DELETE FROM contact_requests WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

  // ── Vite middleware (dev) / static files (prod) ───────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m✓\x1b[0m ENN Magazine server running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`  DB       → ${DB_PATH}`);
    console.log(`  Uploads  → ${UPLOADS_DIR}`);
    console.log(`  Mode     → ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
