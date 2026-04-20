import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Button, Text, IconButton, Surface, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useAddresses, useDeleteAddress, useSetPrimaryAddress } from "@/hooks/queries";
import { AddressInterface } from "@/interface";

export default function AddressesScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const { data: addresses = [], isLoading } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setPrimary = useSetPrimaryAddress();

  const handleGoBack = () => {
    router.back();
  };

  const handleAddAddress = () => {
    router.push("/addresses/new");
  };

  const handleEditAddress = (address: AddressInterface) => {
    router.push(`/addresses/${address.documentId || address.id}`);
  };

  const handleDeleteAddress = (address: AddressInterface) => {
    Alert.alert("Delete Address", `Are you sure you want to delete "${address.label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAddress.mutate(address.documentId || address.id),
      },
    ]);
  };

  const handleSetPrimary = (address: AddressInterface) => {
    if (!address.isPrimary) {
      setPrimary.mutate(address.documentId || address.id);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating color={primaryColor} size="large" />
            <Text style={{ marginTop: 12 }}>Loading addresses...</Text>
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
            My Addresses
          </Text>
          <IconButton icon="plus" size={24} onPress={handleAddAddress} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconButton icon="map-marker-off" size={64} iconColor="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No addresses saved
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Add an address for faster checkout
              </Text>
              <Button
                mode="contained"
                onPress={handleAddAddress}
                style={styles.addButton}
                icon="plus"
              >
                Add Address
              </Button>
            </View>
          ) : (
            <>
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address)}
                  onSetPrimary={() => handleSetPrimary(address)}
                  primaryColor={primaryColor}
                  isDark={isDark}
                />
              ))}

              <Button
                mode="outlined"
                onPress={handleAddAddress}
                style={styles.addMoreButton}
                icon="plus"
              >
                Add Another Address
              </Button>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

interface AddressCardProps {
  address: AddressInterface;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
  primaryColor: string;
  isDark: boolean;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetPrimary,
  primaryColor,
  isDark,
}: AddressCardProps) => {
  return (
    <Surface style={[styles.card, isDark && styles.cardDark]} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text variant="titleMedium" style={styles.label}>
            {address.label}
          </Text>
          {address.isPrimary && (
            <View style={[styles.primaryBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <View style={styles.cardActions}>
          <IconButton icon="pencil" size={20} onPress={onEdit} iconColor={primaryColor} />
          <IconButton icon="delete" size={20} onPress={onDelete} iconColor="#f44336" />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text variant="bodyMedium" style={styles.name}>
          {address.fullName}
        </Text>
        <Text variant="bodyMedium" style={styles.phone}>
          {address.phone}
        </Text>
        <Text variant="bodyMedium" style={styles.addressLine}>
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        </Text>
        <Text variant="bodyMedium" style={styles.addressLine}>
          {address.city}, {address.state} - {address.pincode}
        </Text>
        <Text variant="bodySmall" style={styles.country}>
          {address.country}
        </Text>
      </View>

      {!address.isPrimary && (
        <TouchableOpacity onPress={onSetPrimary} style={styles.setPrimaryBtn}>
          <Text style={{ color: primaryColor, fontWeight: "600" }}>Set as Primary</Text>
        </TouchableOpacity>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
  title: {
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
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
  },
  addButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  addMoreButton: {
    marginTop: 16,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontWeight: "700",
  },
  primaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
  },
  cardContent: {
    marginBottom: 8,
  },
  name: {
    fontWeight: "600",
  },
  phone: {
    color: "#666",
    marginTop: 2,
  },
  addressLine: {
    color: "#333",
    marginTop: 2,
  },
  country: {
    color: "#999",
    marginTop: 4,
  },
  setPrimaryBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
