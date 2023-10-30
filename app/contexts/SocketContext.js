import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
const SocketContext = createContext({ webSocket: null });

const SocketProvider = ({ handleMessage, user, game, children }) => {
  const WS_BASE_URL = 'https://18df-96-28-85-126.ngrok-free.app';
  const [webSocketUrl, setWebSocketUrl] = useState(null);
  const [webSocket, setWebSocket] = useState();

  useEffect(() => {
    const fetchWebSocketUrl = async () => {
      const socketId = `${user.id}--${game.id}--${user.display_name}`;
      try {
        const response = await axios.get(`${WS_BASE_URL}/negotiate?id=${socketId}`);
        setWebSocketUrl(response.data.url);
      } catch (error) {
        console.error('Error fetching WebSocket URL:', error);
      }
    };

    fetchWebSocketUrl();
  }, []);

  useEffect(() => {
    if (webSocketUrl === null) return;

    const ws = new WebSocket(webSocketUrl);

    ws.onopen = () => {
      console.log('Connected to the server')
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
  }, [webSocketUrl]);

  return (
    <SocketContext.Provider value={{ webSocket }}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node,
};

export { SocketContext, SocketProvider };