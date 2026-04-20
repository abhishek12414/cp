import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  Text,
  IconButton,
  Surface,
  ActivityIndicator,
  Chip,
  Button,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useAllUploadOrders, useUpdateUploadOrder } from "@/hooks/queries";
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

export default function AdminUploadOrdersScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const { data: uploadOrders = [], isLoading, refetch } = useAllUploadOrders();
  const updateUploadOrder = useUpdateUploadOrder();

  const [selectedOrder, setSelectedOrder] = useState<UploadOrderInterface | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState<UploadOrderStatus>("pending");

  const handleViewDetail = (order: UploadOrderInterface) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || "");
    setTotalAmount(order.totalAmount?.toString() || "");
    setStatus(order.status);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await updateUploadOrder.mutateAsync({
        id: selectedOrder.documentId,
        data: {
          status,
          adminNotes: adminNotes.trim() || undefined,
          totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        },
      });
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error?.message || "Failed to update");
    }
  };

  const pendingCount = uploadOrders.filter((o) => o.status === "pending").length;

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
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="headlineSmall" style={styles.title}>
            Upload Orders
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text variant="titleLarge" style={[styles.statNumber, { color: statusColors.pending }]}>
              {pendingCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Pending
            </Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text
              variant="titleLarge"
              style={[styles.statNumber, { color: statusColors.processing }]}
            >
              {uploadOrders.filter((o) => o.status === "processing").length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Processing
            </Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text
              variant="titleLarge"
              style={[styles.statNumber, { color: statusColors.completed }]}
            >
              {uploadOrders.filter((o) => o.status === "completed").length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Completed
            </Text>
          </Surface>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {uploadOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text>No upload orders yet</Text>
            </View>
          ) : (
            uploadOrders.map((order) => (
              <UploadOrderCard
                key={order.documentId}
                order={order}
                onPress={() => handleViewDetail(order)}
                isDark={isDark}
              />
            ))
          )}
        </ScrollView>

        {/* Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Process Order
                </Text>
                <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
              </View>

              <ScrollView style={styles.modalScroll}>
                {selectedOrder && (
                  <>
                    {/* User Info */}
                    <View style={styles.userInfo}>
                      <Text variant="titleSmall">Customer</Text>
                      <Text variant="bodyMedium">{selectedOrder.user?.email}</Text>
                      <Text variant="bodySmall" style={styles.dateText}>
                        Submitted: {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Text>
                    </View>

                    {/* Files */}
                    <Text variant="titleSmall" style={styles.sectionLabel}>
                      Files ({selectedOrder.files?.length || 0})
                    </Text>
                    <ScrollView horizontal style={styles.filesScroll}>
                      {selectedOrder.files?.map((file) => (
                        <TouchableOpacity key={file.id} onPress={() => {}} style={styles.fileThumb}>
                          {file.mime?.startsWith("image/") ? (
                            <Image
                              source={{ uri: `${API_URL}${file.url}` }}
                              style={styles.fileImage}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={styles.fileDoc}>
                              <IconButton icon="file-document" size={32} iconColor="#666" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* User Notes */}
                    {selectedOrder.notes && (
                      <>
                        <Text variant="titleSmall" style={styles.sectionLabel}>
                          Customer Notes
                        </Text>
                        <Surface style={styles.notesBox}>
                          <Text variant="bodyMedium">{selectedOrder.notes}</Text>
                        </Surface>
                      </>
                    )}

                    <Divider style={styles.divider} />

                    {/* Status Selection */}
                    <Text variant="titleSmall" style={styles.sectionLabel}>
                      Update Status
                    </Text>
                    <View style={styles.statusRow}>
                      {(Object.keys(statusLabels) as UploadOrderStatus[]).map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.statusBtn,
                            status === s && { backgroundColor: statusColors[s] },
                          ]}
                          onPress={() => setStatus(s)}
                        >
                          <Text style={[styles.statusBtnText, status === s && { color: "#fff" }]}>
                            {statusLabels[s]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Admin Notes */}
                    <Text variant="titleSmall" style={styles.sectionLabel}>
                      Admin Notes
                    </Text>
                    <TextInput
                      style={styles.input}
                      multiline
                      numberOfLines={3}
                      placeholder="Add notes for customer..."
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                    />

                    {/* Total Amount */}
                    <Text variant="titleSmall" style={styles.sectionLabel}>
                      Total Amount (₹)
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Enter quoted amount"
                      value={totalAmount}
                      onChangeText={setTotalAmount}
                    />
                  </>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdate}
                  loading={updateUploadOrder.isPending}
                  style={styles.saveBtn}
                >
                  Save Changes
                </Button>
              </View>
            </Surface>
          </View>
        </Modal>
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.card, isDark && styles.cardDark]} elevation={2}>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleMedium" style={styles.userEmail}>
              {order.user?.email || "Unknown User"}
            </Text>
            <Text variant="bodySmall" style={styles.dateText}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColors[order.status] + "20" }]}
            textStyle={{ color: statusColors[order.status], fontSize: 11 }}
          >
            {statusLabels[order.status]}
          </Chip>
        </View>

        <View style={styles.cardContent}>
          <Text variant="bodyMedium" numberOfLines={2}>
            {order.notes || "No notes provided"}
          </Text>
          <Text variant="bodySmall" style={styles.fileCount}>
            {fileCount} file{fileCount !== 1 ? "s" : ""} uploaded
          </Text>
        </View>

        {order.totalAmount && (
          <View style={styles.amountRow}>
            <Text variant="titleMedium" style={styles.amount}>
              ₹{order.totalAmount.toFixed(2)}
            </Text>
          </View>
        )}
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
  },
  statNumber: { fontWeight: "700" },
  statLabel: { color: "#666", marginTop: 4 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userEmail: {
    fontWeight: "600",
  },
  dateText: {
    color: "#999",
    marginTop: 2,
  },
  statusChip: {
    height: 26,
  },
  cardContent: {
    marginBottom: 8,
  },
  fileCount: {
    color: "#999",
    marginTop: 4,
  },
  amountRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  amount: {
    color: "#4caf50",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "700",
  },
  modalScroll: {
    maxHeight: 400,
  },
  userInfo: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: "#666",
  },
  filesScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  fileThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: "hidden",
  },
  fileImage: {
    width: "100%",
    height: "100%",
  },
  fileDoc: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  notesBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  divider: {
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});
