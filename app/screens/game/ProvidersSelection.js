import React from "react";
import { FlatList, TouchableHighlight, View, Text } from "react-native";

const ProvidersSelection = ({ values, setValues }) => {
  const PROVIDERS = [
    {
      title: "Netflix", code: "nfx"
    },
    {
      title: "HBO Max", code: "hbm"
    },
    {
      title: "Hulu", code: "hlu"
    }
  ]

  const toggleValue = (code) => {
    console.log("values", values);
    if (values.providers.includes(code)) {
      setValues({...values, providers: [values.providers.filter()]})
    } else {
      setValues({...values, providers: [...values.providers, code] });
    }
    console.log("newValues", values);
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
