import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ImageBackground,
} from "react-native";
import colors from "../../../config/colors";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const user = useContext(UserContext);
  const image = require("../../assets/theater.jpg");

  const visibleButtons = () => {
    if (user) {
      return (
        <Pressable
          style={styles.buttonBase}
          onPress={() => navigation.navigate("Game")}
        >
          <Text style={styles.text}>Press to start matching</Text>
        </Pressable>
      );
    } else {
      return (
        <>
          <Pressable
            style={styles.buttonBase}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.text}>Login</Text>
          </Pressable>
          <Pressable
            style={styles.buttonBase}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.text}>Sign Up</Text>
          </Pressable>
        </>
      );
    }
  };

  return (
    <ImageBackground source={image} style={styles.backgroundImage}>
      <Text style={styles.headerText}>So... what do you wanna watch?</Text>
      {visibleButtons()}
      <StatusBar style="auto" />
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  headerText: {
    textAlign: "center",
    backgroundColor: colors.secondary,
    marginHorizontal: 30,
    marginBottom: 200,
    padding: 20,
    color: colors.red,
    borderRadius: 40,
    overflow: "hidden",
    fontSize: 40,
    fontFamily: "Noteworthy-Bold",
  },
  text: {
    color: colors.white,
  },
  buttonBase: {
    marginHorizontal: 30,
    marginVertical: 10,
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
  },
  backgroundImage: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    resizeMode: "cover",
    width: "100%",
  },
  startButton: {
    backgroundColor: colors.primary,
    color: colors.red,
  },
});
