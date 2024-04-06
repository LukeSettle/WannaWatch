import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native"; // Add the missing import statement for StyleSheet
import Checkbox from 'expo-checkbox';
import { fetchGenres } from "../../data/movie_api";

const GenreSelection = ({ values, setValues }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchGenres().then((data) => {
      setGenres(data)
      setValues({ ...values, genres: data.map((genre) => genre.id) });
    });
  }, []);

  const handleGenreChange = (genre) => {
    const updatedGenres = values.genres.includes(genre)
      ? values.genres.filter((g) => g !== genre)
      : [...values.genres, genre];
    setValues({ ...values, genres: updatedGenres });
  };

  return (
    <View style={styles.genreContainer}>
      {genres?.map((genre) => (
        <View key={genre.id} style={styles.genreItem}>
          <Checkbox
            value={values.genres.includes(genre.id)}
            onValueChange={() => handleGenreChange(genre.id)}
          />
          <Text style={styles.genreText}>{genre.name}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({ // Wrap the styles object in StyleSheet.create()
  genreContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  genreItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  genreText: {
    fontSize: 18,
    color: "#333333",
  },
});

export default GenreSelection;