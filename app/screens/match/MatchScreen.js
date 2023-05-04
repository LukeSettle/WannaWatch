import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import { SocketProvider } from '../../contexts/SocketContext';

const MatchScreen = ({ navigation, route }) => {
  const [game, _setGame] = useState(route.params.game);
  const [query, _setQuery] = useState(JSON.parse(game.query));
  const [movies, setMovies] = useState([]);
  const [page, _setPage] = useState(query.page);

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

  const newGame = () => {
    navigation.navigate("Game");
  }

  return (
    <SocketProvider>
      {game && movies.length > 0 && <Matching game={game} movies={movies} setMovies={setMovies} />}
    </SocketProvider>
  );
};

export default MatchScreen;
