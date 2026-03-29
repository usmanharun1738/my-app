const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL environment variable");
}

const getApiUrl = (path: string): string => {
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

export const fetchMovies = async ({
  query,
  filters,
}: {
  query: string;
  filters?: MovieFilters;
}): Promise<Movie[]> => {
  const searchParams = new URLSearchParams();

  if (filters?.genreId) {
    searchParams.set("genreId", String(filters.genreId));
  }

  if (filters?.year) {
    searchParams.set("year", String(filters.year));
  }

  if (filters?.minRating) {
    searchParams.set("minRating", String(filters.minRating));
  }

  if (filters?.sortBy) {
    searchParams.set("sortBy", filters.sortBy);
  }

  if (query) {
    searchParams.set("q", query);
  }

  const endpoint = query ? "/api/movies/search" : "/api/movies/discover";
  const queryString = searchParams.toString();
  const url = getApiUrl(queryString ? `${endpoint}?${queryString}` : endpoint);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw await buildHttpError(response, "Failed to fetch movies", url);
    }

    const payload = await response.json();
    return payload.data || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  const url = getApiUrl(`/api/movies/${movieId}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw await buildHttpError(
        response,
        "Failed to fetch movie details",
        url
      );
    }

    const payload = await response.json();
    return payload.data || {};
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};
