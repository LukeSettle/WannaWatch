const express = require("express");
const cors = require("cors");
const http = require("http");
const { pool, initDb, rowUser, hydrateGame, getGameById } = require("./db");
const { attachWebSocket, broadcastToGame, broadcastGameIndexUpdate } = require("./ws");

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

async function ensureFriendship(a, b) {
  if (a === b) return;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  await pool.query(
    `INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)
     ON CONFLICT (user_id, friend_id) DO NOTHING`,
    [lo, hi]
  );
}

async function tasteProfile(userId) {
  const { rows } = await pool.query(
    `SELECT genre_ids FROM user_likes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [userId]
  );

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

app.post("/users/upsert", async (req, res) => {
  try {
    const { device_id, username, providers } = req.body || {};
    if (!device_id) {
      return res.status(400).json({ error: "device_id required" });
    }

    const { rows: existingRows } = await pool.query(
      `SELECT * FROM users WHERE device_id = $1`,
      [device_id]
    );
    const existing = existingRows[0];

    if (existing) {
      const providersJson =
        providers !== undefined
          ? JSON.stringify(Array.isArray(providers) ? providers : [])
          : existing.providers;
      const nextName = username !== undefined ? username : existing.username;
      await pool.query(
        `UPDATE users SET username = COALESCE($1, username), providers = COALESCE($2, providers) WHERE id = $3`,
        [nextName || null, providersJson, existing.id]
      );
      const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [existing.id]);
      return res.json(rowUser(rows[0]));
    }

    const providersJson = JSON.stringify(Array.isArray(providers) ? providers : []);
    const { rows } = await pool.query(
      `INSERT INTO users (device_id, username, providers) VALUES ($1, $2, $3) RETURNING *`,
      [device_id, username || null, providersJson]
    );
    res.json(rowUser(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/games", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id, 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "user_id required" });
    }

    const { rows } = await pool.query(
      `SELECT g.* FROM games g
       JOIN game_players gp ON gp.game_id = g.id
       WHERE gp.user_id = $1
       ORDER BY g.id DESC`,
      [userId]
    );

    const games = await Promise.all(rows.map((r) => hydrateGame(r)));
    res.json(games);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/games/find_by_entry_code", async (req, res) => {
  try {
    const code = req.query.entry_code;
    const userId = parseInt(req.query.user_id, 10);
    if (!code) {
      return res.status(400).json({ error: "entry_code required" });
    }

    const { rows: gameRows } = await pool.query(`SELECT * FROM games WHERE entry_code = $1`, [
      code,
    ]);
    const gameRow = gameRows[0];
    if (!gameRow) {
      return res.status(404).json({ error: "not found" });
    }

    if (Number.isFinite(userId)) {
      const { rows: already } = await pool.query(
        `SELECT 1 FROM game_players WHERE game_id = $1 AND user_id = $2`,
        [gameRow.id, userId]
      );
      if (!already.length) {
        await pool.query(
          `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES ($1, $2, '[]')`,
          [gameRow.id, userId]
        );
        await ensureFriendship(gameRow.user_id, userId);
        const host = gameRow.user_id;
        const fresh = await getGameById(gameRow.id);
        broadcastToGame(gameRow.id, {
          type: "system",
          message: "Someone joined the game",
          game: JSON.stringify(fresh),
        });
        broadcastGameIndexUpdate(userId);
        broadcastGameIndexUpdate(host);
      }
    }

    const game = await getGameById(gameRow.id);
    res.json(game);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/games/upsert", async (req, res) => {
  try {
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

    const { rows: existingRows } = await pool.query(`SELECT * FROM games WHERE entry_code = $1`, [
      entry_code,
    ]);
    const existingGame = existingRows[0];

    if (existingGame) {
      if (players_attributes && Array.isArray(players_attributes)) {
        for (const pa of players_attributes) {
          const uid = pa.user_id;
          if (!uid) continue;
          const { rows: ex } = await pool.query(
            `SELECT 1 FROM game_players WHERE game_id = $1 AND user_id = $2`,
            [existingGame.id, uid]
          );
          if (!ex.length) {
            await pool.query(
              `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES ($1, $2, '[]')`,
              [existingGame.id, uid]
            );
            await ensureFriendship(existingGame.user_id, uid);
          }
        }
      }

      if (query != null) {
        await pool.query(`UPDATE games SET query = $1 WHERE id = $2`, [query, existingGame.id]);
      }

      const game = await getGameById(existingGame.id);
      broadcastToGame(existingGame.id, {
        type: "system",
        message: "Game updated",
        game: JSON.stringify(game),
      });
      const { rows: uidRows } = await pool.query(
        `SELECT user_id FROM game_players WHERE game_id = $1`,
        [existingGame.id]
      );
      for (const r of uidRows) {
        broadcastGameIndexUpdate(r.user_id);
      }
      return res.json(game);
    }

    if (!query) {
      return res.status(400).json({ error: "query required for new game" });
    }

    const { rows: ins } = await pool.query(
      `INSERT INTO games (entry_code, user_id, query, load_more_count) VALUES ($1, $2, $3, 0) RETURNING id`,
      [entry_code, user_id, query]
    );
    const gameId = ins[0].id;
    await pool.query(
      `INSERT INTO game_players (game_id, user_id, liked_movie_ids) VALUES ($1, $2, '[]')`,
      [gameId, user_id]
    );

    const game = await getGameById(gameId);
    broadcastGameIndexUpdate(user_id);
    res.json(game);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/games/:id/finish", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows: gameRows } = await pool.query(`SELECT * FROM games WHERE id = $1`, [id]);
    if (!gameRows[0]) {
      return res.status(404).json({ error: "not found" });
    }

    const { rows: userIdRows } = await pool.query(
      `SELECT user_id FROM game_players WHERE game_id = $1`,
      [id]
    );
    const userIds = userIdRows.map((r) => r.user_id);

    await pool.query(`DELETE FROM games WHERE id = $1`, [id]);

    for (const uid of userIds) {
      broadcastGameIndexUpdate(uid);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/games/keep_playing", async (req, res) => {
  try {
    const { game_id, user_id } = req.body || {};
    const gid = parseInt(game_id, 10);
    const uid = parseInt(user_id, 10);
    if (!Number.isFinite(gid) || !Number.isFinite(uid)) {
      return res.status(400).json({ error: "game_id and user_id required" });
    }

    await pool.query(
      `UPDATE games SET finished_at = NULL, load_more_count = load_more_count + 1 WHERE id = $1`,
      [gid]
    );
    await pool.query(
      `UPDATE game_players SET ready_at = NULL, finished_at = NULL, liked_movie_ids = '[]' WHERE game_id = $1`,
      [gid]
    );

    const game = await getGameById(gid);
    broadcastToGame(gid, {
      type: "system",
      message: "Keep playing — new round",
      game: JSON.stringify(game),
    });
    const { rows } = await pool.query(`SELECT user_id FROM game_players WHERE game_id = $1`, [
      gid,
    ]);
    for (const row of rows) {
      broadcastGameIndexUpdate(row.user_id);
    }

    res.json(game);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/friends/index", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id, 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "user_id required" });
    }

    const { rows: friends } = await pool.query(
      `SELECT u.* FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
       WHERE f.user_id = $1 OR f.friend_id = $1`,
      [userId]
    );

    res.json(friends.map(rowUser));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/friends/movie_ids", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id, 10);
    const friendId = parseInt(req.query.friend_id, 10);
    if (!Number.isFinite(userId) || !Number.isFinite(friendId)) {
      return res.status(400).json({ error: "user_id and friend_id required" });
    }

    const { rows: myRows } = await pool.query(
      `SELECT movie_id FROM user_likes WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const myLikes = myRows.map((r) => r.movie_id);

    if (userId === friendId) {
      return res.json({
        myLikedMovieIds: myLikes,
        friendsLikedMovieIds: [],
        ourLikedMovieIds: myLikes,
      });
    }

    const { rows: friendRows } = await pool.query(
      `SELECT movie_id FROM user_likes WHERE user_id = $1 ORDER BY created_at DESC`,
      [friendId]
    );
    const friendLikes = friendRows.map((r) => r.movie_id);

    const friendSet = new Set(friendLikes);
    const ourLikedMovieIds = myLikes.filter((id) => friendSet.has(id));

    res.json({
      myLikedMovieIds: myLikes,
      friendsLikedMovieIds: friendLikes,
      ourLikedMovieIds,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/users/:id/taste", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "invalid id" });
    }
    res.json(await tasteProfile(userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

async function start() {
  await initDb();
  const server = http.createServer(app);
  attachWebSocket(server);

  server.listen(PORT, () => {
    console.log(`WannaWatch API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
