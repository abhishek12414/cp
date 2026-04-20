import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Text, IconButton, Surface, ActivityIndicator, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useUploadOrder } from "@/hooks/queries";
import { UploadOrderStatus } from "@/interface";
import { API_URL } from "@/apis/apiRoutes";

const statusColors: Record<UploadOrderStatus, string> = {
  pending: "#ff9800",
  processing: "#2196f3",
  completed: "#4caf50",
  cancelled: "#f44336",
};

const statusLabels: Record<UploadOrderStatus, string> = {
  pending: "Pending Review",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function UploadOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const { data: order, isLoading } = useUploadOrder(id || "");

  const handleGoBack = () => {
    router.back();
  };

  const handleOpenFile = (url: string) => {
    Linking.openURL(`${API_URL}${url}`);
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

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
            <Text variant="headlineSmall" style={styles.title}>
              Upload Details
            </Text>
            <View style={{ width: 48 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Text>Order not found</Text>
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
            Upload Details
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status Card */}
          <Surface style={[styles.statusCard, { borderLeftColor: statusColors[order.status] }]}>
            <View style={styles.statusRow}>
              <View>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Status
                </Text>
                <Text
                  variant="titleMedium"
                  style={[styles.statusText, { color: statusColors[order.status] }]}
                >
                  {statusLabels[order.status]}
                </Text>
              </View>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColors[order.status] + "20" }]}
                textStyle={{ color: statusColors[order.status] }}
              >
                {order.status.toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.dateText}>
              Submitted on {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </Surface>

          {/* Files Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Uploaded Files ({order.files?.length || 0})
            </Text>
            <View style={styles.filesGrid}>
              {order.files?.map((file, index) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileItem}
                  onPress={() => handleOpenFile(file.url)}
                >
                  {file.mime?.startsWith("image/") ? (
                    <Image
                      source={{ uri: `${API_URL}${file.url}` }}
                      style={styles.fileThumbnail}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.fileIcon}>
                      <IconButton icon="file-document" size={32} iconColor="#666" />
                    </View>
                  )}
                  <View style={styles.fileOverlay}>
                    <IconButton icon="eye" size={16} iconColor="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Section */}
          {(order.notes || order.adminNotes) && (
            <View style={styles.section}>
              {order.notes && (
                <Surface style={styles.notesCard}>
                  <Text variant="titleSmall" style={styles.notesLabel}>
                    Your Notes
                  </Text>
                  <Text variant="bodyMedium">{order.notes}</Text>
                </Surface>
              )}
              {order.adminNotes && (
                <Surface style={[styles.notesCard, styles.adminNotesCard]}>
                  <Text variant="titleSmall" style={styles.notesLabel}>
                    Admin Response
                  </Text>
                  <Text variant="bodyMedium">{order.adminNotes}</Text>
                </Surface>
              )}
            </View>
          )}

          {/* Total Amount */}
          {order.totalAmount && (
            <Surface style={styles.amountCard}>
              <Text variant="bodyMedium" style={styles.amountLabel}>
                Quoted Amount
              </Text>
              <Text variant="headlineMedium" style={[styles.amount, { color: primaryColor }]}>
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </Surface>
          )}

          {/* Generated Order Link */}
          {order.generatedOrder && (
            <TouchableOpacity style={styles.orderLink}>
              <View>
                <Text variant="titleSmall">View Generated Order</Text>
                <Text variant="bodySmall" style={styles.orderNumber}>
                  Order #{order.generatedOrder.orderNumber}
                </Text>
              </View>
              <IconButton icon="chevron-right" size={24} iconColor={primaryColor} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

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
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    color: "#999",
    marginBottom: 4,
  },
  statusText: {
    fontWeight: "700",
  },
  statusChip: {
    height: 28,
  },
  dateText: {
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fileItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  fileThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  fileIcon: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  fileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  adminNotesCard: {
    backgroundColor: "#e8f5e9",
  },
  notesLabel: {
    color: "#666",
    marginBottom: 8,
  },
  amountCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: {
    color: "#666",
    marginBottom: 8,
  },
  amount: {
    fontWeight: "700",
  },
  orderLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  orderNumber: {
    color: "#999",
    marginTop: 4,
  },
});
