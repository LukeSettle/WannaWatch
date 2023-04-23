import React, { useContext } from "react";

import axios from "axios";
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
import Constants from "expo-constants";
import colors from "../../../config/colors";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const image = require("../../assets/theater.jpg");

  const submitForm = (values) => {
    axios({
      headers: { "Access-Control-Allow-Origin": "*" },
      method: "put",
      url: `${Constants.manifest.extra.API_URL}/users`,
      data: {
        device_id: user.device_id,
        user: {
          display_name: values.display_name,
        },
      },
    })
      .then((response) => {
        setUser(response.data.data);
        navigation.navigate("Game")
      })
      .catch((error) => {
        console.log("error", error)
        setError(error.response.data.error);
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
          {({ handleChange, handleBlur, handleSubmit, values }) => (
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
                onPress={handleSubmit}
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
