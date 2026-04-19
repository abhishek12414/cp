import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text, Button, IconButton, RadioButton, Divider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useCart } from "@/hooks/queries/useCart";
import { useAddresses } from "@/hooks/queries/useAddress";
import { useCheckout, useFeeConfig, calculateOrderSummary } from "@/hooks/queries/useCheckout";
import { CartItemInterface } from "@/interface";
import { getImageUrl } from "@/helpers/image";
import { Image } from "expo-image";
import LoadingScreen from "@/components/LoadingScreen";
import OfflineScreen from "@/components/OfflineScreen";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function CheckoutScreen() {
  const colorScheme = useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses = [], isLoading: addressLoading } = useAddresses();
  const { data: feeConfig } = useFeeConfig();
  const { checkout, isCheckingOut } = useCheckout();
  const { isConnected } = useNetworkStatus();

  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const [paymentMethod] = useState<"cod">("cod");

  const cartItems: CartItemInterface[] = cart?.cartItems || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const { subtotal: sub, deliveryFee, platformFee, packagingFee, total } = calculateOrderSummary(subtotal, feeConfig);

  // Auto select primary address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const primary = addresses.find((a: any) => a.isPrimary) || addresses[0];
      setSelectedAddressId(primary.documentId || primary.id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddressSelect = (id: string | number) => {
    setSelectedAddressId(id);
  };

  const handleAddNewAddress = () => {
    router.push("/addresses/new");
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert("Address Required", "Please select a delivery address to continue.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Your cart is empty.");
      return;
    }

    try {
      const result = await checkout({
        addressId: selectedAddressId,
        paymentMethod,
      });

      // Navigate to success page
      const order = result.order;
      router.replace({
        pathname: "/order-success",
        params: {
          orderId: order.documentId || order.id,
          orderNumber: order.orderNumber,
          total: order.totalPrice.toString(),
          expectedDelivery: result.expectedDelivery,
        },
      });
    } catch (error) {
      // Error already handled in the hook (out of stock / network)
    }
  };

  // Loading states
  if (cartLoading || addressLoading) {
    return <LoadingScreen message="Preparing checkout..." />;
  }

  if (!isConnected && !cart) {
    return <OfflineScreen onRetry={() => {}} />;
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall">Your cart is empty</Text>
          <Button mode="contained" onPress={() => router.replace("/")} style={{ marginTop: 16 }}>
            Continue Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const minDelivery = feeConfig?.deliveryTimeMinDays || 3;
  const maxDelivery = feeConfig?.deliveryTimeMaxDays || 5;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Delivery Address */}
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Address</Text>
            <Button mode="text" onPress={handleAddNewAddress} compact>
              + Add New
            </Button>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.noAddress}>
              <Text style={styles.noAddressText}>No saved addresses</Text>
              <Button mode="outlined" onPress={handleAddNewAddress} style={{ marginTop: 8 }}>
                Add Address
              </Button>
            </View>
          ) : (
            addresses.map((address: any) => {
              const addrId = address.documentId || address.id;
              const isSelected = selectedAddressId === addrId;
              return (
                <Pressable
                  key={addrId}
                  style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  onPress={() => handleAddressSelect(addrId)}
                >
                  <RadioButton
                    value={String(addrId)}
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() => handleAddressSelect(addrId)}
                    color={primaryColor}
                  />
                  <View style={styles.addressInfo}>
                    <Text variant="titleSmall">{address.fullName} {address.isPrimary && "(Primary)"}</Text>
                    <Text variant="bodySmall" numberOfLines={2}>
                      {address.addressLine1}, {address.city} - {address.pincode}
                    </Text>
                    <Text variant="bodySmall">{address.phone}</Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </Surface>

        {/* Order Items Summary */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          {cartItems.map((item) => (
            <View key={item.documentId} style={styles.orderItem}>
              <Image
                source={{ uri: getImageUrl(item.product?.images?.[0]?.url) || undefined }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text numberOfLines={1} style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{(item.product?.price || 0) * item.quantity}</Text>
            </View>
          ))}
        </Surface>

        {/* Fee Breakdown + Total */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text>Subtotal</Text>
            <Text>₹{sub.toFixed(0)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text>Delivery Fee</Text>
            <Text>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text>Platform Fee</Text>
            <Text>₹{platformFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text>Packaging Fee</Text>
            <Text>₹{packagingFee}</Text>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text variant="titleLarge">Total Amount</Text>
            <Text variant="titleLarge" style={{ color: primaryColor }}>₹{total.toFixed(0)}</Text>
          </View>
        </Surface>

        {/* Payment Method - COD Only */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.codContainer}>
            <RadioButton value="cod" status="checked" color={primaryColor} />
            <View>
              <Text variant="titleSmall">Cash on Delivery (COD)</Text>
              <Text variant="bodySmall" style={styles.codNote}>Pay when your order is delivered</Text>
            </View>
          </View>
          <Text style={styles.deliveryNote}>
            Expected Delivery: {minDelivery}-{maxDelivery} business days
          </Text>
        </Surface>
      </ScrollView>

      {/* Bottom Confirm Bar */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotal}>₹{total.toFixed(0)}</Text>
        </View>
        <Button
          mode="contained"
          buttonColor={primaryColor}
          style={styles.confirmButton}
          labelStyle={styles.confirmLabel}
          onPress={handleConfirmOrder}
          disabled={isCheckingOut || !selectedAddressId}
          loading={isCheckingOut}
        >
          {isCheckingOut ? "Placing Order..." : "Confirm & Place Order"}
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerTitle: { fontWeight: "700" },
  content: { flex: 1, padding: 16 },
  section: { padding: 16, marginBottom: 16, borderRadius: 12, backgroundColor: "#fff", elevation: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontWeight: "600", marginBottom: 12 },
  addressCard: { flexDirection: "row", alignItems: "flex-start", padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 10 },
  addressCardSelected: { borderColor: Colors.light.primary, backgroundColor: "#f0f7ff" },
  addressInfo: { flex: 1, marginLeft: 8 },
  noAddress: { alignItems: "center", paddingVertical: 20 },
  noAddressText: { color: "#666" },
  orderItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  itemImage: { width: 50, height: 50, borderRadius: 6, backgroundColor: "#f5f5f5" },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: "500" },
  itemQty: { color: "#666", fontSize: 12 },
  itemPrice: { fontWeight: "600" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalRow: { paddingTop: 4 },
  codContainer: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#f8f8f8", borderRadius: 10 },
  codNote: { color: "#666", marginLeft: 8 },
  deliveryNote: { textAlign: "center", marginTop: 12, color: "#444", fontSize: 13 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  bottomTotalLabel: { fontSize: 12, color: "#666" },
  bottomTotal: { fontSize: 22, fontWeight: "700" },
  confirmButton: { flex: 1, marginLeft: 20, borderRadius: 10, paddingVertical: 4 },
  confirmLabel: { fontSize: 15, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
