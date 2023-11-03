import React from "react";
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from "react-native";

const ProvidersSelection = ({ values, setValues }) => {
  const PROVIDERS = [
    {
      title: "Netflix", code: "8"
    },
    {
      title: "HBO Max", code: "1899"
    },
    {
      title: "Hulu", code: "15"
    },
    {
      title: "Disney+", code: "337"
    },
    {
      title: "Peacock", code: "386"
    },
    {
      title: "Amazon Prime Video", code: "9"
    },
    {
      title: "Paramount Plus", code: "531"
    }
  ]

  const toggleValue = (code) => {
    if (values.providers.includes(code)) {
      setValues({
        ...values,
        providers: values.providers.filter((provider) => provider !== code)
      })
    } else {
      setValues({
        ...values,
        providers: [...values.providers, code]
      })
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={PROVIDERS}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              values.providers.includes(item.code) && styles.selectedItem,
            ]}
            onPress={() => toggleValue(item.code)}
          >
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  selectedItem: {
    backgroundColor: '#28a745',
  },
  itemText: {
    fontSize: 18,
    color: '#333333',
  },
});

export default ProvidersSelection;
