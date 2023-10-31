import React, { useState } from "react";
import { Button, View, Keyboard } from "react-native";
import { Formik } from "formik";
import { upsertGame } from "../../data/cosmo_client";
import { v4 as uuidv4 } from 'uuid';
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";

const GameScreen = ({ setGame, user }) => {
  const [error, setError] = useState(null);
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
      });
  };

  return (
    <>
      <Error error={error} />
      <Formik
        initialValues={{
          providers: [],
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ handleChange, handleBlur, submitForm, values, setValues }) => (
          <View>
            <ProvidersSelection values={values} setValues={setValues} />
            <Button onPress={submitForm} title="Create Game" />
          </View>
        )}
      </Formik>
    </>
  );
};

export default GameScreen;
