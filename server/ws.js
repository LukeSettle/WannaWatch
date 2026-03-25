const { WebSocketServer } = require("ws");
const { db, getGameById, hydrateGame } = require("./db");

function parseIdentifier(identifierStr) {
  try {
    return JSON.parse(identifierStr);
  } catch {
    return null;
  }
}

function cableMessage(identifier, message) {
  return JSON.stringify({
    identifier: identifier,
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

function allGameUserIds(gameId) {
  const rows = db
    .prepare(`SELECT user_id FROM game_players WHERE game_id = ?`)
    .all(gameId);
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
          ws.send(
            cableMessage(msg.identifier, { type: "welcome" })
          );
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
          db.prepare(
            `UPDATE game_players SET ready_at = datetime('now') WHERE game_id = ? AND user_id = ?`
          ).run(gameId, ws.userId);

          const game = getGameById(gameId);
          const username =
            db.prepare(`SELECT username FROM users WHERE id = ?`).get(ws.userId)?.username ||
            "Someone";
          broadcastToGame(
            gameId,
            systemPayload(`${username} is ready`, game)
          );

          const total = db
            .prepare(`SELECT COUNT(*) as c FROM game_players WHERE game_id = ?`)
            .get(gameId).c;
          const ready = db
            .prepare(
              `SELECT COUNT(*) as c FROM game_players WHERE game_id = ? AND ready_at IS NOT NULL`
            )
            .get(gameId).c;

          if (total > 0 && ready === total) {
            const g = getGameById(gameId);
            broadcastToGame(gameId, systemPayload("Everyone is ready — start matching!", g));
          }
          return;
        }

        if (data.action === "finish_matching") {
          if (!ws.userId) return;
          const likedIds = Array.isArray(data.liked_movie_ids)
            ? data.liked_movie_ids
            : [];
          const likedDetails = Array.isArray(data.liked_movies)
            ? data.liked_movies
            : [];

          db.prepare(
            `UPDATE game_players SET finished_at = datetime('now'), liked_movie_ids = ? WHERE game_id = ? AND user_id = ?`
          ).run(JSON.stringify(likedIds), gameId, ws.userId);

          const insertLike = db.prepare(
            `INSERT INTO user_likes (user_id, movie_id, genre_ids) VALUES (?, ?, ?)
             ON CONFLICT(user_id, movie_id) DO UPDATE SET genre_ids = excluded.genre_ids`
          );
          for (const item of likedDetails) {
            const mid = item.id ?? item.movie_id;
            if (mid == null) continue;
            const genres = item.genre_ids || item.genreIds || [];
            insertLike.run(
              ws.userId,
              mid,
              JSON.stringify(Array.isArray(genres) ? genres : [])
            );
          }

          const totalPlayers = db
            .prepare(`SELECT COUNT(*) as c FROM game_players WHERE game_id = ?`)
            .get(gameId).c;
          const finishedCount = db
            .prepare(
              `SELECT COUNT(*) as c FROM game_players WHERE game_id = ? AND finished_at IS NOT NULL`
            )
            .get(gameId).c;

          const allDone = totalPlayers > 0 && finishedCount === totalPlayers;

          if (allDone) {
            db.prepare(`UPDATE games SET finished_at = datetime('now') WHERE id = ?`).run(
              gameId
            );
          }

          const game = getGameById(gameId);
          broadcastToGame(
            gameId,
            systemPayload("A player finished matching", game)
          );

          for (const uid of allGameUserIds(gameId)) {
            broadcastGameIndexUpdate(uid);
          }
          return;
        }
      }
    });
  });

  return wss;
}

module.exports = { attachWebSocket, broadcastToGame, broadcastGameIndexUpdate };
