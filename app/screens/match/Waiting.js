import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const Waiting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Waiting for other players to finish matching...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
};

export default Waiting;