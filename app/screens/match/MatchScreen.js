import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";

const MatchScreen = ({ game }) => {
  const [query, _setQuery] = useState(JSON.parse(game.query));
  const [movies, setMovies] = useState([]);

  const options = () => {
    const parsedOptions = query;
    return {
      ...parsedOptions,
      params: {
        ...parsedOptions.params,
      }
    }
  }

  const getMovies = async () => {
    console.log('options', options());
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
  }, []);

  const newGame = () => {
    navigation.navigate("Game");
  }

  if (!game) {
    return null;
  }

  return (
    <>
      {!game.finished_at
        ? movies.length > 0 && <Matching game={game} movies={movies} setMovies={setMovies} />
        : <Results game={game} movies={movies} />
      }
    </>
  );
};

export default MatchScreen;
