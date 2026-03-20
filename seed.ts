/**
 * seed.ts — Creates DB schema only.
 * No dummy data. No default admin.
 * Create your admin via: POST /api/auth/register (then promote via DB)
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/app/data/enn.db'
  : path.join(__dirname, 'data', 'enn.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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

console.log('✓ Database schema ready.');
db.close();
