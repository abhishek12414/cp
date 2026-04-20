import React from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button } from "react-native-paper";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import BrandCard from "@/components/ui/BrandCard";
import { useBrand } from "@/hooks/queries/useBrand";
import { brandApi } from "@/apis/brand.api";
import { BrandInterface } from "@/interface";

/**
 * Manage Brands screen in admin panel.
 *
 * Route: /admin/brands
 *
 * Displays list of brands from Strapi DB (via useBrand hook/api::brand.brand content type).
 * Features:
 * - List brands (reuse BrandCard)
 * - Add new brand button (nav to form)
 * - Edit brand (reuse form screen)
 * - Delete with confirmation (mutation + Alert)
 *
 * Backend: See server/src/api/brand/content-types/brand/schema.json for fields (name, slug, logo, etc.).
 * CRUD via brand.api.ts ; React Query for data fetching/mutation/invalidation.
 *
 * Schema summary:
 * - name (string, required, unique)
 * - slug (uid auto from name)
 * - description, website, isActive (bool), logo (media), products (relation)
 *
 * Future extensions: Search, pagination, full media upload in form.
 */

export default function ManageBrandsScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // React Query for brands list (reuse existing hook; fetches from /api/brands?populate=logo)
  const { data: brands = [], isLoading, error, refetch } = useBrand();

  // Query client for invalidation after mutations
  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandApi.deleteBrand(id),
    onSuccess: () => {
      // Invalidate and refetch brands list
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      Alert.alert("Success", "Brand deleted successfully.");
    },
    onError: (err) => {
      console.error("Delete brand error:", err);
      Alert.alert("Error", "Failed to delete brand. Please try again.");
    },
  });

  // Handlers
  const handleAddBrand = () => {
    // Navigate to form for create (using dynamic or dedicated form route)
    router.push("/(admin)/brands/new");
  };

  const handleEditBrand = (documentId: string) => {
    // Navigate to form for edit (reuse same screen)
    router.push(`/(admin)/brands/${documentId}`);
  };

  const handleDeleteBrand = (id: BrandInterface["id"], name: string) => {
    // Confirmation dialog before delete
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the brand "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleBrandPress = (documentId: string) => {
    // Optional: View details or default to edit
    handleEditBrand(documentId);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
          <View style={styles.center}>
            <Text>Loading brands...</Text>
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
            <Text>Error loading brands: {error.message}</Text>
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
          <Text style={[styles.title, { color: primaryColor }]}>Manage Brands</Text>
          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={handleAddBrand}
            style={styles.addButton}
          >
            Add New Brand
          </Button>
        </View>

        {/* List of brands using FlatList and reusable BrandCard */}
        <FlatList
          data={brands}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.brandItem}>
              <BrandCard data={item} onPress={() => handleBrandPress(item.documentId)} />
              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => handleEditBrand(item.documentId)}
                  style={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  textColor="red"
                  onPress={() => handleDeleteBrand(item.id, item.name)}
                  style={styles.actionButton}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No brands found. Add one to get started.</Text>
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
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 12,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
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
