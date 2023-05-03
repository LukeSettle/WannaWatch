import React, { useState } from "react";
import Matching from "./Matching";
import { SocketProvider } from '../../contexts/SocketContext';

const MatchScreen = ({ navigation, route }) => {
  const [game, _setGame] = useState(route.params.game);

  const newGame = () => {
    navigation.navigate("Game");
  }

  return (
    <SocketProvider>
      {game && <Matching game={game} newGame={newGame} />}
    </SocketProvider>
  );
};

export default MatchScreen;
