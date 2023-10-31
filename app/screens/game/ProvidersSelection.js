import React from "react";
import { FlatList, TouchableHighlight, View, Text } from "react-native";

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
    <View>
      <FlatList
        data={PROVIDERS}
        renderItem={({item}) => (
          <TouchableHighlight
            onPress={() => toggleValue(item.code)}>
            <View style={{backgroundColor: values.providers.includes(item.code) ? 'green' : 'white'}}>
              <Text>{item.title}</Text>
            </View>
          </TouchableHighlight>
        )}
      />
    </View>
  );
};

export default ProvidersSelection;
