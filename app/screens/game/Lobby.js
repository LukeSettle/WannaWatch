import React, { useContext, useState, useEffect } from "react";
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { Pressable, FlatList, Text, View, StyleSheet } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";
import globalStyles from "../../../config/styles";

const Lobby = ({ game, serverMessages }) => {
  const { user } = useContext(UserContext);
  const { webSocket } = useContext(SocketContext);
  const [gameReady, setGameReady] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [link, setLink] = useState('');

  const sendReadyMessage = () => {
    setUserReady(true);
    webSocket.send(
      JSON.stringify(
        {
          command: "message",
          identifier: JSON.stringify(
            { channel: "GameChannel", game_id: game.id }
          ),
          data: JSON.stringify({ action: 'ready' })
        }
      )
    );
  }

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(link);

    alert('Link copied to clipboard');
  };

  useEffect(() => {
    if (!game || !game.players ) return;

    const player = game.players.find(player => player.user.id === user.id);

    if (player) {
      setGameReady(true);
    }
    setLink(`wannawatch://?entry_code=${game.entry_code}`);
    // setLink(`exp://192.168.86.27:8081?entry_code=${game.entry_code}`);
  }, [game]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lobby</Text>
      <Text style={styles.instructionText}>Scan code to join game</Text>
      <View style={styles.qrCodeContainer}>
        {link &&
          <>
            <QRCode
              value={link}
              size={150}
            />

            <Pressable style={[globalStyles.buttonContainer, { margin: 10 }]} onPress={copyToClipboard}>
              <Text style={globalStyles.buttonText}>Copy Link</Text>
            </Pressable>
          </>
        }
      </View>
      <Pressable
        style={({ pressed }) => [
          globalStyles.buttonContainer,
          !gameReady ? globalStyles.disabledButtonContainer : styles.enabledButtonContainer,
          pressed && globalStyles.pressedButtonContainer
        ]}
        onPress={sendReadyMessage}
        disabled={!gameReady || userReady}
      >
        <Text style={globalStyles.buttonText}>Ready</Text>
      </Pressable>
      <Text style={styles.subHeader}>Current Players:</Text>
      <FlatList
        data={game.players}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Text style={styles.playerText}>{item.user?.username}</Text>
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
  button: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#28a745',
    padding: 10
  },
});

export default Lobby;
