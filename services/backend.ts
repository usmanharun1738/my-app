import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
let authToken: string | null = null;
const AUTH_TOKEN_KEY = "movie_app_auth_token";

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
      const validationErrors = parsed?.errors;

      if (validationErrors && typeof validationErrors === "object") {
        const firstField = Object.keys(validationErrors)[0];
        const firstMessage = Array.isArray(validationErrors[firstField])
          ? validationErrors[firstField][0]
          : null;

        if (firstMessage) {
          serverMessage = String(firstMessage);
        }
      }

      if (!serverMessage) {
        serverMessage = parsed?.message || parsed?.error || rawText;
      }
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

const getAuthHeaders = (): Record<string, string> => {
  if (!authToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${authToken}`,
  };
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const persistAuthToken = async (token: string | null) => {
  if (!token) {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const restoreAuthToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  setAuthToken(token);
  return token;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  deviceName?: string;
}): Promise<{ user: AuthUser; token: string }> => {
  const url = getApiUrl("/api/auth/register");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      device_name: payload.deviceName ?? "expo-mobile",
    }),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to register", url);
  }

  const data = (await response.json()) as { data: { user: AuthUser; token: string } };
  setAuthToken(data.data.token);
  await persistAuthToken(data.data.token);
  return data.data;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
  deviceName?: string;
}): Promise<{ user: AuthUser; token: string }> => {
  const url = getApiUrl("/api/auth/login");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      device_name: payload.deviceName ?? "expo-mobile",
    }),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to login", url);
  }

  const data = (await response.json()) as { data: { user: AuthUser; token: string } };
  setAuthToken(data.data.token);
  await persistAuthToken(data.data.token);
  return data.data;
};

export const logoutUser = async (): Promise<void> => {
  const url = getApiUrl("/api/auth/logout");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok && response.status !== 401) {
    throw await buildHttpError(response, "Failed to logout", url);
  }

  setAuthToken(null);
  await persistAuthToken(null);
};

export const getProfileSummary = async (): Promise<ProfileSummaryResponse> => {
  const url = getApiUrl("/api/profile/summary");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to fetch profile summary", url);
  }

  const payload = (await response.json()) as { data: ProfileSummaryResponse };
  return payload.data;
};

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    await fetch(getApiUrl("/api/analytics/search"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        searchTerm: query,
        movieId: movie.id,
        title: movie.title,
        genreIds: movie.genre_ids ?? [],
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
        ...getAuthHeaders(),
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
      ...getAuthHeaders(),
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
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw await buildHttpError(response, "Failed to remove from watchlist", url);
  }
};
