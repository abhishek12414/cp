import React from "react";
import { StyleSheet, ScrollView, View, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCategories } from "@/hooks/queries";
import { Colors } from "@/constants/Colors";
import { CategoryInterface } from "@/interface";

export default function CategoriesScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";

  // Fetch categories from API
  const { data: categoriesData, isLoading, refetch, isRefetching } = useCategories();

  const handleCategoryPress = (category: CategoryInterface) => {
    router.push(`/category/${category.documentId}`);
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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating size="large" color={Colors[colorScheme].primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading categories...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={[Colors[colorScheme].primary]}
                tintColor={Colors[colorScheme].primary}
              />
            }
          >
            <View style={styles.categoriesGrid}>
              {categoriesData?.map((category) => (
                <View key={category.documentId} style={styles.categoryWrapper}>
                  <CategoryCard data={category} onPress={handleCategoryPress} />
                </View>
              ))}
            </View>

            {categoriesData?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No categories found
                </Text>
              </View>
            )}
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  categoryWrapper: {
    width: "25%",
    marginBottom: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
  },
});
