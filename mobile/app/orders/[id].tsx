import React from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import { Text, IconButton, Surface, Divider, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useUserOrders } from "@/hooks/queries/useCheckout";
import { OrderInterface, OrderItemInterface } from "@/interface";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getImageUrl } from "@/helpers/image";
import { Image } from "expo-image";
import { ThemedView } from "@/components/ThemedView";

const statusSteps = ["pending", "processing", "shipped", "delivered"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "#f59e0b";
    case "processing":
      return "#3b82f6";
    case "shipped":
      return "#8b5cf6";
    case "delivered":
      return "#10b981";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: orders = [], isLoading } = useUserOrders();

  // Find the specific order from the list (simple approach)
  const order = orders.find((o: OrderInterface) => o.documentId === id || String(o.id) === id);

  const currentStatusIndex = order ? statusSteps.indexOf(order.status) : -1;

  const renderTimeline = () => {
    if (!order) return null;

    return (
      <View style={styles.timelineContainer}>
        {statusSteps.map((step, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const stepColor = isActive ? getStatusColor(order.status) : "#d1d5db";

          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[styles.timelineDot, { backgroundColor: stepColor }]}>
                {isCurrent && (
                  <View style={[styles.timelineInnerDot, { backgroundColor: "#fff" }]} />
                )}
              </View>
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: isActive ? stepColor : "#d1d5db" },
                  ]}
                />
              )}
              <Text style={[styles.timelineLabel, { color: isActive ? "#1f2937" : "#9ca3af" }]}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: OrderItemInterface }) => (
    <View style={styles.itemRow}>
      <Image
        source={{ uri: getImageUrl(item.product?.images?.[0]?.url) || undefined }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text numberOfLines={2} style={styles.itemName}>
          {item.product?.name}
        </Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{(item.priceAtPurchase * item.quantity).toFixed(0)}</Text>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading order details..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="headlineSmall">Order Not Found</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text>We couldn&apos;t find this order.</Text>
          <Button mode="contained" onPress={() => router.push("/orders")} style={{ marginTop: 16 }}>
            Go to My Orders
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Order Details
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Order Header */}
          <Surface style={styles.card}>
            <View style={styles.orderHeader}>
              <Text variant="titleLarge">{order.orderNumber}</Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(order.status) + "15" }}
                textStyle={{ color: getStatusColor(order.status), fontWeight: "600" }}
              >
                {order.status.toUpperCase()}
              </Chip>
            </View>
            <Text style={styles.dateText}>Placed on {formatDate(order.createdAt)}</Text>
            {order.expectedDeliveryDate && (
              <Text style={styles.deliveryText}>
                Expected Delivery: {formatDate(order.expectedDeliveryDate)}
              </Text>
            )}
          </Surface>

          {/* Status Timeline */}
          <Surface style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Status
            </Text>
            {renderTimeline()}
          </Surface>

          {/* Items */}
          <Surface style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Items ({order.orderItems?.length || 0})
            </Text>
            <FlatList
              data={order.orderItems || []}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.documentId || String(item.id)}
              scrollEnabled={false}
            />
          </Surface>

          {/* Price Breakdown */}
          <Surface style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Price Details
            </Text>
            <View style={styles.priceRow}>
              <Text>Subtotal</Text>
              <Text>₹{order.subtotal?.toFixed(0) || order.totalPrice?.toFixed(0)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>Delivery Fee</Text>
              <Text>₹{order.deliveryFee || 0}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>Platform Fee</Text>
              <Text>₹{order.platformFee || 0}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>Packaging Fee</Text>
              <Text>₹{order.packagingFee || 0}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text variant="titleMedium">Total</Text>
              <Text variant="titleMedium" style={{ color: primaryColor }}>
                ₹{order.totalPrice?.toFixed(0)}
              </Text>
            </View>
          </Surface>

          {/* Shipping & Payment */}
          <Surface style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Delivery Address
            </Text>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </Surface>

          <Surface style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment
            </Text>
            <Text>Cash on Delivery (COD)</Text>
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontWeight: "700" },
  card: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { color: "#666", marginTop: 4 },
  deliveryText: { color: "#10b981", marginTop: 4, fontWeight: "500" },
  sectionTitle: { fontWeight: "600", marginBottom: 12 },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineInnerDot: { width: 8, height: 8, borderRadius: 4 },
  timelineLine: { position: "absolute", top: 8, left: "50%", right: "-50%", height: 2, zIndex: -1 },
  timelineLabel: { fontSize: 11, marginTop: 6, textAlign: "center" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#f5f5f5" },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: "500" },
  itemQty: { color: "#666", fontSize: 12 },
  itemPrice: { fontWeight: "600" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  totalRow: { paddingTop: 8 },
  addressText: { lineHeight: 20, color: "#444" },
});
