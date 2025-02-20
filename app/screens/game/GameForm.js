import React, { useState } from "react";
import { Pressable, View, ScrollView, StyleSheet, Keyboard, Text, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import RangeSlider from "react-native-range-slider-expo";
import { Formik } from "formik";
import { upsertGame } from "../../data/backend_client";
import Error from "../../components/shared/Error";
import ProvidersSelection from "./ProvidersSelection";
import GenresSelection from "./GenresSelection";
import globalStyles from "../../../config/styles";
import colors from "../../../config/colors";

// Helper function to build the query parameters for TMDB.
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

  // User Score Range
  params["vote_average.gte"] = values.userScoreMin;
  params["vote_average.lte"] = values.userScoreMax;

  // Release Year Range (converted to date range)
  if (values.releaseYearMin && values.releaseYearMax) {
    params["primary_release_date.gte"] = `${values.releaseYearMin}-01-01`;
    params["primary_release_date.lte"] = `${values.releaseYearMax}-12-31`;
  }

  // Runtime Range
  params["with_runtime.gte"] = values.runtimeMin;
  params["with_runtime.lte"] = values.runtimeMax;

  if (values.sortBy) {
    params.sort_by = values.sortBy;
  }
  if (values.language) {
    params.with_original_language = values.language;
  }

  // Ratings as certification filter (if any)
  if (values.ratings && values.ratings.length > 0) {
    params.certification = values.ratings.join("|");
    params.certification_country = "US";
  }

  return {
    method: "GET",
    url: "https://api.themoviedb.org/3/discover/movie?api_key=fd1efe23da588e99056fdb264ca89bbd",
    params,
  };
};

// Generates a 6-character short code.
const generateShortCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Options for rating selection.
const ratingsOptions = ["G", "PG", "PG-13", "R", "NC-17", "NR"];

// Helper to toggle a rating in an array.
const toggleRating = (currentRatings, rating) => {
  if (currentRatings.includes(rating)) {
    return currentRatings.filter((r) => r !== rating);
  } else {
    return [...currentRatings, rating];
  }
};

const GameForm = ({ setGame, user }) => {
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

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
          releaseYearMax: 2023,
          runtimeMin: 0,
          runtimeMax: 240,
          language: "",
          ratings: ["PG", "PG-13", "R"],
        }}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ submitForm, values, setValues }) => (
          <View style={styles.formContainer}>
            <ScrollView contentContainerStyle={styles.filtersContainer}>
              {step === 1 && (
                <View style={styles.filtersContainer}>
                  <Text style={globalStyles.label}>Select Providers</Text>
                  <ProvidersSelection
                    values={{ providers: values.providers }}
                    setValues={(updated) =>
                      setValues({ ...values, providers: updated.providers })
                    }
                  />
                </View>
              )}

              {step === 2 && (
                <View style={styles.filtersContainer}>
                  <Text style={globalStyles.label}>Select Genres</Text>
                  <GenresSelection
                    values={{ genres: values.genres }}
                    setValues={(updated) =>
                      setValues({ ...values, genres: updated.genres })
                    }
                  />
                </View>
              )}

              {step === 3 && (
                <View style={styles.filtersContainer}>
                  <Text style={globalStyles.label}>Advanced Filters</Text>

                  {/* Sort By */}
                  <Text style={styles.advancedLabel}>Sort By:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values.sortBy}
                      onValueChange={(val) => setValues({ ...values, sortBy: val })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Popularity Descending" value="popularity.desc" />
                      <Picker.Item label="Popularity Ascending" value="popularity.asc" />
                      <Picker.Item label="Release Date Descending" value="release_date.desc" />
                      <Picker.Item label="Release Date Ascending" value="release_date.asc" />
                      <Picker.Item label="Vote Average Descending" value="vote_average.desc" />
                      <Picker.Item label="Vote Average Ascending" value="vote_average.asc" />
                    </Picker>
                  </View>

                  {/* User Score Range */}
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

                  {/* Release Year Range */}
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

                  {/* Runtime Range */}
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

                  {/* Language */}
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

                  {/* Ratings */}
                  <Text style={styles.advancedLabel}>Ratings:</Text>
                  <View style={styles.ratingsContainer}>
                    {ratingsOptions.map((rating) => {
                      const isSelected = values.ratings.includes(rating);
                      return (
                        <Pressable
                          key={rating}
                          onPress={() =>
                            setValues({
                              ...values,
                              ratings: toggleRating(values.ratings, rating),
                            })
                          }
                          style={[
                            styles.ratingButton,
                            isSelected && styles.ratingButtonSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.ratingButtonText,
                              isSelected && styles.ratingButtonTextSelected,
                            ]}
                          >
                            {rating}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navContainer}>
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

export default GameForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    justifyContent: "center",
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
    flex: 1,
    width: "100%",
    maxWidth: 400,
    marginBottom: 60,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
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
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },
  ratingsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  ratingButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  ratingButtonSelected: {
    backgroundColor: colors.secondary,
  },
  ratingButtonText: {
    fontSize: 14,
    color: colors.secondary,
  },
  ratingButtonTextSelected: {
    color: "#fff",
  },
});
