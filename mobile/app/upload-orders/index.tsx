import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text, IconButton, Surface, ActivityIndicator, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useUploadOrders } from "@/hooks/queries";
import { UploadOrderInterface, UploadOrderStatus } from "@/interface";
import { API_URL } from "@/apis/apiRoutes";

const statusColors: Record<UploadOrderStatus, string> = {
  pending: "#ff9800",
  processing: "#2196f3",
  completed: "#4caf50",
  cancelled: "#f44336",
};

const statusLabels: Record<UploadOrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function UploadOrdersScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const { data: uploadOrders = [], isLoading } = useUploadOrders();

  const handleGoBack = () => {
    router.back();
  };

  const handleNewUpload = () => {
    router.push("/upload-orders/new");
  };

  const handleViewDetail = (order: UploadOrderInterface) => {
    router.push(`/upload-orders/${order.documentId}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating color={primaryColor} size="large" />
            <Text style={{ marginTop: 12 }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.title}>
            My Uploads
          </Text>
          <IconButton icon="plus" size={24} onPress={handleNewUpload} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {uploadOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconButton icon="cloud-upload" size={64} iconColor="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No uploads yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Upload files from your electrician to get a quote
              </Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: primaryColor }]}
                onPress={handleNewUpload}
              >
                <Text style={styles.uploadButtonText}>Upload Files</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {uploadOrders.map((order) => (
                <UploadOrderCard
                  key={order.documentId}
                  order={order}
                  onPress={() => handleViewDetail(order)}
                  isDark={isDark}
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

interface UploadOrderCardProps {
  order: UploadOrderInterface;
  onPress: () => void;
  isDark: boolean;
}

const UploadOrderCard = ({ order, onPress, isDark }: UploadOrderCardProps) => {
  const fileCount = order.files?.length || 0;
  const thumbnailUrl = order.files?.[0]?.url ? `${API_URL}${order.files[0].url}` : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.card, isDark && styles.cardDark]} elevation={2}>
        <View style={styles.cardHeader}>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColors[order.status] + "20" }]}
            textStyle={{ color: statusColors[order.status], fontSize: 12 }}
          >
            {statusLabels[order.status]}
          </Chip>
          <Text variant="bodySmall" style={styles.date}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          {thumbnailUrl && (
            <View style={styles.thumbnailContainer}>
              <View style={styles.fileIcon}>
                <IconButton icon="file-image" size={32} iconColor="#666" />
              </View>
              {fileCount > 1 && (
                <View style={styles.fileCount}>
                  <Text style={styles.fileCountText}>+{fileCount - 1}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text variant="bodyMedium" numberOfLines={2} style={styles.notes}>
              {order.notes || "No notes added"}
            </Text>
            <Text variant="bodySmall" style={styles.fileCountLabel}>
              {fileCount} file{fileCount !== 1 ? "s" : ""} uploaded
            </Text>
            {order.totalAmount && (
              <Text variant="titleMedium" style={styles.amount}>
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  },
  title: { fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  uploadButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusChip: {
    height: 28,
  },
  date: {
    color: "#999",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnailContainer: {
    position: "relative",
    marginRight: 16,
  },
  fileIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fileCount: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fileCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  infoContainer: {
    flex: 1,
  },
  notes: {
    color: "#333",
    marginBottom: 4,
  },
  fileCountLabel: {
    color: "#999",
  },
  amount: {
    color: "#4caf50",
    fontWeight: "700",
    marginTop: 4,
  },
});
