import React from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useProducts } from "@/hooks/queries";
import { ProductInterface } from "@/interface";
import { productApi } from "@/apis/product.api";
import { getImageUrl } from "@/helpers/image";

/**
 * Manage Products screen in admin panel.
 *
 * Route: /admin/products
 *
 * Displays list of products with add/edit/delete actions.
 */

export default function ManageProductsScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: products = [], isLoading, error, refetch } = useProducts({});
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => productApi.deleteProduct(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Alert.alert("Success", "Product deleted successfully.");
    },
    onError: (err) => {
      console.error("Delete product error:", err);
      Alert.alert("Error", "Failed to delete product. Please try again.");
    },
  });

  const handleAddProduct = () => {
    router.push("/(admin)/products/new");
  };

  const handleEditProduct = (documentId: string) => {
    router.push(`/(admin)/products/${documentId}`);
  };

  const handleDeleteProduct = (documentId: ProductInterface["documentId"], name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the product "${name}"? This action cannot be undone.`,
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
            <Text>Loading products...</Text>
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
            <Text>Error loading products: {(error as Error).message}</Text>
            <Button onPress={() => refetch()}>Retry</Button>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: primaryColor }]}>Manage Products</Text>
          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={handleAddProduct}
            style={styles.addButton}
          >
            Add New
          </Button>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.documentId}
          renderItem={({ item }) => {
            const productImages = item.images || [];
            const hasImages = productImages.length > 0;
            const imageCount = productImages.length;
            const firstImage = hasImages ? productImages[0] : null;

            return (
              <View style={styles.productItem}>
                <View style={styles.productInfo}>
                  {hasImages && firstImage ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: getImageUrl(firstImage.url) }}
                        style={styles.productImage}
                        contentFit="cover"
                      />
                      {imageCount > 1 && (
                        <View style={styles.imageCountBadge}>
                          <Text style={styles.imageCountText}>+{imageCount - 1}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                      <Text style={styles.avatarText}>
                        {item.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.textBlock}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.productMeta} numberOfLines={1}>
                      {item.category?.name || "No category"}
                      {item.brand?.name ? ` • ${item.brand.name}` : ""}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>₹{item.price?.toFixed(2)}</Text>
                      {item.stockQuantity !== undefined && (
                        <Text
                          style={[
                            styles.stockText,
                            item.stockQuantity === 0
                              ? styles.outOfStock
                              : item.stockQuantity < 5
                                ? styles.lowStock
                                : styles.inStock,
                          ]}
                        >
                          {item.stockQuantity === 0
                            ? "Out of stock"
                            : item.stockQuantity < 5
                              ? `Only ${item.stockQuantity} left`
                              : "In stock"}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditProduct(item.documentId)}
                    style={styles.actionButton}
                    compact
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    textColor="red"
                    onPress={() => handleDeleteProduct(item.documentId, item.name)}
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
            <Text style={styles.emptyText}>No products found. Add one to get started.</Text>
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
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  imageCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  textBlock: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  productMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  stockText: {
    fontSize: 11,
    fontWeight: "500",
  },
  inStock: {
    color: "#4CAF50",
  },
  lowStock: {
    color: "#FF9800",
  },
  outOfStock: {
    color: "#F44336",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 60,
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
