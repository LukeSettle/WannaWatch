import React from "react";
import { finishGame } from "../../data/backend_client";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../../config/colors";

const GamesList = ({ games, setGames, setEntryCode, navigation }) => {
  const handleGamePress = (game) => {
    setEntryCode(game.entry_code);
    navigation.navigate("Game");
  };

  const handleDeleteGame = (game) => {
    Alert.alert("Remove game", "Remove this game from your list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await finishGame(game.id);
            setGames((prevGames) => prevGames.filter((g) => g.id !== game.id));
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.gameCard, pressed && { opacity: 0.95 }]}
      onPress={() => handleGamePress(item)}
    >
      <View style={styles.gameHeader}>
        <View>
          <Text style={styles.gameTitle}>Code {item.entry_code}</Text>
          <Text style={styles.gameSubtitle}>
            {item.finished_at ? "Finished" : "In progress"}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDeleteGame(item)}
          hitSlop={10}
          style={styles.trashHit}
        >
          <Ionicons name="trash-outline" size={22} color={colors.red} />
        </Pressable>
      </View>
      <Text style={styles.playersHeader}>Players</Text>
      {item.players.map((player) => (
        <Text key={player.user.id} style={styles.playerName}>
          {player.user.username}
        </Text>
      ))}
    </Pressable>
  );

  if (games.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.currentGamesHeader}>Your games</Text>
      <FlatList
        nestedScrollEnabled
        data={games}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default GamesList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  gameCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 16,
    marginVertical: 8,
    borderRadius: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  trashHit: {
    padding: 4,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  gameSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  playersHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  playerName: {
    fontSize: 15,
    marginLeft: 4,
    color: colors.text,
    marginBottom: 2,
  },
  currentGamesHeader: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
