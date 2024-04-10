import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"; // Add the missing import statement for StyleSheet
import { fetchGenres } from "../../data/movie_api";
import colors from "../../../config/colors";

const GenreSelection = ({ values, setValues }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchGenres().then((data) => {
      setGenres(data)
    });
  }, []);

  const toggleValue = (id) => {
    if (values.genres.includes(id)) {
      setValues({
        ...values,
        genres: values.genres.filter((genre) => genre !== id)
      })
    } else {
      setValues({
        ...values,
        genres: [...values.genres, id]
      })
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
          <Text style={[styles.itemText, values.genres.includes(genre.id) && styles.selectedItemText,]}>{genre.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({ // Wrap the styles object in StyleSheet.create()
  container: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  item: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: colors.secondary,
  },
  selectedItemText: {
    color: colors.white,
  },
  itemText: {
    fontSize: 18,
    color: '#333333',
  },
});

export default GenreSelection;