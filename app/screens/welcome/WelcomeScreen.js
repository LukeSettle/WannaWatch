import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ImageBackground,
} from "react-native";
import colors from "../../../config/colors";

const WelcomeScreen = ({ navigation }) => {
  const image = require("../../assets/theater.jpg");

  return (
    <ImageBackground source={image} style={styles.backgroundImage}>
      <Pressable
        style={[styles.buttonBase, styles.startButton]}
        onPress={() => navigation.navigate("Match")}
      >
        <Text style={styles.text}>Press to start matching</Text>
      </Pressable>
      <Pressable
        style={[styles.buttonBase, styles.loginButton]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.text}>Login</Text>
      </Pressable>
      <StatusBar style="auto" />
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  text: {
    color: colors.white,
  },
  buttonBase: {
    width: "50%",
    height: 50,
    justifyContent: "center",
    margin: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  startButton: {
    backgroundColor: colors.primary,
    color: colors.red,
  },
  loginButton: {
    backgroundColor: colors.red,
  },
});
