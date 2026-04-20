import React from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button } from "react-native-paper";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useCategories } from "@/hooks/queries/useCategories";
import { categoryApi } from "@/apis/category.api";
import { CategoryInterface } from "@/interface";
import { getImageUrl } from "@/helpers/image";

/**
 * Manage Categories screen in admin panel.
 *
 * Route: /admin/categories
 *
 * Displays list of categories from Strapi DB (via useCategories hook /
 * api::category.category content type).
 * Features:
 * - List categories
 * - Add new category button (nav to form)
 * - Edit category (nav to form screen)
 * - Delete with confirmation (mutation + Alert)
 *
 * Backend: See server/src/api/category/content-types/category/schema.json for
 * fields (name, slug, description, products relation, attributes relation).
 * CRUD via category.api.ts; React Query for data fetching/mutation/invalidation.
 *
 * Schema summary:
 * - name (string, required, unique, maxLength 100)
 * - slug (uid auto from name)
 * - description (text, optional)
 * - products (relation oneToMany)
 * - attributes (relation manyToMany)
 */

export default function ManageCategoriesScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // React Query for categories list
  const { data: categories = [], isLoading, error, refetch } = useCategories();

  // Query client for invalidation after mutations
  const queryClient = useQueryClient();

  // Delete mutation (uses documentId for Strapi v5 API)
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => categoryApi.deleteCategory(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      Alert.alert("Success", "Category deleted successfully.");
    },
    onError: (err) => {
      console.error("Delete category error:", err);
      Alert.alert("Error", "Failed to delete category. Please try again.");
    },
  });

  // Handlers
  const handleAddCategory = () => {
    router.push("/(admin)/categories/new");
  };

  const handleEditCategory = (documentId: CategoryInterface["documentId"]) => {
    router.push(`/(admin)/categories/${documentId}`);
  };

  const handleDeleteCategory = (documentId: CategoryInterface["documentId"], name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the category "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(documentId),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
          <View style={styles.center}>
            <Text>Loading categories...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
          <View style={styles.center}>
            <Text>Error loading categories: {(error as Error).message}</Text>
            <Button onPress={() => refetch()}>Retry</Button>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* SafeAreaView with edges excluding 'top' for headered admin layout */}
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: primaryColor }]}>Manage Categories</Text>
          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={handleAddCategory}
            style={styles.addButton}
          >
            Add New
          </Button>
        </View>

        {/* List of categories using FlatList */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.documentId}
          renderItem={({ item }) => {
            const imageUri = getImageUrl(item.image?.url || "");
            return (
              <View style={styles.categoryItem}>
                {/* Category info */}
                <View style={styles.categoryInfo}>
                  {/* Initial avatar or Image */}
                  <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.avatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {item.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    )}
                  </View>
                  <View style={styles.textBlock}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={styles.categoryDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : (
                      <Text style={styles.categoryDescEmpty}>No description</Text>
                    )}
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditCategory(item.documentId)}
                    style={styles.actionButton}
                    compact
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    textColor="red"
                    onPress={() => handleDeleteCategory(item.documentId, item.name)}
                    style={styles.actionButton}
                    disabled={deleteMutation.isPending}
                    compact
                  >
                    Delete
                  </Button>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No categories found. Add one to get started.</Text>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
  },
  categoryDesc: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  categoryDescEmpty: {
    fontSize: 12,
    opacity: 0.4,
    fontStyle: "italic",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    minWidth: 64,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 32,
  },
});
