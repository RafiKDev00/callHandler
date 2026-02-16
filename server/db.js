import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'callhandler.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transcript TEXT NOT NULL,
    intent TEXT,
    name TEXT,
    dob TEXT,
    phone TEXT,
    summary TEXT,
    urgency TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_phone ON calls(phone);
  CREATE INDEX IF NOT EXISTS idx_name ON calls(name);
  CREATE INDEX IF NOT EXISTS idx_created_at ON calls(created_at);
`);

// Save a new call record
export function saveCall(data) {
  const stmt = db.prepare(`
    INSERT INTO calls (transcript, intent, name, dob, phone, summary, urgency)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.transcript,
    data.intent,
    data.name,
    data.dob,
    data.phone,
    data.summary,
    data.urgency
  );

  return result.lastInsertRowid;
}

// Find previous calls by phone number
export function findByPhone(phone) {
  if (!phone) return [];
  const stmt = db.prepare(`
    SELECT * FROM calls
    WHERE phone = ?
    ORDER BY created_at DESC
    LIMIT 10
  `);
  return stmt.all(phone);
}

// Find previous calls by name (fuzzy match)
export function findByName(name) {
  if (!name) return [];
  const stmt = db.prepare(`
    SELECT * FROM calls
    WHERE LOWER(name) LIKE LOWER(?)
    ORDER BY created_at DESC
    LIMIT 10
  `);
  return stmt.all(`%${name}%`);
}

// Get recent calls (for history view)
export function getRecentCalls(limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM calls
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

// Get call statistics for pattern detection
export function getCallerStats(phone, name, hoursBack = 72) {
  const stats = {
    phoneMatches: [],
    nameMatches: [],
    recentCallCount: 0,
    urgentCallCount: 0,
    sameIntentCount: 0
  };

  if (phone) {
    const phoneStmt = db.prepare(`
      SELECT * FROM calls
      WHERE phone = ?
      AND created_at > datetime('now', ?)
      ORDER BY created_at DESC
    `);
    stats.phoneMatches = phoneStmt.all(phone, `-${hoursBack} hours`);
  }

  if (name) {
    const nameStmt = db.prepare(`
      SELECT * FROM calls
      WHERE LOWER(name) LIKE LOWER(?)
      AND created_at > datetime('now', ?)
      ORDER BY created_at DESC
    `);
    stats.nameMatches = nameStmt.all(`%${name}%`, `-${hoursBack} hours`);
  }

  // Combine and dedupe matches
  const allMatches = [...stats.phoneMatches];
  stats.nameMatches.forEach(nm => {
    if (!allMatches.find(pm => pm.id === nm.id)) {
      allMatches.push(nm);
    }
  });

  stats.recentCallCount = allMatches.length;
  stats.urgentCallCount = allMatches.filter(c => c.urgency === 'high').length;

  return stats;
}

// Get a single call by ID
export function getCallById(id) {
  const stmt = db.prepare('SELECT * FROM calls WHERE id = ?');
  return stmt.get(id);
}

// Search calls by name or phone
export function searchCalls(query) {
  if (!query) return [];
  const stmt = db.prepare(`
    SELECT * FROM calls
    WHERE LOWER(name) LIKE LOWER(?)
    OR phone LIKE ?
    ORDER BY created_at DESC
    LIMIT 100
  `);
  return stmt.all(`%${query}%`, `%${query}%`);
}

export default db;
