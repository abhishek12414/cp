import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Button, Text, IconButton, TextInput, ActivityIndicator, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import * as ExpoImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useCreateUploadOrder } from "@/hooks/queries";
import uploadApi from "@/apis/upload.api";

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  fileId?: number;
  isUploading: boolean;
}

export default function NewUploadOrderScreen() {
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

  const handlePickImages = async () => {
    try {
      const permissionResult = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Allow photo access for image upload.");
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      // Add selected files to state
      const newFiles: SelectedFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`,
        type: asset.mimeType || "image/jpeg",
        isUploading: true,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
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
              prev.map((f, idx) =>
                prev.length - newFiles.length + idx === prev.indexOf(file)
                  ? { ...f, fileId: uploadedFileId, isUploading: false }
                  : f
              )
            );
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Error", `Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Picker error:", error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      Alert.alert("Error", "Please select at least one file");
      return;
    }

    const uploadedFileIds = files.filter((f) => f.fileId).map((f) => f.fileId!);
    if (uploadedFileIds.length === 0) {
      Alert.alert("Error", "Please wait for files to finish uploading");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUploadOrder.mutateAsync({
        files: uploadedFileIds,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error?.message || "Failed to create upload order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const allUploaded = files.length > 0 && files.every((f) => !f.isUploading);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <Text variant="headlineSmall" style={styles.title}>
            Upload Files
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text variant="bodyMedium" style={styles.infoText}>
              Upload images or documents shared by your electrician. Our team will review and create
              a quote for you.
            </Text>
          </View>

          {/* File Upload Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Upload Files
            </Text>

            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: primaryColor }]}
              onPress={handlePickImages}
            >
              <IconButton icon="cloud-upload" size={32} iconColor={primaryColor} />
              <Text style={[styles.uploadText, { color: primaryColor }]}>Tap to select files</Text>
              <Text variant="bodySmall" style={styles.uploadHint}>
                Images or PDFs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Files */}
          {files.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Selected Files ({files.length})
              </Text>
              <View style={styles.filesGrid}>
                {files.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
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
                        <IconButton icon="close" size={16} iconColor="#fff" />
                      </TouchableOpacity>
                    )}
                    {file.fileId && (
                      <Chip style={styles.uploadedChip} textStyle={{ fontSize: 10 }}>
                        Uploaded
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
              placeholder="Add any additional information about the items..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !allUploaded}
            style={styles.submitButton}
          >
            Submit for Review
          </Button>
        </View>
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
  infoCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
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
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontWeight: "600",
    fontSize: 16,
    marginTop: 8,
  },
  uploadHint: {
    color: "#999",
    marginTop: 4,
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
  uploadedChip: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(76,175,80,0.9)",
    height: 24,
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
  submitButton: {
    borderRadius: 8,
  },
});
