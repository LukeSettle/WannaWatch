import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions
} from "react-native";
import MovieDetails from "./MovieDetails";
import colors from "../../../config/colors";

const Results = ({ game, movies, requestKeepPlaying }) => {
  const { width } = useWindowDimensions();
  // Use a breakpoint (600px) to decide between grid and list layout
  const isLargeScreen = width > 600;
  const numColumns = isLargeScreen ? 3 : 1;
  const containerPadding = 40; // from contentContainer style
  const cardMargin = 10; // horizontal margin between cards
  const availableWidth = width - containerPadding * 2;
  // For grid layout, subtract margin space between cards
  const cardWidth = isLargeScreen
    ? (availableWidth - cardMargin * (numColumns - 1)) / numColumns
    : availableWidth;

  const matchedMovies = () => {
    const allMovieIds = game.players.map((player) => player.liked_movie_ids);
    const matchedMovieIds = allMovieIds.reduce((a, b) =>
      a.filter((c) => b.includes(c))
    );
    return movies.filter((movie) =>
      matchedMovieIds.includes(movie.id)
    ).reverse();
  };

  const matchesText = () => {
    const count = matchedMovies().length;
    if (count === 0) {
      return "No matches yet! Try again!";
    } else if (count === 1) {
      return "You found a movie you all WannaWatch!";
    } else {
      return "You found movies you all WannaWatch!";
    }
  };

  const imageSource = (movie) => ({
    uri: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>{matchesText()}</Text>
        <View style={styles.cardsContainer}>
          {matchedMovies().map((movie, index) => (
            <View
              key={movie.id}
              style={[
                styles.card,
                { width: cardWidth, marginRight: (isLargeScreen && ((index + 1) % numColumns !== 0)) ? cardMargin : 0 },
              ]}
            >
              <View style={styles.imageContainer}>
                <Image style={styles.image} source={imageSource(movie)} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <View style={styles.overviewText}>
                  <MovieDetails movie={movie} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable style={styles.keepPlaying} onPress={requestKeepPlaying}>
        <Text style={{ color: "white" }}>Keep playing</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    padding: 40,
    alignItems: "center", // center the grid within available width
  },
  header: {
    fontSize: 22,
    marginVertical: 20,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  card: {
    backgroundColor: "#ffffff",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 10,
  },
  imageContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 27 / 40,
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingTop: 10,
  },
  overviewText: {
    fontSize: 16,
    color: "#666",
  },
  keepPlaying: {
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 10,
    width: "80%",
    alignSelf: "center",
  },
});

export default Results;
