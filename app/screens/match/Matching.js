import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  StyleSheet,
} from "react-native";
import Movie from "./Movie";
import Results from "./Results";
import { UserContext } from "../../contexts/UserContext";
import useChannel from '../../components/shared/useChannel';

const FINISH_GAME_MESSAGE = "finish_game";

const Matching = ({ game, newGame }) => {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [query, _setQuery] = useState(JSON.parse(game.query));
  const [page, setPage] = useState(query.page);
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

  const options = () => {
    const parsedOptions = query;
    return {
      ...parsedOptions,
      params: {
        ...parsedOptions.params,
        body: {
          ...parsedOptions.params.body,
          page
        }
      }
    }
  }

  const getMovies = async () => {
    try {
      const response = await axios.request(options());
      const json = await response.data.results
      setMovies(json);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMovies();
  }, [page]);

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
      <Results matchedMovies={matchedMovies} page={page} setPage={setPage} newGame={newGame} />
    );
  }

  return (
    <View style={styles.container}>
      {filteredMovies.map((movie, index) => (
        <Movie
          key={movie.id}
          movie={movie}
          setUpdateMovieParams={setUpdateMovieParams}
          simple={index !== filteredMovies.length - 1}
        />
      ))}
    </View>
  );
};

export default Matching;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
