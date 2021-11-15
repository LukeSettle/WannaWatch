/* @flow weak */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import Interactable from "react-native-interactable-reanimated";
import Animated, {
  Value,
  interpolate,
  concat,
  Extrapolate,
} from "react-native-reanimated";
import colors from "../../../config/colors";

const { width, height } = Dimensions.get("window");
const φ = (1 + Math.sqrt(5)) / 2;
const deltaX = width / 2;
const w = width - 32;
const h = w * φ;
const α = Math.PI / 12;
const A = width * Math.cos(α) + height * Math.sin(α);

const Movie = ({ movie, setUpdateMovieParams, simple }) => {
  const x = new Value(0);
  const y = new Value(0);

  const rotateZ = concat(
    interpolate(x, {
      inputRange: [-1 * deltaX, deltaX],
      outputRange: [α, -1 * α],
      extrapolate: Extrapolate.CLAMP,
    }),
    "rad"
  );

  const translateX = x;
  const translateY = y;

  const likeOpacity = interpolate(x, {
    inputRange: [0, deltaX / 4],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const nopeOpacity = interpolate(x, {
    inputRange: [(-1 * deltaX) / 4, 0],
    outputRange: [1, 0],
    extrapolate: Extrapolate.CLAMP,
  });

  const style = {
    ...StyleSheet.absoluteFillObject,
    transform: [{ translateX }, { translateY }, { rotateZ }],
  };

  const onSnap = ({ nativeEvent: { x } }) => {
    if (x !== 0) {
      // Right = like; Left = Nope
      const movieParams = { id: movie.id, liked: x > 0 };
      setUpdateMovieParams(movieParams);
    }
  };

  const imageSource = () => {
    const titleAsParam = movie.full_path.split("/").slice(-1)[0];
    let posterArray = movie.poster.split("/");
    posterArray.pop();
    const posterString = posterArray.join("/");

    return {
      uri: `https://images.justwatch.com${posterString}/s332/${titleAsParam}`,
    };
  };

  console.log("simple", `${movie.title} ${simple}`);

  if (simple) {
    return (
      <SafeAreaView style={styles.card}>
        <Image style={styles.poster} source={imageSource()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.card}>
      <Interactable.View
        key={movie.id}
        style={StyleSheet.absoluteFillObject}
        snapPoints={[{ x: -1 * A }, { x: 0 }, { x: A }]}
        animatedValueX={x}
        {...{ onSnap, x, y }}
      >
        <Animated.View {...{ style }}>
          <Image style={styles.poster} source={imageSource()} />
          <View style={styles.buttonsWrapper}>
            <Animated.View
              style={[
                styles.buttonContainer,
                styles.likeButton,
                { opacity: likeOpacity },
              ]}
            >
              <Text style={styles.likeText}>Like</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.buttonContainer,
                styles.nopeButton,
                { opacity: nopeOpacity },
              ]}
            >
              <Text style={styles.nopeText}>Nope</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </Interactable.View>
    </SafeAreaView>
  );
};

export default Movie;

const styles = StyleSheet.create({
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: w,
    height: h,
    marginLeft: 16,
    position: "absolute",
  },
  buttonsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    height: "30%",
    padding: 20,
  },
  buttonContainer: {
    width: "50%",
    height: undefined,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  likeButton: {
    backgroundColor: colors.quaternary,
    color: "white",
  },
  nopeButton: {
    backgroundColor: colors.red,
    color: "white",
  },
  likeText: {
    color: "white",
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "Baskerville-SemiBoldItalic" : "serif",
  },
  nopeText: {
    color: "white",
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "Baskerville-SemiBoldItalic" : "serif",
  },
});
