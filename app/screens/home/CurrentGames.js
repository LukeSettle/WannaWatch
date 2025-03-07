import React, { useEffect, useState, useContext } from "react";
import { gamesIndex } from "../../data/backend_client";
import { UserContext } from "../../contexts/UserContext";
import { SocketProvider } from "../../contexts/SocketContext";
import GamesList from "./GamesList";

const CurrentGames = ({ navigation }) => {
  const { user, setEntryCode } = useContext(UserContext);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchGames = async () => {
      try {
        const response = await gamesIndex(user.id);
        setGames(response);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, [user]);

  const handleMessage = (data) => {
    console.log('====================================');
    console.log('data.message.message', data.message?.message);
    console.log('data.message == "game_index_updated"', data.message?.message == "game_index_updated")
    console.log('====================================');
    if (data.message?.message == "game_index_updated") {
      console.log('====================================');
      console.log('loading games index');
      console.log('====================================');
      gamesIndex(user.id).then(setGames).catch(console.error);
    }
  }

  return (
    <SocketProvider handleMessage={handleMessage} user={user}>
      <GamesList games={games} setGames={setGames} setEntryCode={setEntryCode} navigation={navigation} />
    </SocketProvider>
  );
};

export default CurrentGames;
