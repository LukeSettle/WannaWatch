import { useState, useContext, useEffect } from 'react';
import { Presence } from 'phoenix';
import { SocketContext } from '../../contexts/SocketContext';

const useChannel = ({ channelName, displayName }) => {
  const [channel, setChannel] = useState();
  const [presenceList, setPresenceList] = useState([]);
  const { socket } = useContext(SocketContext);

  const setOnlineUsers = presence => {
    const onlineUsers = presence.list((id, { metas: [first, ...rest] }) => {
      return first;
    });
    setPresenceList(onlineUsers);
  };

  useEffect(() => {
    if (!socket) return;

    const phoenixChannel = socket.channel(channelName, {display_name: displayName });
    const presence = new Presence(phoenixChannel);

    presence.onSync(() => setOnlineUsers(presence))

    phoenixChannel.join().receive('ok', () => {
      console.log('Joined successfully');
      setChannel(phoenixChannel);
    });

    // leave the channel when the component unmounts
    return () => {
      console.log("Leaving channel");
      phoenixChannel.leave();
    };
  }, [socket]);

  return [channel, presenceList];
};

export default useChannel;