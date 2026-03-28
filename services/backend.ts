const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const getApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL environment variable");
  }

  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${normalizedBase}${path}`;
};

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    await fetch(getApiUrl("/api/analytics/search"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        searchTerm: query,
        movieId: movie.id,
        title: movie.title,
        posterUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
      }),
    });
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const response = await fetch(getApiUrl("/api/analytics/trending?limit=5"), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload)) {
      return payload as TrendingMovie[];
    }

    if (Array.isArray(payload?.data)) {
      return payload.data as TrendingMovie[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return undefined;
  }
};
