import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Socket } from 'phoenix';
import Constants from 'expo-constants';

const SocketContext = createContext({ socket: null });

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket = new Socket(`${Constants.manifest.extra.WEBSOCKET_URL}/socket`);
    socket.connect();
    setSocket(socket);
  }, []);

  if (!socket) return null;

  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node,
};

export { SocketContext, SocketProvider };