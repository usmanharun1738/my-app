import { loginUser } from "@/services/backend";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        email: email.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isCredentialError =
        message.includes("incorrect") ||
        message.includes("credentials") ||
        message.includes("http 401") ||
        message.includes("http 422");

      Alert.alert(
        "Login failed",
        isCredentialError
          ? "Incorrect credentials. Please check your email and password."
          : error instanceof Error
            ? error.message
            : "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-6">
      <View className="flex-1 justify-center">
        <Text className="text-white text-3xl font-bold">Login</Text>
        <Text className="text-light-200 mt-2">Use your account to continue.</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#A8B5DB"
          className="bg-dark-100 text-white rounded-xl px-4 py-4 mt-6"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#A8B5DB"
          className="bg-dark-100 text-white rounded-xl px-4 py-4 mt-3"
        />

        <Pressable
          disabled={loading}
          onPress={handleLogin}
          className="bg-accent rounded-xl py-4 mt-5"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">Login</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("./register")} className="mt-4 py-2">
          <Text className="text-light-200 text-center">No account? Register</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
