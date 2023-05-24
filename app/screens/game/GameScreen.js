import React, { useState, useContext } from "react";
import GameForm from "./GameForm";
import Lobby from "./Lobby";
import { UserContext } from "../../contexts/UserContext";
import { SocketProvider } from '../../contexts/SocketContext';

const GameScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [game, setGame] = useState(null);

  const startGame = () => {
    navigation.navigate("Match", { game });
  };

  return (
    <SocketProvider>
      {!game && <GameForm setGame={setGame} user={user} />}
      {game && <Lobby game={game} startGame={startGame} />}
    </SocketProvider>
  );
};

export default GameScreen;
