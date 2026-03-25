import React, { createContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getWebSocketBaseUrl } from "../config/api";

const SocketContext = createContext({ webSocket: null });

const SocketProvider = ({ handleMessage, user, game, children }) => {
  const [webSocket, setWebSocket] = useState();
  const handleMessageRef = useRef(handleMessage);
  handleMessageRef.current = handleMessage;

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const base = getWebSocketBaseUrl();
    const wsUrl = `${base}/cable?user_id=${user.id}`;
    const ws = new WebSocket(wsUrl);

    const subscribe = () => {
      if (game?.id) {
        ws.send(
          JSON.stringify({
            command: "subscribe",
            identifier: JSON.stringify({
              channel: "GameChannel",
              game_id: game.id,
            }),
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            command: "subscribe",
            identifier: JSON.stringify({ channel: "UserGamesChannel" }),
          })
        );
      }
    };

    ws.onopen = () => {
      subscribe();
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        handleMessageRef.current(data);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {};

    ws.onerror = () => {};

    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, [user?.id, game?.id]);

  return (
    <SocketContext.Provider value={{ webSocket }}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node,
  handleMessage: PropTypes.func,
  user: PropTypes.object,
  game: PropTypes.object,
};

export { SocketContext, SocketProvider };
