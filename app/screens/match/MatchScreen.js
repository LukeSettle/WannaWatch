import React, { useEffect, useRef, useState } from "react";
import Matching from "./Matching";
import Results from "./Results";
import Waiting from "./Waiting";
import { keepPlaying } from "../../data/backend_client";
import { buildRound } from "../../data/recommendations";
import { loadOpinions, shouldSkipMovie } from "../../data/movie_opinions";
import { Button, View, Text, StyleSheet } from "react-native";

const MatchScreen = ({ game, setGame, user }) => {
  const [fetchingMovies, setFetchingMovies] = useState(true);
  const [movies, setMovies] = useState([]);
  const [userFinishedMatching, setUserFinishedMatching] = useState(false);
  const [noMoreMovies, setNoMoreMovies] = useState(false);

  const dealtIds = useRef(new Set());
  const likedIdsByPlayer = useRef({});

  const getMovies = async () => {
    setFetchingMovies(true);
    try {
      const nextRound = await buildRound({
        query: JSON.parse(game.query),
        round: game.load_more_count,
        likedIdsByPlayer: Object.values(likedIdsByPlayer.current),
        dealtIds: dealtIds.current,
      });
      nextRound.forEach((movie) => dealtIds.current.add(movie.id));

      const opinions = await loadOpinions();
      const unseen = nextRound.filter((movie) => !shouldSkipMovie(opinions, movie.id));
      const deck = unseen.length > 0 ? unseen : nextRound;

      if (deck.length === 0) {
        setNoMoreMovies(true);
      } else {
        // The last movie in the list is the top card, so the best pick goes last.
        setMovies((prev) => [...prev, ...deck.reverse()]);
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
    game.players.forEach((player) => {
      const previous = likedIdsByPlayer.current[player.user.id] || [];
      const latest = player.liked_movie_ids || [];
      likedIdsByPlayer.current[player.user.id] = [...new Set([...previous, ...latest])];
    });
  }, [game]);

  useEffect(() => {
    getMovies();
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
