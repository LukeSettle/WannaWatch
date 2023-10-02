import React, { useEffect, useContext, useState } from "react";
import { WebPubSubServiceClient } from "@azure/web-pubsub";
import { Button, FlatList, Text, View } from "react-native";
import { UserContext } from "../../contexts/UserContext";

const Lobby = ({ game, startMatching }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);

  const startGame = () => {
    let data = JSON.stringify({
      target: "newMessage",
      message: `${user.display_name} has started the game`
    });

    socket.send(data);
    // startMatching();
  };

  useEffect(() => {
    let url = 'wss://wannawatchpubsub.webpubsub.azure.com/client/hubs/Hub?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3c3M6Ly93YW5uYXdhdGNocHVic3ViLndlYnB1YnN1Yi5henVyZS5jb20vY2xpZW50L2h1YnMvSHViIiwiaWF0IjoxNjkwOTI0NTA2LCJleHAiOjE2OTA5MjgxMDYsInJvbGUiOlsid2VicHVic3ViLnNlbmRUb0dyb3VwIiwid2VicHVic3ViLmpvaW5MZWF2ZUdyb3VwIl19.rTAESfZ83bd-pWd2rvXYCxLRriRciwtT0z8J6Gil-zc'

    const serviceClient = new WebPubSubServiceClient(url, "Hub");

    serviceClient.sendToAll({ message: "Hello world!" });

    // client.start().then(() => {
    //   console.log("connected");

    //   client.joinGroup('Group1').then(() => {
    //     console.log("joined group");
    //   }).catch((e) => {
    //     console.log(e);
    //   });
    // });

    // client.on('newMessage', (e) => {
    //   console.log(`Received message: ${e.message.data}`);
    // });

    // client.sendToGroup(game.id, user.display_name, 'Joined the lobby').then(() => {
    //   console.log("sent message");
    // });

    setSocket(client);
  }, []);

  return (
    <View>
      <Text>Lobby</Text>
      <Text>Game: {game.id}</Text>
      <Text>Players:</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.display_name}</Text>}
        keyExtractor={item => item.phx_ref}
      />
      {socket && <Button title="Start Game" onPress={() => startGame()} />}
    </View>
  );
};

export default Lobby;
