import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'movieOpinions';
let opinions = null;

const loadOpinions = async () => {
  if (opinions) return opinions;

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  opinions = stored ? JSON.parse(stored) : {};
  return opinions;
};

const saveOpinion = async (movieId, { liked, watched }) => {
  const current = await loadOpinions();
  current[movieId] = { liked, watched };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

const shouldSkipMovie = (opinions, movieId) => {
  const opinion = opinions[movieId];
  return Boolean(opinion && (opinion.watched || opinion.liked === false));
};

export { loadOpinions, saveOpinion, shouldSkipMovie };
