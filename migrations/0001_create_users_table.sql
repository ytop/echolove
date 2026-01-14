-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  email_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
