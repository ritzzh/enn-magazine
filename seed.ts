/**
 * seed.ts — Populate the database with sample data.
 * Safe to run multiple times (checks before inserting).
 * Usage: npx tsx seed.ts
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
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
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magazine_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(magazine_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magazine_id INTEGER NOT NULL,
    user_id INTEGER,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS comment_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER,
    guest_fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Admin user
const existingAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@enn.com'").get();
if (!existingAdmin) {
  db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run('ENN Admin', 'admin@enn.com', bcrypt.hashSync('admin123', 10));
  console.log('✅ Admin created: admin@enn.com / admin123  ← change this!');
} else {
  console.log('ℹ️  Admin already exists, skipping.');
}

// Sample magazines
const count = (db.prepare('SELECT COUNT(*) as c FROM magazines').get() as any).c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO magazines (title, headline, description, category, month, year, release_date, cover_gradient, is_featured, is_published, download_count, like_count)
    VALUES (@title, @headline, @description, @category, @month, @year, @release_date, @cover_gradient, @is_featured, @is_published, @download_count, @like_count)
  `);

  const magazines = [
    {
      title: 'ENN March 2026', headline: "The Founder's Playbook: Building Resilient Startups in Uncertain Times",
      description: "This month we dive deep into the strategies India's most resilient founders use to navigate uncertainty — from funding droughts to market pivots.",
      category: 'Strategy', month: 'March', year: 2026, release_date: '2026-03-01',
      cover_gradient: 'linear-gradient(160deg,#0C1535 0%,#1a0a2e 50%,#0A1530 100%)',
      is_featured: 1, is_published: 1, download_count: 142, like_count: 38,
    },
    {
      title: 'ENN February 2026', headline: 'Bootstrapped to ₹100Cr: The Quiet Revolution in Indian SaaS',
      description: 'How a new generation of founders is building profitable bootstrapped SaaS companies — without VC funding, without compromise.',
      category: 'Founder Profile', month: 'February', year: 2026, release_date: '2026-02-01',
      cover_gradient: 'linear-gradient(160deg,#0A1128 0%,#1A0C35 100%)',
      is_featured: 0, is_published: 1, download_count: 289, like_count: 74,
    },
    {
      title: 'ENN January 2026', headline: "The D2C Disruption: India's Consumer Brands Writing New Rules",
      description: "From Mamaearth to the next wave — how direct-to-consumer brands are rewriting the retail playbook across Bharat.",
      category: 'Sector X-Ray', month: 'January', year: 2026, release_date: '2026-01-01',
      cover_gradient: 'linear-gradient(135deg,#0C1535 0%,#1a1208 50%,#0A1530 100%)',
      is_featured: 0, is_published: 1, download_count: 412, like_count: 91,
    },
    {
      title: 'ENN December 2025', headline: "2025 in Review: The Founders Who Shaped India's Startup Decade",
      description: 'A retrospective on breakout founders, landmark exits, and defining moments that made 2025 the most important year for Indian entrepreneurship.',
      category: 'Community', month: 'December', year: 2025, release_date: '2025-12-01',
      cover_gradient: 'linear-gradient(160deg,#050A1A 0%,#0C1535 50%,#1a0808 100%)',
      is_featured: 0, is_published: 1, download_count: 567, like_count: 128,
    },
    {
      title: 'ENN November 2025', headline: 'AI-First Startups: The Indian Playbook for the Age of Intelligence',
      description: 'What does it really mean to build AI-native? We talk to 12 founders shipping AI products that actually work for Indian customers.',
      category: 'Strategy', month: 'November', year: 2025, release_date: '2025-11-01',
      cover_gradient: 'linear-gradient(160deg,#0C1535 0%,#080F26 80%,#0A1530 100%)',
      is_featured: 0, is_published: 1, download_count: 388, like_count: 86,
    },
    {
      title: 'ENN October 2025', headline: "The Climate Tech Moment: Where India's Green Founders Are Betting Big",
      description: "From EV charging networks to agri-tech, India's climate founders are building at scale. We map the opportunity and the real challenges ahead.",
      category: 'Sector X-Ray', month: 'October', year: 2025, release_date: '2025-10-01',
      cover_gradient: 'linear-gradient(160deg,#0A1128 0%,#0a1a10 100%)',
      is_featured: 0, is_published: 1, download_count: 301, like_count: 67,
    },
  ];

  for (const mag of magazines) insert.run(mag);

  const first = db.prepare('SELECT id FROM magazines WHERE is_featured = 1 LIMIT 1').get() as any;
  if (first) {
    const comments = [
      { name: 'Priya Mehta', text: 'Absolutely loved this issue. The resilience frameworks section was immediately bookmarked. Practical, not preachy.' },
      { name: 'Rohan Kapoor', text: 'The founder interviews were raw and honest — exactly what the ecosystem needs more of.' },
      { name: 'Anonymous', text: 'Downloaded and read it in one sitting on a flight. Great curation this month.' },
    ];
    for (const c of comments) {
      db.prepare('INSERT INTO comments (magazine_id, author_name, content, upvotes) VALUES (?, ?, ?, ?)')
        .run(first.id, c.name, c.text, Math.floor(Math.random() * 12));
    }
  }
  console.log('✅ 6 sample magazines + comments seeded');
} else {
  console.log(`ℹ️  ${count} magazines already exist, skipping seed.`);
}

console.log('🚀 Seed complete.');
db.close();
