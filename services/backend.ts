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

const buildHttpError = async (
  response: Response,
  label: string,
  url: string
) => {
  const rawText = await response.text();

  let serverMessage = "";
  if (rawText) {
    try {
      const parsed = JSON.parse(rawText);
      serverMessage = parsed?.message || parsed?.error || rawText;
    } catch {
      serverMessage = rawText;
    }
  }

  const statusText = response.statusText || "Unknown status";
  const details = serverMessage
    ? ` - ${String(serverMessage).slice(0, 200)}`
    : "";

  return new Error(
    `${label}: HTTP ${response.status} (${statusText}) [${url}]${details}`
  );
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

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  const url = getApiUrl("/api/analytics/trending?limit=5");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw await buildHttpError(response, "Failed to fetch trending movies", url);
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
    return [];
  }
};

export const getWatchlist = async (): Promise<WatchlistMovie[]> => {
  const url = getApiUrl("/api/watchlist");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw await buildHttpError(response, "Failed to fetch watchlist", url);
    }

    const payload = await response.json();

    if (Array.isArray(payload)) {
      return payload as WatchlistMovie[];
    }

    if (Array.isArray(payload?.data)) {
      return payload.data as WatchlistMovie[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const addToWatchlist = async (movie: {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
}): Promise<void> => {
  const url = getApiUrl("/api/watchlist");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? null,
      releaseDate: movie.release_date ?? null,
      voteAverage: movie.vote_average ?? null,
    }),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to add to watchlist", url);
  }
};

export const removeFromWatchlist = async (movieId: number): Promise<void> => {
  const url = getApiUrl(`/api/watchlist/${movieId}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to remove from watchlist", url);
  }
};
