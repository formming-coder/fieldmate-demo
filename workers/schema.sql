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

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS property_photos (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS property_history (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS shared_properties (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  shared_with TEXT NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view',
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, key)
);

CREATE TABLE IF NOT EXISTS property_versions (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_history_property_id ON property_history(property_id);
CREATE INDEX IF NOT EXISTS idx_property_versions_property_id ON property_versions(property_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
