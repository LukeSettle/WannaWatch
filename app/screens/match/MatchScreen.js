import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dimensions,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Movie from "./Movie";
import colors from "../../../config/colors";

const { width, height } = Dimensions.get("window");

const MatchScreen = ({}) => {
  const [movies, setMovies] = useState(null);
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [page, setPage] = useState(Math.round(Math.random() * (66 - 1) + 1));

  const options = {
    method: "GET",
    url: "https://apis.justwatch.com/content/titles/en_US/popular",
    params: {
      body: {
        fields: [
          "cinema_release_date",
          "full_path",
          "full_paths",
          "id",
          "localized_release_date",
          "object_type",
          "poster",
          "scoring",
          "title",
          "tmdb_popularity",
          "offers",
        ],
        providers: ["nfx", "hbm", "hlu"],
        enable_provider_filter: false,
        monetization_types: [],
        page: page,
        page_size: 8,
        matching_offers_only: true,
      },
    },
  };

  const getMovies = async () => {
    console.log("getMovies");
    try {
      const response = await axios.request(options);
      const json = await response.data.items;
      setMovies(json);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!updateMovieParams) return;

    const movieToUpdate = movies.find(
      (movie) => movie.id == updateMovieParams.id
    );
    const updatedMovies = movies.map((movie) =>
      movie.id === updateMovieParams.id
        ? { ...movie, liked: updateMovieParams.liked, hidden: true }
        : movie
    );

    setMovies(updatedMovies);
  }, [updateMovieParams]);

  useEffect(() => {
    getMovies();
  }, [page]);

  if (!movies) {
    return null;
  }

  const filteredMovies = movies.filter((movie) => movie.hidden !== true);

  if (filteredMovies.length === 0) {
    const likedMovies = movies.filter((movie) => movie.liked === true);

    return (
      <View styles={styles.container}>
        <Button
          title="Retry with new movies?"
          onPress={() => setPage(page + 1)}
        />
        <Text>Here are the movies you liked:</Text>
        {likedMovies.map((movie) => (
          <Text key={movie.id}>{movie.title}</Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filteredMovies.map((movie, index) => (
        <Movie
          key={movie.id}
          movie={movie}
          setUpdateMovieParams={setUpdateMovieParams}
          simple={index !== filteredMovies.length - 1}
        />
      ))}
    </View>
  );
};

export default MatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
