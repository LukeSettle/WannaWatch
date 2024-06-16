import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";
import Waiting from "./Waiting";
import { keepPlaying } from "../../data/backend_client";

const MatchScreen = ({ game, setGame, user }) => {
  const [query, setQuery] = useState(JSON.parse(game.query));
  const [movies, setMovies] = useState([]);
  const [userFinishedMatching, setUserFinishedMatching] = useState(false);

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
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreMovies = async () => {
    const newPage = Math.round(Math.random() * (66 - 1) + 1)

    const params = {
      user_id: user.id,
      game_id: game.id,
      game: {
        query: JSON.stringify({
          ...query,
          params: {
            ...query.params,
            page: newPage,
          }
        })
      }
    }

    keepPlaying(params)
      .then(() => {
        console.log('====================================');
        console.log('Keep playing initiated', params);
        console.log('====================================');
      })
  }

  useEffect(() => {
    if (game.finished_at !== null) {
      return;
    }
    getMovies();
  }, [game.finished_at]);

  useEffect(() => {
    const currentPlayer = game.players.find(player => player.user.id === user?.id);

    if (currentPlayer && currentPlayer.finished_at !== null) {
      setUserFinishedMatching(true)
    } else {
      setUserFinishedMatching(false)
    }
  }, [game]);

  if (!game) {
    return null;
  }

  if (game.finished_at) {
    return <Results game={game} movies={movies} loadMoreMovies={loadMoreMovies} />;
  }

  if (userFinishedMatching) {
    return <Waiting />
  }

  return (
    <>
      {movies.length > 0 && <Matching game={game} movies={movies} setMovies={setMovies} />}
    </>
  );
};

export default MatchScreen;
