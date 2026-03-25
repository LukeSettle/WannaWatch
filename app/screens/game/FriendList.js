import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { friendsIndex, upsertGame } from "../../data/backend_client";
import { UserContext } from "../../contexts/UserContext";
import colors from "../../../config/colors";
const FriendList = ({ game, setGame }) => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [loadingFriendId, setLoadingFriendId] = useState(null);

  useEffect(() => {
    if (!user) return;

    friendsIndex({ user_id: user.id })
      .then((data) => setFriends(data))
      .catch(() => {});
  }, [user]);

  const inviteFriend = (friendId) => {
    setLoadingFriendId(friendId);

    const gameParams = {
      game: {
        entry_code: game.entry_code,
        user_id: game.user_id,
        players_attributes: [{ user_id: friendId, game_id: game.id }],
      },
    };

    upsertGame(gameParams)
      .then((g) => {
        setGame(g);
        setLoadingFriendId(null);
      })
      .catch(() => {
        setLoadingFriendId(null);
      });
  };

  const renderFriendItem = ({ item }) => {
    const isInGame = game.players.some((player) => player.user.id === item.id);

    return (
      <View style={styles.friendItemContainer}>
        <Text style={styles.friendItemText}>{item.username}</Text>
        {isInGame ? (
          <Text style={styles.inGameText}>In game</Text>
        ) : loadingFriendId === item.id ? (
          <ActivityIndicator size="small" color={colors.secondary} />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.inviteBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => inviteFriend(item.id)}
          >
            <Text style={styles.inviteBtnText}>Invite</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const filteredFriends = friends.filter((friend) => friend.id !== user.id);

  return (
    <View>
      <Text style={styles.mainHeader}>Friends</Text>
      {filteredFriends.length === 0 ? (
        <Text style={styles.noFriendsText}>
          No friends yet. Join the same game as someone to add them here.
        </Text>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendItem}
          scrollEnabled={false}
          contentContainerStyle={styles.friendsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  friendItemContainer: {
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  friendItemText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  inGameText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  noFriendsText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  friendsList: {
    paddingBottom: 8,
  },
  inviteBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  inviteBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default FriendList;
