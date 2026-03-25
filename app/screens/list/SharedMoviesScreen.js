import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { friendsMovieIds } from "../../data/backend_client";
import { UserContext } from "../../contexts/UserContext";
import Movie from "./Movie";
import colors from "../../../config/colors";

const FILTERS = [
  { key: "ourLikedMovieIds", label: "Mutual likes" },
  { key: "friendsLikedMovieIds", label: "Their likes" },
  { key: "myLikedMovieIds", label: "My likes" },
];

const SharedMoviesScreen = ({ route }) => {
  const { user } = useContext(UserContext);
  const [listKey, setListKey] = useState("ourLikedMovieIds");
  const [loading, setLoading] = useState(true);
  const [movieIds, setMovieIds] = useState({
    myLikedMovieIds: [],
    friendsLikedMovieIds: [],
    ourLikedMovieIds: [],
  });
  const { friendId } = route.params;

  useEffect(() => {
    setLoading(true);
    friendsMovieIds({ friend_id: friendId, user_id: user.id })
      .then((data) => setMovieIds(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [friendId, user.id]);

  const ids = movieIds[listKey] || [];
  const isSolo = user.id === friendId;

  return (
    <View style={styles.root}>
      {!isSolo && (
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setListKey(f.key)}
              style={[
                styles.chip,
                listKey === f.key && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  listKey === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : ids.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySub}>
            Keep swiping in games — likes show up here for recommendations and shared picks.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {ids.map((movieId) => (
            <Movie key={movieId} movieId={movieId} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: "#fff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default SharedMoviesScreen;
