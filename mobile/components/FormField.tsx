import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  Switch,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useField, useFormikContext } from "formik";
import { Button } from "react-native-paper";

import ImagePicker from "./ImagePicker";

/**
 * Supported field types for FormField component
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "url"
  | "switch"
  | "image"
  | "select"
  | "multiselect";

/**
 * Option for select field type
 */
export interface SelectOption {
  label: string;
  value: string | number;
}

/**
 * Select display mode
 * - buttons: Display options as toggle buttons (default for small option sets)
 * - dropdown: Native dropdown with search functionality
 */
export type SelectMode = "buttons" | "dropdown";

/**
 * Props for FormField component
 */
export interface FormFieldProps {
  /**
   * Field name in the form (used with Formik)
   */
  name: string;

  /**
   * Field type to render
   */
  type: FieldType;

  /**
   * Label text displayed above the field
   */
  label?: string;

  /**
   * Placeholder text for input fields
   */
  placeholder?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Hint text displayed below the field
   */
  hint?: string;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Additional props for TextInput
   */
  textInputProps?: Partial<TextInputProps>;

  /**
   * Options for select type fields
   */
  options?: SelectOption[];

  /**
   * Select display mode (buttons or dropdown)
   */
  selectMode?: SelectMode;

  /**
   * Enable search in dropdown mode
   */
  searchable?: boolean;

  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;

  /**
   * For image type: callback when image is uploaded
   */
  onImageUpload?: (fileId: number, uri: string) => void;

  /**
   * For image type: current image URI for preview
   */
  imageUri?: string | null;

  /**
   * For image type: note text below the picker
   */
  imageNote?: string;

  /**
   * For image type: button text
   */
  imageButtonText?: string;

  /**
   * For image type: placeholder text
   */
  imagePlaceholder?: string;

  /**
   * For image type: size of preview
   */
  imageSize?: number;

  /**
   * Custom container style
   */
  containerStyle?: any;
}

/**
 * Reusable form field component that renders different input types
 * based on the `type` prop. Integrates with Formik for state management.
 *
 * Supported types:
 * - text: Standard text input
 * - textarea: Multiline text input
 * - number: Numeric input with number keyboard
 * - email: Email input with email keyboard
 * - url: URL input with URL keyboard
 * - switch: Boolean toggle switch
 * - image: Image picker with upload functionality
 * - select: Selection from options (buttons or dropdown with search)
 * - multiselect: Multiple selection from options
 */
