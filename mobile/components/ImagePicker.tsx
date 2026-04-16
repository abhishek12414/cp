import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Button, IconButton } from "react-native-paper";

import uploadApi from "@/apis/upload.api";
import { getImageUrl } from "@/helpers/image";
import MediaPicker from "./MediaPicker";
import { Colors } from "@/constants/Colors";

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

  /**
   * Whether to allow multiple image selection from media library
   */
  multiple?: boolean;

  /**
   * Page size for media library (10 or 20)
   */
  mediaPageSize?: 10 | 20;
}

/**
 * Reusable image picker component with upload functionality
 * Handles permission request, image selection, and upload to Strapi
 * Also supports selecting images from the Strapi media library
 */
export function ImagePicker({
  value,
  onUpload,
  onClear,
  placeholder = "No image selected",
  buttonText = "Pick Image",
  size = 100,
  disabled = false,
  label,
  note,
  aspect,
  allowsEditing = true,
  quality = 0.8,
  multiple = false,
  mediaPageSize = 20,
}: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);

  const handlePickImage = async () => {
    setOptionsModalVisible(false);
    
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

  const handleSelectFromGallery = () => {
    setOptionsModalVisible(false);
    setMediaPickerVisible(true);
  };

  const handleMediaSelect = (files: Array<{ id: number; url: string }>) => {
    if (files.length > 0) {
      // For single selection, use the first file
      const file = files[0];
      onUpload(file.id, file.url);
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
          onPress={() => setOptionsModalVisible(true)}
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

      {/* Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsContainer}>
            <View style={styles.optionsContent}>
              <Text style={styles.optionsTitle}>Select Image Source</Text>
              
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handlePickImage}
              >
                <IconButton
                  icon="camera"
                  size={24}
                  iconColor={Colors.light.primary}
                  style={styles.optionIcon}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Upload from Device</Text>
                  <Text style={styles.optionSubtitle}>
                    Pick and upload a new image from your device
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleSelectFromGallery}
              >
                <IconButton
                  icon="image-multiple"
                  size={24}
                  iconColor={Colors.light.primary}
                  style={styles.optionIcon}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Select from Gallery</Text>
                  <Text style={styles.optionSubtitle}>
                    Choose from previously uploaded images
                  </Text>
                </View>
              </TouchableOpacity>

              <Button
                mode="text"
                onPress={() => setOptionsModalVisible(false)}
                style={styles.cancelOption}
              >
                Cancel
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Media Library Picker Modal */}
      <MediaPicker
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onSelect={handleMediaSelect}
        multiple={multiple}
        pageSize={mediaPageSize}
      />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  optionsContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    margin: 0,
    marginRight: 8,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  cancelOption: {
    marginTop: 8,
  },
});

export default ImagePicker;
