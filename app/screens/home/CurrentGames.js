import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { gamesIndex } from "../../data/backend_client";
import { UserContext } from "../../contexts/UserContext";

const CurrentGames = ({ navigation }) => {
  const { user, setEntryCode } = useContext(UserContext);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchGames = async () => {
      try {
        const response = await gamesIndex(user.id);
        setGames(response);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, [user]);

  const handleGamePress = (game) => {
    setEntryCode(game.entry_code);
    navigation.navigate("Game");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => handleGamePress(item)}>
      <Text style={styles.gameTitle}>Game ID: {item.id}</Text>
      <Text style={styles.gameSubtitle}>Entry Code: {item.entry_code}</Text>
      <Text style={styles.playersHeader}>Players:</Text>
      {item.players.map((player) => (
        <Text key={player.user.id} style={styles.playerName}>
          {player.user.username}
        </Text>
      ))}
    </TouchableOpacity>
  );

  if (games.length === 0) {
    return (
      null
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.currentGamesHeader}>Current Games</Text>
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

export default CurrentGames;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  gameCard: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  gameSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  playersHeader: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 3,
    color: "#333",
  },
  playerName: {
    fontSize: 16,
    marginLeft: 10,
    color: "#555",
  },
  currentGamesHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
});
