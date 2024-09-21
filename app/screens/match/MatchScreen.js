import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";
import Waiting from "./Waiting";
import { keepPlaying } from "../../data/backend_client";

const MatchScreen = ({ game, user }) => {
  const [fetchingMovies, setFetchingMovies] = useState(true);
  const [movies, setMovies] = useState([]);
  const [userFinishedMatching, setUserFinishedMatching] = useState(false);

  const options = () => {
    const parsedOptions = JSON.parse(game.query);
    return {
      ...parsedOptions,
      params: {
        ...parsedOptions.params,
        page: (parsedOptions.params.page + game.load_more_count) % 500 + 1,
      }
    }
  }

  const getMovies = async () => {
    setFetchingMovies(true);
    try {
      const response = await axios.request(options());
      const json = await response.data.results

      setMovies([...movies, ...json]);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingMovies(false);
    }
  };

  const requestKeepPlaying = async () => {
    try {
      await keepPlaying({ game_id: game.id, user_id: user.id });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getMovies();
  }, [game.load_more_count]);

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
    return <Results game={game} movies={movies} requestKeepPlaying={requestKeepPlaying} />;
  }

  if (userFinishedMatching) {
    return <Waiting />
  }

  return (
    <>
      {!fetchingMovies && <Matching game={game} movies={movies} setMovies={setMovies} />}
    </>
  );
};

export default MatchScreen;
