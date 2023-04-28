import React, { useState } from "react";
import Matching from "./Matching";
import { SocketProvider } from '../../contexts/SocketContext';

const MatchScreen = ({ route }) => {
  const [game, _setGame] = useState(route.params.game);

  return (
    <SocketProvider>
      {game && <Matching game={game} />}
    </SocketProvider>
  );
};

export default MatchScreen;
