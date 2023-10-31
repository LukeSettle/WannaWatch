import React, { useEffect, useContext, useState } from "react";
import GameForm from "./GameForm";
import Lobby from "./Lobby";
import { UserContext } from "../../contexts/UserContext";
import { SocketProvider } from '../../contexts/SocketContext';
import MatchScreen from "../match/MatchScreen";
import { findGameFromEntryCode } from "../../data/cosmo_client";

const GameScreen = () => {
  const { user, entryCode } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [serverMessages, setServerMessages] = useState([]);

  const handleMessage = (data) => {
    if (data.type === 'system') {
      setServerMessages(prevMessages => [...prevMessages, data.message]);
      if (data.game) { setGame(data.game) }
    }
  };

  useEffect(() => {
    if (entryCode) {
      const gameFromDb = findGameFromEntryCode(entryCode);
      setGame(gameFromDb);
    }
  }, [entryCode])

  if (!game) {
    return <GameForm setGame={setGame} user={user} />;
  }

  return (
    <SocketProvider handleMessage={handleMessage} user={user} game={game} serverMessages={serverMessages}>
      {game.started
        ? <MatchScreen game={game} />
        : <Lobby game={game} serverMessages={serverMessages} />
      }
    </SocketProvider>
  );
};

export default GameScreen;
