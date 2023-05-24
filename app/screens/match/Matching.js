import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");
console.log('width', width);
console.log('height', height);
import Movie from "./Movie";
import Results from "./Results";
import { UserContext } from "../../contexts/UserContext";
import useChannel from '../../components/shared/useChannel';

const FINISH_GAME_MESSAGE = "finish_game";

const Matching = ({ game, movies, setMovies }) => {
  const { user } = useContext(UserContext);
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [matchedMovies, setMatchedMovies] = useState([]);
  const [gameChannel, _presenceList] = useChannel(
    {
      channelName: `room:${game.entry_code}`,
      displayName: user.display_name
    }
  );

  useEffect(() => {
    if (!gameChannel) return;

    gameChannel.on(FINISH_GAME_MESSAGE, response => {
      console.log('FINISH_GAME_MESSAGE', response);
      setMatchedMovies(
        movies.filter((movie) =>
          response.matched_movie_ids.includes(movie.id)
        )
      )
    });

    return () => {
      gameChannel.off(FINISH_GAME_MESSAGE);
    };
  }, [gameChannel]);


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
    if (!gameChannel || filteredMovies.length !== 0) return;

    console.log("FINISH_GAME_MESSAGE init");
    gameChannel.push(
      FINISH_GAME_MESSAGE,
      {
        display_name: user.display_name,
        game_id: game.id,
        user_id: user.id,
        movie_ids: likedMovies.map((movie) => movie.id)
      }
    );

  }, [filteredMovies]);

  if (movies.length === 0) {
    return null;
  }

  if (filteredMovies.length === 0) {
    return (
      <Results matchedMovies={matchedMovies} />
    );
  }

  return (
    <View style={styles.container}>
      {filteredMovies.slice(-2).map((movie, index) => (
        <Movie
          key={movie.id}
          movie={movie}
          setUpdateMovieParams={setUpdateMovieParams}
        />
      ))}
    </View>
  );
};

export default Matching;

const styles = StyleSheet.create({
  container: {
    flex: 0.7,
    flexDirection: 'column',
  },
});
