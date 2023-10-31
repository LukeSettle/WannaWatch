import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-url-polyfill/auto"
import { StyleSheet } from "react-native";
import WelcomeScreen from "./app/screens/welcome/WelcomeScreen";
import GameScreen from "./app/screens/game/GameScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from "./app/contexts/UserContext";
import { upsertUser } from "./app/data/cosmo_client";
import * as Linking from 'expo-linking';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [entryCode, setEntryCode] = useState(null);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const getGameEntryCode = async () => {
      const url = await Linking.getInitialURL();
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const { entry_code } = queryParams;

      if (entry_code) { setEntryCode(entry_code) }
    }

    getGameEntryCode();
  }, [user])


  useEffect(() => {
    const findOrCreateeDeviceId = async () => {
      const id = await SecureStore.getItemAsync('deviceId');
      if (!id) {
        const newId = uuidv4();
        await SecureStore.setItemAsync('deviceId', newId);
      }
      setDeviceId(id);
    }

    findOrCreateeDeviceId();
  }, [])

  useEffect(() => {
    if (!deviceId) return;

    const userParams = {
      device_id: deviceId,
    }

    upsertUser(userParams)
      .then(upsertedUser => {
        setUser(upsertedUser)
      })
      .catch(error => {
        console.error('Error upserting user:', error);
        setError(error);
      });
  }, [deviceId])

  return (
    <UserContext.Provider value={{user, setUser, entryCode}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={"Welcome"}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
