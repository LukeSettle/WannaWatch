import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { friendsIndex, upsertGame } from '../../data/backend_client';
import { UserContext } from "../../contexts/UserContext";

const FriendList = ({ game, setGame }) => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriendId, setLoadingFriendId] = useState(null);

  useEffect(() => {
    if (!user) return;

    friendsIndex({ user_id: user.id })
      .then((data) => {
        setFriends(data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, [user]);

  const inviteFriend = (friendId) => {
    setLoading(true);
    setLoadingFriendId(friendId);

    const gameParams = {
      game: {
        entry_code: game.entry_code,
        user_id: game.user_id,
        players_attributes: [
          { user_id: friendId, game_id: game.id }
        ]
      }
    };

    upsertGame(gameParams)
      .then(game => {
        setGame(game);
        setLoading(false);
        setLoadingFriendId(null);
      })
      .catch(error => {
        console.error('Error inviting friend:', error);
        setLoading(false);
        setLoadingFriendId(null);
      });
  };

  const renderFriendItem = ({ item }) => {
    const isInGame = game.players.some(player => player.user.id === item.id);

    return (
      <View style={styles.friendItemContainer}>
        <Text style={styles.friendItemText}>{item.username}</Text>
        {isInGame ? (
          <Text style={styles.inGameText}>Already in game</Text>
        ) : (
          loading && loadingFriendId === item.id ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <Button title="Invite" onPress={() => inviteFriend(item.id)} />
          )
        )}
      </View>
    );
  };

  const filteredFriends = friends.filter(friend => friend.id !== user.id);

  return (
    <View>
      <Text style={styles.mainHeader}>Invite Friends</Text>
      {filteredFriends.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends found.</Text>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id.toString()}
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
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  mainHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  friendItemContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  friendItemText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  inGameText: {
    fontSize: 16,
    color: '#999',
  },
  noFriendsText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  friendsList: {
    paddingBottom: 20,
  },
});

export default FriendList;