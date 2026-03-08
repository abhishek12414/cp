import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

import { loginSuccess } from "@/reducers/auth.reducer";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";

export default function LoginScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const dispatch = useDispatch();

  // For demo purposes, we'll just simulate a login
  const handleLogin = async () => {
    // In a real app, this would call an API endpoint
    // For now, we'll just simulate a successful login
    const mockUser = {
      id: "user123",
      email: "demo@example.com",
      name: "Demo User",
      phone: "+1234567890",
    };

    const mockToken = "mock-jwt-token";

    // Save token to storage
    await AsyncStorage.setItem("auth_token", mockToken);

    // Update Redux state
    dispatch(loginSuccess({ user: mockUser, token: mockToken }));

    // Navigate to home screen
    router.replace("/");
  };

  const handleSkipLogin = () => {
    // For demonstration purposes, allow skipping login
    router.replace("/");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/react-logo.png")}
              style={styles.logo}
            />
            <Text style={[styles.logoText, { color: primaryColor }]}>
              CurrentShop
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome to CurrentShop</Text>
            <Text style={styles.subtitleText}>
              Your B2B/B2C Electronic Components Solution
            </Text>

            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.buttonLabel}
            >
              Login with Demo Account
            </Button>

            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.signupButton}
              labelStyle={styles.buttonLabel}
            >
              Create Account
            </Button>

            <TouchableOpacity
              onPress={handleSkipLogin}
              style={styles.skipContainer}
            >
              <Text style={styles.skipText}>Skip Login for Now</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.7,
  },
  loginButton: {
    padding: 4,
    marginBottom: 16,
  },
  signupButton: {
    padding: 4,
    marginBottom: 24,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 6,
  },
  skipContainer: {
    alignItems: "center",
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
