import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Button, Text, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { FormField } from "@/components/FormField";
import { useAddress, useUpdateAddress } from "@/hooks/queries";
import {
  addressValidationSchema,
  addressInitialValues,
  AddressFormValues,
} from "@/helpers/validation/address";

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const { data: address, isLoading } = useAddress(id || "");
  const updateAddress = useUpdateAddress();
  const [submitting, setSubmitting] = useState(false);

  // Compute initial values for edit mode
  const editInitialValues: AddressFormValues = useMemo(() => {
    if (address) {
      return {
        label: address.label || "Home",
        fullName: address.fullName || "",
        phone: address.phone || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "India",
        isPrimary: address.isPrimary || false,
        type: address.type || "shipping",
      };
    }
    return addressInitialValues;
  }, [address]);

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async (values: AddressFormValues) => {
    setSubmitting(true);
    try {
      await updateAddress.mutateAsync({ id: id || "", data: values });
      router.back();
    } catch (error: any) {
      console.error("Failed to update address:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating color={primaryColor} size="large" />
            <Text style={{ marginTop: 12 }}>Loading address...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
            <Text variant="headlineSmall" style={styles.title}>
              Edit Address
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <Formik
            initialValues={editInitialValues}
            validationSchema={addressValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleSubmit: formikSubmit, isValid, dirty }) => (
              <>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                  <FormField
                    name="label"
                    type="text"
                    label="Label"
                    placeholder="Home, Office, etc."
                  />
                  <FormField
                    name="fullName"
                    type="text"
                    label="Full Name"
                    placeholder="Enter full name"
                    required
                  />
                  <FormField
                    name="phone"
                    type="text"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    required
                  />
                  <FormField
                    name="addressLine1"
                    type="text"
                    label="Address Line 1"
                    placeholder="House no, Street, Locality"
                    required
                  />
                  <FormField
                    name="addressLine2"
                    type="text"
                    label="Address Line 2"
                    placeholder="Apartment, Suite, etc. (optional)"
                  />
                  <FormField
                    name="city"
                    type="text"
                    label="City"
                    placeholder="Enter city"
                    required
                  />
                  <FormField
                    name="state"
                    type="text"
                    label="State"
                    placeholder="Enter state"
                    required
                  />
                  <FormField
                    name="pincode"
                    type="text"
                    label="Pincode"
                    placeholder="Enter pincode"
                    required
                  />
                  <FormField
                    name="country"
                    type="text"
                    label="Country"
                    placeholder="Enter country"
                  />
                  <FormField name="isPrimary" type="switch" label="Set as Primary Address" />
                </ScrollView>

                <View style={styles.footer}>
                  <Button
                    mode="contained"
                    onPress={() => formikSubmit()}
                    loading={submitting}
                    disabled={submitting || !isValid || !dirty}
                    style={styles.saveButton}
                  >
                    Save Changes
                  </Button>
                </View>
              </>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  title: { fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: { borderRadius: 8 },
});
