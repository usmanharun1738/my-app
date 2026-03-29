import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getAuthToken, restoreAuthToken } from "@/services/backend";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, ImageBackground, Text, View } from "react-native";

const SplashScreen = () => {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await restoreAuthToken();

      if (cancelled) {
        return;
      }

      setTimeout(() => {
        if (cancelled) {
          return;
        }

        if (getAuthToken()) {
          router.replace("/(tabs)");
          return;
        }

        router.replace("/welcome");
      }, 1200);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="flex-1 bg-primary">
      <ImageBackground source={images.bg} className="flex-1" resizeMode="cover">
        <View className="flex-1 items-center justify-center px-6">
          <Image source={icons.logo} className="w-24 h-24" resizeMode="contain" />
          <Text className="text-white text-2xl font-bold mt-5">Movie App</Text>
          <Text className="text-light-200 text-sm mt-2 text-center">
            Find movies, save favorites, and track your taste.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
