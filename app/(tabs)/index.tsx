import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { fetchLatestMoviesPage } from "@/services/api";
import { getTrendingMovies } from "@/services/backend";
import useFetch from "@/services/usefetch";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";

const LATEST_PAGE_SIZE = 12;

const Index = () => {
  const router = useRouter();
  const [latestPage, setLatestPage] = useState(1);

  const fetchTrending = useCallback(() => getTrendingMovies(), []);
  const fetchLatest = useCallback(
    () => fetchLatestMoviesPage({ page: latestPage, perPage: LATEST_PAGE_SIZE }),
    [latestPage]
  );

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(fetchTrending);

  const {
    data: latestMoviesPayload,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(fetchLatest);

  const trendingList = Array.isArray(trendingMovies) ? trendingMovies : [];
  const latestMovies = Array.isArray(latestMoviesPayload?.data)
    ? latestMoviesPayload.data
    : [];
  const latestMeta = latestMoviesPayload?.meta;

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <View className="mt-10 px-5">
            <Text className="text-red-400 text-center">
              Error: {moviesError?.message || trendingError?.message}
            </Text>
            <TouchableOpacity
              className="mt-4 self-center bg-accent px-5 py-2 rounded-full"
              onPress={() => {
                refetchTrending();
                refetchMovies();
              }}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Search for a movie"
            />

            {trendingList.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trendingList}
                  contentContainerStyle={{
                    gap: 26,
                  }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              <FlatList
                data={latestMovies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 10,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />

              <View className="flex-row items-center justify-between mt-2 mb-10">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    latestPage <= 1 || moviesLoading ? "bg-dark-200" : "bg-accent"
                  }`}
                  disabled={latestPage <= 1 || moviesLoading}
                  onPress={() => setLatestPage((prev) => Math.max(1, prev - 1))}
                >
                  <Text className="text-white font-semibold">Previous</Text>
                </TouchableOpacity>

                <Text className="text-light-200 font-medium">
                  Page {latestMeta?.page ?? latestPage} of {latestMeta?.totalPages ?? 1}
                </Text>

                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    latestMeta?.hasNextPage && !moviesLoading ? "bg-accent" : "bg-dark-200"
                  }`}
                  disabled={!latestMeta?.hasNextPage || moviesLoading}
                  onPress={() => setLatestPage((prev) => prev + 1)}
                >
                  <Text className="text-white font-semibold">Next</Text>
                </TouchableOpacity>
              </View>
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
