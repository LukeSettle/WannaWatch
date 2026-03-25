const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "data", "wannawatch.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    username TEXT,
    providers TEXT
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_code TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    load_more_count INTEGER NOT NULL DEFAULT 0,
    finished_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    ready_at TEXT,
    finished_at TEXT,
    liked_movie_ids TEXT NOT NULL DEFAULT '[]',
    UNIQUE(game_id, user_id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS friendships (
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_likes (
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    genre_ids TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_game_players_game ON game_players(game_id);
  CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id);
`);

function rowUser(row) {
  if (!row) return null;
  let providers = [];
  if (row.providers) {
    try {
      providers = JSON.parse(row.providers);
    } catch {
      providers = [];
    }
  }
  return {
    id: row.id,
    device_id: row.device_id,
    username: row.username,
    providers,
  };
}

function hydrateGame(gameRow) {
  const players = db
    .prepare(
      `SELECT gp.*, u.id as uid, u.device_id, u.username, u.providers
       FROM game_players gp
       JOIN users u ON u.id = gp.user_id
       WHERE gp.game_id = ?
       ORDER BY gp.id`
    )
    .all(gameRow.id);

  return {
    id: gameRow.id,
    entry_code: gameRow.entry_code,
    user_id: gameRow.user_id,
    query: gameRow.query,
    load_more_count: gameRow.load_more_count,
    finished_at: gameRow.finished_at,
    players: players.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      game_id: p.game_id,
      ready_at: p.ready_at,
      finished_at: p.finished_at,
      liked_movie_ids: JSON.parse(p.liked_movie_ids || "[]"),
      user: rowUser({
        id: p.uid,
        device_id: p.device_id,
        username: p.username,
        providers: p.providers,
      }),
    })),
  };
}

function getGameById(id) {
  const row = db.prepare(`SELECT * FROM games WHERE id = ?`).get(id);
  return row ? hydrateGame(row) : null;
}

function getGameByEntryCode(code) {
  const row = db.prepare(`SELECT * FROM games WHERE entry_code = ?`).get(code);
  return row ? hydrateGame(row) : null;
}

module.exports = {
  db,
  rowUser,
  hydrateGame,
  getGameById,
  getGameByEntryCode,
};
