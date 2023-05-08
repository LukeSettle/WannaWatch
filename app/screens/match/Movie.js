/* @flow weak */

import React from "react";
import { StyleSheet, Image, Dimensions } from "react-native";
import TinderCard from "./TinderCard";
import colors from "../../../config/colors";
const { width, height } = Dimensions.get("window");

const Movie = ({ movie, setUpdateMovieParams }) => {
  const onSwipe = (direction) => {
    if ('left') {
      setUpdateMovieParams({ id: movie.id, liked: true });
    } else if ('right') {
      setUpdateMovieParams({ id: movie.id, liked: false });
    }
  };

  const imageSource = () => {
    return {
      uri: `https://image.tmdb.org/t/p/original/${movie.poster_path}`,
    };
  };

  return (
    <TinderCard
      onSwipe={onSwipe}
      swipeRequirementType={'position'}
      preventSwipe={['up', 'down']}
      swipeThreshold={width - 200}
    >
      <Image
        source={imageSource()}
        style={styles.poster}
        resizeMode="cover"
      />
    </TinderCard>
  );
};

export default Movie;

const styles = StyleSheet.create({
  poster: {
    ...StyleSheet.absoluteFillObject,
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 30,
    backgroundColor: colors.primary,
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "pink",
  },
});
