import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { ThemedView } from "../../../components/ThemedView";
import { useThemeColor } from "../../../hooks/useThemeColor";
import { Colors } from "../../../constants/Colors";
import brandApi, { BrandInput } from "../../../apis/brand.api";
import { BrandInterface } from "../../../interface";
import { getImageUrl } from "../../../helpers/image";

/**
 * Brand Form screen for add/edit in admin panel.
 * 
 * Route: /admin/brands/[id] (use id='new' for create, or brand ID for edit)
 * 
 * Form fields based on Strapi brand schema: name, description, website, isActive, logo (media).
 * Uses React Query mutations for save to DB.
 * 
 * Navigation: Called from brands list (add/edit buttons).
 * Back to list on success; invalidate queries to refresh.
 * 
 * First part: Logo upload implemented - select from device (expo-image-picker), upload to
 * Strapi /api/upload , attach file ID to brand data (see schema and brand.api.ts).
 * 
 * Second part: Edit pre-fills all details including current logo preview/display.
 */

export default function BrandFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== "new";
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Form state (extended for logo ID)
  const [formData, setFormData] = useState<BrandInput>({
    name: "",
    description: "",
    website: "",
    isActive: true,
    logo: null,
  });

  // State for selected logo image (URI for preview , before upload)
  const [selectedLogoUri, setSelectedLogoUri] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Query client for invalidate
  const queryClient = useQueryClient();

  // Load data for edit (pre-fills form , including current logo for display)
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

  // Populate form for edit (including logo preview from existing)
  useEffect(() => {
    if (isEdit && brandData) {
      const attrs = brandData.attributes;
      setFormData({
        name: attrs.name,
        description: attrs.description || "",
        website: attrs.website || "",
        isActive: attrs.isActive,
        // Retain existing logo ID (null if user uploads new)
        logo: attrs.logo?.data?.id || null,
      });
      // Set preview URI for current logo (using helper)
      const logoUrl = getImageUrl(
        attrs.logo?.data?.attributes?.url || attrs.logoUrl || ""
      );
      if (logoUrl) {
        setSelectedLogoUri(logoUrl);
      }
    }
  }, [brandData, isEdit]);

  // Mutation for create/update (logo ID attached if uploaded)
  const mutation = useMutation({
    mutationFn: async (data: BrandInput) => {
      if (isEdit) {
        return brandApi.updateBrand(id, data);
      }
      return brandApi.createBrand(data);
    },
    onSuccess: () => {
      // Invalidate brands list to refresh
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      Alert.alert("Success", `Brand ${isEdit ? "updated" : "created"} successfully.`);
      router.back(); // Return to brands list
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

  // Image picker + upload for logo (device library , Strapi media endpoint)
  const handlePickLogo = async () => {
    // Permission request
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Allow photo access for logo upload.");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedLogoUri(uri);

      // Upload to get Strapi file ID , attach to formData.logo
      try {
        setIsUploadingLogo(true);

        // Fetch the image file as a Blob from the URI
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create FormData and append the blob as binary content
        const formDataUpload = new FormData();
        formDataUpload.append("files", blob, `brand-logo-${Date.now()}.jpg`);

        const uploadRes = await brandApi.uploadLogo(formDataUpload);
        const uploadedFileId = uploadRes.data[0].id;
        updateField("logo", uploadedFileId); // Set ID for save (Strapi attaches)
        Alert.alert("Success", "Logo uploaded and ready.");
      } catch (err) {
        console.error("Logo upload error:", err);
        Alert.alert("Error", "Failed to upload logo. Try again.");
        setSelectedLogoUri(null);
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const slugValue = useMemo(() => {
    return formData.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }, [formData.name]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    // Generate slug: lowercase + replace spaces with hyphen
    const dataToSubmit: BrandInput = {
      ...formData,
      slug: slugValue,
    };
    mutation.mutate(dataToSubmit);
  };

  const updateField = (field: keyof BrandInput, value: string | boolean | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoadingBrand) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
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
      {/* SafeAreaView for headered admin screen */}
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: primaryColor }]}>
            {isEdit ? "Edit Brand" : "Add New Brand"}
          </Text>

          {/* Form fields matching schema */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Brand Name (required, unique)"
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => updateField("description", text)}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Website (e.g., https://example.com)"
              value={formData.website}
              onChangeText={(text) => updateField("website", text)}
              keyboardType="url"
            />
            <View style={styles.switchRow}>
              <Text>Active Brand</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => updateField("isActive", value)}
              />
            </View>

            {/* Logo upload section - implemented: pick from device , preview , upload to Strapi
                Pre-fills current logo for edit (displayed below) , allows replace. */}
            <Text style={styles.label}>Brand Logo</Text>
            <View style={styles.logoPreviewContainer}>
              {selectedLogoUri ? (
                <Image
                  source={{ uri: selectedLogoUri }}
                  style={styles.logoPreview}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.noLogoText}>No logo selected</Text>
              )}
              <Button
                mode="outlined"
                onPress={handlePickLogo}
                disabled={isUploadingLogo}
                style={styles.pickButton}
              >
                {isUploadingLogo ? "Uploading..." : "Pick & Upload Logo"}
              </Button>
            </View>
            {/* Note for edit: current logo shown ; upload new to replace */}
            <Text style={styles.note}>
              {isEdit ? "Current logo shown above; pick new to replace." : "Optional logo upload."}
            </Text>

            {/* Slug preview */}
            <Text style={styles.label}>Slug (auto)</Text>
            <View style={styles.slugBox}>
              <Text style={styles.slugText}>{slugValue || "-"}</Text>
            </View>
            <Text style={styles.note}>
              Slug is generated from the name using lowercase and hyphens.
            </Text>
          </View>

          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={handleSubmit}
            loading={mutation.isPending || isUploadingLogo}
            disabled={mutation.isPending || isUploadingLogo}
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  note: {
    opacity: 0.6,
    marginBottom: 16,
    fontStyle: "italic",
  },
  // Styles for logo upload/preview (handles display for edit pre-fill and new selection)
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  logoPreviewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  noLogoText: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 8,
  },
  pickButton: {
    marginTop: 8,
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