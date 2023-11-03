import React, { useContext } from "react";
import QRCode from 'react-native-qrcode-svg';
import { Button, FlatList, Text, View, StyleSheet } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";

const Lobby = ({ game, serverMessages }) => {
  const { user } = useContext(UserContext);
  const { webSocket } = useContext(SocketContext);

  const sendReadyMessage = () => {
    webSocket.send(JSON.stringify({ type: 'user', message: 'ready' }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lobby</Text>
      <Text style={styles.instructionText}>Scan code to join game</Text>
      <View style={styles.qrCodeContainer}>
        <QRCode
          value={`exp://192.168.86.46:19000?entry_code=${game.entry_code}`}
          size={150}
        />
      </View>
      <Text style={styles.subHeader}>Current Players:</Text>
      <FlatList
        data={game.players}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Text style={styles.playerText}>{item.display_name}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
      <Text style={styles.subHeader}>Info:</Text>
      <FlatList
        data={serverMessages}
        renderItem={({ item }) => <Text style={styles.listText}>{item}</Text>}
        keyExtractor={item => item}
      />
      <Button title="Ready" onPress={sendReadyMessage} color="#28a745" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderRadius: 10,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  playerItem: {
    backgroundColor: '#e7f7ef',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  playerText: {
    fontSize: 18,
    color: '#333',
  },
  instructionText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333333',
    textAlign: 'center',
  },
  listText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333333',
  },
});

export default Lobby;
