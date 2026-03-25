import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import colors from "../../../config/colors";

const Waiting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almost there</Text>
      <Text style={styles.text}>
        Waiting for everyone to finish swiping. Matches appear when all players are done.
      </Text>
      <ActivityIndicator size="large" color={colors.secondary} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 28,
  },
  spinner: {
    marginTop: 8,
  },
});

export default Waiting;