import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
  FlatList,
    Image,
    Linking,
  Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { icons } from "@/constants/icons";
import { getPosterImageUri, POSTER_PLACEHOLDER_URI } from "@/constants/images";
import { fetchMovieDetails } from "@/services/api";
import {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist,
} from "@/services/backend";
import useFetch from "@/services/usefetch";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-6 w-full">
    <Text className="text-light-200 font-medium text-base">{label}</Text>
    <Text className="text-light-100 font-semibold text-lg leading-8 mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const InfoChip = ({ text }: { text: string }) => (
  <View className="bg-dark-100 border border-white/10 rounded-full px-4 py-2 mr-2 mb-2">
    <Text className="text-light-100 text-sm font-medium">{text}</Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = Array.isArray(id) ? id[0] : id;

  const fetchDetails = useCallback(() => fetchMovieDetails(movieId as string), [movieId]);
  const fetchWatchlist = useCallback(() => getWatchlist(), []);
  const [hasPosterError, setHasPosterError] = useState(false);
  const [isTrailerVisible, setIsTrailerVisible] = useState(false);

  const { data: movie, loading } = useFetch(fetchDetails, Boolean(movieId));
  const { data: watchlist, refetch: refetchWatchlist } = useFetch(fetchWatchlist);

  const isSaved =
    Array.isArray(watchlist) && !!movie
      ? watchlist.some((item) => item.movie_id === movie.id)
      : false;

  const posterUri = useMemo(() => {
    if (hasPosterError) {
      return POSTER_PLACEHOLDER_URI;
    }

    return getPosterImageUri(movie?.poster_path ?? null);
  }, [hasPosterError, movie?.poster_path]);

  useEffect(() => {
    setHasPosterError(false);
    setIsTrailerVisible(false);
  }, [movieId]);

  const castMembers = useMemo(
    () => (movie?.credits?.cast ?? []).slice(0, 10).map((member) => member.name),
    [movie?.credits?.cast]
  );

  const directors = useMemo(() => {
    const names = (movie?.credits?.crew ?? [])
      .filter((member) => member.job === "Director")
      .map((member) => member.name);

    return Array.from(new Set(names));
  }, [movie?.credits?.crew]);

  const trailerKey = useMemo(() => {
    const videos = movie?.videos?.results ?? [];
    const youtubeVideos = videos.filter((video) => video.site === "YouTube");
    const preferred =
      youtubeVideos.find((video) => video.type === "Trailer" && video.official) ||
      youtubeVideos.find((video) => video.type === "Trailer") ||
      youtubeVideos.find((video) => video.type === "Teaser") ||
      youtubeVideos[0];

    return preferred?.key ?? null;
  }, [movie?.videos?.results]);

  const trailerUrl = useMemo(
    () => (trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null),
    [trailerKey]
  );

  const trailerEmbedUrl = useMemo(
    () =>
      trailerKey
        ? `https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0&modestbranding=1&playsinline=1`
        : null,
    [trailerKey]
  );

  const similarMovies = useMemo(
    () => (movie?.similar?.results ?? []).filter((item) => item.id !== movie?.id).slice(0, 12),
    [movie?.id, movie?.similar?.results]
  );

  const releaseYear = movie?.release_date?.split("-")[0] || "N/A";
  const runtimeLabel = movie?.runtime ? `${movie.runtime}m` : "N/A";

  const handleViewTrailer = async () => {
    if (!trailerKey) {
      Alert.alert("Trailer unavailable", "No trailer found for this movie yet.");
      return;
    }

    setIsTrailerVisible(true);
  };

  const handleOpenTrailerExternally = async () => {
    if (!trailerUrl) {
      return;
    }

    const supported = await Linking.canOpenURL(trailerUrl);
    if (!supported) {
      Alert.alert("Cannot open trailer", "Your device cannot open this link.");
      return;
    }

    await Linking.openURL(trailerUrl);
  };

  const handleSave = async () => {
    if (!movie) {
      return;
    }

    if (isSaved) {
      Alert.alert("Remove", "Remove this movie from watchlist?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFromWatchlist(movie.id);
              await refetchWatchlist();
              Alert.alert("movie removed");
            } catch (removeError) {
              Alert.alert(
                "Remove failed",
                removeError instanceof Error ? removeError.message : "Unknown error"
              );
            }
          },
        },
      ]);

      return;
    }

    try {
      await addToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      });
      await refetchWatchlist();

      Alert.alert("movie saved");
    } catch (saveError) {
      Alert.alert(
        "Save failed",
        saveError instanceof Error ? saveError.message : "Unknown error"
      );
    }
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <Image
            source={{ uri: posterUri }}
            className="w-full h-[550px]"
            resizeMode="cover"
            onError={() => setHasPosterError(true)}
          />

          <View className="absolute bottom-0 left-0 right-0 h-40 bg-black/35" />

          <TouchableOpacity
            className={`absolute bottom-5 right-5 rounded-full size-14 flex items-center justify-center ${
              isSaved ? "bg-accent" : "bg-white"
            }`}
            onPress={handleSave}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? "#FFFFFF" : "#151312"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-4 px-5">
          <Text className="text-white font-bold text-[38px] leading-[44px]">
            {movie?.title}
          </Text>

          <View className="flex-row items-center mt-3">
            <Text className="text-light-200 text-lg font-medium">{releaseYear}</Text>
            <Text className="text-light-200 text-lg font-medium mx-2">•</Text>
            <Text className="text-light-200 text-lg font-medium">{runtimeLabel}</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-xl gap-x-1 mt-4">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-[30px]">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-lg font-medium">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <TouchableOpacity
            className="mt-5 bg-accent rounded-2xl py-3.5 px-5 flex-row items-center justify-center"
            onPress={handleViewTrailer}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-2xl ml-2">View Trailer</Text>
          </TouchableOpacity>

          <MovieInfo label="Overview" value={movie?.overview || "N/A"} />

          <View className="mt-7 w-full">
            <Text className="text-light-200 font-medium text-base mb-3">Director(s)</Text>
            <View className="flex-row flex-wrap">
              {directors.length > 0 ? (
                directors.map((name) => <InfoChip key={name} text={name} />)
              ) : (
                <Text className="text-light-100 text-lg font-semibold">N/A</Text>
              )}
            </View>
          </View>

          <View className="mt-7 w-full">
            <Text className="text-light-200 font-medium text-base mb-3">Cast</Text>
            <View className="flex-row flex-wrap">
              {castMembers.length > 0 ? (
                castMembers.map((name) => <InfoChip key={name} text={name} />)
              ) : (
                <Text className="text-light-100 text-lg font-semibold">N/A</Text>
              )}
            </View>
          </View>

          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex-row justify-between w-full">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />

          {similarMovies.length > 0 && (
            <View className="w-full mt-8">
              <Text className="text-light-200 font-medium text-base mb-3">
                Similar Movies
              </Text>
              <FlatList
                data={similarMovies}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="mr-3"
                    onPress={() => router.push(`/movie/${item.id}` as never)}
                  >
                    <Image
                      source={{ uri: getPosterImageUri(item.poster_path ?? null) }}
                      className="w-24 h-36 rounded-xl"
                      resizeMode="cover"
                    />
                    <Text className="text-light-100 text-xs font-semibold mt-2 w-24" numberOfLines={2}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute top-12 left-5 rounded-full size-11 items-center justify-center border border-white/20 z-50"
        style={{ backgroundColor: "rgba(15, 13, 35, 0.8)" }}
        onPress={router.back}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={isTrailerVisible}
        transparent
        onRequestClose={() => setIsTrailerVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center px-4">
          <SafeAreaView>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Trailer Preview</Text>
              <TouchableOpacity
                className="h-9 w-9 rounded-full bg-white/20 items-center justify-center"
                onPress={() => setIsTrailerVisible(false)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="w-full aspect-video rounded-xl overflow-hidden bg-black">
              {trailerEmbedUrl ? (
                <WebView
                  source={{ uri: trailerEmbedUrl }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-light-200">Trailer unavailable</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              className="mt-4 bg-white/10 rounded-xl py-3 px-4 flex-row items-center justify-center"
              onPress={handleOpenTrailerExternally}
              disabled={!trailerUrl}
            >
              <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Open in YouTube</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

    </View>
  );
};

export default Details;
