import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
const SocketContext = createContext({ webSocket: null });

const SocketProvider = ({ handleMessage, user, game, children }) => {
  // const WS_BASE_URL = `http://localhost:3000/cable?user_id=${user.id}`;
  const WS_BASE_URL = `https://wanna-watch-rails.onrender.com/cable?user_id=${user.id}`;
  const [webSocket, setWebSocket] = useState();

  useEffect(() => {
    const ws = new WebSocket(WS_BASE_URL);

    ws.onopen = () => {
      console.log('Connected to the server')
      ws.send(JSON.stringify({command: "subscribe", identifier: JSON.stringify({ channel: "GameChannel", game_id: game.id }) }));
    };

    ws.onclose = (e) => {
      console.log('Disconnected. Check internet or server.', e)
    };

    ws.onerror = (e) => {
      console.log(e.message);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      handleMessage(data);
    };

    setWebSocket(ws);

    return () => {
      ws.close();
      console.log('WebSocket connection closed');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ webSocket }}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node,
};

export { SocketContext, SocketProvider };