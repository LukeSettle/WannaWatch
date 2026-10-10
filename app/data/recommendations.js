import { discoverMovies, fetchMovieWithKeywords } from './movie_api';

const ROUND_SIZE = 20;
const EXPLORE_SIZE = 5;
const MAX_SEEDS = 8;
const MAX_TMDB_PAGE = 500;
const MAX_PAGES_PER_SOURCE = 5;
const KEYWORD_MATCH_BONUS = 2;

const countOccurrences = (lists) => {
  const counts = new Map();
  lists.flat().forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  return counts;
};

const mostCommon = (counts, limit) =>
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item]) => item);

// Walks consecutive discover pages, wrapping at the real page count,
// so a narrow search keeps cycling instead of running off the end.
const fetchFreshMovies = async (params, startPage, dealtIds) => {
  const fresh = [];
  let page = startPage;

  for (let i = 0; i < MAX_PAGES_PER_SOURCE && fresh.length < ROUND_SIZE; i++) {
    const data = await discoverMovies(params, page);
    const totalPages = Math.min(data.total_pages, MAX_TMDB_PAGE);
    if (totalPages === 0) break;

    if (page <= totalPages) {
      fresh.push(...data.results.filter((movie) => !dealtIds.has(movie.id)));
    }
    page = (page % totalPages) + 1;
  }

  return fresh;
};

const buildTaste = async (likedIdsByPlayer) => {
  const recentFirst = likedIdsByPlayer.map((ids) => [...ids].reverse());
  const seedIds = mostCommon(countOccurrences(recentFirst), MAX_SEEDS);
  if (seedIds.length === 0) return null;

  const seeds = await Promise.all(seedIds.map(fetchMovieWithKeywords));

  return {
    seedCount: seeds.length,
    genreCounts: countOccurrences(seeds.map((movie) => movie.genres.map((genre) => genre.id))),
    keywordIds: mostCommon(
      countOccurrences(seeds.map((movie) => movie.keywords.keywords.map((keyword) => keyword.id))),
      5
    ),
  };
};

const tasteScore = (movie, taste, keywordMatchIds) => {
  const genreScore = movie.genre_ids.reduce(
    (sum, genreId) => sum + (taste.genreCounts.get(genreId) || 0),
    0
  ) / taste.seedCount;

  return genreScore + (keywordMatchIds.has(movie.id) ? KEYWORD_MATCH_BONUS : 0);
};

const uniqueById = (movies) => [...new Map(movies.map((movie) => [movie.id, movie])).values()];

const relaxedSearches = (params) => {
  const providersOnly = {
    sort_by: params.sort_by,
    with_watch_providers: params.with_watch_providers,
    watch_region: params.watch_region,
  };
  return [{ ...providersOnly, with_genres: params.with_genres }, providersOnly];
};

const curatedDeck = async (params, explore, taste, dealtIds) => {
  const keywordMatches = taste.keywordIds.length > 0
    ? await fetchFreshMovies({ ...params, with_keywords: taste.keywordIds.join('|') }, 1, dealtIds)
    : [];
  const genreMatches = params.with_genres
    ? []
    : await fetchFreshMovies({ ...params, with_genres: mostCommon(taste.genreCounts, 2).join('|') }, 1, dealtIds);

  const keywordMatchIds = new Set(keywordMatches.map((movie) => movie.id));
  const ranked = uniqueById([...keywordMatches, ...genreMatches, ...explore])
    .map((movie) => ({ movie, score: tasteScore(movie, taste, keywordMatchIds) }))
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);

  const favorites = ranked.slice(0, ROUND_SIZE - EXPLORE_SIZE);
  const favoriteIds = new Set(favorites.map((movie) => movie.id));
  const discoveries = explore.filter((movie) => !favoriteIds.has(movie.id));

  return [...favorites, ...discoveries, ...ranked];
};

// Every player in a game builds the same round from the same shared likes,
// so the decks line up and matches are still possible.
const buildRound = async ({ query, round, likedIdsByPlayer, dealtIds }) => {
  const { page: firstPage, ...params } = query.params;
  const explorePage = ((firstPage - 1 + round) % MAX_TMDB_PAGE) + 1;

  const explore = await fetchFreshMovies(params, explorePage, dealtIds);
  const taste = await buildTaste(likedIdsByPlayer);
  let deck = taste ? await curatedDeck(params, explore, taste, dealtIds) : explore;

  for (const relaxed of relaxedSearches(params)) {
    if (deck.length > 0) break;
    deck = await fetchFreshMovies(relaxed, round + 1, dealtIds);
  }

  return uniqueById(deck).slice(0, ROUND_SIZE);
};

export { buildRound };
