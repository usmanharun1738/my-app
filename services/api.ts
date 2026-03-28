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
}: {
  query: string;
}): Promise<Movie[]> => {
  const url = query
    ? getApiUrl(`/api/movies/search?q=${encodeURIComponent(query)}`)
    : getApiUrl("/api/movies/discover");

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
