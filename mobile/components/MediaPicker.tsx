import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Button, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import uploadApi, { UploadedFile } from "@/apis/upload.api";
import { getImageUrl } from "@/helpers/image";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 80) / 3; // 3 columns with padding

interface MediaPickerProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Callback when images are selected
   * @param files - Array of selected files with their IDs and URLs
   */
  onSelect: (files: Array<{ id: number; url: string }>) => void;

  /**
   * Whether to allow multiple selection
   */
  multiple?: boolean;

  /**
   * Maximum number of images to fetch per page (10 or 20)
   */
  pageSize?: 10 | 20;

  /**
   * Currently selected file IDs (for highlighting)
   */
  selectedIds?: number[];
}

/**
 * Media Picker component for selecting images from Strapi media library
 * Supports pagination and single/multiple selection modes
 */
export function MediaPicker({
  visible,
  onClose,
  onSelect,
  multiple = false,
  pageSize = 20,
  selectedIds = [],
}: MediaPickerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>(selectedIds);
  
  // Track if we've already loaded data to prevent duplicate API calls
  const hasLoadedRef = useRef(false);
  // Track the current visible state to prevent stale closures
  const visibleRef = useRef(visible);

  // Fetch files from Strapi - using ref to track loading state
  const fetchFiles = useCallback(async (pageNum: number, refresh: boolean = false) => {
    // Prevent duplicate calls
    if (!refresh && hasLoadedRef.current && pageNum === 1) {
      return;
    }

    if (refresh) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await uploadApi.getFiles(pageNum, pageSize);
      const newFiles = response.data || [];
      const pagination = response.meta?.pagination;

      if (refresh) {
        setFiles(newFiles);
        hasLoadedRef.current = true;
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
      }

      setTotal(pagination?.total || newFiles.length);
      setHasMore(pagination ? pageNum < pagination.pageCount : false);
      setPage(pageNum);
    } catch (error: any) {
      console.error("Error fetching files:", error?.message || error);
      // Don't crash, just show empty state
      if (refresh) {
        setFiles([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  // Reset and fetch when modal opens - with proper dependency management
  useEffect(() => {
    visibleRef.current = visible;
    
    if (visible && !hasLoadedRef.current) {
      setFiles([]);
      setPage(1);
      setHasMore(true);
      setSelected(selectedIds);
      fetchFiles(1, true);
    } else if (visible && hasLoadedRef.current) {
      // Just reset selection if already loaded
      setSelected(selectedIds);
    }
    
    // Cleanup when modal closes
    if (!visible) {
      hasLoadedRef.current = false;
    }
  }, [visible, selectedIds]); // Removed fetchFiles from dependencies to prevent infinite loop

  // Load more files
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFiles(page + 1);
    }
  };

  // Toggle file selection
  const toggleSelection = (fileId: number) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(fileId)
          ? prev.filter((id) => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      setSelected([fileId]);
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    const selectedFiles = files
      .filter((file) => selected.includes(file.id))
      .map((file) => ({
        id: file.id,
        url: getImageUrl(file.url) || "",
      }));
    onSelect(selectedFiles);
    onClose();
  };

  // Render file item
  const renderItem = ({ item }: { item: UploadedFile }) => {
    const isSelected = selected.includes(item.id);
    const thumbnailUrl = item.formats?.thumbnail?.url
      ? getImageUrl(item.formats.thumbnail.url)
      : getImageUrl(item.url);

    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          isSelected && styles.imageContainerSelected,
        ]}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: thumbnailUrl || "" }}
          style={styles.image}
          contentFit="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <IconButton
              icon="check-circle"
              iconColor="#fff"
              size={24}
              style={styles.checkIcon}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <IconButton icon="image-off" size={48} iconColor="#999" />
        <Text style={styles.emptyText}>No images found</Text>
        <Text style={styles.emptySubtext}>
          Upload some images to the media library first
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconButton icon="close" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>
            Select {multiple ? "Images" : "Image"}
          </Text>
          <View style={styles.headerRight}>
            {selected.length > 0 && (
              <Text style={styles.selectedCount}>
                {selected.length} selected
              </Text>
            )}
          </View>
        </View>

        {/* Image count */}
        {!loading && files.length > 0 && (
          <Text style={styles.imageCount}>
            Showing {files.length} of {total} images
          </Text>
        )}

        {/* Image Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading images...</Text>
          </View>
        ) : (
          <FlatList
            data={files}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        )}

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={selected.length === 0}
            style={styles.confirmButton}
          >
            Confirm ({selected.length})
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 100,
    alignItems: "flex-end",
    paddingRight: 16,
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  imageCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  gridContainer: {
    padding: 12,
    flexGrow: 1,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  imageContainerSelected: {
    borderColor: Colors.light.primary,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default MediaPicker;
