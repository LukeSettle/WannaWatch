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
            return updatedDocument;
          });
      } else {
        // Insert a new user document
        return container.items
          .create(user)
          .then(({ resource: insertedUser }) => {
            return insertedUser;
          });
      }
    })
    .catch(error => {
      console.error('Error upserting user:', error);
      throw error;
    });
}


function upsertGame(game) {
  const database = client.database(databaseId);
  const container = database.container(config.gamesContainer.id);

  return container.items
    .query(`SELECT * FROM c WHERE c.entry_code = '${game.entry_code}'`)
    .fetchAll()
    .then(({ resources: existingGames}) => {
      if (existingGames.length > 0) {
        return existingGames[0];
      } else {
        // Insert a new game document
        return container.items
          .create(game)
          .then(({ resource: insertedGame }) => {
            return insertedGame;
          });
      }
    })
    .catch(error => {
      console.error('Error findOrCreating game:', error);
      throw error;
    });
}


module.exports = {
  upsertUser,
  upsertGame
}