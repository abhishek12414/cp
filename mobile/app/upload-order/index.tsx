import { Image } from "expo-image";
import * as ExpoImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Chip, IconButton, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateUploadOrder } from "@/hooks/queries";
import uploadApi from "@/apis/upload.api";

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  fileId?: number;
  isUploading: boolean;
}

export default function UploadOrderScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUploadOrder = useCreateUploadOrder();

  const handleGoBack = () => {
    router.back();
  };

  // Upload a single file to Strapi and update its state
  const uploadFile = async (file: SelectedFile, index: number) => {
    try {
      const formData = new FormData();
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const uploadRes = await uploadApi.uploadFile(formData);
      const uploadedFileId = uploadRes.data?.[0]?.id;

      if (uploadedFileId) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, fileId: uploadedFileId, isUploading: false } : f
          )
        );
      } else {
        throw new Error("No file ID returned");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, isUploading: false } : f)));
      Alert.alert(
        "Upload Error",
        `Failed to upload ${file.name}. You can remove it and try again.`
      );
    }
  };

  // Add files from picker result and start uploading
  const processPickerResult = async (assets: ExpoImagePicker.ImagePickerAsset[]) => {
    const startIndex = files.length;
    const newFiles: SelectedFile[] = assets.map((asset) => ({
      uri: asset.uri,
      name: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`,
      type: asset.mimeType || "image/jpeg",
      isUploading: true,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Upload each file
    for (let i = 0; i < newFiles.length; i++) {
      await uploadFile(newFiles[i], startIndex + i);
    }
  };

  // Pick images from gallery
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow photo library access to select images.");
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;
      await processPickerResult(result.assets);
    } catch (error) {
      console.error("Gallery picker error:", error);
      Alert.alert("Error", "Unable to open gallery. Please try again.");
    }
  };

  // Take a photo with camera
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow camera access to take photos.");
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;
      await processPickerResult(result.assets);
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Unable to open camera. Please try again.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      Alert.alert("No Files", "Please select at least one image to upload.");
      return;
    }

    const uploadedFileIds = files.filter((f) => f.fileId).map((f) => f.fileId!);
    if (uploadedFileIds.length === 0) {
      Alert.alert("Uploading", "Please wait for files to finish uploading.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUploadOrder.mutateAsync({
        files: uploadedFileIds,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        "Order Submitted!",
        "We\u2019ll review your order and get back to you with pricing details shortly.",
        [
          {
            text: "Back to Home",
            onPress: () => router.replace("/"),
          },
          {
            text: "View My Uploads",
            onPress: () => {
              router.replace("/upload-orders");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error?.message || "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const allUploaded = files.length > 0 && files.every((f) => !f.isUploading);
  const someUploading = files.some((f) => f.isUploading);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} disabled={isSubmitting} />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Upload Purchase Order
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <IconButton
              icon="information-outline"
              size={20}
              iconColor="#1565c0"
              style={styles.infoIcon}
            />
            <Text variant="bodyMedium" style={styles.infoText}>
              Upload photos of your purchase order, electrician&apos;s item list, or any document.
              Our team will review and create a quote for you.
            </Text>
          </View>

          {/* Source Options */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Add Images
            </Text>
            <View style={styles.sourceOptions}>
              {/* Camera Option */}
              <TouchableOpacity
                style={[styles.sourceCard, { borderColor: primaryColor }]}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.sourceIconCircle, { backgroundColor: primaryColor + "15" }]}>
                  <IconButton
                    icon="camera"
                    size={28}
                    iconColor={primaryColor}
                    style={styles.sourceIconBtn}
                  />
                </View>
                <Text variant="titleSmall" style={[styles.sourceLabel, { color: primaryColor }]}>
                  Take Photo
                </Text>
                <Text variant="bodySmall" style={styles.sourceHint}>
                  Use camera to capture
                </Text>
              </TouchableOpacity>

              {/* Gallery Option */}
              <TouchableOpacity
                style={[styles.sourceCard, { borderColor: primaryColor }]}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.sourceIconCircle, { backgroundColor: primaryColor + "15" }]}>
                  <IconButton
                    icon="image-multiple"
                    size={28}
                    iconColor={primaryColor}
                    style={styles.sourceIconBtn}
                  />
                </View>
                <Text variant="titleSmall" style={[styles.sourceLabel, { color: primaryColor }]}>
                  Choose from Gallery
                </Text>
                <Text variant="bodySmall" style={styles.sourceHint}>
                  Select existing photos
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Files */}
          {files.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Selected Files ({files.length})
              </Text>
              <View style={styles.filesGrid}>
                {files.map((file, index) => (
                  <View key={`${file.uri}-${index}`} style={styles.fileItem}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.fileThumbnail}
                      contentFit="cover"
                    />
                    {file.isUploading ? (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFile(index)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                    {file.fileId && (
                      <Chip style={styles.uploadedChip} textStyle={styles.uploadedChipText}>
                        ✓
                      </Chip>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notes (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Add any details about the items you need..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              outlineColor="#ddd"
              activeOutlineColor={primaryColor}
            />
          </View>
        </ScrollView>

        {/* Bottom Submit Bar */}
        <View style={styles.footer}>
          {someUploading && (
            <View style={styles.uploadingBanner}>
              <ActivityIndicator size="small" color={primaryColor} />
              <Text variant="bodySmall" style={styles.uploadingBannerText}>
                Uploading images...
              </Text>
            </View>
          )}
          <Button
            mode="contained"
            buttonColor={primaryColor}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !allUploaded || files.length === 0}
            style={styles.submitButton}
            labelStyle={styles.submitButtonLabel}
          >
            {files.length === 0
              ? "Add images to submit"
              : isSubmitting
                ? "Submitting..."
                : `Submit Order (${files.length} file${files.length > 1 ? "s" : ""})`}
          </Button>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    margin: 0,
    marginRight: 4,
    marginTop: -2,
  },
  infoText: {
    flex: 1,
    color: "#1565c0",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  sourceOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sourceCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  sourceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  sourceIconBtn: {
    margin: 0,
  },
  sourceLabel: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  sourceHint: {
    color: "#999",
    textAlign: "center",
  },
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fileItem: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fileThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(244,67,54,0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  uploadedChip: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(76,175,80,0.9)",
    height: 22,
    minHeight: 22,
  },
  uploadedChipText: {
    fontSize: 10,
    color: "#fff",
  },
  notesInput: {
    backgroundColor: "#fff",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  uploadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 8,
  },
  uploadingBannerText: {
    color: "#666",
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 4,
  },
  submitButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
