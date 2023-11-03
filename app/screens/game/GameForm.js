import React, { useState } from "react";
import { Pressable, View, StyleSheet, Keyboard, Text } from "react-native";
import { Formik } from "formik";
import { upsertGame } from "../../data/cosmo_client";
import { v4 as uuidv4 } from 'uuid';
import Error from "../../components/shared/Error";
import Loader from "../../components/shared/Loader";
import ProvidersSelection from "./ProvidersSelection";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(Math.round(Math.random() * (66 - 1) + 1));

  const options = (values) => {
    return({
      method: "GET",
      url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
      params: {
        with_watch_providers: values.providers.join('|'),
        watch_region: 'US',
        page: page,
      },
    })
  };

  const handleSubmit = (values) => {
    setLoading(true);
    Keyboard.dismiss();
    const gameParams = {
      entry_code: uuidv4(),
      query: JSON.stringify(options(values)),
      user_id: user.id,
    }

    upsertGame(gameParams)
      .then((game) => {
        setGame(game);
      })
      .catch((error) => {
        console.log(error);
        setError("Please enter a valid code")
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Choose Your Game Settings</Text>
      <Error error={error} />
      <Formik
        initialValues={{
          providers: [],
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, submitForm, values, setValues }) => (
          <View style={styles.formContainer}>
            <ProvidersSelection values={values} setValues={setValues} />
            <View style={styles.buttonContainer}>
              {loading ? (
                <Loader color="#fff" />
              ) : (
                <Pressable style={styles.buttonContainer} onPress={submitForm}>
                  <Text style={styles.buttonText}>Create Game</Text>
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
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  buttonContainer: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingVertical: 12,
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default GameScreen;
