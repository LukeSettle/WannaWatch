import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dimensions,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Movie from "./Movie";
import { UserContext } from "../../contexts/UserContext";
import useChannel from '../../components/shared/useChannel';
import colors from "../../../config/colors";

const { width, height } = Dimensions.get("window");

const FINISH_GAME_MESSAGE = "finish_game";

const MatchScreen = ({ route }) => {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [matchingStarted, setMatchingStarted] = useState(false);
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [game, _setGame] = useState(route.params.game);
  const [query, _setQuery] = useState(JSON.parse(game.query));
  const [page, setPage] = useState(query.page);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [gameChannel, _presenceList] = useChannel(
    {
      channelName: `room:${game.entry_code}`,
      displayName: user.display_name
    }
  );

  console.log('Ahhhhh', gameChannel);

  useEffect(() => {
    console.log('gameChannel in MatchScreen', gameChannel);
    if (!gameChannel) return;

    console.log('gameChannel', gameChannel);

    gameChannel.on(FINISH_GAME_MESSAGE, response => {
      console.log('FINISH_GAME_MESSAGE', response);
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
    if (!updateMovieParams) return;

    const updatedMovies = movies.map((movie) =>
      movie.id === updateMovieParams.id
        ? { ...movie, liked: updateMovieParams.liked, hidden: true }
        : movie
    );

    setMatchingStarted(true);
    setMovies(updatedMovies);
  }, [updateMovieParams]);

  useEffect(() => {
    getMovies();
  }, [page]);

  useEffect(() => {
    setLikedMovies(movies.filter((movie) => movie.liked === true))
    setFilteredMovies(movies.filter((movie) => movie.hidden !== true));
  }, [movies])

  useEffect(() => {
    console.log('matchingStarted', matchingStarted);
    console.log('gameChannel in use effect for filter', gameChannel);
    if (!matchingStarted || !gameChannel) return;

    gameChannel.push(
      FINISH_GAME_MESSAGE,
      {
        display_name: user.display_name,
        movie_ids: likedMovies.map((movie) => movie.id)
      }
    );

  }, [filteredMovies, gameChannel]);

  if (movies.length === 0) {
    return null;
  }

  if (filteredMovies.length === 0) {
    return (
      <View styles={styles.container}>
        <Button
          title="Retry with new movies?"
          onPress={() => setPage(page + 1)}
        />
        <Text>Here are the movies you liked:</Text>
        {likedMovies.map((movie) => (
          <Text key={movie.id}>{movie.title}</Text>
        ))}
      </View>
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

export default MatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
