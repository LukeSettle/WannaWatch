import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, Button, View, ImageBackground } from "react-native";
import colors from "../../../config/colors";

const WelcomeScreen = ({ navigation }) => {
  const image = require("../../assets/theater.jpg");

  return (
    <ImageBackground source={image} style={styles.backgroundImage}>
      <View style={styles.startButton}>
        <Button
          color={colors.secondary}
          onPress={() => navigation.navigate("Match")}
          title="Press to start matching"
        />
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  startButton: {
    backgroundColor: colors.secondary,
    width: "100%",
    height: 100,
    justifyContent: "center"
  }
});
