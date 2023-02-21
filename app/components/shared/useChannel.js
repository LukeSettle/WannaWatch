import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../contexts/SocketContext';

const useChannel = channelName => {
  const [channel, setChannel] = useState();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    console.log('socket from hook', socket);

    const phoenixChannel = socket.channel(channelName, {});

    phoenixChannel.join().receive('ok', () => {
      setChannel(phoenixChannel);
    });

    // leave the channel when the component unmounts
    return () => {
      phoenixChannel.leave();
    };
  }, [socket]);

  console.log('channel from hook', channel);

  return [channel];
};

export default useChannel;