import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Movie from "./Movie";
import { SocketContext } from "../../contexts/SocketContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../../config/colors";

const Matching = ({ game, movies, setMovies }) => {
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const { webSocket } = useContext(SocketContext);
  const finishedSent = useRef(false);
  const pendingFinish = useRef(false);

  useEffect(() => {
    finishedSent.current = false;
    pendingFinish.current = false;
  }, [game?.id]);

  const likedMovies = () => {
    if (movies == null) return [];
    return movies.filter((movie) => movie.liked === true);
  };

  const filteredMovies = () => {
    if (movies == null) return null;
    return movies.filter((movie) => movie.hidden !== true);
  };

  const sendFinishMatching = useCallback(() => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      pendingFinish.current = true;
      return;
    }
    if (finishedSent.current) return;
    finishedSent.current = true;
    pendingFinish.current = false;
    const liked = likedMovies();
    webSocket.send(
      JSON.stringify({
        command: "message",
        identifier: JSON.stringify({
          channel: "GameChannel",
          game_id: game.id,
        }),
        data: JSON.stringify({
          action: "finish_matching",
          liked_movie_ids: liked.map((movie) => movie.id),
          liked_movies: liked.map((movie) => ({
            id: movie.id,
            genre_ids: movie.genre_ids || [],
          })),
        }),
      })
    );
  }, [webSocket, game?.id, movies]);

  const nopeCurrentMovie = () => {
    const visible = filteredMovies();
    if (!visible?.length) return;
    setUpdateMovieParams({ id: visible[visible.length - 1].id, liked: false });
  };

  const likeCurrentMovie = () => {
    const visible = filteredMovies();
    if (!visible?.length) return;
    setUpdateMovieParams({ id: visible[visible.length - 1].id, liked: true });
  };

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
    if (!movies || movies.length === 0) return;
    const unswipedMoviesCount = movies.filter((movie) => movie.liked === undefined).length;
    const visible = filteredMovies();
    if (unswipedMoviesCount > 0 || visible == null || visible.length !== 0) return;

    sendFinishMatching();
  }, [movies, sendFinishMatching]);

  useEffect(() => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) return;
    if (!pendingFinish.current) return;
    finishedSent.current = false;
    sendFinishMatching();
  }, [webSocket, sendFinishMatching]);

  if (movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.outer_container}>
      <View style={styles.container}>
        {(filteredMovies() || []).map((movie) => (
          <Movie
            key={movie.id}
            movie={movie}
            setUpdateMovieParams={setUpdateMovieParams}
          />
        ))}
      </View>
      <View style={styles.directions}>
        <Pressable
          onPress={nopeCurrentMovie}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          accessibilityLabel="Pass"
        >
          <Ionicons name="close" size={28} color={colors.red} />
        </Pressable>
        <Pressable
          onPress={likeCurrentMovie}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnLike, pressed && styles.actionBtnPressed]}
          accessibilityLabel="Like"
        >
          <Ionicons name="heart" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

export default Matching;

const styles = StyleSheet.create({
  outer_container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    marginTop: "4%",
  },
  directions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  actionBtnLike: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  actionBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
