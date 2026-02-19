import React from "react";
import { StyleSheet, ScrollView, View, FlatList, Image } from "react-native";
import { Text, Button, IconButton, Divider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";

import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";
import { RootState } from "../../store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../reducers/cart.reducer";

export default function CartScreen() {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Calculate cart totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% GST for example
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
  const total = subtotal + tax + shipping;

  const handleGoBack = () => {
    router.back();
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    } else {
      dispatch(removeFromCart(itemId));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    if (cart.items.length > 0) {
      router.push("/checkout");
    }
  };

  const renderCartItem = ({ item }) => (
    <Surface style={styles.cartItemContainer}>
      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text
          variant="titleMedium"
          numberOfLines={2}
          style={styles.productName}
        >
          {item.name}
        </Text>

        <Text variant="bodyMedium" style={styles.productPrice}>
          ₹{item.price.toFixed(2)}
        </Text>

        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={16}
            mode="outlined"
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          />

          <Text variant="titleMedium" style={styles.quantityText}>
            {item.quantity}
          </Text>

          <IconButton
            icon="plus"
            size={16}
            mode="outlined"
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          />

          <View style={styles.spacer} />

          <Text variant="titleMedium">
            ₹{(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      <IconButton
        icon="close"
        size={20}
        onPress={() => handleRemoveItem(item.id)}
        style={styles.removeButton}
      />
    </Surface>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Shopping Cart
          </Text>
          {cart.items.length > 0 && (
            <Button onPress={handleClearCart} textColor="red">
              Clear
            </Button>
          )}
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
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
              data={cart.items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cartItemsList}
            />

            <Surface style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Subtotal</Text>
                <Text variant="bodyLarge">₹{subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">GST (18%)</Text>
                <Text variant="bodyMedium">₹{tax.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Shipping</Text>
                <Text variant="bodyMedium">
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text variant="titleLarge">Total</Text>
                <Text variant="titleLarge">₹{total.toFixed(2)}</Text>
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
    borderRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontWeight: "500",
  },
  productPrice: {
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityText: {
    marginHorizontal: 8,
  },
  spacer: {
    flex: 1,
  },
  removeButton: {
    alignSelf: "flex-start",
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
  divider: {
    marginVertical: 12,
  },
  checkoutButton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  emptyCartText: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyCartSubtext: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  shopNowButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});
