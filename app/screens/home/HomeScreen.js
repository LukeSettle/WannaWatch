import React, { useContext } from "react";
import { Formik } from "formik";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { upsertUser } from "../../data/backend_client";
import colors from "../../../config/colors";
import globalStyles from "../../../config/styles";
import { UserContext } from "../../contexts/UserContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const WelcomeScreen = ({ navigation }) => {
  const { user, setUser, onLayoutRootView } = useContext(UserContext);

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
    <LinearGradient
        colors={[colors.primary, colors.secondary, colors.red,]}
        style={styles.background}
    >
      <KeyboardAwareScrollView contentContainerStyle={styles.background}>
        <View onLayout={onLayoutRootView}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.image}
          />

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
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 25,
  },
  headerText: {
    fontSize: 40,
    color: colors.flame,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "Signika",
    fontSize: 50,
  },
  formContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    margin: 20,
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
