import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * This is the root file that gets loaded first.
 * We redirect users to either tabs or login based on authentication status.
 */
export default function Root() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Failed to get auth token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // If still loading, we could show a splash screen
  if (isLoading) {
    return null;
  }

  // Redirect based on authentication status
  // For a real app, update this logic as needed
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}
