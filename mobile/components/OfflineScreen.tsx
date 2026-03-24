import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";

interface OfflineScreenProps {
  onRetry?: () => void;
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📡</Text>
          </View>
          
          <Text variant="headlineMedium" style={styles.title}>
            You're Offline
          </Text>
          
          <Text variant="bodyLarge" style={styles.subtitle}>
            It seems you've lost your internet connection. Please check your network settings and try again.
          </Text>

          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={onRetry}
            style={styles.retryButton}
            icon="refresh"
          >
            Try Again
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconText: {
    fontSize: 80,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});

export default OfflineScreen;
