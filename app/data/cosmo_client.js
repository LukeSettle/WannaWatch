//@ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')

const endpoint = config.endpoint
const key = config.key

const databaseId = config.database.id

const options = {
      endpoint: endpoint,
      key: key,
      userAgentSuffix: 'CosmosDBJavascriptQuickstart'
    };

const client = new CosmosClient(options)

function upsertUser(user) {
  console.log('Upserting user:\n', user);
  const database = client.database(databaseId);
  const container = database.container(config.usersContainer.id);

  return container.items
    .query(`SELECT * FROM c WHERE c.device_id = '${user.device_id}'`)
    .fetchAll()
    .then(({ resources: existingUsers }) => {
      if (existingUsers.length > 0) {
        // Update the existing user document
        const existingUser = existingUsers[0];
        const updatedUser = { ...existingUser, ...user };

        return container.items
          .upsert(updatedUser)
          .then(({ resource: updatedDocument }) => {
            console.log('User updated:', updatedDocument);
            return updatedDocument;
          });
      } else {
        // Insert a new user document
        return container.items
          .create(user)
          .then(({ resource: insertedUser }) => {
            console.log('User inserted:', insertedUser);
            return insertedUser;
          });
      }
    })
    .catch(error => {
      console.error('Error upserting user:', error);
      throw error;
    });
}

async function createGame(game) {
  const database = client.database(databaseId);
  const container = database.container(config.gamesContainer.id);

  console.log('Creating game:\n', game);

  // Create the game record
  return container.items.create(game)
    .then(({ resource: createdGame }) => {
      console.log('Game created:', createdGame);
      return createdGame;
    })
    .catch(error => {
      console.error('Error creating game:', error);
      throw error; // Propagate the exception to the calling code
    });
}

module.exports = {
  upsertUser,
  createGame
}