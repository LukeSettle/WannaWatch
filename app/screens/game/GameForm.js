import React, { useState } from "react";
import { Pressable, View, ScrollView, StyleSheet, Keyboard, Text } from "react-native";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import { v4 as uuidv4 } from 'uuid';
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GeneresSelection from "./GeneresSelection";
import globalStyles from "../../../config/styles";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(Math.round(Math.random() * (66 - 1) + 1));
  const [toggleGenres, setToggleGenres] = useState(false);

  const options = (values) => {
    return({
      method: "GET",
      url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
      params: {
        with_watch_providers: values.providers.join('|'),
        watch_region: 'US',
        with_origin_country: 'US',
        page: page,
      },
    })
  };

  const handleSubmit = (values) => {
    Keyboard.dismiss();
    const gameParams = {
      entry_code: uuidv4(),
      query: JSON.stringify(options(values)),
      user_id: user.id,
      providers: values.providers,
    }

    upsertGame(gameParams)
      .then((game) => {
        setGame(game);
      })
      .catch((error) => {
        console.log(error);
        setError("Please enter a valid code")
      })
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
            <ScrollView>
              <Text style={globalStyles.label}>Providers</Text>
              <ProvidersSelection values={values} setValues={setValues} />

              <View style={styles.separator} />

              <View style={styles.toggleButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    globalStyles.buttonContainer,
                    pressed && globalStyles.pressedButtonContainer
                  ]}
                  onPress={() => setToggleGenres(!toggleGenres)}
                >
                  <Text style={globalStyles.buttonText}>
                    {toggleGenres ? "Hide Genres" : "Filter By Genres"}
                  </Text>
                </Pressable>
              </View>
              {toggleGenres && (
                <>
                  <Text style={globalStyles.label}>Genres</Text>
                  <GeneresSelection values={values} setValues={setValues} />
                </>
              )}
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  globalStyles.buttonContainer,
                  pressed && globalStyles.pressedButtonContainer
                ]}
                onPress={submitForm}
              >
                <Text style={globalStyles.buttonText}>Create Game</Text>
              </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333333', // You can adjust the color to match your design
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 60,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },

});

export default GameScreen;
