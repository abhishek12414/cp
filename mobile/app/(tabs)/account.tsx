import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { logout } from "@/reducers/auth.reducer";

export default function AccountScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  const handleLogout = async () => {
    // Remove token from storage
    await AsyncStorage.removeItem("auth_token");

    // Update Redux state
    dispatch(logout());

    // Navigate to login screen
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            My Account
          </Text>
        </View>

        <View style={styles.profileSection}>
          <Avatar.Text
            size={80}
            label={user?.name?.substring(0, 2) || "DU"}
            backgroundColor={primaryColor}
          />
          <View style={styles.userInfo}>
            <Text variant="titleLarge">{user?.name || "Demo User"}</Text>
            <Text variant="bodyMedium">
              {user?.email || "demo@example.com"}
            </Text>
            <Text variant="bodyMedium">{user?.phone || "+1234567890"}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Button
            mode="contained"
            style={styles.menuButton}
            icon="history"
            onPress={() => console.log("Order History")}
          >
            Order History
          </Button>

          <Button
            mode="contained"
            style={styles.menuButton}
            icon="account-details"
            onPress={() => console.log("Edit Profile")}
          >
            Edit Profile
          </Button>

          <Button
            mode="contained"
            style={styles.menuButton}
            icon="cog"
            onPress={() => console.log("Settings")}
          >
            Settings
          </Button>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            style={styles.logoutButton}
            icon="logout"
            onPress={handleLogout}
          >
            Logout
          </Button>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  userInfo: {
    marginLeft: 16,
  },
  menuSection: {
    padding: 16,
  },
  menuButton: {
    marginVertical: 8,
    borderRadius: 8,
  },
  logoutContainer: {
    padding: 16,
    marginTop: "auto",
  },
  logoutButton: {
    borderRadius: 8,
  },
});
