import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Loader = ({ color }) => {
  return (
    <View style={styles.loader}>
      <Text style={{ color: color }}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;