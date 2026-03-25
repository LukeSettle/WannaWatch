const express = require("express");
const cors = require("cors");
const http = require("http");
const { db, rowUser, hydrateGame, getGameById, getGameByEntryCode } = require("./db");
const { attachWebSocket, broadcastToGame, broadcastGameIndexUpdate } = require("./ws");

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

function ensureFriendship(a, b) {
  if (a === b) return;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  db.prepare(
    `INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)`
  ).run(lo, hi);
}

function tasteProfile(userId) {
  const rows = db
    .prepare(
      `SELECT genre_ids FROM user_likes WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`
    )
    .all(userId);

  const counts = new Map();
  for (const row of rows) {
    let ids = [];
    try {
      ids = JSON.parse(row.genre_ids || "[]");
    } catch {
      ids = [];
    }
    for (const gid of ids) {
      counts.set(gid, (counts.get(gid) || 0) + 1);
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 8).map(([id]) => id);
  return { genreWeights: Object.fromEntries(sorted), topGenreIds: top };
}

app.post("/users/upsert", (req, res) => {
  const { device_id, username, providers } = req.body || {};
  if (!device_id) {
    return res.status(400).json({ error: "device_id required" });
  }

  const existing = db
    .prepare(`SELECT * FROM users WHERE device_id = ?`)
    .get(device_id);

  if (existing) {
    const providersJson =
      providers !== undefined
        ? JSON.stringify(Array.isArray(providers) ? providers : [])
        : existing.providers;
    const nextName = username !== undefined ? username : existing.username;
    db.prepare(
      `UPDATE users SET username = COALESCE(?, username), providers = COALESCE(?, providers) WHERE id = ?`
    ).run(nextName || null, providersJson, existing.id);
    const updated = db.prepare(`SELECT * FROM users WHERE id = ?`).get(existing.id);
    return res.json(rowUser(updated));
  }

  const providersJson = JSON.stringify(
    Array.isArray(providers) ? providers : []
  );
  const info = db
    .prepare(
      `INSERT INTO users (device_id, username, providers) VALUES (?, ?, ?)`
    ).run(device_id, username || null, providersJson);

  const created = db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid);
  res.json(rowUser(created));
});

app.get("/games", (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: "user_id required" });
  }

  const rows = db
    .prepare(
      `SELECT g.* FROM games g
       JOIN game_players gp ON gp.game_id = g.id
       WHERE gp.user_id = ?
       ORDER BY g.id DESC`
    )
    .all(userId);

  res.json(rows.map((r) => hydrateGame(r)));
});

app.get("/games/find_by_entry_code", (req, res) => {
  const code = req.query.entry_code;
  const userId = parseInt(req.query.user_id, 10);
  if (!code) {
    return res.status(400).json({ error: "entry_code required" });
  }

  const gameRow = db.prepare(`SELECT * FROM games WHERE entry_code = ?`).get(code);
  if (!gameRow) {
    return res.status(404).json({ error: "not found" });
  }

  if (Number.isFinite(userId)) {
    const already = db
      .prepare(`SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?`)
      .get(gameRow.id, userId);
    if (!already) {
      db.prepare(
        `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES (?, ?, '[]')`
      ).run(gameRow.id, userId);
      ensureFriendship(gameRow.user_id, userId);
      const host = gameRow.user_id;
      const fresh = getGameById(gameRow.id);
      broadcastToGame(gameRow.id, {
        type: "system",
        message: "Someone joined the game",
        game: JSON.stringify(fresh),
      });
      broadcastGameIndexUpdate(userId);
      broadcastGameIndexUpdate(host);
    }
  }

  const game = getGameById(gameRow.id);
  res.json(game);
});

