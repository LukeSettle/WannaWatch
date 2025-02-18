import React, { useState } from "react";
import axios from "axios";
import { Pressable, View, ScrollView, StyleSheet, Keyboard, Text } from "react-native";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GeneresSelection from "./GeneresSelection";
import globalStyles from "../../../config/styles";
import colors from "../../../config/colors";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Providers, 2: Genres

  // Build the query options from values and current step
  const options = (values, totalPages = null) => {
    let page = Math.floor(Math.random() * 5) + 1;

    const params = {
      with_origin_country: 'US',
      page: page,
    };

    if (values.providers.length > 0) {
      params.with_watch_providers = values.providers.join('|');
      params.watch_region = 'US';
    }

    if (values.genres.length > 0) {
      params.with_genres = values.genres.join('|');
    }

    return {
      method: "GET",
      url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
      params,
    };
  };

  // Generates a 6-character code from A-Z and 0-9
  const generateShortCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSubmit = async (values) => {
    Keyboard.dismiss();
    // Optionally you might fetch totalPages here
    const gameParams = {
      entry_code: generateShortCode(),
      query: JSON.stringify(options(values)),
      user_id: user.id,
      providers: values.providers,
      // genres: values.genres, // Optional: include genres if needed on backend
    };

    upsertGame(gameParams)
      .then((game) => {
        setGame(game);
      })
      .catch((error) => {
        console.log(error);
        setError("Please enter a valid code");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Choose Your Game Settings</Text>
      <Error error={error} />
      <Formik
        initialValues={{
          providers: user.providers || [],
          genres: [],
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ submitForm, values, setValues }) => (
          <View style={styles.formContainer}>
            <ScrollView contentContainerStyle={styles.filtersContainer}>
              {step === 1 && (
                <>
                  <Text style={globalStyles.label}>Select Providers</Text>
                  <ProvidersSelection values={values} setValues={setValues} />
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={globalStyles.label}>Select Genres</Text>
                  <GeneresSelection values={values} setValues={setValues} />
                </>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              {step === 1 ? (
                <Pressable
                  style={({ pressed }) => [
                    globalStyles.buttonContainer,
                    pressed && globalStyles.pressedButtonContainer,
                  ]}
                  onPress={() => setStep(2)}
                >
                  <Text style={globalStyles.buttonText}>Next</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    globalStyles.buttonContainer,
                    pressed && globalStyles.pressedButtonContainer,
                  ]}
                  onPress={submitForm}
                >
                  <Text style={globalStyles.buttonText}>Create Game</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
    color: "#333333",
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    gap: 20,
    width: "100%",
    maxWidth: 400,
    marginBottom: 80,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default GameScreen;
