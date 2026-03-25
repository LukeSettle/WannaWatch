import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MovieDetails from '../match/MovieDetails';
import { fetchMovieDetails } from '../../data/movie_api';

const Movie = ({ movieId }) => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetchMovieDetails(movieId)
      .then((data) => {
        console.log('====================================');
        console.log('data', data.movieDetails.poster_path);
        console.log('====================================');
        setMovie(data.movieDetails);
      })
      .catch(() => {});
  }
  , [movieId]);

  if (movie == null) return <></>;

  return (
    <View
      key={movie.id}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: `https://image.tmdb.org/t/p/w500/${movie.poster_path}` }}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.movieTitle}>{movie.title}</Text>
        <View style={styles.overviewText}>
          <MovieDetails movie={movie} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  imageContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 27 / 40,
  },
  textContainer: {
    padding: 20,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overviewText: {
    fontSize: 16,
  },
});

export default Movie;