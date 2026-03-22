import React, { useCallback, forwardRef, useImperativeHandle } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductFilter, { ProductFilterProps } from "./ProductFilter";
import { ProductFilterState } from "@/interface";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

export interface FilterModalRef {
  open: () => void;
  close: () => void;
}

export interface FilterModalProps extends Omit<ProductFilterProps, "onApply" | "onClear" | "onFilterChange" | "onClose"> {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilterState) => void;
}

export const FilterModal = forwardRef<FilterModalRef, FilterModalProps>(
  ({ visible, onClose, onApplyFilters, ...filterProps }, ref) => {
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      open: () => {},
      close: () => onClose(),
    }));

    const handleApply = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleClear = useCallback(() => {
      // Clear is handled inside ProductFilter
    }, []);

    const handleFilterChange = useCallback(
      (filters: ProductFilterState) => {
        onApplyFilters(filters);
      },
      [onApplyFilters]
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.container}>
          {/* Backdrop - covers only the top area, modal content is on top */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          {/* Modal Content - rendered after backdrop so it's on top */}
          <View style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Filter Content */}
            <View style={styles.filterContent}>
              <ProductFilter
                {...filterProps}
                onFilterChange={handleFilterChange}
                onApply={handleApply}
                onClear={handleClear}
                onClose={onClose}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

FilterModal.displayName = "FilterModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: MODAL_HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  filterContent: {
    flex: 1,
    overflow: "hidden",
  },
});

export default FilterModal;
