import React, { useEffect } from "react";
import { Button, View } from "react-native";
import useChannel from '../../components/shared/useChannel';

const Lobby = ({ game }) => {
  LOAD_GAME_MESSAGE = 'load_game';

  console.log('game', game);
  const [gameChannel] = useChannel(`room:${game.entry_code}`);

  useEffect(() => {
    if (!gameChannel) return;

    //the LOAD_game_MESSAGE is a message defined by the server
    const gameChannel = gameChannel.on(LOAD_GAME_MESSAGE, response => {
      console.log('response', response);
    });

    // stop listening to this message before the component unmounts
    return () => {
      gameChannel.off(LOAD_GAME_MESSAGE, gameChannel);
    };
  }, [gameChannel]);

  const startGame = () => {
    // send a message to the game channel to start the game
  };

  return (
    <View>
      <Button title="Start Game" onPress={() => gameChannel.push(LOAD_GAME_MESSAGE, { userId: user.id })} />
    </View>
  );
};

export default Lobby;
