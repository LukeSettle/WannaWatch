const { getApiBaseUrl } = require("../config/api");

function baseUrl() {
  return getApiBaseUrl();
}

function gamesIndex(user_id) {
  const url = `${baseUrl()}/games?user_id=${user_id}`;

  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error getting games:", error);
      throw error;
    });
}

function upsertUser(user) {
  const url = `${baseUrl()}/users/upsert`;

  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  };

  const retryFetch = (retries) => {
    return fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error upserting user:", error);
        if (retries > 0) {
          return retryFetch(retries - 1);
        }
        throw error;
      });
  };

  return retryFetch(3);
}

function upsertGame(game) {
  const url = `${baseUrl()}/games/upsert`;

  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  };

  const retryFetch = (retries) => {
    return fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error upserting game:", error);
        if (retries > 0) {
          return retryFetch(retries - 1);
        }
        throw error;
      });
  };

  return retryFetch(3);
}

function finishGame(game_id) {
  const url = `${baseUrl()}/games/${game_id}/finish`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error finishing game:", error);
      throw error;
    });
}

function findGameFromEntryCode(entryCode, userId) {
  let url = `${baseUrl()}/games/find_by_entry_code?entry_code=${encodeURIComponent(entryCode)}`;
  if (userId != null) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  }

  return fetch(url, { method: "GET" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((game) => {
      if (!game) {
        throw new Error("Game not found");
      }
      return game;
    })
    .catch((error) => {
      console.error("Error finding game:", error);
      throw error;
    });
}

function keepPlaying(params) {
  const url = `${baseUrl()}/games/keep_playing`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error keeping playing:", error);
      throw error;
    });
}

function friendsIndex(params) {
  const url = `${baseUrl()}/friends/index?user_id=${params.user_id}`;

  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error getting friends:", error);
      throw error;
    });
}

function friendsMovieIds(params) {
  const url = `${baseUrl()}/friends/movie_ids?friend_id=${params.friend_id}&user_id=${params.user_id}`;

  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error getting friends movies ids:", error);
      throw error;
    });
}

function fetchUserTaste(userId) {
  const url = `${baseUrl()}/users/${userId}/taste`;
  return fetch(url)
    .then((r) => {
      if (!r.ok) return { topGenreIds: [] };
      return r.json();
    })
    .catch(() => ({ topGenreIds: [] }));
}

module.exports = {
  upsertUser,
  gamesIndex,
  upsertGame,
  finishGame,
  findGameFromEntryCode,
  keepPlaying,
  friendsIndex,
  friendsMovieIds,
  fetchUserTaste,
};
