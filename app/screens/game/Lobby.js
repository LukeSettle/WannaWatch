import React, { useContext, useState, useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import {
  Pressable,
  FlatList,
  Text,
  View,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";
import globalStyles from "../../../config/styles";
import FriendList from "./FriendList";

const Lobby = ({ game, setGame, serverMessages }) => {
  const { user } = useContext(UserContext);
  const { webSocket } = useContext(SocketContext);
  const [gameReady, setGameReady] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [link, setLink] = useState("");
  const [showInviteAlert, setShowInviteAlert] = useState(false);
  const [showFriendList, setShowFriendList] = useState(false);

  // Send "ready" message to the server
  const sendReadyMessage = () => {
    setUserReady(true);
    webSocket.send(
      JSON.stringify({
        command: "message",
        identifier: JSON.stringify({
          channel: "GameChannel",
          game_id: game.id,
        }),
        data: JSON.stringify({ action: "ready" }),
      })
    );
  };

  // Handle ready press; if alone, show modal alert
  const handleReadyPress = () => {
    if (game?.players?.length === 1) {
      setShowInviteAlert(true);
    } else {
      sendReadyMessage();
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(link);
    alert("Link copied to clipboard!");
  };

  useEffect(() => {
    if (!game || !game.players) return;

    const player = game.players.find((p) => p.user.id === user.id);
    if (player) {
      setGameReady(true);
    }

    // Update with your custom scheme or local dev URL
    setLink(`https://apps.apple.com/us/app/wannawatch/id6479348557?entry_code=${game.entry_code}`);
    // setLink(`exp://192.168.86.23:8081?entry_code=${game.entry_code}`);
  }, [game]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Lobby</Text>
        <Text style={styles.instructionText}>
          Invite your friends to join the fun!
        </Text>

        <View style={styles.qrCodeContainer}>
          {link && (
            <>
              <QRCode value={link} size={150} />
              <Text style={styles.entryCodeText}>
                Game Code: {game.entry_code}
              </Text>
              <Text style={styles.instructionsForSharing}>
                Share this code, let them scan the QR code, or send them the link
                so they can jump right into the game.
              </Text>

              <Pressable
                style={[globalStyles.buttonContainer, { marginTop: 10 }]}
                onPress={copyToClipboard}
              >
                <Text style={globalStyles.buttonText}>Copy Link</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* READY BUTTON */}
        <Pressable
          style={({ pressed }) => [
            globalStyles.buttonContainer,
            styles.readyButtonContainer,
            (!gameReady || userReady) && globalStyles.disabledButtonContainer,
            pressed && globalStyles.pressedButtonContainer,
          ]}
          onPress={handleReadyPress}
          disabled={!gameReady || userReady}
        >
          <Text style={globalStyles.buttonText}>Ready</Text>
        </Pressable>

        {/* Invite Friends Button */}
        <Pressable
          style={[globalStyles.buttonContainer, styles.inviteButtonContainer]}
          onPress={() => setShowFriendList(true)}
        >
          <Text style={globalStyles.buttonText}>Add Friends</Text>
        </Pressable>

        {/* Players List */}
        <Text style={styles.subHeader}>Current Players</Text>
        <View style={styles.playersContainer}>
          <FlatList
            data={game.players}
            renderItem={({ item }) => (
              <View style={styles.playerItem}>
                <Text style={styles.playerText}>{item.user?.username}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Messages List */}
        <Text style={styles.subHeader}>Game Updates</Text>
        <View style={styles.updatesContainer}>
          <FlatList
            data={[...serverMessages].reverse()}
            renderItem={({ item }) => (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        {/* Custom Modal Alert */}
        <Modal visible={showInviteAlert} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Heads Up!</Text>
              <Text style={styles.modalMessage}>
                It looks like you're the only one here. Browsing movies solo can be
                fun, but it's even better with friends! Share your game link, let
                someone scan the QR code, or pass along the game code so your buddies
                can join. Would you like to continue alone?
              </Text>
              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[
                    globalStyles.buttonContainer,
                    styles.modalButton,
                    styles.inviteButton,
                  ]}
                  onPress={() => setShowInviteAlert(false)}
                >
                  <Text style={globalStyles.buttonText}>Invite Friends</Text>
                </Pressable>
                <Pressable
                  style={[
                    globalStyles.buttonContainer,
                    styles.modalButton,
                    styles.continueButton,
                  ]}
                  onPress={() => {
                    setShowInviteAlert(false);
                    sendReadyMessage();
                  }}
                >
                  <Text style={globalStyles.buttonText}>Continue Solo</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Friend List Modal */}
        <Modal visible={showFriendList} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <FriendList game={game} setGame={setGame} />
              <Pressable
                style={[globalStyles.buttonContainer, styles.closeButton]}
                onPress={() => setShowFriendList(false)}
              >
                <Text style={globalStyles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default Lobby;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  container: {
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
    color: "#e74c3c",
    fontWeight: "bold",
    textAlign: "center",
  },
  instructionText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333333",
    textAlign: "center",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderColor: "#e74c3c",
    borderWidth: 2,
    borderRadius: 10,
  },
  entryCodeText: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: "bold",
    color: "#333333",
  },
  instructionsForSharing: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
    color: "#333333",
    paddingHorizontal: 10,
    fontWeight: "600",
  },
  readyButtonContainer: {
    backgroundColor: "#3498db",
    marginTop: 30,
  },
  inviteButtonContainer: {
    backgroundColor: "#e74c3c",
    marginTop: 10,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 10,
    color: "#333333",
    fontWeight: "bold",
  },
  playersContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  playerItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playerText: {
    fontSize: 16,
    color: "#333",
  },
  updatesContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageContainer: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  messageText: {
    fontSize: 14,
    color: "#555",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e74c3c",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  inviteButton: {
    backgroundColor: "#e74c3c",
  },
  continueButton: {
    backgroundColor: "#3498db",
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    marginTop: 10,
  },
});
