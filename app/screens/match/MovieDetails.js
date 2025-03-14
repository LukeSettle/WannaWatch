import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import justwatch_logo from "../../assets/justwatch_logo.png";
import PROVIDERS from "../../../config/providers";
import { fetchMovieDetails } from "../../data/movie_api";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function MovieDetails({ movie, autoFetch = false }) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);

  const truncateOverview = () => {
    if (showFullDetails) return movie.overview;

    const maxLength = 70;
    if (movie.overview.length > maxLength) {
      return `${movie.overview.substring(0, maxLength)}...`;
    }
    return movie.overview;
  };

  const fetchDetails = () => {
    if (movieDetails) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowFullDetails(!showFullDetails);
      return;
    }

    fetchMovieDetails(movie.id)
      .then((data) => {
        setMovieDetails(data);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowFullDetails(!showFullDetails);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const providerLogos = () => {
    return (
      Object.entries(movieDetails.watchProviders.results.US).map(([key, providers]) => {
        if (key === "link") return null;

        return providers.map((provider) => {
          if (
            PROVIDERS.find((p) => p.code === String(provider.provider_id)) ===
            undefined
          )
            return null;

          return (
            <Image
              key={provider.provider_id}
              source={{
                uri: `https://image.tmdb.org/t/p/w500/${provider.logo_path}`,
              }}
              style={{ width: 30, height: 30 }}
            />
          );
        });
      })
    );
  };

  function toPrettyDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }

  const innerDetails = () => {
    console.log("movieDetails", movieDetails);
    return movieDetails.movieDetails;
  };

  useEffect(() => {
    if (autoFetch) {
      fetchDetails();
    }

    // Set the initial state for the LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <View style={styles.container}>
      <Pressable onPress={fetchDetails}>
        <View
          style={
            showFullDetails
              ? styles.overviewContainerExpanded
              : styles.overviewContainer
          }
        >
          <Text style={styles.overview}>{truncateOverview()}</Text>
          {!showFullDetails && (
            <Ionicons
              name="chevron-down-outline"
              size={20}
              color="#333"
              style={styles.expandIcon}
            />
          )}
        </View>
      </Pressable>
      {showFullDetails && (
        <>
          <Text style={styles.details}>
            Genres:{" "}
            {innerDetails().genres.map((genre) => genre.name).join(", ")}
          </Text>
          <Text style={styles.details}>
            Release date: {toPrettyDate(innerDetails().release_date)}
          </Text>
          <Text style={styles.details}>
            Runtime: {innerDetails().runtime} minutes
          </Text>
          <Text style={styles.details}>
            Vote average: {innerDetails().vote_average}
          </Text>
          <Text>Available On</Text>
          <View style={styles.providerLogos}>{providerLogos()}</View>
          <Image
            source={justwatch_logo}
            style={styles.justWatchLogo}
            resizeMode="contain"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  overviewContainer: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    padding: 10,
    borderRadius: 4,
    position: "relative", // enable absolute positioning for the icon
  },
  overviewContainerExpanded: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    position: "relative",
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
  },
  expandIcon: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  details: {
    fontSize: 14,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  providerLogos: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  providerLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    margin: 5,
  },
  poweredByText: {
    fontSize: 14,
    marginBottom: 10,
  },
  justWatchLogo: {
    width: 100,
    height: 50,
    alignSelf: "center",
  },
});

export default MovieDetails;
