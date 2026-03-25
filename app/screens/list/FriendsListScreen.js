import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { friendsIndex } from "../../data/backend_client";
import { UserContext } from "../../contexts/UserContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../../config/colors";

const FriendsListScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    friendsIndex({ user_id: user.id })
      .then((data) => setFriends(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const otherFriends = friends.filter((item) => item.id !== user.id);

  const renderFriendItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.friendItemContainer,
        pressed && { opacity: 0.92 },
      ]}
      onPress={() => navigation.navigate("Shared Movies", { friendId: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.username || "?").slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.friendItemText}>{item.username}</Text>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.mainHeader}>People & likes</Text>
      <Text style={styles.description}>
        See movies you both liked, or browse each person’s likes. Playing together adds friends
        automatically.
      </Text>

      <Text style={styles.sectionHeader}>You</Text>
      <Pressable
        style={({ pressed }) => [
          styles.soloCard,
          pressed && { opacity: 0.95 },
        ]}
        onPress={() => navigation.navigate("Shared Movies", { friendId: user.id })}
      >
        <Ionicons name="heart" size={22} color={colors.secondary} />
        <Text style={styles.soloCardText}>All my liked movies</Text>
        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      </Pressable>

      <Text style={styles.sectionHeader}>Friends</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.secondary} />
      ) : otherFriends.length === 0 ? (
        <Text style={styles.noFriendsText}>
          No friends yet. Join the same game as someone to connect.
        </Text>
      ) : (
        <FlatList
          data={otherFriends}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.friendsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  mainHeader: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: colors.text,
  },
  soloCard: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  soloCardText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  friendItemContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(41,51,92,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.secondary,
  },
  friendItemText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  noFriendsText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 22,
  },
  friendsList: {
    paddingBottom: 40,
  },
});

export default FriendsListScreen;