app.post("/games/upsert", (req, res) => {
  const body = req.body || {};
  const nested = body.game;
  const payload = nested || body;

  const entry_code = payload.entry_code || nested?.entry_code;
  const user_id = payload.user_id ?? nested?.user_id;
  const query = payload.query ?? nested?.query;
  const players_attributes = payload.players_attributes || nested?.players_attributes;

  if (!entry_code || !user_id) {
    return res.status(400).json({ error: "entry_code and user_id required" });
  }

  const existingGame = db
    .prepare(`SELECT * FROM games WHERE entry_code = ?`)
    .get(entry_code);

  if (existingGame) {
    if (players_attributes && Array.isArray(players_attributes)) {
      for (const pa of players_attributes) {
        const uid = pa.user_id;
        if (!uid) continue;
        const exists = db
          .prepare(`SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?`)
          .get(existingGame.id, uid);
        if (!exists) {
          db.prepare(
            `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES (?, ?, '[]')`
          ).run(existingGame.id, uid);
          ensureFriendship(existingGame.user_id, uid);
        }
      }
    }

    if (query != null) {
      db.prepare(`UPDATE games SET query = ? WHERE id = ?`).run(query, existingGame.id);
    }

    const game = getGameById(existingGame.id);
    broadcastToGame(
      existingGame.id,
      {
        type: "system",
        message: "Game updated",
        game: JSON.stringify(game),
      }
    );
    for (const uid of db
      .prepare(`SELECT user_id FROM game_players WHERE game_id = ?`)
      .all(existingGame.id)
      .map((r) => r.user_id)) {
      broadcastGameIndexUpdate(uid);
    }
    return res.json(game);
  }

  if (!query) {
    return res.status(400).json({ error: "query required for new game" });
  }

  const info = db
    .prepare(
      `INSERT INTO games (entry_code, user_id, query, load_more_count) VALUES (?, ?, ?, 0)`
    )
    .run(entry_code, user_id, query);

  const gameId = info.lastInsertRowid;
  db.prepare(
    `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES (?, ?, '[]')`
  ).run(gameId, user_id);

  const game = getGameById(gameId);
  broadcastGameIndexUpdate(user_id);
  res.json(game);
});

app.post("/games/:id/finish", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const gameRow = db.prepare(`SELECT * FROM games WHERE id = ?`).get(id);
  if (!gameRow) {
    return res.status(404).json({ error: "not found" });
  }

  const userIds = db
    .prepare(`SELECT user_id FROM game_players WHERE game_id = ?`)
    .all(id)
    .map((r) => r.user_id);

  db.prepare(`DELETE FROM game_players WHERE game_id = ?`).run(id);
  db.prepare(`DELETE FROM games WHERE id = ?`).run(id);

  for (const uid of userIds) {
    broadcastGameIndexUpdate(uid);
  }

  res.json({ ok: true });
});

app.post("/games/keep_playing", (req, res) => {
  const { game_id, user_id } = req.body || {};
  const gid = parseInt(game_id, 10);
  const uid = parseInt(user_id, 10);
  if (!Number.isFinite(gid) || !Number.isFinite(uid)) {
    return res.status(400).json({ error: "game_id and user_id required" });
  }

  db.prepare(
    `UPDATE games SET finished_at = NULL, load_more_count = load_more_count + 1 WHERE id = ?`
  ).run(gid);
  db.prepare(
    `UPDATE game_players SET ready_at = NULL, finished_at = NULL, liked_movie_ids = '[]' WHERE game_id = ?`
  ).run(gid);

  const game = getGameById(gid);
  broadcastToGame(
    gid,
    {
      type: "system",
      message: "Keep playing — new round",
      game: JSON.stringify(game),
    }
  );
  for (const row of db
    .prepare(`SELECT user_id FROM game_players WHERE game_id = ?`)
    .all(gid)) {
    broadcastGameIndexUpdate(row.user_id);
  }

  res.json(game);
});

app.get("/friends/index", (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: "user_id required" });
  }

  const friends = db
    .prepare(
      `SELECT u.* FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
       WHERE f.user_id = ? OR f.friend_id = ?`
    )
    .all(userId, userId, userId);

  res.json(friends.map(rowUser));
});

app.get("/friends/movie_ids", (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  const friendId = parseInt(req.query.friend_id, 10);
  if (!Number.isFinite(userId) || !Number.isFinite(friendId)) {
    return res.status(400).json({ error: "user_id and friend_id required" });
  }

  const myLikes = db
    .prepare(`SELECT movie_id FROM user_likes WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId)
    .map((r) => r.movie_id);

  if (userId === friendId) {
    return res.json({
      myLikedMovieIds: myLikes,
      friendsLikedMovieIds: [],
      ourLikedMovieIds: myLikes,
    });
  }

  const friendLikes = db
    .prepare(`SELECT movie_id FROM user_likes WHERE user_id = ? ORDER BY created_at DESC`)
    .all(friendId)
    .map((r) => r.movie_id);

  const friendSet = new Set(friendLikes);
  const ourLikedMovieIds = myLikes.filter((id) => friendSet.has(id));

  res.json({
    myLikedMovieIds: myLikes,
    friendsLikedMovieIds: friendLikes,
    ourLikedMovieIds,
  });
});

app.get("/users/:id/taste", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: "invalid id" });
  }
  res.json(tasteProfile(userId));
});

const server = http.createServer(app);
attachWebSocket(server);

server.listen(PORT, () => {
  console.log(`WannaWatch API listening on http://localhost:${PORT}`);
});
