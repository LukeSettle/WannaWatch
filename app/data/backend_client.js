const BASE_URL = 'http://localhost:3000'
// const BASE_URL = 'https://wanna-watch-rails.onrender.com'

function upsertUser(user) {
  const url = `${BASE_URL}/users/upsert`;

  const fetchOptions = {
    method: 'POST', // Use POST to send data
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user), // Convert the user object to a JSON string
  };

  // Make the fetch request to the Rails server
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
      throw error;
    });
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
      console.error('Error upserting game:', error);
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



module.exports = {
  upsertUser,
  upsertGame,
  findGameFromEntryCode,
}