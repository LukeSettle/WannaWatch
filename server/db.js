const { Pool } = require("pg");

function buildPoolConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required (set it to your Render Postgres connection string)."
    );
  }
  const needsSsl =
    connectionString.includes("sslmode=require") ||
    connectionString.includes("render.com") ||
    process.env.PGSSL === "1";
  return {
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  };
}

const pool = new Pool(buildPoolConfig());

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      device_id TEXT UNIQUE NOT NULL,
      username TEXT,
      providers TEXT
    );

    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      entry_code TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      query TEXT NOT NULL,
      load_more_count INTEGER NOT NULL DEFAULT 0,
      finished_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS game_players (
      id SERIAL PRIMARY KEY,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      ready_at TIMESTAMPTZ,
      finished_at TIMESTAMPTZ,
      liked_movie_ids TEXT NOT NULL DEFAULT '[]',
      UNIQUE(game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS friendships (
      user_id INTEGER NOT NULL REFERENCES users(id),
      friend_id INTEGER NOT NULL REFERENCES users(id),
      PRIMARY KEY (user_id, friend_id),
      CHECK (user_id < friend_id)
    );

    CREATE TABLE IF NOT EXISTS user_likes (
      user_id INTEGER NOT NULL REFERENCES users(id),
      movie_id INTEGER NOT NULL,
      genre_ids TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, movie_id)
    );

    CREATE INDEX IF NOT EXISTS idx_game_players_game ON game_players(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id);
  `);
}

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

async function hydrateGame(gameRow) {
  const { rows: players } = await pool.query(
    `SELECT gp.*, u.id AS uid, u.device_id, u.username, u.providers
     FROM game_players gp
     JOIN users u ON u.id = gp.user_id
     WHERE gp.game_id = $1
     ORDER BY gp.id`,
    [gameRow.id]
  );

  const ts = (v) =>
    v ? (v instanceof Date ? v.toISOString() : v) : null;

  return {
    id: gameRow.id,
    entry_code: gameRow.entry_code,
    user_id: gameRow.user_id,
    query: gameRow.query,
    load_more_count: Number(gameRow.load_more_count) || 0,
    finished_at: ts(gameRow.finished_at),
    players: players.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      game_id: p.game_id,
      ready_at: ts(p.ready_at),
      finished_at: ts(p.finished_at),
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

async function getGameById(id) {
  const { rows } = await pool.query(`SELECT * FROM games WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  return hydrateGame(rows[0]);
}

async function getGameByEntryCode(code) {
  const { rows } = await pool.query(`SELECT * FROM games WHERE entry_code = $1`, [code]);
  if (!rows[0]) return null;
  return hydrateGame(rows[0]);
}

module.exports = {
  pool,
  initDb,
  rowUser,
  hydrateGame,
  getGameById,
  getGameByEntryCode,
};
