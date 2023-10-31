import React, { useContext } from "react";
import QRCode from 'react-native-qrcode-svg';
import { Button, FlatList, Text, View } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";

const Lobby = ({ game, serverMessages }) => {
  const { user } = useContext(UserContext);
  const { webSocket } = useContext(SocketContext);

  const sendReadyMessage = () => {
    webSocket.send(JSON.stringify({ type: 'user', message: 'ready' }));
  }

  return (
    <View>
      <Text>Lobby</Text>
      <QRCode value={`exp://192.168.86.46:19000?entry_code=${game.entry_code}`} />
      <Text>Current Players:</Text>
      <FlatList
        data={game.players}
        renderItem={({ item }) => <Text>{item.display_name}</Text>}
        keyExtractor={item => item.id}
      />
      <Text>Server Messages:</Text>
      <FlatList
        data={serverMessages}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={item => item}
      />
      <Button title="Ready" onPress={sendReadyMessage} />
    </View>
  );
};

export default Lobby;
