import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Button, IconButton, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function OrderSuccessScreen() {
  const colorScheme = useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const params = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
    total?: string;
    expectedDelivery?: string;
  }>();

  const orderNumber = params.orderNumber || "N/A";
  const total = params.total ? parseFloat(params.total) : 0;
  const expectedDelivery = params.expectedDelivery || "3-5 business days";

  const handleContinueShopping = () => {
    router.replace("/");
  };

  const handleViewOrders = () => {
    router.replace("/orders");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon & Message */}
        <View style={styles.successSection}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Order Placed Successfully!
          </Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>
        </View>

        {/* Order Details Card */}
        <Surface style={styles.orderCard}>
          <Text variant="titleMedium" style={styles.cardTitle}>Order Confirmation</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number</Text>
            <Text style={styles.detailValue}>{orderNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={[styles.detailValue, { color: primaryColor, fontWeight: "700" }]}>
              ₹{total.toFixed(0)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>Cash on Delivery (COD)</Text>
          </View>

          <View style={[styles.detailRow, styles.highlightRow]}>
            <Text style={styles.detailLabel}>Expected Delivery</Text>
            <Text style={[styles.detailValue, styles.deliveryHighlight]}>{expectedDelivery}</Text>
          </View>
        </Surface>

        {/* Important Notes */}
        <Surface style={styles.noteCard}>
          <Text variant="titleSmall" style={styles.noteTitle}>What happens next?</Text>
          <Text style={styles.noteText}>
            • You will receive an SMS/Email confirmation shortly.
            {"\n"}• Our team will contact you to confirm the order.
            {"\n"}• Pay cash when the order is delivered at your doorstep.
          </Text>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            buttonColor={primaryColor}
            style={styles.primaryButton}
            onPress={handleContinueShopping}
          >
            Continue Shopping
          </Button>
          <Button
            mode="outlined"
            style={styles.secondaryButton}
            onPress={handleViewOrders}
          >
            View My Orders
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  successSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6f7e6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 56,
  },
  successTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  successSubtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    paddingHorizontal: 20,
  },
  orderCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 16,
    color: "#222",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  highlightRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  detailLabel: {
    color: "#666",
    fontSize: 14,
  },
  detailValue: {
    fontWeight: "500",
    fontSize: 14,
    color: "#1a1a1a",
  },
  deliveryHighlight: {
    color: "#2e7d32",
    fontWeight: "600",
  },
  noteCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#fff8e1",
    marginBottom: 30,
  },
  noteTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#5d4037",
  },
  noteText: {
    color: "#5d4037",
    lineHeight: 22,
    fontSize: 13.5,
  },
  actions: {
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 6,
    borderColor: "#ccc",
  },
});
