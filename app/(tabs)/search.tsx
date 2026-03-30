import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/backend";

import MovieDisplayCard from "@/components/MovieCard";
import MovieFilters from "@/components/MovieFilters";
import SearchBar from "@/components/SearchBar";

const SEARCH_PAGE_SIZE = 12;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<{
    genreId: number | null;
    year: number | null;
    minRating: number | null;
    sortBy: "popular" | "release_desc" | "release_asc";
  }>({
    genreId: null,
    year: null,
    minRating: null,
    sortBy: "popular",
  });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounced search effect for fetching movie results.
  useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      const normalizedQuery = debouncedQuery.trim();

      // Only fetch if query is long enough OR if filters are active
      const hasActiveFilters = Object.values(filters).some(
        (val) => val !== null && val !== "popular"
      );

      if (!normalizedQuery && !hasActiveFilters) {
        setMovies([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (normalizedQuery && normalizedQuery.length < 2) {
        setMovies([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await fetchMovies({
          query: normalizedQuery,
          filters,
        });

        if (cancelled) {
          return;
        }

        setMovies(results);
        setSearchPage(1);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError
            : new Error("An unknown error occurred")
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters]);

  const handleSubmitSearch = async () => {
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await fetchMovies({
        query: normalizedQuery,
        filters,
      });

      setMovies(results);
      setSearchPage(1);

      if (results.length > 0) {
        await updateSearchCount(normalizedQuery, results[0]);
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchMovies({
        query: searchQuery.trim() || "",
        filters,
      });

      setMovies(results);
      setSearchPage(1);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(movies.length / SEARCH_PAGE_SIZE));
  const currentPage = Math.min(searchPage, totalPages);
  const pageStartIndex = (currentPage - 1) * SEARCH_PAGE_SIZE;
  const paginatedMovies = movies.slice(pageStartIndex, pageStartIndex + SEARCH_PAGE_SIZE);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={paginatedMovies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 10,
          marginVertical: 10,
        }}
        contentContainerStyle={{ paddingBottom: 90 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search for a movie"
                value={searchQuery}
                onChangeText={handleSearch}
                onSubmitEditing={handleSubmitSearch}
              />

              <View className="mt-3">
                <MovieFilters filters={filters} onChange={setFilters} onApply={handleApplyFilters} />
              </View>
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length! > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? searchQuery.trim().length < 2
                    ? "Type at least 2 characters to search"
                    : "No movies found"
                  : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading && !error && movies.length > 0 ? (
            <View className="flex-row items-center justify-between mt-1 mb-5">
              <TouchableOpacity
                className={`h-11 w-11 rounded-full items-center justify-center ${
                  currentPage > 1 ? "bg-accent" : "bg-dark-200"
                }`}
                disabled={currentPage <= 1}
                onPress={() => setSearchPage((prev) => Math.max(1, prev - 1))}
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <Text className="text-light-200 font-medium">
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                className={`h-11 w-11 rounded-full items-center justify-center ${
                  currentPage < totalPages ? "bg-accent" : "bg-dark-200"
                }`}
                disabled={currentPage >= totalPages}
                onPress={() => setSearchPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
