import React, { useContext } from "react";

import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ImageBackground,
} from "react-native";
import { upsertUser } from "../../data/cosmo_client";
import colors from "../../../config/colors";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const image = require("../../assets/theater.jpg");

  const submitForm = (values) => {
    const userParams = {
      device_id: user.device_id,
      display_name: values.display_name,
    }

    upsertUser(userParams)
      .then((upsertedUser) => {
        setUser(upsertedUser);
        navigation.navigate("Game")
      })
      .catch((error) => {
        console.log("error", error)
        setError(error);
      });
  };

  const visibleButtons = () => {
    if (user) {
      return (
        <Formik
          initialValues={{
            display_name: user.display_name || "",
          }}
          onSubmit={(values) => submitForm(values)}
        >
          {({ handleChange, handleBlur, submitForm, values }) => (
            <View>
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={handleChange("display_name")}
                  onBlur={handleBlur("display_name")}
                  placeholder="Enter a name for your friends to see"
                  placeholderTextColor="#aaa"
                  value={values.display_name}
                  style={styles.textInput}
                />
              </View>
              <Pressable
                style={styles.buttonBase}
                disabled={!values.display_name}
                onPress={submitForm}
              >
                <Text style={styles.text}>Press to start matching</Text>
              </Pressable>
            </View>
          )}
        </Formik>
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
  buttonBase: {
    zIndex: 1,
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
  textInput: {
    borderColor: "#eee",
    height: 60,
    backgroundColor: "#ffffff",
    paddingLeft: 15,
    paddingRight: 15,
  },
});
