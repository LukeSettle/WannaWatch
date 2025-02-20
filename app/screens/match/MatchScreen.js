import React, { useEffect, useState } from "react";
import Matching from "./Matching";
import axios from "axios";
import Results from "./Results";
import Waiting from "./Waiting";
import { keepPlaying } from "../../data/backend_client";
import { Button, View, Text, StyleSheet } from "react-native";

const MatchScreen = ({ game, setGame, user }) => {
  const [fetchingMovies, setFetchingMovies] = useState(true);
  const [movies, setMovies] = useState([]);
  const [userFinishedMatching, setUserFinishedMatching] = useState(false);
  const [noMoreMovies, setNoMoreMovies] = useState(false);

  const options = () => {
    const parsedOptions = JSON.parse(game.query);
    return {
      ...parsedOptions,
      params: {
        ...parsedOptions.params,
        // Use load_more_count to pick a new page
        page: (parsedOptions.params.page + game.load_more_count) % 500 + 1,
      },
    };
  };

  const getMovies = async () => {
    setFetchingMovies(true);
    try {
      const response = await axios.request(options());
      const json = response.data.results; // array of movies

      if (json.length === 0) {
        // No more matching movies
        setNoMoreMovies(true);
      } else {
        // Append new movies to the existing list
        setMovies((prev) => [...prev, ...json]);
      }
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
  };

  useEffect(() => {
    getMovies();
    // Re-run whenever load_more_count changes
  }, [game.load_more_count]);

  useEffect(() => {
    const currentPlayer = game.players.find(
      (player) => player.user.id === user?.id
    );

    if (currentPlayer && currentPlayer.finished_at !== null) {
      setUserFinishedMatching(true);
    } else {
      setUserFinishedMatching(false);
    }
  }, [game]);

  if (!game) return null;

  // If the game is done, show final results
  if (game.finished_at) {
    return (
      <Results
        game={game}
        movies={movies}
        requestKeepPlaying={requestKeepPlaying}
      />
    );
  }

  // If user is done matching, show waiting screen
  if (userFinishedMatching) {
    return <Waiting />;
  }

  // If we finished fetching but got an empty result
  // => No more matching movies
  if (!fetchingMovies && noMoreMovies) {
    return (
      <View style={styles.noMoviesContainer}>
        <Text style={styles.noMoviesText}>
          No more movies match your search criteria.
        </Text>
        <Text style={styles.noMoviesSubtext}>
          Try another game and adjust your filters, providers, and genres.
        </Text>

        <Button
          title="Create a new game"
          onPress={() => {
            setGame(null);
          }}
        />
      </View>
    );
  }

  // Otherwise, show the matching screen (once fetching is done)
  return (
    <>
      {!fetchingMovies && (
        <Matching game={game} movies={movies} setMovies={setMovies} />
      )}
    </>
  );
};

export default MatchScreen;

const styles = StyleSheet.create({
  noMoviesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMoviesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  noMoviesSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
