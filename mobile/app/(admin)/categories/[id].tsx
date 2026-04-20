import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import { Formik } from "formik";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { FormField } from "@/components/FormField";
import { categoryApi, CategoryInput } from "@/apis/category.api";
import { useCategoryByDocumentId } from "@/hooks/queries/useCategories";
import { extractMediaUrl, extractMediaId } from "@/helpers/image";
import { generateSlug } from "@/helpers/dataFormatter";
import {
  categoryValidationSchema,
  categoryInitialValues,
  CategoryFormValues,
} from "@/helpers/validation/category";

/**
 * Category Form screen for add/edit in admin panel.
 *
 * Route: /admin/categories/[id]
 *   - id = 'new'          → create mode
 *   - id = <documentId>   → edit mode (pre-fills existing data)
 *
 * Uses Formik for form state management and Yup for validation.
 * Reusable FormField component handles different input types.
 */

export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== "new";

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // State for selected image URI (for preview)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Query client for invalidation
  const queryClient = useQueryClient();

  // Load existing category for edit mode
  const { data: categoryData, isLoading: isLoadingCategory } = useCategoryByDocumentId(
    isEdit ? id : ""
  );

  // Compute initial values for edit mode
  const editInitialValues: CategoryFormValues = useMemo(() => {
    if (isEdit && categoryData) {
      return {
        name: categoryData.name || "",
        description: categoryData.description || "",
        isActive: categoryData.isActive ?? true,
        image: extractMediaId(categoryData.image),
      };
    }
    return categoryInitialValues;
  }, [categoryData, isEdit]);

  // Set image preview when category data loads
  useEffect(() => {
    if (isEdit && categoryData) {
      const imageUrl = extractMediaUrl(categoryData.image);
      if (imageUrl) {
        setSelectedImageUri(imageUrl);
      }
    }
  }, [categoryData, isEdit]);

  // Create / update mutation
  const mutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      // Generate slug from name
      const slug = generateSlug(data.name);

      const payload: CategoryInput = {
        ...data,
        slug,
      };

      if (isEdit) {
        return categoryApi.updateCategory(id, payload);
      }
      return categoryApi.createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["category", id] });
      }
      Alert.alert("Success", `Category ${isEdit ? "updated" : "created"} successfully.`);
      router.back();
    },
    onError: (err) => {
      console.error("Category save error:", err);
      Alert.alert("Error", `Failed to ${isEdit ? "update" : "create"} category. Please try again.`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => categoryApi.deleteCategory(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      Alert.alert("Success", "Category deleted successfully.");
      router.back();
    },
    onError: (err) => {
      console.error("Delete category error:", err);
      Alert.alert("Error", "Failed to delete category. Please try again.");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this category? This action cannot be undone.",
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

  const handleSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  const handleImageUpload = (fileId: number, uri: string) => {
    setSelectedImageUri(uri);
  };

  // Compute slug preview from form values
  const getSlugPreview = (name: string) => {
    return generateSlug(name);
  };

  if (isLoadingCategory) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
          <View style={styles.center}>
            <Text>Loading category...</Text>
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
          validationSchema={categoryValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values }) => (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.title, { color: primaryColor }]}>
                {isEdit ? "Edit Category" : "Add New Category"}
              </Text>

              <View style={styles.form}>
                {/* Category Name */}
                <FormField
                  name="name"
                  type="text"
                  label="Category Name"
                  placeholder="e.g. Bulb, Wire, Switches"
                  required
                  hint="Required · Unique · Max 100 characters"
                />

                {/* Description */}
                <FormField
                  name="description"
                  type="textarea"
                  label="Description"
                  placeholder="Short description of this category (optional)"
                  hint="Optional · Max 500 characters"
                />

                {/* Active Switch */}
                <FormField name="isActive" type="switch" label="Active Category" />

                {/* Category Image */}
                <FormField
                  name="image"
                  type="image"
                  label="Category Image"
                  imageUri={selectedImageUri}
                  onImageUpload={handleImageUpload}
                  imagePlaceholder="No image selected"
                  imageButtonText="Pick & Upload Image"
                  imageSize={140}
                  imageNote={
                    isEdit
                      ? "Current image shown above; pick new to replace."
                      : "Optional image upload for category display."
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
                {isEdit ? "Update Category" : "Create Category"}
              </Button>

              {isEdit && (
                <Button
                  mode="outlined"
                  textColor="red"
                  onPress={handleDelete}
                  style={styles.deleteButton}
                  disabled={deleteMutation.isPending || mutation.isPending}
                >
                  Delete Category
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },
  note: {
    fontSize: 13,
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
  },
  slugBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  slugText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#444",
  },
  submitButton: {
    marginTop: 8,
    padding: 4,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  deleteButton: {
    marginTop: 16,
    padding: 4,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    borderColor: "red",
  },
  cancelButton: {
    marginTop: 10,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
