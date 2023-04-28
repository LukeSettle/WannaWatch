import React from "react";
import { View, Text, Button } from "react-native";

const Results = ({ matchedMovies, setPage }) => {
  return (
    <View>
      <Button
        title="Retry with new movies?"
        onPress={() => setPage(page + 1)}
      />
      <Text>Here are the movies everyone matched on:</Text>
      {matchedMovies.map((movie) => (
        <Text key={movie.id}>{movie.title}</Text>
      ))}
    </View>
  );
};

export default Results;
