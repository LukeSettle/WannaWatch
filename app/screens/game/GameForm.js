import React, { useState, useRef } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from "@react-native-picker/picker";
import RangeSlider from "react-native-range-slider-expo";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GenresSelection from "./GenresSelection";
import globalStyles from "../../../config/styles";
import colors from "../../../config/colors";

const buildQuery = (values) => {
  const params = {
    with_origin_country: "US",
    page: Math.floor(Math.random() * 5) + 1,
  };

  if (values.providers.length > 0) {
    params.with_watch_providers = values.providers.join("|");
    params.watch_region = "US";
  }
  if (values.genres.length > 0) {
    params.with_genres = values.genres.join("|");
  }

  params["vote_average.gte"] = values.userScoreMin;
  params["vote_average.lte"] = values.userScoreMax;

  if (values.releaseYearMin && values.releaseYearMax) {
    params["primary_release_date.gte"] = `${values.releaseYearMin}-01-01`;
    params["primary_release_date.lte"] = `${values.releaseYearMax}-12-31`;
  }

  params["with_runtime.gte"] = values.runtimeMin;
  params["with_runtime.lte"] = values.runtimeMax;

  if (values.sortBy) {
    params.sort_by = values.sortBy;
  }
  if (values.language) {
    params.with_original_language = values.language;
  }

  return {
    method: "GET",
    url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
    params,
  };
};

const generateShortCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const GameForm = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const submitFormRef = useRef(null);

  const handleSubmit = async (values) => {
    Keyboard.dismiss();
    const query = buildQuery(values);
    const gameParams = {
      entry_code: generateShortCode(),
      query: JSON.stringify(query),
      user_id: user.id,
      providers: values.providers,
    };

    upsertGame(gameParams)
      .then((game) => {
        setGame(game);
      })
      .catch((err) => {
        console.log(err);
        setError("Something went wrong creating the game.");
      });
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.headerText}>Choose Your Game Settings</Text>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
          <Error error={error} />

          <Formik
            initialValues={{
              providers: user.providers || [],
              genres: [],
              sortBy: "popularity.desc",
              userScoreMin: 0,
              userScoreMax: 10,
              releaseYearMin: 1980,
              releaseYearMax: new Date().getFullYear(),
              runtimeMin: 0,
              runtimeMax: 240,
              language: "",
            }}
            onSubmit={(values) => handleSubmit(values)}
          >
            {({ submitForm, values, setValues, handleChange, handleBlur }) => {
              // Save submitForm reference for use in the fixed nav
              submitFormRef.current = submitForm;
              return (
                <>
                  <View style={styles.filtersContainer}>
                    {step === 1 && (
                      <>
                        <Text style={globalStyles.label}>Select Providers</Text>
                        <ProvidersSelection
                          values={{ providers: values.providers }}
                          setValues={(updated) =>
                            setValues({ ...values, providers: updated.providers })
                          }
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <Text style={globalStyles.label}>Select Genres</Text>
                        <GenresSelection
                          values={{ genres: values.genres }}
                          setValues={(updated) =>
                            setValues({ ...values, genres: updated.genres })
                          }
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <Text style={globalStyles.label}>Advanced Filters</Text>
                        <Text style={styles.advancedLabel}>Sort By:</Text>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={values.sortBy}
                            onValueChange={(val) =>
                              setValues({ ...values, sortBy: val })
                            }
                            style={styles.picker}
                          >
                            <Picker.Item
                              label="Popularity Descending"
                              value="popularity.desc"
                            />
                            <Picker.Item
                              label="Popularity Ascending"
                              value="popularity.asc"
                            />
                            <Picker.Item
                              label="Release Date Descending"
                              value="release_date.desc"
                            />
                            <Picker.Item
                              label="Release Date Ascending"
                              value="release_date.asc"
                            />
                            <Picker.Item
                              label="Vote Average Descending"
                              value="vote_average.desc"
                            />
                            <Picker.Item
                              label="Vote Average Ascending"
                              value="vote_average.asc"
                            />
                          </Picker>
                        </View>

                        <Text style={styles.advancedLabel}>
                          User Score: {values.userScoreMin} - {values.userScoreMax}
                        </Text>
                        <View style={styles.sliderContainer}>
                          <RangeSlider
                            min={0}
                            max={10}
                            step={1}
                            fromValue={parseFloat(values.userScoreMin)}
                            toValue={parseFloat(values.userScoreMax)}
                            fromValueOnChange={(low) =>
                              setValues({ ...values, userScoreMin: low })
                            }
                            toValueOnChange={(high) =>
                              setValues({ ...values, userScoreMax: high })
                            }
                            selectionColor={colors.secondary}
                            blankColor="#ccc"
                            style={styles.slider}
                          />
                        </View>

                        <Text style={styles.advancedLabel}>
                          Release Year: {values.releaseYearMin} - {values.releaseYearMax}
                        </Text>
                        <View style={styles.sliderContainer}>
                          <RangeSlider
                            min={1980}
                            max={2025}
                            step={1}
                            fromValue={values.releaseYearMin}
                            toValue={values.releaseYearMax}
                            fromValueOnChange={(low) =>
                              setValues({ ...values, releaseYearMin: low })
                            }
                            toValueOnChange={(high) =>
                              setValues({ ...values, releaseYearMax: high })
                            }
                            selectionColor={colors.secondary}
                            blankColor="#ccc"
                            style={styles.slider}
                          />
                        </View>

                        <Text style={styles.advancedLabel}>
                          Runtime (minutes): {values.runtimeMin} - {values.runtimeMax}
                        </Text>
                        <View style={styles.sliderContainer}>
                          <RangeSlider
                            min={0}
                            max={400}
                            step={10}
                            fromValue={values.runtimeMin}
                            toValue={values.runtimeMax}
                            fromValueOnChange={(low) =>
                              setValues({ ...values, runtimeMin: low })
                            }
                            toValueOnChange={(high) =>
                              setValues({ ...values, runtimeMax: high })
                            }
                            selectionColor={colors.secondary}
                            blankColor="#ccc"
                            style={styles.slider}
                          />
                        </View>

                        <Text style={styles.advancedLabel}>Language:</Text>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={values.language}
                            onValueChange={(val) =>
                              setValues({ ...values, language: val })
                            }
                            style={styles.picker}
                          >
                            <Picker.Item label="Any" value="" />
                            <Picker.Item label="English" value="en" />
                            <Picker.Item label="Spanish" value="es" />
                            <Picker.Item label="French" value="fr" />
                            <Picker.Item label="German" value="de" />
                            <Picker.Item label="Italian" value="it" />
                            <Picker.Item label="Japanese" value="ja" />
                            <Picker.Item label="Korean" value="ko" />
                          </Picker>
                        </View>
                      </>
                    )}
                  </View>
                </>
              );
            }}
          </Formik>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.fixedNavContainer}>
        {step > 1 && (
          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              pressed && globalStyles.pressedButtonContainer,
            ]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={globalStyles.buttonText}>Back</Text>
          </Pressable>
        )}
        {step < 3 ? (
          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              pressed && globalStyles.pressedButtonContainer,
            ]}
            onPress={() => setStep(step + 1)}
          >
            <Text style={globalStyles.buttonText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              globalStyles.buttonContainer,
              pressed && globalStyles.pressedButtonContainer,
            ]}
            onPress={() => {
              if (submitFormRef.current) {
                submitFormRef.current();
              }
            }}
          >
            <Text style={globalStyles.buttonText}>Create Game</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default GameForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: "10%",
  },
  contentWrapper: {
    flex: 1,
    minHeight: "100%",
  },
  headerText: {
    fontSize: 24,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  stepIndicator: {
    fontSize: 16,
    marginBottom: 15,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    width: 300,
    alignSelf: "center",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    overflow: "visible",
  },
  advancedLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  pickerContainer: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "visible",
    zIndex: 999,
  },
  picker: {
    width: "100%",
  },
  sliderContainer: {
    marginVertical: 10,
  },
  slider: {
    height: 60,
  },
  fixedNavContainer: {
    position: "absolute",
    bottom: 20, // Adjust this value to move the nav higher
    left: 0,
    right: 0,
    backgroundColor: "#f0f0f0",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
