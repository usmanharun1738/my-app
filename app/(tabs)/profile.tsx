import {
    getAuthToken,
    getProfileSummary,
    loginUser,
    logoutUser,
    registerUser,
} from "@/services/backend";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ProfileSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    if (!getAuthToken()) {
      setSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProfileSummary();
      setSummary(result);
    } catch (fetchError) {
      setSummary(null);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Name, email, and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      await loadSummary();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginUser({ email: email.trim(), password });
      await loadSummary();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logoutUser();
      setSummary(null);
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1 px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-white text-2xl font-bold mt-4">Profile</Text>
        <Text className="text-light-200 text-sm mt-1">
          Manage your account and track your movie discovery habits.
        </Text>

        <View className="bg-dark-100 rounded-2xl p-4 mt-5">
          <Text className="text-white font-semibold text-base">Account</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name (for register)"
            placeholderTextColor="#A8B5DB"
            className="bg-dark-200 text-white rounded-xl px-4 py-3 mt-3"
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#A8B5DB"
            className="bg-dark-200 text-white rounded-xl px-4 py-3 mt-3"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#A8B5DB"
            className="bg-dark-200 text-white rounded-xl px-4 py-3 mt-3"
          />

          <View className="flex-row gap-3 mt-4">
            <Pressable
              disabled={loading}
              onPress={handleRegister}
              className="flex-1 bg-dark-200 rounded-xl py-3"
            >
              <Text className="text-white text-center font-semibold">Register</Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={handleLogin}
              className="flex-1 bg-accent rounded-xl py-3"
            >
              <Text className="text-white text-center font-semibold">Login</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={loading || !summary}
            onPress={handleLogout}
            className="bg-dark-200 rounded-xl py-3 mt-3"
          >
            <Text className="text-white text-center font-semibold">Logout</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator className="mt-4" color="#fff" />
          ) : null}

          {error ? <Text className="text-rose-300 text-xs mt-3">{error}</Text> : null}
        </View>

        <View className="bg-dark-100 rounded-2xl p-4 mt-4">
          <Text className="text-white font-semibold text-base">Identity</Text>
          <Text className="text-light-200 text-sm mt-2">
            {summary ? summary.user.name : "Not signed in"}
          </Text>
          <Text className="text-light-200 text-sm mt-1">
            {summary ? summary.user.email : "Login to see account details"}
          </Text>
        </View>

        <View className="bg-dark-100 rounded-2xl p-4 mt-4">
          <Text className="text-white font-semibold text-base">Usage Stats</Text>
          <Text className="text-light-200 text-sm mt-2">
            Searches: {summary ? summary.stats.searchCount : 0}
          </Text>

          <Text className="text-white text-sm font-semibold mt-4">Top Genres</Text>

          {summary && summary.stats.topGenres.length > 0 ? (
            summary.stats.topGenres.map((genre) => (
              <View
                key={`genre-${genre.id}`}
                className="flex-row items-center justify-between bg-dark-200 rounded-lg px-3 py-2 mt-2"
              >
                <Text className="text-white text-sm">{genre.name}</Text>
                <Text className="text-light-200 text-xs">{genre.count} searches</Text>
              </View>
            ))
          ) : (
            <Text className="text-light-200 text-sm mt-2">No stats yet. Search for movies after login.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
