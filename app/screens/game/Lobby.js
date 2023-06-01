import React, { useEffect, useContext } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { HubConnectionBuilder } from '@microsoft/signalr';

const Lobby = ({ game, startGame }) => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`https://wannawatchrealtime.service.signalr.net/${game.id}`)
      .build();

    connection.on('broadcastMessage', (message) => {
      // Handle incoming message here
      console.log('Received message:', message);
    });

    connection.start()
      .then(() => {
        console.log('SignalR connection established.');
      })
      .catch((error) => {
        console.log('Error establishing SignalR connection:', error);
      });
  }, []);

  return (
    <View>
      <Text>Lobby</Text>
      <Text>Game: {game.id}</Text>
      <Text>Players:</Text>
      {/* <FlatList
        data={presenceList}
        renderItem={({ item }) => <Text>{item.display_name}</Text>}
        keyExtractor={item => item.phx_ref}
      /> */}
      <Button title="Start Game" onPress={() => gameChannel.push(LOAD_GAME_MESSAGE, { user_id: user.id })} />
    </View>
  );
};

export default Lobby;
