import React, { useEffect, useContext, useState } from "react";
import { Formik } from "formik";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CurrentGames from "./CurrentGames";
import { upsertUser } from "../../data/backend_client";
import colors from "../../../config/colors";
import globalStyles from "../../../config/styles";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser, entryCode, setEntryCode, onLayoutRootView } = useContext(UserContext);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user && entryCode) {
      navigation.navigate("Game");
    }
  }, [entryCode, user]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Getting things ready…</Text>
      </View>
    );
  }

  const handleNameSubmit = (values) => {
    const userParams = {
      device_id: user.device_id,
      username: values.username,
    };
    upsertUser(userParams)
      .then((updatedUser) => {
        setUser(updatedUser);
      })
      .catch((error) => {
        console.log("error", error);
        Alert.alert("Error", "Unable to update user.");
      });
  };

  const handleJoinGame = (code) => {
    if (!code) {
      Alert.alert("Invalid Code", "Please enter a valid game code.");
      return;
    }
    setEntryCode(code);
    navigation.navigate("Game");
  };

  const handleCreateGame = () => {
    setEntryCode("");
    navigation.navigate("Game");
  };

  const hasUsername = !!user.username;

  return (
    <LinearGradient
      colors={["#5c7ab8", colors.secondary, "#1e2540"]}
      style={styles.background}
    >
      {hasUsername && (
        <View style={[styles.topRightContainer, { top: insets.top + 8 }]}>
          <Pressable
            onPress={() => setShowEditNameModal(true)}
            style={({ pressed }) => [styles.profilePill, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.usernameText}>{user.username}</Text>
          </Pressable>
        </View>
      )}

      {/* The main scrollable area */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        nestedScrollEnabled
      >
        {/* The "top" portion (form, etc.) */}
        <View onLayout={onLayoutRootView} style={styles.innerContainer}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.image}
          />
          <Text style={styles.headerText}>What do you wanna watch?</Text>
          <Text style={styles.tagline}>Pick filters, swipe together, find a match.</Text>

          {!hasUsername ? (
            <Formik initialValues={{ username: "" }} onSubmit={handleNameSubmit}>
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
                    <Text style={globalStyles.buttonText}>Save Name</Text>
                  </Pressable>
                </View>
              )}
            </Formik>
          ) : (
            <Formik initialValues={{ gameCode: entryCode }} onSubmit={() => {}}>
              {({ handleChange, handleBlur, values }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Game code</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("gameCode")}
                    onBlur={handleBlur("gameCode")}
                    value={values.gameCode}
                    placeholder="e.g. ABC123"
                    placeholderTextColor="#aaa"
                    autoCapitalize="characters"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      pressed && globalStyles.pressedButtonContainer,
                    ]}
                    onPress={() => handleJoinGame(values.gameCode)}
                  >
                    <Text style={globalStyles.buttonText}>Join game</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      styles.secondaryBtn,
                      pressed && globalStyles.pressedButtonContainer,
                    ]}
                    onPress={handleCreateGame}
                  >
                    <Text style={globalStyles.buttonText}>Start new game</Text>
                  </Pressable>
                </View>
              )}
            </Formik>
          )}

          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              pressed && globalStyles.pressedButtonContainer,
              styles.linkButton,
            ]}
            onPress={() => navigation.navigate("Friends List")}
          >
            <Text style={styles.linkText}>Likes & friends</Text>
          </Pressable>
        </View>

        {/* The "Current Games" section, also scrollable if needed. */}
        <View style={styles.currentGamesSection}>
          {/* Pass the navigation so CurrentGames can navigate if needed */}
          <CurrentGames navigation={navigation} />
        </View>
      </KeyboardAwareScrollView>

      {/* Modal for editing name */}
      <Modal visible={showEditNameModal} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <Formik
              initialValues={{ username: user.username || "" }}
              onSubmit={(values) => {
                const userParams = {
                  device_id: user.device_id,
                  username: values.username,
                };
                upsertUser(userParams)
                  .then((updatedUser) => {
                    setUser(updatedUser);
                    setShowEditNameModal(false);
                  })
                  .catch((error) => {
                    console.log("error", error);
                    Alert.alert("Error", "Unable to update name.");
                  });
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View>
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
                    <Text style={globalStyles.buttonText}>Save Name</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      globalStyles.buttonContainer,
                      pressed && globalStyles.pressedButtonContainer,
                      styles.cancelButton,
                    ]}
                    onPress={() => setShowEditNameModal(false)}
                  >
                    <Text style={globalStyles.buttonText}>Cancel</Text>
                  </Pressable>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80, // some extra space at the top
    paddingBottom: 30, // some extra space at the bottom
  },
  innerContainer: {
    alignItems: "center",
    width: "100%",
  },
  topRightContainer: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  profilePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  usernameText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "700",
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
    marginBottom: 8,
    fontFamily: "Signika",
    fontSize: 36,
    color: "#fff",
    paddingHorizontal: 16,
    lineHeight: 42,
  },
  tagline: {
    textAlign: "center",
    color: "rgba(255,255,255,0.88)",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 22,
    margin: 20,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
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
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  linkText: {
    color: colors.white,
    fontSize: 17,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.flame,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#ccc",
  },
  // CurrentGames styling
  currentGamesSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  }
});
