import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../../config/colors";

const Error = ({ error }) => {
  if (error === null) {
    return null;
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};

export default Error;

const styles = StyleSheet.create({
  errorContainer: {
    margin: 15,
    padding: 20,
    backgroundColor: colors.red,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  errorText: {
    color: colors.white,
  },
});
