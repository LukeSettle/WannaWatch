import React, { useState, useContext } from "react";
import { Button, TextInput, View, StyleSheet, Keyboard } from "react-native";
import { Formik } from "formik";
import axios from "axios";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import Error from "../../components/shared/Error";
import { UserContext } from "../../contexts/UserContext";

const GameScreen = ({ navigation }) => {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(Math.round(Math.random() * (66 - 1) + 1));
  const user = useContext(UserContext);

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
    axios({
      headers: { "Access-Control-Allow-Origin": "*" },
      method: "post",
      url: `${Constants.manifest.extra.RAILS_API_URL}/games`,
      data: {
        game: {
          entry_code: values.entryCode,
          query: JSON.stringify(options),
          user_id: user.id,
        },
      },
    })
      .then((response) => {
        navigation.navigate("Match", { game: response.data, page });
      })
      .catch((error) => {
        setError(error.response.data.error);
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
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={handleChange("entryCode")}
                onBlur={handleBlur("entryCode")}
                placeholder="entryCode"
                value={values.entryCode}
                style={styles.textInput}
              />
            </View>
            <Button onPress={handleSubmit} title="Start Matching" />
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
