import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { router } from "expo-router";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ImageBackground source={images.bg} className="flex-1" resizeMode="cover">
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <Image source={icons.logo} className="w-20 h-20" resizeMode="contain" />
            <Text className="text-white text-3xl font-bold mt-5">Welcome</Text>
            <Text className="text-light-200 text-center mt-3">
              Sign in to save your profile and movie stats.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("./login")}
            className="bg-accent rounded-xl py-4"
          >
            <Text className="text-white text-center font-semibold text-base">Login</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("./register")}
            className="bg-dark-100 rounded-xl py-4 mt-3"
          >
            <Text className="text-white text-center font-semibold text-base">Create Account</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="py-3 mt-5"
          >
            <Text className="text-light-200 text-center">Continue as guest</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
