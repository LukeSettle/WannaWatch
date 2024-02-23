import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import MovieDetails from "./MovieDetails";

const Results = ({ game, movies }) => {
  const [showOverviewId, setShowOverviewId] = useState(false);

  const matchedMovies = () => {
    const allMovieIds = game.players.map((player) => player.liked_movie_ids);
    const matchedMovieIds = allMovieIds.reduce((a, b) => a.filter(c => b.includes(c)));
    return movies.filter((movie) => matchedMovieIds.includes(movie.id));
  }

  const matchesText = () => {
    if (matchedMovies().length === 0) {
      return "No matches yet! Try again!"
    } else if (matchedMovies().length === 1) {
      return "You found a movie you all WannaWatch!"
    } else {
      return "You found movies you all WannaWatch!"
    }
  }

  const imageSource = (movie) => {
    return {
      uri: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
    };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{matchesText()}</Text>
      {matchedMovies().map((movie) => (
        <View
          key={movie.id}
          style={styles.card}
        >
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={imageSource(movie)}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <View style={styles.overviewText}>
              <MovieDetails movie={movie} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

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
export default Results;
