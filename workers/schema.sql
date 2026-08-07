CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  market_price REAL NOT NULL,
  appraisal_price REAL NOT NULL,
  status TEXT NOT NULL,
  type TEXT,
  last_inspection TEXT NOT NULL,
  images TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  property_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS officers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  avatar TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  recommendation REAL NOT NULL,
  score REAL NOT NULL,
  note TEXT NOT NULL,
  checklist TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT,
  created_at TEXT NOT NULL
);
