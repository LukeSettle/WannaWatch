import React, { useState } from "react";
import { Button, TextInput, View, StyleSheet, Keyboard } from "react-native";
import { Formik } from "formik";
import { createGame } from "../../data/cosmo_client";
import Error from "../../components/shared/Error";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(Math.round(Math.random() * (66 - 1) + 1));

  const options = {
    method: "GET",
    url: "https://api.themoviedb.org/3/discover/movie?api_key=27c571472904897e90b202471ab2eacc",
    params: {
      body: {
        fields: [
          "cinema_release_date",
          "full_path",
          "full_paths",
          "id",
          "localized_release_date",
          "object_type",
          "poster",
          "scoring",
          "title",
          "tmdb_popularity",
          "offers",
        ],
        providers: ["nfx", "hbm", "hlu"],
        enable_provider_filter: false,
        monetization_types: [],
        page: page,
        page_size: 8,
        matching_offers_only: true,
      },
    },
  };

  const handleSubmit = (values) => {
    Keyboard.dismiss();
    const gameParams = {
      entry_code: values.entryCode,
      query: JSON.stringify(options),
      user_id: user.id,
    }

    console.log(gameParams)
    createGame(gameParams)
      .then((game) => {
        setGame(game);
      })
      .catch((error) => {
        console.log(error);
        setError("Please enter a valid code")
      });
  };

  return (
    <>
      <Error error={error} />
      <Formik
        initialValues={{
          entryCode: "",
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, submitForm, values }) => (
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={handleChange("entryCode")}
                onBlur={handleBlur("entryCode")}
                placeholder="Enter a code for your friends to join"
                placeholderTextColor="#aaa"
                value={values.entryCode}
                style={styles.textInput}
              />
            </View>
            <Button onPress={submitForm} title="Create Game" />
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

export default GameScreen;
