import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ui/ProductCard";

import { Colors } from "@/constants/Colors";
import { useCategoryByDocumentId, useProducts } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: category, isLoading: isLoadingCategory } =
    useCategoryByDocumentId(id || "");

  // For Strapi we need nested filter keys so qs.stringify outputs
  // filters[category][documentId][$eq]=<id>
  const query = {
    filters: {
      category: { documentId: { $eq: id } },
    },
  };
  const { data: categoryProducts, isLoading: isLoadingProducts } =
    useProducts(query);

  const handleGoBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // Implement add to cart logic
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
    // Implement add to wishlist logic
  };

  if (isLoadingCategory || isLoadingProducts) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={primaryColor} />
        <Text>Loading category...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {category?.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={categoryProducts}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.productCardContainer}>
                <ProductCard
                  data={item}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </View>
            )}
            keyExtractor={(item) => item.documentId}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="titleMedium">No products found</Text>
                <Text variant="bodyMedium">
                  Try changing your search or filters
                </Text>
              </View>
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  brandChip: {
    marginRight: 8,
  },
  chipsList: {
    paddingRight: 16,
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  productsList: {
    padding: 8,
  },
  productCardContainer: {
    width: "50%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
