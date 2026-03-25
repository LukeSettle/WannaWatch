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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";
import globalStyles from "../../../config/styles";
import FriendList from "./FriendList";
import colors from "../../../config/colors";
import * as Linking from "expo-linking";

const Lobby = ({ game, setGame, serverMessages }) => {
  const { user } = useContext(UserContext);
  const { webSocket } = useContext(SocketContext);
  const insets = useSafeAreaInsets();
  const [userReady, setUserReady] = useState(false);
  const [link, setLink] = useState("");
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showInviteAlert, setShowInviteAlert] = useState(false);

  const sendReadyMessage = () => {
    setUserReady(true);
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      Alert.alert("Connection", "Not connected yet. Check your network and try again.");
      setUserReady(false);
      return;
    }
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

  const handleReadyPress = () => {
    if (game?.players?.length === 1) {
      setShowInviteAlert(true);
    } else {
      sendReadyMessage();
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(link);
    Alert.alert("Copied", "Invite link copied to clipboard.");
  };

  useEffect(() => {
    if (!game?.entry_code) return;
    const schemeUrl = Linking.createURL("", {
      queryParams: { entry_code: game.entry_code },
    });
    setLink(schemeUrl);
  }, [game?.entry_code]);

  useEffect(() => {
    const me = game.players?.find((p) => p.user?.id === user?.id);
    if (me?.ready_at) setUserReady(true);
  }, [game, user?.id]);

  return (
    <ScrollView
      style={[styles.scrollView, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Lobby</Text>
        <Text style={styles.subtitle}>
          When everyone is ready, you will swipe together on the same stack.
        </Text>

        <View style={styles.buttonSection}>
          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              styles.readyButton,
              userReady && globalStyles.disabledButtonContainer,
              pressed && globalStyles.pressedButtonContainer,
            ]}
            onPress={handleReadyPress}
            disabled={userReady}
          >
            <Text style={globalStyles.buttonText}>{userReady ? "Ready" : "I'm ready"}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              styles.inviteButton,
              pressed && globalStyles.pressedButtonContainer,
            ]}
            onPress={() => setShowFriendsModal(true)}
          >
            <Text style={globalStyles.buttonText}>Invite</Text>
          </Pressable>
        </View>

        <Text style={styles.subHeader}>Players</Text>
        <View style={styles.card}>
          <FlatList
            scrollEnabled={false}
            data={game.players}
            renderItem={({ item }) => (
              <View style={styles.playerItem}>
                <View style={styles.playerDot} />
                <Text style={styles.playerText}>{item.user?.username || "Guest"}</Text>
                {item.ready_at ? (
                  <Text style={styles.readyBadge}>Ready</Text>
                ) : null}
              </View>
            )}
            keyExtractor={(item) => String(item.id)}
          />
        </View>

        <Text style={styles.subHeader}>Activity</Text>
        <View style={styles.card}>
          {serverMessages.length === 0 ? (
            <Text style={styles.emptyActivity}>Waiting for updates…</Text>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={[...serverMessages].reverse().slice(0, 12)}
              renderItem={({ item }) => (
                <View style={styles.messageRow}>
                  <Text style={styles.messageText}>{item}</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item}-${index}`}
            />
          )}
        </View>
      </View>

      <Modal visible={showInviteAlert} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solo in the lobby?</Text>
            <Text style={styles.modalMessage}>
              Swiping is more fun with someone else. Share your code or invite a friend — or continue
              on your own.
            </Text>
            <View style={styles.modalButtonColumn}>
              <Pressable
                style={({ pressed }) => [
                  globalStyles.buttonContainer,
                  styles.modalPrimary,
                  pressed && globalStyles.pressedButtonContainer,
                  { marginBottom: 10 },
                ]}
                onPress={() => {
                  setShowInviteAlert(false);
                  setShowFriendsModal(true);
                }}
              >
                <Text style={globalStyles.buttonText}>Invite someone</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  globalStyles.buttonContainer,
                  styles.modalSecondary,
                  pressed && globalStyles.pressedButtonContainer,
                ]}
                onPress={() => {
                  setShowInviteAlert(false);
                  sendReadyMessage();
                }}
              >
                <Text style={styles.modalSecondaryText}>Continue solo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showFriendsModal} transparent animationType="slide">
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowFriendsModal(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Invite</Text>
              <Pressable
                onPress={() => setShowFriendsModal(false)}
                hitSlop={12}
                style={styles.closeHit}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              <FriendList game={game} setGame={setGame} />
              <View style={styles.qrBlock}>
                {link ? (
                  <>
                    <QRCode value={link} size={160} />
                    <Text style={styles.codeLabel}>Game code</Text>
                    <Text style={styles.entryCodeText}>{game.entry_code}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        globalStyles.buttonContainer,
                        { marginTop: 16, alignSelf: "stretch" },
                        pressed && globalStyles.pressedButtonContainer,
                      ]}
                      onPress={copyToClipboard}
                    >
                      <Text style={globalStyles.buttonText}>Copy invite link</Text>
                    </Pressable>
                    <Text style={styles.hint}>
                      Friends can open the link on their phone to join this game.
                    </Text>
                  </>
                ) : null}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default Lobby;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    fontSize: 28,
    marginBottom: 8,
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  readyButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.secondary,
  },
  inviteButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: colors.primary,
  },
  subHeader: {
    fontSize: 17,
    marginBottom: 10,
    color: colors.text,
    fontWeight: "600",
  },
  card: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  playerItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.quaternary,
    marginRight: 10,
  },
  playerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  readyBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.secondary,
    backgroundColor: "rgba(41,51,92,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  messageRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  messageText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  emptyActivity: {
    fontSize: 15,
    color: colors.textMuted,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: colors.text,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtonColumn: {},
  modalPrimary: {
    backgroundColor: colors.secondary,
  },
  modalSecondary: {
    backgroundColor: "#e8eaef",
  },
  modalSecondaryText: {
    textAlign: "center",
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  closeHit: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
  },
  sheetBody: {
    padding: 20,
    paddingBottom: 40,
  },
  qrBlock: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: colors.background,
  },
  codeLabel: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  entryCodeText: {
    fontSize: 26,
    marginTop: 4,
    fontWeight: "800",
    letterSpacing: 4,
    color: colors.text,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
