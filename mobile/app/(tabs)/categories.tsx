import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";

// Import mock data
import { categories } from "@/mock/categories";

export default function CategoriesScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";

  // React Query hook to fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => Promise.resolve(categories),
    initialData: categories,
  });

  const handleCategoryPress = (id: string) => {
    router.push(`/category/${id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.header}>
            Shop by Category
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Browse all {categoriesData?.length || 0} categories
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.categoriesGrid}>
            {categoriesData?.map((item) => (
              <View key={item.id} style={styles.categoryWrapper}>
                <CategoryCard
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  onPress={handleCategoryPress}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  header: {
    fontWeight: "700",
    fontSize: 26,
    color: "#1a1a1a",
  },
  subtitle: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryWrapper: {
    width: "48%",
    marginBottom: 16,
  },
});
