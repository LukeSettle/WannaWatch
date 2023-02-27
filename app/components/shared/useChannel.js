import { useState, useContext, useEffect } from 'react';
import { Presence } from 'phoenix';
import { SocketContext } from '../../contexts/SocketContext';

const useChannel = channelName => {
  const [channel, setChannel] = useState();
  const [presenceList, setPresenceList] = useState([]);
  const { socket } = useContext(SocketContext);

  const setOnlineUsers = presence => {
    const onlineUsers = presence.list((id, { metas: [first, ...rest] }) => {
      console.log('id', id);
      console.log('first', first);
      console.log('rest', rest);
      return first;
    });
    setPresenceList(onlineUsers);
  };

  useEffect(() => {
    if (!socket) return;

    const phoenixChannel = socket.channel(channelName, {name: 'test'});
    const presence = new Presence(phoenixChannel);

    presence.onSync(() => setOnlineUsers(presence))

    phoenixChannel.join().receive('ok', () => {
      setChannel(phoenixChannel);
    });

    // leave the channel when the component unmounts
    return () => {
      phoenixChannel.leave();
    };
  }, [socket]);

  return [channel, presenceList];
};

export default useChannel;