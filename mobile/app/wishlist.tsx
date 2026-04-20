import React from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ui/ProductCard";
import { Colors } from "@/constants/Colors";
import { useWishlist, useToggleWishlist } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProductInterface } from "@/interface";

export default function WishlistScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: wishlistItems = [], isLoading } = useWishlist();
  useToggleWishlist();

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

  // Convert wishlist items to product format for ProductCard
  const products: ProductInterface[] = wishlistItems
    .filter((item) => item.product)
    .map((item) => ({
      ...item.product!,
      id: item.product!.id,
      documentId: item.product!.documentId,
    }));

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={primaryColor} />
        <Text>Loading wishlist...</Text>
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
            My Wishlist
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="heart-outline" size={64} iconColor="#ccc" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Your wishlist is empty
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Start adding products you love!
            </Text>
            <TouchableOpacity style={styles.shopNowButton} onPress={() => router.push("/(tabs)")}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.productCardContainer}>
                <ProductCard
                  data={item}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                />
              </View>
            )}
            keyExtractor={(item) => item.documentId}
            contentContainerStyle={styles.productsList}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },
  shopNowButton: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  productsList: {
    padding: 8,
  },
  productCardContainer: {
    width: "50%",
  },
});
