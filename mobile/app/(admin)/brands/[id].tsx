import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import { Formik } from "formik";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { FormField } from "@/components/FormField";
import { brandApi, BrandInput } from "@/apis/brand.api";
import { extractMediaUrl, extractMediaId } from "@/helpers/image";
import { generateSlug } from "@/helpers/dataFormatter";
import {
  brandValidationSchema,
  brandInitialValues,
  BrandFormValues,
} from "@/helpers/validation/brand";

/**
 * Brand Form screen for add/edit in admin panel.
 *
 * Route: /admin/brands/[id] (use id='new' for create, or brand ID for edit)
 *
 * Uses Formik for form state management and Yup for validation.
 * Reusable FormField component handles different input types.
 */

export default function BrandFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== "new";
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // State for selected logo image URI (for preview)
  const [selectedLogoUri, setSelectedLogoUri] = useState<string | null>(null);

  // Query client for invalidate
  const queryClient = useQueryClient();

  // Load data for edit (pre-fills form, including current logo for display)
  const { data: brandData, isLoading: isLoadingBrand } = useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      if (isEdit) {
        const response = await brandApi.getBrand(id);
        return response.data.data;
      }
      return null;
    },
    enabled: isEdit,
  });

  // Compute initial values for edit mode
  const editInitialValues: BrandFormValues = useMemo(() => {
    if (isEdit && brandData) {
      return {
        name: brandData.name,
        description: brandData.description || "",
        website: brandData.website || "",
        isActive: brandData.isActive,
        logo: extractMediaId(brandData.logo),
      };
    }
    return brandInitialValues;
  }, [brandData, isEdit]);

  // Set logo preview when brand data loads
  useEffect(() => {
    if (isEdit && brandData) {
      const logoUrl = extractMediaUrl(brandData.logo, brandData.logoUrl);
      if (logoUrl) {
        setSelectedLogoUri(logoUrl);
      }
    }
  }, [brandData, isEdit]);

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (data: BrandFormValues) => {
      // Generate slug from name
      const slug = generateSlug(data.name);

      const payload: BrandInput = {
        ...data,
        slug,
      };

      if (isEdit) {
        return brandApi.updateBrand(id, payload);
      }
      return brandApi.createBrand(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      Alert.alert("Success", `Brand ${isEdit ? "updated" : "created"} successfully.`);
      router.back();
    },
    onError: (err) => {
      console.error("Brand save error:", err);
      Alert.alert("Error", `Failed to ${isEdit ? "update" : "create"} brand.`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (brandId: string) => brandApi.deleteBrand(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      Alert.alert("Success", "Brand deleted successfully.");
      router.back();
    },
    onError: (err) => {
      console.error("Delete brand error:", err);
      Alert.alert("Error", "Failed to delete brand. Please try again.");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this brand? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleSubmit = (values: BrandFormValues) => {
    mutation.mutate(values);
  };

  const handleLogoUpload = (fileId: number, uri: string) => {
    setSelectedLogoUri(uri);
  };

  // Compute slug preview from form values
  const getSlugPreview = (name: string) => {
    return generateSlug(name);
  };

  if (isLoadingBrand) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
          <View style={styles.center}>
            <Text>Loading brand...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <Formik
          initialValues={editInitialValues}
          validationSchema={brandValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values, isSubmitting }) => (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.title, { color: primaryColor }]}>
                {isEdit ? "Edit Brand" : "Add New Brand"}
              </Text>

              <View style={styles.form}>
                {/* Brand Name */}
                <FormField
                  name="name"
                  type="text"
                  label="Brand Name"
                  placeholder="Brand Name (required, unique)"
                  required
                  hint="Required · Unique · 2-100 characters"
                />

                {/* Description */}
                <FormField
                  name="description"
                  type="textarea"
                  label="Description"
                  placeholder="Description"
                  hint="Optional · Max 500 characters"
                />

                {/* Website */}
                <FormField
                  name="website"
                  type="url"
                  label="Website"
                  placeholder="Website (e.g., https://example.com)"
                  hint="Optional · Valid URL format"
                />

                {/* Active Switch */}
                <FormField name="isActive" type="switch" label="Active Brand" />

                {/* Logo Upload */}
                <FormField
                  name="logo"
                  type="image"
                  label="Brand Logo"
                  imageUri={selectedLogoUri}
                  onImageUpload={handleLogoUpload}
                  imagePlaceholder="No logo selected"
                  imageButtonText="Pick & Upload Logo"
                  imageSize={100}
                  imageNote={
                    isEdit
                      ? "Current logo shown above; pick new to replace."
                      : "Optional logo upload."
                  }
                />

                {/* Slug Preview */}
                <Text style={styles.label}>Slug (auto)</Text>
                <View style={styles.slugBox}>
                  <Text style={styles.slugText}>{getSlugPreview(values.name) || "-"}</Text>
                </View>
                <Text style={styles.note}>
                  Slug is generated from the name using lowercase and hyphens.
                </Text>
              </View>

              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={() => handleSubmit()}
                loading={mutation.isPending}
                disabled={mutation.isPending}
                style={styles.submitButton}
              >
                {isEdit ? "Update Brand" : "Create Brand"}
              </Button>

              {isEdit && (
                <Button
                  mode="outlined"
                  textColor="red"
                  onPress={handleDelete}
                  style={styles.deleteButton}
                  disabled={deleteMutation.isPending || mutation.isPending}
                >
                  Delete Brand
                </Button>
              )}

              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            </ScrollView>
          )}
        </Formik>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  note: {
    opacity: 0.6,
    marginBottom: 16,
    fontStyle: "italic",
  },
  slugBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  slugText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#444",
  },
  submitButton: {
    marginTop: 16,
    padding: 4,
  },
  deleteButton: {
    marginTop: 16,
    padding: 4,
    borderColor: "red",
  },
  cancelButton: {
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