export function FormField({
  name,
  type,
  label,
  placeholder,
  required = false,
  hint,
  disabled = false,
  textInputProps,
  options = [],
  selectMode = "buttons",
  searchable = true,
  searchPlaceholder = "Search...",
  onImageUpload,
  imageUri,
  imageNote,
  imageButtonText,
  imagePlaceholder,
  imageSize,
  containerStyle,
}: FormFieldProps) {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();

  const hasError = meta.touched && meta.error;
  const fieldValue = field.value;

  // State for dropdown modal
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery || !searchable) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  // Get selected option(s) label(s)
  const getSelectedLabel = () => {
    if (type === "multiselect") {
      if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
        return placeholder || "Select options";
      }
      const selectedLabels = options
        .filter((opt) => fieldValue.includes(opt.value))
        .map((opt) => opt.label);
      return selectedLabels.join(", ") || placeholder || "Select options";
    }
    
    const selected = options.find((opt) => opt.value === fieldValue);
    return selected?.label || placeholder || "Select an option";
  };

  /**
   * Render text-based input fields (text, textarea, number, email, url)
   */
  const renderTextInput = () => {
    const keyboardType =
      type === "number"
        ? "decimal-pad"
        : type === "email"
          ? "email-address"
          : type === "url"
            ? "url"
            : "default";

    const isMultiline = type === "textarea";

    return (
      <TextInput
        style={[
          styles.input,
          isMultiline && styles.multiline,
          hasError && styles.inputError,
        ]}
        placeholder={placeholder}
        value={fieldValue?.toString() || ""}
        onChangeText={(text) => helpers.setValue(text)}
        onBlur={() => helpers.setTouched(true)}
        keyboardType={keyboardType}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        textAlignVertical={isMultiline ? "top" : "center"}
        editable={!disabled && !isSubmitting}
        autoCapitalize={type === "email" || type === "url" ? "none" : "sentences"}
        {...textInputProps}
      />
    );
  };

  /**
   * Render switch field
   */
  const renderSwitch = () => (
    <View style={styles.switchRow}>
      <Text>{fieldValue ? "Yes" : "No"}</Text>
      <Switch
        value={!!fieldValue}
        onValueChange={(value) => helpers.setValue(value)}
        disabled={disabled || isSubmitting}
      />
    </View>
  );

  /**
   * Render image picker field
   */
  const renderImage = () => (
    <ImagePicker
      value={imageUri}
      onUpload={(fileId, uri) => {
        helpers.setValue(fileId);
        onImageUpload?.(fileId, uri);
      }}
      onClear={() => {
        helpers.setValue(null);
      }}
      placeholder={imagePlaceholder}
      buttonText={imageButtonText}
      size={imageSize}
      disabled={disabled || isSubmitting}
      note={imageNote}
    />
  );

  /**
   * Handle option selection
   */
  const handleSelect = (value: string | number) => {
    if (type === "multiselect") {
      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      helpers.setValue(newValues);
    } else {
      helpers.setValue(value);
      setDropdownVisible(false);
    }
    helpers.setTouched(true);
  };

  /**
   * Check if option is selected
   */
  const isSelected = (value: string | number) => {
    if (type === "multiselect") {
      return Array.isArray(fieldValue) && fieldValue.includes(value);
    }
    return fieldValue === value;
  };

  /**
   * Render select field with buttons
   */
  const renderSelectButtons = () => {
    if (!options || options.length === 0) {
      return <Text style={styles.noOptions}>No options available</Text>;
    }

    return (
      <View style={styles.optionList}>
        {options.map((option) => (
          <Button
            key={String(option.value)}
            mode={isSelected(option.value) ? "contained" : "outlined"}
            onPress={() => handleSelect(option.value)}
            disabled={disabled || isSubmitting}
            style={styles.optionButton}
          >
            {option.label}
          </Button>
        ))}
      </View>
    );
  };

  /**
   * Render dropdown select field
   */
  const renderDropdown = () => (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, hasError && styles.inputError]}
        onPress={() => {
          setSearchQuery("");
          setDropdownVisible(true);
        }}
        disabled={disabled || isSubmitting}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !fieldValue && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {getSelectedLabel()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label || "Select"}</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

            {type === "multiselect" && (
              <View style={styles.multiSelectInfo}>
                <Text style={styles.multiSelectInfoText}>
                  {(Array.isArray(fieldValue) ? fieldValue.length : 0)} selected
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    helpers.setValue([]);
                    helpers.setTouched(true);
                  }}
                >
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    isSelected(item.value) && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected(item.value) && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected(item.value) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noResultsText}>No results found</Text>
              }
            />

            {type === "multiselect" && (
              <View style={styles.dropdownFooter}>
                <Button
                  mode="contained"
                  onPress={() => setDropdownVisible(false)}
                  style={styles.doneButton}
                >
                  Done
                </Button>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );

  /**
   * Render select field based on mode
   */
  const renderSelect = () => {
    if (selectMode === "dropdown") {
      return renderDropdown();
    }
    return renderSelectButtons();
  };

  /**
   * Render field based on type using switch statement
   */
  const renderField = () => {
    switch (type) {
      case "text":
      case "textarea":
      case "number":
      case "email":
      case "url":
        return renderTextInput();

      case "switch":
        return renderSwitch();

      case "image":
        return renderImage();

      case "select":
      case "multiselect":
        return renderSelect();

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {renderField()}
      {hasError && <Text style={styles.error}>{meta.error}</Text>}
      {hint && !hasError && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
    marginLeft: 2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  noOptions: {
    fontSize: 14,
    opacity: 0.5,
    fontStyle: "italic",
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: "40%",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
    padding: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 15,
  },
  multiSelectInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  multiSelectInfoText: {
    fontSize: 14,
    color: "#666",
  },
  clearAllText: {
    fontSize: 14,
    color: "#007AFF",
  },
  optionsList: {
    flex: 1,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownOptionSelected: {
    backgroundColor: "#f0f9f0",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    marginLeft: 8,
  },
  noResultsText: {
    textAlign: "center",
    padding: 20,
    color: "#999",
    fontSize: 15,
  },
  dropdownFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  doneButton: {
    borderRadius: 8,
  },
});

export default FormField;
