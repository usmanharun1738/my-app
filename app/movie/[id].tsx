import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
  Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = Array.isArray(id) ? id[0] : id;

  const fetchDetails = useCallback(() => fetchMovieDetails(movieId as string), [movieId]);
  const fetchWatchlist = useCallback(() => getWatchlist(), []);
  const [hasPosterError, setHasPosterError] = useState(false);

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

  const castNames = useMemo(() => {
    if (!movie?.credits?.cast?.length) {
      return "N/A";
    }

    return movie.credits.cast
      .slice(0, 8)
      .map((member) => member.name)
      .join(" • ");
  }, [movie?.credits?.cast]);

  const directorNames = useMemo(() => {
    if (!movie?.credits?.crew?.length) {
      return "N/A";
    }

    const names = movie.credits.crew
      .filter((member) => member.job === "Director")
      .map((member) => member.name);

    return names.length > 0 ? Array.from(new Set(names)).join(" • ") : "N/A";
  }, [movie?.credits?.crew]);

  const trailerUrl = useMemo(() => {
    const videos = movie?.videos?.results ?? [];
    const youtubeVideos = videos.filter((video) => video.site === "YouTube");
    const preferred =
      youtubeVideos.find((video) => video.type === "Trailer" && video.official) ||
      youtubeVideos.find((video) => video.type === "Trailer") ||
      youtubeVideos.find((video) => video.type === "Teaser") ||
      youtubeVideos[0];

    return preferred?.key ? `https://www.youtube.com/watch?v=${preferred.key}` : null;
  }, [movie?.videos?.results]);

  const handleViewTrailer = async () => {
    if (!trailerUrl) {
      Alert.alert("Trailer unavailable", "No trailer found for this movie yet.");
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
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{ uri: posterUri }}
            className="w-full h-[550px]"
            resizeMode="cover"
            onError={() => setHasPosterError(true)}
          />

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

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <TouchableOpacity
            className="mt-4 bg-accent rounded-lg py-3 px-4 flex-row items-center justify-center"
            onPress={handleViewTrailer}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">View Trailer</Text>
          </TouchableOpacity>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo label="Director(s)" value={directorNames} />
          <MovieInfo label="Cast" value={castNames} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
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
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute top-12 left-5 rounded-full size-11 items-center justify-center border border-white/20 z-50"
        style={{ backgroundColor: "rgba(15, 13, 35, 0.8)" }}
        onPress={router.back}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

    </View>
  );
};

export default Details;
