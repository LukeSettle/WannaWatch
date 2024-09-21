import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { friendsMovieIds } from '../../data/backend_client';
import { UserContext } from "../../contexts/UserContext";
import Movie from './Movie';

const SharedMoviesScreen = ({ route }) => {
  const { user } = useContext(UserContext);
  const [listKey, setListKey] = useState('ourLikedMovieIds');
  const [movieIds, setMovieIds] = useState({
    myLikedMovieIds: [],
    friendsLikedMovieIds: [],
    ourLikedMovieIds: [],
  });
  const { friendId } = route.params;

  useEffect(() => {
    friendsMovieIds({ friend_id: friendId, user_id: user.id })
      .then((data) => {
        setMovieIds(data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, [friendId]);

  return (
    <View>
      <Picker
        selectedValue={listKey}
        onValueChange={(itemValue, itemIndex) =>
          setListKey(itemValue)
        }>
        <Picker.Item label="Our Matches" value="ourLikedMovieIds" />
        <Picker.Item label="Friends Liked Movies" value="friendsLikedMovieIds" />
        <Picker.Item label="My Liked Movies" value="myLikedMovieIds" />
      </Picker>
      {/* <Text style={{ fontSize: 22, fontWeight: 'bold', padding: 20 }}>Shared Movies:</Text> */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {movieIds[listKey].map((movieId) => (
          <Movie key={movieId} movieId={movieId} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 40,
  },
  header: {
    fontSize: 22,
    marginVertical: 20,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 10,
  },
  imageContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  image: {
    width: '100%',
    aspectRatio: 27 / 40,
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingTop: 10,
  },
  overviewText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SharedMoviesScreen;
