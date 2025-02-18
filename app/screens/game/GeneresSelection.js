import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { fetchGenres } from "../../data/movie_api";
import colors from "../../../config/colors";

const GenreSelection = ({ values, setValues }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchGenres().then((data) => {
      setGenres(data);
    });
  }, []);

  const toggleValue = (id) => {
    if (values.genres.includes(id)) {
      setValues({
        ...values,
        genres: values.genres.filter((genre) => genre !== id),
      });
    } else {
      setValues({
        ...values,
        genres: [...values.genres, id],
      });
    }
  };

  return (
    <View style={styles.container}>
      {genres?.map((genre) => (
        <TouchableOpacity
          key={genre.id}
          style={[
            styles.item,
            values.genres.includes(genre.id) && styles.selectedItem,
          ]}
          onPress={() => toggleValue(genre.id)}
        >
          <Text
            style={[
              styles.itemText,
              values.genres.includes(genre.id) && styles.selectedItemText,
            ]}
          >
            {genre.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  item: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
  },
  selectedItemText: {
    color: colors.white,
  },
});

export default GenreSelection;
