import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Button } from "react-native-paper";

import uploadApi from "@/apis/upload.api";

interface ImagePickerProps {
  /**
   * Current image URI to display (for preview)
   */
  value?: string | null;

  /**
   * Callback when image is uploaded successfully, returns the file ID
   */
  onUpload: (fileId: number, uri: string) => void;

  /**
   * Callback when image is cleared
   */
  onClear?: () => void;

  /**
   * Placeholder text when no image is selected
   */
  placeholder?: string;

  /**
   * Upload button text
   */
  buttonText?: string;

  /**
   * Preview image size
   */
  size?: number;

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Label for the image picker
   */
  label?: string;

  /**
   * Note/hint text below the picker
   */
  note?: string;

  /**
   * Aspect ratio for cropping [width, height]
   */
  aspect?: [number, number];

  /**
   * Whether to allow editing/cropping
   */
  allowsEditing?: boolean;

  /**
   * Image quality (0-1)
   */
  quality?: number;
}

/**
 * Reusable image picker component with upload functionality
 * Handles permission request, image selection, and upload to Strapi
 */
export function ImagePicker({
  value,
  onUpload,
  onClear,
  placeholder = "No image selected",
  buttonText = "Pick & Upload Image",
  size = 100,
  disabled = false,
  label,
  note,
  aspect,
  allowsEditing = true,
  quality = 0.8,
}: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo access for image upload."
        );
        return;
      }

      // Launch image picker
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      try {
        setIsUploading(true);

        // Create FormData for upload
        const formData = new FormData();
        formData.append("files", {
          uri: uri,
          name: `image-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        } as any);

        // Upload to server
        const uploadRes = await uploadApi.uploadFile(formData);
        const uploadedFileId = uploadRes.data?.[0]?.id;

        if (!uploadedFileId) {
          throw new Error("Upload failed: No file ID returned");
        }

        // Notify parent component
        onUpload(uploadedFileId, uri);
        Alert.alert("Success", "Image uploaded successfully.");
      } catch (error: any) {
        console.error("Image upload error:", error?.response?.data || error?.message || error);
        Alert.alert("Error", error?.response?.data?.error?.message || "Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } catch (error: any) {
      console.error("Image picker error:", error?.message || error);
      Alert.alert("Error", error?.message || "Unable to open image picker. Please check app permissions.");
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.previewContainer}>
        {value ? (
          <Image
            source={{ uri: value }}
            style={[styles.preview, { width: size, height: size }]}
            contentFit="contain"
          />
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Button
          mode="outlined"
          onPress={handlePickImage}
          disabled={disabled || isUploading}
          style={styles.button}
        >
          {isUploading ? "Uploading..." : buttonText}
        </Button>
        {value && onClear && (
          <Button
            mode="text"
            textColor="red"
            onPress={onClear}
            disabled={disabled || isUploading}
            style={styles.clearButton}
          >
            Remove
          </Button>
        )}
      </View>
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: "center",
  },
  preview: {
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholder: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 4,
  },
  note: {
    opacity: 0.6,
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default ImagePicker;
