import axios from 'axios';

const apiKey = 'fd1efe23da588e99056fdb264ca89bbd';

const fetchProviders = async () => {
  const url = `https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data.results;
  }
  catch (error) {
    console.error('Fetching providers failed:', error);
    throw error;
  }
};

const fetchMovieDetails = async (movieId) => {
  const urls = [
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`,
    `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`,
    // Add any additional URLs for other data you might need
  ];

  try {
    // Fetch details concurrently
    console.log('urls', urls);
    const data = await axios.all(urls.map((url) => axios.get(url)));

    // `data` will be an array of axios responses, so extract the `data` property
    const [movieDetailsResponse, watchProvidersResponse] = data;

    return {
      movieDetails: movieDetailsResponse.data,
      watchProviders: watchProvidersResponse.data,
      // You can add more details by accessing `data[2].data`, `data[3].data`, etc.
    };
  } catch (error) {
    console.error('Fetching movie details failed:', error);
    throw error;
  }
}

const fetchGenres = async () => {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

  try {
    const response = await axios.get(url);
    return response.data.genres;
  }
  catch (error) {
    console.error('Fetching genres failed:', error);
    throw error;
  }
}

export { fetchMovieDetails, fetchGenres, fetchProviders };
