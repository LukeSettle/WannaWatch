import React, { useContext } from "react";
import { Platform } from "react-native";
import { Formik } from "formik";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ImageBackground,
} from "react-native";
import { upsertUser } from "../../data/backend_client";
import logo from "../../assets/logo.png";
import globalStyles from "../../../config/styles";
import { UserContext } from "../../contexts/UserContext";

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const image = require("../../assets/theater.jpg");

  const submitForm = (values) => {
    const userParams = {
      device_id: user.device_id,
      username: values.username,
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

  if (!user) return null;

  return (
    <ImageBackground source={require("../../assets/theater.jpg")} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.headerText}>So... what do you wanna watch?</Text>
        <Formik
          initialValues={{
            username: user.username || "",
          }}
          onSubmit={(values) => submitForm(values)}
        >
          {({ handleChange, handleBlur, submitForm, values }) => (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
              />
              <Pressable
                style={({ pressed }) => [
                  globalStyles.buttonContainer,
                  pressed && globalStyles.pressedButtonContainer
                ]}
                onPress={submitForm}
              >
                <Text style={globalStyles.buttonText}>Start Matching</Text>
              </Pressable>
            </View>
          )}
        </Formik>
      </View>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 40,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 40,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Baskerville-SemiBoldItalic" : "serif",
  },
  formContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  }
});
