import { registerUser } from "@/services/backend";
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

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Registration failed",
        error instanceof Error ? error.message : "Unable to register"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-6">
      <View className="flex-1 justify-center">
        <Text className="text-white text-3xl font-bold">Register</Text>
        <Text className="text-light-200 mt-2">Create an account in seconds.</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor="#A8B5DB"
          className="bg-dark-100 text-white rounded-xl px-4 py-4 mt-6"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#A8B5DB"
          className="bg-dark-100 text-white rounded-xl px-4 py-4 mt-3"
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
          onPress={handleRegister}
          className="bg-accent rounded-xl py-4 mt-5"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">Register</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("./login")} className="mt-4 py-2">
          <Text className="text-light-200 text-center">Already have an account? Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;
