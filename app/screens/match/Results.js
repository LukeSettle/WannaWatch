import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Results = ({ game, movies }) => {
  const matchedMovies = () => {
    const allMovieIds = game.players.map((player) => player.liked_movie_ids);
    const matchedMovieIds = allMovieIds.reduce((a, b) => a.filter(c => b.includes(c)));
    return movies.filter((movie) => matchedMovieIds.includes(movie.id));
  }

  const matchesText = () => {
    if (matchedMovies().length === 0) {
      return "No matches yet!"
    } else {
      return "Here are the movies everyone matched on:"
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{matchesText()}</Text>
      {matchedMovies().map((movie) => (
        <View key={movie.id} style={styles.movieContainer}>
          <Text style={styles.movieText}>{movie.title}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  movieContainer: {
    backgroundColor: '#e7f7ef',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  movieText: {
    fontSize: 18,
    color: '#333333',
  },
});

export default Results;
