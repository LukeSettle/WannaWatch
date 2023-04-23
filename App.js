import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { StyleSheet } from "react-native";
import WelcomeScreen from "./app/screens/welcome/WelcomeScreen";
import GameScreen from "./app/screens/game/GameScreen";
import MatchScreen from "./app/screens/match/MatchScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from "./app/contexts/UserContext";
import Constants from "expo-constants";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

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

    axios.defaults.baseURL = Constants.manifest.extra.API_URL;
    axios.defaults.headers.common['deviceId'] = deviceId;

    axios({
      headers: { "Access-Control-Allow-Origin": "*" },
      method: "post",
      url: `${Constants.manifest.extra.API_URL}/users`,
      data: {
        user: {
          device_id: deviceId
        },
      },
    })
      .then((response) => {
        setUser(response.data.data);
      })
      .catch((error) => {
        console.log("error", error)
        setError(error.response.data.error);
      });
  }, [deviceId])

  return (
    <UserContext.Provider value={{user, setUser}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={"Welcome"}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Match" component={MatchScreen} />
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
