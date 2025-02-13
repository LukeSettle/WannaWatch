import React, { useContext } from "react";
import { Formik } from "formik";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { upsertUser } from "../../data/backend_client";
import colors from "../../../config/colors";
import globalStyles from "../../../config/styles";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser, entryCode, setEntryCode, onLayoutRootView } =
    useContext(UserContext);

  // Called when user enters a new username
  const submitForm = (values) => {
    const userParams = {
      device_id: user.device_id,
      username: values.username,
    };

    upsertUser(userParams)
      .then((upsertedUser) => {
        setUser(upsertedUser);
        navigation.navigate("Game");
      })
      .catch((error) => {
        console.log("error", error);
        Alert.alert("Error", "Unable to update user.");
      });
  };

  // Called when user wants to create a new game
  const handleCreateGame = () => {
    // Clear any previously set entry code
    setEntryCode("");

    // Optionally upsert again if you want to ensure user is synced
    const userParams = {
      device_id: user.device_id,
      username: user.username,
    };

    upsertUser(userParams)
      .then((upsertedUser) => {
        setUser(upsertedUser);
        navigation.navigate("Game");
      })
      .catch((error) => {
        console.log("error", error);
        Alert.alert("Error", "Unable to create game.");
      });
  };

  // Called when user wants to join a game with a code
  const handleJoinGame = (code) => {
    if (!code) {
      Alert.alert("Invalid Code", "Please enter a valid game code.");
      return;
    }
    // Simulate deep link or set the entryCode in context
    setEntryCode(code);
    navigation.navigate("Game");
  };

  if (!user) return null;

  const hasUsername = !!user.username;

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary, colors.red]}
      style={styles.background}
    >
      {/* Center children vertically & horizontally */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.innerContainer} onLayout={onLayoutRootView}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.image}
          />

          <Text style={styles.headerText}>
            So... what do you wanna watch?
          </Text>

          {/* If user has NO username, show "Enter your name" flow */}
          {!hasUsername && (
            <Formik
              initialValues={{ username: user.username || "" }}
              onSubmit={(values) => submitForm(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View style={styles.formContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    placeholder="Enter your name"
                    placeholderTextColor="#aaa"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      pressed && globalStyles.pressedButtonContainer,
                    ]}
                    onPress={handleSubmit}
                  >
                    <Text style={globalStyles.buttonText}>
                      Start Matching
                    </Text>
                  </Pressable>
                </View>
              )}
            </Formik>
          )}

          {/* If user ALREADY has a username, show "Game Code" flow */}
          {hasUsername && (
            <Formik initialValues={{ gameCode: "" }} onSubmit={() => {}}>
              {({ handleChange, handleBlur, values }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Enter Game Code</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("gameCode")}
                    onBlur={handleBlur("gameCode")}
                    value={values.gameCode}
                    placeholder="e.g. ABC123"
                    placeholderTextColor="#aaa"
                  />

                  {/* Join Game Button */}
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      pressed && globalStyles.pressedButtonContainer,
                    ]}
                    onPress={() => handleJoinGame(values.gameCode)}
                  >
                    <Text style={globalStyles.buttonText}>Join Game</Text>
                  </Pressable>

                  {/* Create Game Button - BLUE */}
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      pressed && globalStyles.pressedButtonContainer,
                      {
                        marginTop: 10,
                        backgroundColor: "#3498db", // Overridden color
                      },
                    ]}
                    onPress={handleCreateGame}
                  >
                    <Text style={globalStyles.buttonText}>Create Game</Text>
                  </Pressable>
                </View>
              )}
            </Formik>
          )}

          {/* View Matches Button (always visible) */}
          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              pressed && globalStyles.pressedButtonContainer,
              styles.linkButton,
            ]}
            onPress={() => navigation.navigate("Friends List")}
          >
            <Text style={styles.linkText}>View Matches</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  // Ensures content is centered within the scrollable area
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 25,
  },
  headerText: {
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Signika",
    fontSize: 50,
    color: colors.flame,
  },
  formContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    width: 300,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: colors.white,
    fontSize: 18,
  },
});
