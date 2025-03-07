// const BASE_URL = 'http://localhost:3000'
const BASE_URL = 'https://wanna-watch-rails.onrender.com'

function gamesIndex(user_id) {
  const url = `${BASE_URL}/games?user_id=${user_id}`;

  const fetchOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error getting games:', error);
      throw error;
    });
}

function upsertUser(user) {
  const url = `${BASE_URL}/users/upsert`;

  const fetchOptions = {
    method: 'POST', // Use POST to send data
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user), // Convert the user object to a JSON string
  };

  // Function to retry the fetch request
  const retryFetch = (url, fetchOptions, retries) => {
    return fetch(url, fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response body
      })
      .then(data => {
        // The 'data' variable contains the response from the server
        return data; // This could be the updated or newly created user object
      })
      .catch(error => {
        console.error('Error upserting user:', error);
        if (retries > 0) {
          console.log(`Retrying request (${retries} retries left)...`);
          return retryFetch(url, fetchOptions, retries - 1);
        } else {
          throw error;
        }
      });
  };

  // Make the fetch request with retries
  return retryFetch(url, fetchOptions, 3);
}

function upsertGame(game) {
  const url = `${BASE_URL}/games/upsert`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(game),
  };

  // Function to retry the fetch request
  const retryFetch = (url, fetchOptions, retries) => {
    return fetch(url, fetchOptions)
      .then(response => {
        console.log('====================================');
        console.log('response', response);
        console.log('====================================');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error upserting game:', error);
        if (retries > 0) {
          console.log(`Retrying request (${retries} retries left)...`);
          return retryFetch(url, fetchOptions, retries - 1);
        } else {
          throw error;
        }
      });
  };

  // Make the fetch request with retries
  return retryFetch(url, fetchOptions, 3);
}

function finishGame(game_id) {
  const url = `${BASE_URL}/games/${game_id}/finish`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error finishing game:', error);
      throw error;
    });
}

function findGameFromEntryCode(entryCode) {
  const url = `${BASE_URL}/games/find_by_entry_code?entry_code=${encodeURIComponent(entryCode)}`;

  const fetchOptions = {
    method: 'GET',
  };

  return fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(game => {
      if (!game) {
        throw new Error('Game not found');
      }
      return game;
    })
    .catch(error => {
      console.error('Error finding game:', error);
      throw error;
    });
}

function keepPlaying(params) {
  const url = `${BASE_URL}/games/keep_playing`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  };

  return fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error keeping playing:', error);
      throw error;
    });
}

function friendsIndex(params) {
  const url = `${BASE_URL}/friends/index?user_id=${params.user_id}`;

  const fetchOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error getting friends:', error);
      throw error;
    });
}

function friendsMovieIds(params) {
  const url = `${BASE_URL}/friends/movie_ids?friend_id=${params.friend_id}&user_id=${params.user_id}`;

  const fetchOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error getting friends movies ids:', error);
      throw error;
    });
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
}