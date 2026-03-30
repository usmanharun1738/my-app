import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type TabIconProps = {
  focused: boolean;
  activeName: keyof typeof Ionicons.glyphMap;
  inactiveName: keyof typeof Ionicons.glyphMap;
};

function TabIcon({ focused, activeName, inactiveName }: TabIconProps) {
  const scale = useRef(new Animated.Value(focused ? 1.12 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <View className="flex-1 items-center justify-center">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={focused ? activeName : inactiveName}
          size={24}
          color={focused ? "#A78BFA" : "#A8B5DB"}
        />
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "auto",
          height: 64,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderTopWidth: 1,
          borderTopColor: "#1C1A38",
          height: 64,
          elevation: 0,
        },
        tabBarActiveTintColor: "#A78BFA",
        tabBarInactiveTintColor: "#A8B5DB",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="home-sharp" inactiveName="home-sharp" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="search" inactiveName="search-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="save"
        options={{
          title: "Save",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="bookmark" inactiveName="bookmark-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeName="person" inactiveName="person-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
