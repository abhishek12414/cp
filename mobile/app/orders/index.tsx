import React from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Text, IconButton, Surface, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useUserOrders } from "@/hooks/queries/useCheckout";
import { OrderInterface } from "@/interface";
import { LoadingScreen } from "@/components/LoadingScreen";
import OfflineScreen from "@/components/OfflineScreen";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ThemedView } from "@/components/ThemedView";

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
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyOrdersScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const { isConnected } = useNetworkStatus();

  const { data: orders = [], isLoading, error, refetch } = useUserOrders();

  const handleOrderPress = (order: OrderInterface) => {
    const orderId = order.documentId || order.id;
    router.push(`/orders/${orderId}`);
  };

  const renderOrderItem = ({ item }: { item: OrderInterface }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity onPress={() => handleOrderPress(item)} activeOpacity={0.7}>
        <Surface style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text variant="titleMedium" style={styles.orderNumber}>
                {item.orderNumber}
              </Text>
              <Text variant="bodySmall" style={styles.orderDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: statusColor + "15" }]}
              textStyle={{ color: statusColor, fontWeight: "600" }}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.orderDetails}>
            <Text variant="bodyMedium">
              {item.orderItems?.length || 0} item{(item.orderItems?.length || 0) > 1 ? "s" : ""}
            </Text>
            <Text variant="titleMedium" style={[styles.orderTotal, { color: primaryColor }]}>
              ₹{item.totalPrice?.toFixed(0)}
            </Text>
          </View>

          <View style={styles.orderFooter}>
            <Text variant="bodySmall" style={styles.paymentMethod}>
              {item.paymentMethod === "cod" ? "Cash on Delivery" : "Paid"}
            </Text>
            <IconButton icon="chevron-right" size={20} iconColor="#999" />
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your orders..." />;
  }

  if (error && !isConnected) {
    return <OfflineScreen onRetry={refetch} />;
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            My Orders
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No orders yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Start shopping and your orders will appear here
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => router.push("/")}
              style={{ marginTop: 20 }}
            >
              Start Shopping
            </Button>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.documentId || String(item.id)}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  listContent: { padding: 16, paddingBottom: 40 },
  orderCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: { fontWeight: "600" },
  orderDate: { color: "#666", marginTop: 2 },
  statusChip: { height: 28 },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTotal: { fontWeight: "700" },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  paymentMethod: { color: "#666" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { marginBottom: 8 },
  emptySubtitle: { textAlign: "center", color: "#666" },
});
