import React, { useState, useRef } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GenresSelection from "./GenresSelection";
import globalStyles from "../../../config/styles";
import colors from "../../../config/colors";

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
];

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

  // Using the range arrays:
  params["vote_average.gte"] = values.userScoreRange[0];
  params["vote_average.lte"] = values.userScoreRange[1];

  if (values.releaseYearRange.length === 2) {
    params["primary_release_date.gte"] = `${values.releaseYearRange[0]}-01-01`;
    params["primary_release_date.lte"] = `${values.releaseYearRange[1]}-12-31`;
  }

  params["with_runtime.gte"] = values.runtimeRange[0];
  params["with_runtime.lte"] = values.runtimeRange[1];

  // Hard-coded to popularity descending.
  params.sort_by = "popularity.desc";

  if (values.language.length > 0) {
    // Join selected languages with a pipe character.
    params.with_original_language = values.language.join("|");
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
  const currentYear = new Date().getFullYear();
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const formikRef = useRef();

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
      {/* Scrollable filtering content */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.headerText}>Choose Your Game Settings</Text>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
          <Error error={error} />

          <Formik
            innerRef={formikRef}
            initialValues={{
              providers: user?.providers || [],
              genres: [],
              // sortBy is removed – always "popularity.desc"
              userScoreRange: [0, 10],
              releaseYearRange: [1980, currentYear],
              runtimeRange: [0, 240],
              language: [],
            }}
            onSubmit={(values) => handleSubmit(values)}
          >
            {({ submitForm, values, setValues }) => (
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

                      {/* Reactive User Score Slider */}
                      <Text style={styles.advancedLabel}>
                        User Rating: {values.userScoreRange[0]} - {values.userScoreRange[1]}
                      </Text>
                      <View style={styles.sliderContainer}>
                        <MultiSlider
                          values={values.userScoreRange}
                          sliderLength={280}
                          onValuesChange={(sliderValues) =>
                            setValues({ ...values, userScoreRange: sliderValues })
                          }
                          min={0}
                          max={10}
                          step={1}
                          selectedStyle={{ backgroundColor: colors.secondary }}
                          unselectedStyle={{ backgroundColor: "#ccc" }}
                        />
                      </View>

                      {/* Reactive Release Year Slider */}
                      <Text style={styles.advancedLabel}>
                        Release Year: {values.releaseYearRange[0]} - {values.releaseYearRange[1]}
                      </Text>
                      <View style={styles.sliderContainer}>
                        <MultiSlider
                          values={values.releaseYearRange}
                          sliderLength={280}
                          onValuesChange={(sliderValues) =>
                            setValues({ ...values, releaseYearRange: sliderValues })
                          }
                          min={1980}
                          max={2025}
                          step={1}
                          selectedStyle={{ backgroundColor: colors.secondary }}
                          unselectedStyle={{ backgroundColor: "#ccc" }}
                        />
                      </View>

                      {/* Reactive Runtime Slider */}
                      <Text style={styles.advancedLabel}>
                        Runtime (minutes): {values.runtimeRange[0]} - {values.runtimeRange[1]}
                      </Text>
                      <View style={styles.sliderContainer}>
                        <MultiSlider
                          values={values.runtimeRange}
                          sliderLength={280}
                          onValuesChange={(sliderValues) =>
                            setValues({ ...values, runtimeRange: sliderValues })
                          }
                          min={0}
                          max={400}
                          step={10}
                          selectedStyle={{ backgroundColor: colors.secondary }}
                          unselectedStyle={{ backgroundColor: "#ccc" }}
                        />
                      </View>

                      {/* Multi-select Language */}
                      <View style={styles.multiSelectContainer}>
                        <Text style={styles.advancedLabel}>Languages:</Text>
                        <View style={styles.languageOptionsContainer}>
                          {languageOptions.map((option) => {
                            const selected = values.language.includes(option.value);
                            return (
                              <Pressable
                                key={option.value}
                                onPress={() => {
                                  if (selected) {
                                    setValues({
                                      ...values,
                                      language: values.language.filter(
                                        (val) => val !== option.value
                                      ),
                                    });
                                  } else {
                                    setValues({
                                      ...values,
                                      language: [...values.language, option.value],
                                    });
                                  }
                                }}
                                style={[
                                  styles.languageOption,
                                  selected && styles.languageOptionSelected,
                                ]}
                              >
                                <Text
                                  style={
                                    selected
                                      ? styles.languageOptionTextSelected
                                      : styles.languageOptionText
                                  }
                                >
                                  {option.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>

      {/* Fixed Navigation Buttons */}
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
              if (formikRef.current) {
                formikRef.current.submitForm();
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
    paddingBottom: "25%",
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
    margin: 20,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  fixedNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f0f0f0",
    paddingVertical: "10%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  multiSelectContainer: {
    marginTop: 10,
  },
  languageOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  languageOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 5,
    marginBottom: 5,
  },
  languageOptionSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  languageOptionText: {
    fontSize: 14,
    color: "#333",
  },
  languageOptionTextSelected: {
    fontSize: 14,
    color: "#fff",
  },
});
