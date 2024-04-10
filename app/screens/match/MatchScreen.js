import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";

const MatchScreen = ({ game, setGame, user }) => {
  const [query, setQuery] = useState(JSON.parse(game.query));
  const [movies, setMovies] = useState([]);

  const userFinishedMatching = () => (
    game.players.find(player => player.user.id === user.id).finished_matching
  )

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

    setQuery({
      ...query,
      params: {
        ...query.params,
        page: newPage,
      }
    });
  }

  useEffect(() => {
    getMovies();
  }, [query]);

  if (!game) {
    return null;
  }

  if (game.finished_at) {
    return <Results game={game} movies={movies} loadMoreMovies={loadMoreMovies} />;
  }

  if (userFinishedMatching()) {
    return <Waiting />
  }

  return (
    <>
      {movies.length > 0 && <Matching game={game} movies={movies} setMovies={setMovies} />}
    </>
  );
};

export default MatchScreen;
