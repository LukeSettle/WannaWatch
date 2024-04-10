import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import PROVIDERS from "../../../config/providers";
import colors from "../../../config/colors";

const ProvidersSelection = ({ values, setValues }) => {
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
      {PROVIDERS.map((item) => (
        <TouchableOpacity
          key={item.code}
          style={[
            styles.item,
            values.providers.includes(item.code) && styles.selectedItem,
          ]}
          onPress={() => toggleValue(item.code)}
        >
          <Text style={[styles.itemText, values.providers.includes(item.code) && styles.selectedItemText,]}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  item: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: colors.secondary,
  },
  selectedItemText: {
    color: colors.white,
  },
  itemText: {
    fontSize: 18,
    color: '#333333',
  },
});

export default ProvidersSelection;
