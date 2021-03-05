import React, { useEffect, useState } from "react";
import axios from "axios";
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import { createLikedMovieIds } from '../../../graphql/mutations';
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

Amplify.configure(awsconfig);

const { width, height } = Dimensions.get("window");
const pageSize = 8;
const url = "https://apis.justwatch.com/content/titles/en_US/popular";
const providers = ["nfx","hbm","hlu"];

const MatchScreen = ({}) => {
  const [movies, setMovies] = useState(null);
  const [updateMovieParams, setUpdateMovieParams] = useState(null);
  const [page, setPage] = useState(Math.round((Math.random() * (66 - 1) + 1)));

  const options = {
    method: "GET",
    url: url,
    params: {
      body: {
        fields:["cinema_release_date", "full_path", "full_paths", "id", "localized_release_date", "object_type", "poster", "scoring", "title", "tmdb_popularity", "offers"],
        providers: providers,
        enable_provider_filter: false,
        monetization_types: [],
        page: page,
        page_size: pageSize,
        matching_offers_only: true
      },
    },
  };

  const saveLikedMovieIdsRecord = async (likedMovieIds) => {
    const likedMovieIdsRecord = {
      movieIds: likedMovieIds,
      searchReference: `${url}?page=${page}&page_size=${pageSize}&providers=${providers.join(',')}`,
      user: {
        id: '1234',
        email: 'lukewestonsettle@gmail.com',
        username: 'lwsettle96',
        createdAt:
      }
    }

    console.log('likedMovieIdsRecord', likedMovieIdsRecord);

    try {
      const response = await API.graphql(graphqlOperation(createLikedMovieIds, { input: likedMovieIdsRecord }));
      console.log('response', response);
    } catch (e) {
      console.log('Error', e);
    }
  }

  const getMovies = async () => {
    try {
      const response = await axios.request(options);
      const json = await response.data.items;
      setMovies(json);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!updateMovieParams) return;

    const movieToUpdate = movies.find((movie) => movie.id == updateMovieParams.id)
    const updatedMovies = movies.map(movie => (
      movie.id === updateMovieParams.id
      ? {...movie, liked: updateMovieParams.liked, hidden: true}
      : movie
    ))

    setMovies(updatedMovies);
  }, [updateMovieParams])

  useEffect(() => {
    getMovies();
  }, [page]);


  if (!movies) {
    return null;
  }

  const filteredMovies = (
    movies.filter((movie) => (
      movie.hidden !== true
    ))
  );

  if (filteredMovies.length === 0) {
    const likedMovies = (
      movies.filter((movie) => (
        movie.liked === true
      ))
    )

    saveLikedMovieIdsRecord(likedMovies.map(movie => movie.id.toString()))

    return (
      <View styles={styles.container}>
        <Button title="Retry with new movies?" onPress={() => setPage(page + 1)} />
        <Text>Here are the movies you liked:</Text>
        {likedMovies.map((movie) => (
          <Text key={movie.id}>{movie.title}</Text>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {filteredMovies.map((movie, index) => (
        <Movie key={movie.id} movie={movie} setUpdateMovieParams={setUpdateMovieParams} simple={index !== filteredMovies.length - 1} />
      ))}
    </View>
  );
};

export default MatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  }
});
