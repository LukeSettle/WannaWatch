const { WebSocketServer } = require("ws");
const { pool, getGameById } = require("./db");

function parseIdentifier(identifierStr) {
  try {
    return JSON.parse(identifierStr);
  } catch {
    return null;
  }
}

function cableMessage(identifier, message) {
  return JSON.stringify({
    identifier,
    message,
  });
}

function systemPayload(text, game) {
  return {
    type: "system",
    message: text,
    game: game ? JSON.stringify(game) : undefined,
  };
}

function broadcastToGame(gameId, messageObj) {
  const identifier = JSON.stringify({ channel: "GameChannel", game_id: gameId });
  const payload = cableMessage(identifier, messageObj);
  for (const client of wss.clients) {
    if (client.readyState !== 1) continue;
    if (client.subscriptions?.has(`game:${gameId}`)) {
      client.send(payload);
    }
  }
}

function broadcastGameIndexUpdate(userId) {
  const identifier = JSON.stringify({ channel: "UserGamesChannel" });
  const payload = cableMessage(identifier, { message: "game_index_updated" });
  for (const client of wss.clients) {
    if (client.readyState !== 1) continue;
    if (client.userId === userId && client.subscriptions?.has("user_games")) {
      client.send(payload);
    }
  }
}

async function allGameUserIds(gameId) {
  const { rows } = await pool.query(`SELECT user_id FROM game_players WHERE game_id = $1`, [
    gameId,
  ]);
  return rows.map((r) => r.user_id);
}

let wss;

function attachWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/cable" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "http://localhost");
    const userId = parseInt(url.searchParams.get("user_id"), 10);
    ws.userId = Number.isFinite(userId) ? userId : null;
    ws.subscriptions = new Set();

    ws.on("message", (raw) => {
      (async () => {
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (msg.command === "subscribe") {
          const id = parseIdentifier(msg.identifier);
          if (!id) return;
          if (id.channel === "UserGamesChannel") {
            ws.subscriptions.add("user_games");
            ws.send(cableMessage(msg.identifier, { type: "welcome" }));
          } else if (id.channel === "GameChannel" && id.game_id) {
            ws.subscriptions.add(`game:${id.game_id}`);
            ws.send(cableMessage(msg.identifier, { type: "confirm_subscription" }));
          }
          return;
        }

        if (msg.command === "message") {
          const id = parseIdentifier(msg.identifier);
          if (!id || id.channel !== "GameChannel" || !id.game_id) return;

          let data;
          try {
            data = JSON.parse(msg.data || "{}");
          } catch {
            return;
          }

          const gameId = id.game_id;

          if (data.action === "ready") {
            if (!ws.userId) return;
            await pool.query(
              `UPDATE game_players SET ready_at = now() WHERE game_id = $1 AND user_id = $2`,
              [gameId, ws.userId]
            );

            const game = await getGameById(gameId);
            const { rows: uname } = await pool.query(`SELECT username FROM users WHERE id = $1`, [
              ws.userId,
            ]);
            const username = uname[0]?.username || "Someone";
            broadcastToGame(gameId, systemPayload(`${username} is ready`, game));

            const { rows: totalRow } = await pool.query(
              `SELECT COUNT(*)::int AS c FROM game_players WHERE game_id = $1`,
              [gameId]
            );
            const { rows: readyRow } = await pool.query(
              `SELECT COUNT(*)::int AS c FROM game_players WHERE game_id = $1 AND ready_at IS NOT NULL`,
              [gameId]
            );
            const total = totalRow[0]?.c ?? 0;
            const ready = readyRow[0]?.c ?? 0;

            if (total > 0 && ready === total) {
              const g = await getGameById(gameId);
              broadcastToGame(gameId, systemPayload("Everyone is ready — start matching!", g));
            }
            return;
          }

          if (data.action === "finish_matching") {
            if (!ws.userId) return;
            const likedIds = Array.isArray(data.liked_movie_ids) ? data.liked_movie_ids : [];
            const likedDetails = Array.isArray(data.liked_movies) ? data.liked_movies : [];

            await pool.query(
              `UPDATE game_players SET finished_at = now(), liked_movie_ids = $1 WHERE game_id = $2 AND user_id = $3`,
              [JSON.stringify(likedIds), gameId, ws.userId]
            );

            for (const item of likedDetails) {
              const mid = item.id ?? item.movie_id;
              if (mid == null) continue;
              const genres = item.genre_ids || item.genreIds || [];
              const genreJson = JSON.stringify(Array.isArray(genres) ? genres : []);
              await pool.query(
                `INSERT INTO user_likes (user_id, movie_id, genre_ids) VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, movie_id) DO UPDATE SET genre_ids = EXCLUDED.genre_ids`,
                [ws.userId, mid, genreJson]
              );
            }

            const { rows: totalRow } = await pool.query(
              `SELECT COUNT(*)::int AS c FROM game_players WHERE game_id = $1`,
              [gameId]
            );
            const { rows: finishedRow } = await pool.query(
              `SELECT COUNT(*)::int AS c FROM game_players WHERE game_id = $1 AND finished_at IS NOT NULL`,
              [gameId]
            );
            const totalPlayers = totalRow[0]?.c ?? 0;
            const finishedCount = finishedRow[0]?.c ?? 0;
            const allDone = totalPlayers > 0 && finishedCount === totalPlayers;

            if (allDone) {
              await pool.query(`UPDATE games SET finished_at = now() WHERE id = $1`, [gameId]);
            }

            const game = await getGameById(gameId);
            broadcastToGame(gameId, systemPayload("A player finished matching", game));

            const uids = await allGameUserIds(gameId);
            for (const uid of uids) {
              broadcastGameIndexUpdate(uid);
            }
          }
        }
      })().catch((err) => console.error("ws handler", err));
    });
  });

  return wss;
}

module.exports = { attachWebSocket, broadcastToGame, broadcastGameIndexUpdate };
