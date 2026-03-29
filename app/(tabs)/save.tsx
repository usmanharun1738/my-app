import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { getWatchlist, removeFromWatchlist } from "@/services/backend";
import useFetch from "@/services/usefetch";

const Save = () => {
  const router = useRouter();

  const fetchWatchlist = useCallback(() => getWatchlist(), []);
  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(fetchWatchlist);

  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  useEffect(() => {
    setWatchlist(Array.isArray(data) ? data : []);
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const performRemove = async (movieId: number) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlist((prev) => prev.filter((item) => item.movie_id !== movieId));
      Alert.alert("movie removed");
    } catch (removeError) {
      Alert.alert(
        "Remove failed",
        removeError instanceof Error ? removeError.message : "Unknown error"
      );
    }
  };

  const handleRemove = (movieId: number) => {
    Alert.alert("Remove", "Remove this movie from watchlist?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void performRemove(movieId);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="bg-primary flex-1 px-5">
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.movie_id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View className="mt-5 mb-4">
            <Text className="text-white text-2xl font-bold">Saved Movies</Text>
            <Text className="text-light-200 mt-1">
              Your watchlist persists in backend storage
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-dark-100 rounded-xl p-3 mb-3">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={() => router.push(`/movie/${item.movie_id}`)}
            >
              <Image
                source={{
                  uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "https://placehold.co/200x300/1a1a1a/FFFFFF.png",
                }}
                className="w-16 h-24 rounded-md"
                resizeMode="cover"
              />

              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold" numberOfLines={2}>
                  {item.title}
                </Text>

                <Text className="text-light-200 mt-2 text-xs">
                  {item.release_date?.split("-")[0] || "N/A"} • {item.vote_average
                    ? `${Math.round(item.vote_average / 2)}/5`
                    : "N/A"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-accent rounded-full px-3 py-1"
              onPress={() => handleRemove(item.movie_id)}
            >
              <Text className="text-white text-xs font-semibold">Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="flex justify-center items-center mt-24 gap-4">
              <Image source={icons.save} className="size-10" tintColor="#fff" />
              <Text className="text-gray-300 text-base text-center">
                No saved movies yet
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Open a movie detail page and tap Save
              </Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-light-200">Loading watchlist...</Text>
        </View>
      )}

      {error && (
        <View className="absolute bottom-24 left-5 right-5 bg-red-500/20 rounded-lg p-3">
          <Text className="text-red-300 text-center">{error.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Save;
