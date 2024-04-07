import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";

const MatchScreen = ({ game, setGame }) => {
  const [query, setQuery] = useState(JSON.parse(game.query));
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
    try {
      const response = await axios.request(options());
      const json = await response.data.results

      setMovies([...movies, ...json]);
      setGame({
        ...game,
        finished_at: json.length === 0 ? new Date() : null,
      })
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreMovies = async () => {
    const newPage = Math.round(Math.random() * (66 - 1) + 1)

    console.log('====================================');
    console.log('newPage', newPage);
    console.log('====================================');

    setQuery({
      ...query,
      params: {
        ...query.params,
        page: newPage,
      }
    });
  }

  useEffect(() => {
    console.log('====================================');
    console.log('getMovies', query);
    console.log('====================================');
    getMovies();
  }, [query]);

  if (!game) {
    return null;
  }

  return (
    <>
      {!game.finished_at
        ? movies.length > 0 && <Matching game={game} movies={movies} setMovies={setMovies} />
        : <Results game={game} movies={movies} loadMoreMovies={loadMoreMovies} />
      }
    </>
  );
};

export default MatchScreen;
