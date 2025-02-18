import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { fetchProviders } from "../../data/movie_api";
import colors from "../../../config/colors";

const ProvidersSelection = ({ values, setValues }) => {
  const [providers, setProviders] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);

  // Original providers IDs (as strings) to show initially
  const ORIGINAL_PROVIDERS = ["8", "1899", "15", "337", "386", "9", "531", "2"];
  const initialCount = ORIGINAL_PROVIDERS.length; // e.g., 8

  useEffect(() => {
    fetchProviders().then((data) => {
      setProviders(data);
      setVisibleCount(initialCount);
    });
  }, []);

  // Sort providers so that original ones come first
  const sortedProviders = [
    ...providers.filter((p) => ORIGINAL_PROVIDERS.includes(String(p.provider_id))),
    ...providers.filter((p) => !ORIGINAL_PROVIDERS.includes(String(p.provider_id))),
  ];

  // Show only up to visibleCount
  const providersToShow = sortedProviders.slice(0, visibleCount);

  const toggleValue = (code) => {
    if (values.providers.includes(code)) {
      setValues({
        ...values,
        providers: values.providers.filter((provider) => provider !== code),
      });
    } else {
      setValues({
        ...values,
        providers: [...values.providers, code],
      });
    }
  };

  // Increase visibleCount by 10, up to the total length
  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, sortedProviders.length));
  };

  // Decrease visibleCount by 10, but not below initialCount
  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(prev - 10, initialCount));
  };

  // Show "Show more" if not all providers are visible
  const showMoreButton = visibleCount < sortedProviders.length;

  return (
    <View style={styles.container}>
      {providersToShow.map((item) => (
        <TouchableOpacity
          key={item.provider_id}
          style={[
            styles.item,
            values.providers.includes(String(item.provider_id)) && styles.selectedItem,
          ]}
          onPress={() => toggleValue(String(item.provider_id))}
        >
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500/${item.logo_path}` }}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}
      {sortedProviders.length > initialCount && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={showMoreButton ? handleShowMore : handleShowLess}
        >
          <Text style={styles.toggleButtonText}>
            {showMoreButton ? "Show more providers" : "Show less providers"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",     // Arrange items in a row
    flexWrap: "wrap",         // Allow items to wrap into multiple rows
    justifyContent: "space-between",
    padding: 10,
  },
  item: {
    width: "48%",             // Two columns
    height: 70,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  logo: {
    width: 50,
    height: 50,
  },
  toggleButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: colors.secondary,
  },
});

export default ProvidersSelection;
