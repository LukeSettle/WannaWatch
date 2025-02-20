import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { friendsIndex } from '../../data/backend_client';
import { UserContext } from "../../contexts/UserContext";
import Ionicons from '@expo/vector-icons/Ionicons';

const FriendsListScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);

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

  // Filter out the current user from the friends list.
  const otherFriends = friends.filter(item => item.id !== user.id);

  // Render a selectable friend item.
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItemContainer}
      onPress={() => navigation.navigate('Shared Movies', { friendId: item.id })}
      activeOpacity={0.7}
    >
      <Text style={styles.friendItemText}>{item.username}</Text>
      <Ionicons name="arrow-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.mainHeader}>Your Matches</Text>
      <Text style={styles.description}>
        Here you can view the movies you liked on your own as well as the movies shared by your friends.
        Tap on an item to see the shared movies.
      </Text>

      <View style={styles.mySoloContainer}>
        <Text style={styles.sectionHeader}>My Liked Movies</Text>
        <TouchableOpacity
          style={styles.mySoloItemContainer}
          onPress={() => navigation.navigate('Shared Movies', { friendId: user.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.mySoloItemText}>View All Likes</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Friends</Text>
      {otherFriends.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends found.</Text>
      ) : (
        <FlatList
          data={otherFriends}
          keyExtractor={(item) => item.id}
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
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  mySoloContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },
  mySoloItemContainer: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  mySoloItemText: {
    fontSize: 18,
    color: '#fff',
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

export default FriendsListScreen;
