import React, { useState } from "react";
import { Button, TextInput, View, StyleSheet, Keyboard } from "react-native";
import { Formik } from "formik";
import axios from "axios";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import Error from "../../components/shared/Error";

const LoginScreen = ({ navigation }) => {
  const [error, setError] = useState(null);
  const { getItem, setItem } = useAsyncStorage("@authorization");

  const writeItemToStorage = async (newValue) => {
    await setItem(newValue);
  };

  const handleSubmit = (values) => {
    Keyboard.dismiss();
    axios({
      headers: { "Access-Control-Allow-Origin": "*" },
      method: "post",
      url: `${Constants.manifest.extra.API_URL}/users/log_in`,
      data: {
        user: {
          email: values.username,
          password: values.password,
        },
      },
    })
      .then((response) => {
        writeItemToStorage(response);
        navigation.navigate("Game");
      })
      .catch((error) => {
        console.log("error", error)
        setError(error.response.data.error);
      });
  };

  return (
    <>
      <Error error={error} />
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                placeholder="Username"
                value={values.username}
                style={styles.textInput}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                placeholder="Password"
                value={values.password}
                style={styles.textInput}
              />
            </View>
            <Button onPress={handleSubmit} title="Submit" />
          </View>
        )}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#7acbb8",
    borderRadius: 5,
    height: 70,
    margin: 10,
  },
  textInput: {
    borderColor: "#eee",
    height: 60,
    backgroundColor: "#ffffff",
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default LoginScreen;
