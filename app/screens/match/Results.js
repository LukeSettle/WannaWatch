import React from "react";
import { View, Text, Button } from "react-native";

const Results = ({ game, movies }) => {
  const matchedMovies = () => {
    console.log('game', game);
    const allMovieIds = game.players.map((player) => player.liked_movie_ids);
    console.log('allMovieIds', allMovieIds);
    const matchedMovieIds = allMovieIds.reduce((a, b) => a.filter(c => b.includes(c)));
    return movies.filter((movie) => matchedMovieIds.includes(movie.id));
  }

  return (
    <View>
      {/* <Button
        title="Retry with new movies?"
        onPress={() => setPage(page + 1)}
      />
      <Button
        title="Change game options"
        onPress={() => newGame()}
      /> */}

      <Text>Here are the movies everyone matched on:</Text>
      {matchedMovies().map((movie) => (
        <Text key={movie.id}>{movie.title}</Text>
      ))}
    </View>
  );
};

export default Results;
