import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Text, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Formik } from "formik";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import FormField from "@/components/FormField";
import { useCreateAddress } from "@/hooks/queries";
import {
  addressValidationSchema,
  addressInitialValues,
  AddressFormValues,
} from "@/helpers/validation/address";

export default function NewAddressScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const createAddress = useCreateAddress();
  const [submitting, setSubmitting] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async (values: AddressFormValues) => {
    setSubmitting(true);
    try {
      await createAddress.mutateAsync(values);
      router.back();
    } catch (error: any) {
      console.error("Failed to save address:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
            <Text variant="headlineSmall" style={styles.title}>
              Add Address
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <Formik
            initialValues={addressInitialValues}
            validationSchema={addressValidationSchema}
            onSubmit={handleSubmit}
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
                  <FormField
                    name="isPrimary"
                    type="switch"
                    label="Set as Primary Address"
                  />
                </ScrollView>

                <View style={styles.footer}>
                  <Button
                    mode="contained"
                    onPress={() => formikSubmit()}
                    loading={submitting}
                    disabled={submitting || !isValid || !dirty}
                    style={styles.saveButton}
                  >
                    Save Address
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
