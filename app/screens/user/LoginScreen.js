import React from "react";
import { Button, TextInput, View, StyleSheet } from "react-native";
import { Formik } from "formik";
import axios from "axios";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const { getItem, setItem } = useAsyncStorage("@authorization");

  const writeItemToStorage = async (newValue) => {
    await setItem(newValue);
  };

  const handleSubmit = (values) => {
    axios({
      headers: { "Access-Control-Allow-Origin": "*" },
      method: "post",
      url: "http://localhost:3000/users/sign_in",
      data: {
        user: {
          email: values.username,
          password: values.password,
        },
      },
    })
      .then((response) => {
        writeItemToStorage(response.headers.authorization);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  return (
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
    border: "#eee",
    height: 60,
    backgroundColor: "#ffffff",
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default LoginScreen;
