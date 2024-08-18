import React, { useState } from "react";
import axios from "axios";
import { Pressable, View, ScrollView, StyleSheet, Keyboard, Text } from "react-native";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import { v4 as uuidv4 } from 'uuid';
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GeneresSelection from "./GeneresSelection";
import globalStyles from "../../../config/styles";
import colors from "../../../config/colors";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [toggleGenres, setToggleGenres] = useState(false);

  const options = (values, totalPages = null) => {
    let page;

    if (totalPages) {
      page = Math.round(Math.random() * (totalPages - 1) + 1);
    } else {
      page = 1;
    }

    params = {
      with_origin_country: 'US',
      page: page,
    }

    if (values.providers.length > 0) {
      params.with_watch_providers = values.providers.join(',');
      params.watch_region = 'US';
    }

    if (toggleGenres && values.genres.length > 0) {
      params.with_genres = values.genres.join(',');
    }

    return({
      method: "GET",
      url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
      params
    })
  };

  const fetchTotalPages = async (values) => {
    const response = await axios.request(options(values));
    const totalPages = await response.data.total_pages;

    return totalPages;
  };

  const handleSubmit = async (values) => {
    Keyboard.dismiss();
    const totalPages = await fetchTotalPages(values);

    const gameParams = {
      entry_code: uuidv4(),
      query: JSON.stringify(options(values, totalPages)),
      user_id: user.id,
      providers: values.providers,
      totalPages: totalPages,
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
            <ScrollView contentContainerStyle={styles.filtersContainer}>
              <Text style={globalStyles.label}>Providers</Text>
              <ProvidersSelection values={values} setValues={setValues} />

              <View style={styles.separator} />

              <View style={styles.toggleButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.toggleContainer,
                    pressed && styles.pressedToggleContainer,
                    toggleGenres && styles.pressedToggleContainer,
                  ]}
                  onPress={() => setToggleGenres(!toggleGenres)}
                >
                  <Text style={styles.toggleText}>
                    {toggleGenres ? "Hide Genres" : "Filter By Genres"}
                  </Text>
                </Pressable>
              </View>
              {toggleGenres && (
                <View>
                  <Text style={globalStyles.label}>Genres</Text>
                  <GeneresSelection values={values} setValues={setValues} />
                </View>
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
    flex: 1,
    gap: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 80,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  separator: {
    height: 20,
  },
  toggleButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  pressedToggleContainer: {
    backgroundColor: colors.secondary,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default GameScreen;
