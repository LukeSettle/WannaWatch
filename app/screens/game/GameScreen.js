import React, { useEffect, useContext, useState } from "react";
import GameForm from "./GameForm";
import Lobby from "./Lobby";
import { UserContext } from "../../contexts/UserContext";
import { SocketProvider } from '../../contexts/SocketContext';
import MatchScreen from "../match/MatchScreen";
import { findGameFromEntryCode } from "../../data/backend_client";

const GameScreen = () => {
  const { user, entryCode } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [serverMessages, setServerMessages] = useState([]);

  const handleMessage = (data) => {
    if (data.message?.type === 'system') {
      setServerMessages(prevMessages => [...prevMessages, data.message.message]);
      if (data.message.game) { setGame(JSON.parse(data.message.game)) }
    }
  };

  useEffect(() => {
    if (entryCode) {
      console.log('trying to find by code', entryCode);
      const fetchGame = async () => {
        const gameFromDb = await findGameFromEntryCode(entryCode);
        setGame(gameFromDb);
      }

      fetchGame();
    }
  }, [entryCode])

  if (!game) {
    return <GameForm setGame={setGame} user={user} />;
  }

  return (
    <SocketProvider handleMessage={handleMessage} user={user} game={game} serverMessages={serverMessages}>
      {game.started_at
        ? <MatchScreen game={game} setGame={setGame} user={user} />
        : <Lobby game={game} serverMessages={serverMessages} />
      }
    </SocketProvider>
  );
};

export default GameScreen;
