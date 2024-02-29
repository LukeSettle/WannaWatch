/* @flow weak */

import React from "react";
import { StyleSheet, Image, Dimensions, View, ScrollView, Text, Pressable } from "react-native";
import TinderCard from "./TinderCard";
import MovieDetails from "./MovieDetails";
const { width, height } = Dimensions.get("window");

const Movie = ({ movie, setUpdateMovieParams}) => {
  const onSwipe = (direction) => {
    if (direction == 'left') {
      setUpdateMovieParams({ id: movie.id, liked: false });
    } else if (direction == 'right') {
      setUpdateMovieParams({ id: movie.id, liked: true });
    }
  };

  const imageSource = () => {
    return {
      uri: `https://image.tmdb.org/t/p/original/${movie.poster_path}`,
    };
  };

  return (
    <View style={styles.container}>
      <TinderCard
        onSwipe={onSwipe}
        swipeRequirementType={'position'}
        preventSwipe={['up', 'down']}
        swipeThreshold={width - 270}
      >
        <View style={styles.cardContainer}>
          <Image
            source={imageSource()}
            resizeMode="cover"
            style={styles.poster}
          />
        </View>
        <View style={styles.cardContainer}>
          <ScrollView>
            <MovieDetails movie={movie} autoFetch />
          </ScrollView>
        </View>
      </TinderCard>
    </View>
  );
};

export default Movie;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: width * 0.9,
    height: height * 0.7, // Adjust the height based on your preference
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  poster: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    padding: 10,
  },
  description: {
    color: '#FFFFFF', // White text
    fontSize: 14,
  },
});
