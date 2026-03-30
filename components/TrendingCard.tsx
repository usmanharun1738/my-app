import MaskedView from "@react-native-masked-view/masked-view";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { images, POSTER_PLACEHOLDER_URI } from "@/constants/images";

const TrendingCard = ({
  movie: { movie_id, title, poster_url },
  index,
}: TrendingCardProps) => {
  const [hasPosterError, setHasPosterError] = useState(false);
  const posterUri = useMemo(() => {
    if (hasPosterError) {
      return POSTER_PLACEHOLDER_URI;
    }

    return poster_url || POSTER_PLACEHOLDER_URI;
  }, [hasPosterError, poster_url]);

  return (
    <Link href={`/movie/${movie_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image
          source={{ uri: posterUri }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
          onError={() => setHasPosterError(true)}
        />

        <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
          <MaskedView
            maskElement={
              <Text className="font-bold text-white text-6xl">{index + 1}</Text>
            }
          >
            <Image
              source={images.rankingGradient}
              className="size-14"
              resizeMode="cover"
            />
          </MaskedView>
        </View>

        <Text
          className="text-sm font-bold mt-2 text-light-200"
          numberOfLines={2}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;
