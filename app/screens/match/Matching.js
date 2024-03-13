import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import Movie from "./Movie";
import { UserContext } from "../../contexts/UserContext";
import { SocketContext } from "../../contexts/SocketContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import globalStyles from "../../../config/styles";

const Matching = ({ game, movies, setMovies }) => {
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [filteredMovies, setFilteredMovies] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const { webSocket } = useContext(SocketContext);

  const nopeCurrentMovie = () => {
    setUpdateMovieParams({ id: filteredMovies.slice(-1)[0].id, liked: false });
  };

  const likeCurrentMovie = () => {
    setUpdateMovieParams({ id: filteredMovies.slice(-1)[0].id, liked: true });
  };

  useEffect(() => {
    if (!updateMovieParams) return;

    const updatedMovies = movies.map((movie) =>
      movie.id === updateMovieParams.id
        ? { ...movie, liked: updateMovieParams.liked, hidden: true }
        : movie
    );

    setMovies(updatedMovies);
  }, [updateMovieParams]);

  useEffect(() => {
    setLikedMovies(movies.filter((movie) => movie.liked === true))
    setFilteredMovies(movies.filter((movie) => movie.hidden !== true));
  }, [movies])

  useEffect(() => {
    if (filteredMovies == null || filteredMovies.length !== 0) return;

    webSocket.send(
      JSON.stringify(
        {
          command: "message",
          identifier: JSON.stringify(
            { channel: "GameChannel", game_id: game.id }
          ),
          data: JSON.stringify(
            {
              action: 'finish_matching',
              liked_movie_ids: likedMovies.map((movie) => movie.id)
            }
          )
        }
      )
    );
  }, [filteredMovies]);

  if (movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.outer_container}>
      <View style={styles.container}>
        {(filteredMovies || []).map((movie, index) => (
          <Movie
            key={movie.id}
            movie={movie}
            setUpdateMovieParams={setUpdateMovieParams}
          />
        ))}
      </View>
      <View style={styles.directions}>
        <Ionicons onPress={nopeCurrentMovie} name="arrow-back" size={32} color="red" />
        <Ionicons onPress={likeCurrentMovie} name="arrow-forward" size={32} color="green" />
      </View>
    </View>
  );
};

export default Matching;

const styles = StyleSheet.create({
  outer_container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: '5%',
  },
  directions: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '20%',
    marginLeft: '20%',
    marginRight: '20%',
  },
});
