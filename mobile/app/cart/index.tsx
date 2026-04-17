import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { Text, Button, IconButton, Divider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "@/hooks/queries/useCart";
import { CartItemInterface } from "@/interface";
import { getImageUrl } from "@/helpers/image";
import LoadingScreen from "@/components/LoadingScreen";
import OfflineScreen from "@/components/OfflineScreen";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function CartScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  
  const { data: cart, isLoading, error, refetch } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const { isConnected } = useNetworkStatus();
  
  const [refreshing, setRefreshing] = useState(false);

  // Calculate cart totals
  const cartItems = cart?.cartItems || [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
  const total = subtotal + tax + shipping;

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleUpdateQuantity = async (item: CartItemInterface, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    // Check stock
    const stockQuantity = item.product?.stockQuantity ?? item.product?.stock ?? 0;
    if (newQuantity > stockQuantity) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${stockQuantity} items available.`
      );
      return;
    }

    try {
      await updateCartItem.mutateAsync({
        cartItemId: item.documentId,
        quantity: newQuantity,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveItem = async (item: CartItemInterface) => {
    Alert.alert(
      "Remove Item",
      `Remove ${item.product?.name || "this item"} from cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFromCart.mutateAsync(item.documentId);
            } catch (error) {
              // Error handled in hook
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearCart.mutateAsync();
            } catch (error) {
              // Error handled in hook
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      router.push("/checkout");
    }
  };

  const renderCartItem = ({ item }: { item: CartItemInterface }) => {
    const productImage = item.product?.images?.[0]?.url
      ? getImageUrl(item.product.images[0].url)
      : null;
    const productPrice = item.product?.price || 0;
    const stockQuantity = item.product?.stockQuantity ?? item.product?.stock ?? 0;
    const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
    const isOutOfStock = stockQuantity === 0;

    return (
      <Surface style={[styles.cartItemContainer, isOutOfStock && styles.outOfStockItem]}>
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.noImage]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text
            variant="titleMedium"
            numberOfLines={2}
            style={styles.productName}
          >
            {item.product?.name || "Unknown Product"}
          </Text>

          {item.product?.brand && (
            <Text variant="bodySmall" style={styles.brandName}>
              {item.product.brand.name}
            </Text>
          )}

          <Text variant="bodyMedium" style={styles.productPrice}>
            ₹{productPrice.toFixed(0)}
          </Text>

          {isOutOfStock && (
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          )}

          {isLowStock && !isOutOfStock && (
            <Text style={styles.lowStockText}>Only {stockQuantity} left</Text>
          )}

          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={16}
              mode="outlined"
              onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
              disabled={updateCartItem.isPending}
            />

            <Text variant="titleMedium" style={styles.quantityText}>
              {item.quantity}
            </Text>

            <IconButton
              icon="plus"
              size={16}
              mode="outlined"
              onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
              disabled={updateCartItem.isPending || item.quantity >= stockQuantity}
            />

            <View style={styles.spacer} />

            <Text variant="titleMedium" style={styles.itemTotal}>
              ₹{(productPrice * item.quantity).toFixed(0)}
            </Text>
          </View>
        </View>

        <IconButton
          icon="close"
          size={20}
          onPress={() => handleRemoveItem(item)}
          style={styles.removeButton}
          disabled={removeFromCart.isPending}
        />
      </Surface>
    );
  };

  // Loading state
  if (isLoading && !cart) {
    return <LoadingScreen message="Loading cart..." />;
  }

  // Error state
  if (error && !isConnected) {
    return <OfflineScreen onRetry={() => refetch()} />;
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Shopping Cart
          </Text>
          {cartItems.length > 0 && (
            <Button
              onPress={handleClearCart}
              textColor="red"
              disabled={clearCart.isPending}
            >
              Clear
            </Button>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text variant="displaySmall" style={styles.emptyIcon}>🛒</Text>
            <Text variant="titleLarge" style={styles.emptyCartText}>
              Your cart is empty
            </Text>
            <Text variant="bodyMedium" style={styles.emptyCartSubtext}>
              Browse products and add items to your cart
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => router.push("/")}
              style={styles.shopNowButton}
            >
              Shop Now
            </Button>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.documentId}
              contentContainerStyle={styles.cartItemsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            />

            <Surface style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Subtotal ({cartItems.length} items)</Text>
                <Text variant="bodyLarge">₹{subtotal.toFixed(0)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">GST (18%)</Text>
                <Text variant="bodyMedium">₹{tax.toFixed(0)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Shipping</Text>
                <Text variant="bodyMedium">
                  {shipping === 0 ? (
                    <Text style={styles.freeShipping}>Free</Text>
                  ) : (
                    `₹${shipping.toFixed(0)}`
                  )}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text variant="titleLarge">Total</Text>
                <Text variant="titleLarge" style={styles.totalAmount}>
                  ₹{total.toFixed(0)}
                </Text>
              </View>

              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleCheckout}
                style={styles.checkoutButton}
                labelStyle={styles.checkoutButtonLabel}
              >
                Proceed to Checkout
              </Button>
            </Surface>
          </>
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
  cartItemsList: {
    padding: 16,
  },
  cartItemContainer: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  outOfStockItem: {
    opacity: 0.7,
    backgroundColor: "#fff5f5",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 10,
    color: "#999",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  brandName: {
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  productPrice: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  outOfStockText: {
    color: "#ff3b30",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  lowStockText: {
    color: "#ff9500",
    fontSize: 12,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityText: {
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
  },
  itemTotal: {
    fontWeight: "700",
  },
  removeButton: {
    alignSelf: "flex-start",
    margin: 0,
  },
  summaryContainer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  freeShipping: {
    color: "#34c759",
    fontWeight: "600",
  },
  divider: {
    marginVertical: 12,
  },
  totalAmount: {
    fontWeight: "700",
  },
  checkoutButton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    paddingVertical: 2,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyCartText: {
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyCartSubtext: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  shopNowButton: {
    paddingHorizontal: 32,
    borderRadius: 12,
  },
});
