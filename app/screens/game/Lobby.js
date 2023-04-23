import React, { useEffect, useContext } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import useChannel from '../../components/shared/useChannel';

const Lobby = ({ game, startGame }) => {
  LOAD_GAME_MESSAGE = 'load_game';
  const { user } = useContext(UserContext);
  const [gameChannel, presenceList] = useChannel(
    {
      channelName: `room:${game.entry_code}`,
      displayName: user.display_name
    }
  );

  useEffect(() => {
    if (!gameChannel) return;

    gameChannel.on(LOAD_GAME_MESSAGE, response => {
      startGame();
    });

    return () => {
      gameChannel.off(LOAD_GAME_MESSAGE);
    };
  }, [gameChannel]);

  return (
    <View>
      <FlatList
        data={presenceList}
        renderItem={({ item }) => <Text>{item.display_name}</Text>}
        keyExtractor={item => item.phx_ref}
      />
      <Button title="Start Game" onPress={() => gameChannel.push(LOAD_GAME_MESSAGE, { user_id: user.id })} />
    </View>
  );
};

export default Lobby;
