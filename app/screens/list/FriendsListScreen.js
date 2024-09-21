import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';
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

  const renderItem = ({ item }) => (
    <TouchableHighlight onPress={() => navigation.navigate('Shared Movies', { friendId: item.id })}>
      <View style={styles.itemContainer}>
        <Text style={styles.item}>{item.username}</Text>
        <Ionicons name="arrow-forward" size={32} color="black" />
      </View>
    </TouchableHighlight>
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', padding: 20 }}>Friends:</Text>
      {friends.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends found.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    padding: 5,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    padding: 20,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
  noFriendsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
});

export default FriendsListScreen;
