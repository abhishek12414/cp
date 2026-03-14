import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "react-native-paper";
import { Formik } from "formik";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import FormField from "@/components/FormField";
import {
  useBrand,
  useCategoriesForProducts,
  useProductByDocumentId,
} from "@/hooks/queries";
import productApi from "@/apis/product.api";
import uploadApi from "@/apis/upload.api";
import {
  AttributeInterface,
  ProductAttributeInterface,
  ProductInput,
} from "@/interface";
import { getImageUrl } from "@/helpers/image";
import { generateSlug } from "@/helpers/dataFormatter";
import {
  productValidationSchema,
  productInitialValues,
  ProductFormValues,
} from "@/helpers/validation/product";

interface ImageWithMeta {
  uri: string;
  id: number | null;
  isExisting: boolean;
}

interface AttributeValueState {
  value: string;
  id?: number;
  documentId?: string;
}

// Simple select dropdown component
interface SelectDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function SelectDropdown({
  options,
  value,
  onChange,
  placeholder,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = value || placeholder;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          value ? styles.dropdownButtonSelected : null,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !value ? styles.dropdownPlaceholder : null,
          ]}
        >
          {displayValue}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownModal}>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    value === option ? styles.dropdownOptionSelected : null,
                  ]}
                  onPress={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      value === option
                        ? styles.dropdownOptionTextSelected
                        : null,
                    ]}
                  >
                    {option}
                  </Text>
                  {value === option && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== "new";

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const queryClient = useQueryClient();

  const { data: categories = [] } = useCategoriesForProducts();
  const { data: brands = [] } = useBrand();
  const { data: product, isLoading: isLoadingProduct } = useProductByDocumentId(
    isEdit ? id : ""
  );

  // State for images
  const [imageList, setImageList] = useState<ImageWithMeta[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // State for attribute values
  const [attributeValues, setAttributeValues] = useState<
    Record<number, AttributeValueState>
  >({});
  const [categoryAttributeCache, setCategoryAttributeCache] = useState<
    Record<string, Record<number, AttributeValueState>>
  >({});

  // Compute initial values for edit mode
  const editInitialValues: ProductFormValues = useMemo(() => {
    if (isEdit && product) {
      return {
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        sku: product.sku || "",
        stockQuantity: product.stockQuantity ?? product.stock ?? 0,
        category: product.category?.documentId || null,
        brand: product.brand?.documentId || null,
        images: [],
      };
    }
    return productInitialValues;
  }, [product, isEdit]);

  // Set images and attributes when product data loads
  useEffect(() => {
    if (isEdit && product) {
      if (product.images?.length) {
        const existingImages: ImageWithMeta[] = product.images.map(
          (imageItem) => ({
            uri: getImageUrl(imageItem.url) || "",
            id: imageItem.id,
            isExisting: true,
          })
        );
        setImageList(existingImages);
      }

      // Load existing attribute values
      const rawAttributeValues =
        product.attributeValues || product.productAttributes || [];
      const existingAttributes = Array.isArray(rawAttributeValues)
        ? rawAttributeValues
        : (rawAttributeValues as any)?.data || [];

      const existingMap: Record<number, AttributeValueState> = {};
      existingAttributes.forEach((valueItem: ProductAttributeInterface) => {
        const attr = valueItem.attribute;
        if (attr && typeof attr === "object" && "id" in attr) {
          existingMap[attr.id] = {
            value: valueItem.value || "",
            id: valueItem.id,
            documentId: valueItem.documentId,
          };
        }
      });
      setAttributeValues(existingMap);

      const productCategory = product.category?.documentId;
      if (productCategory) {
        setCategoryAttributeCache((prev) => ({
          ...prev,
          [productCategory]: existingMap,
        }));
      }
    }
  }, [isEdit, product]);

  // Get selected category and its attributes
  const getSelectedCategory = (categoryId: string | null) => {
    return categories.find((cat) => cat.documentId === categoryId);
  };

  // Handle attribute changes
  const handleAttributeChange = (
    attribute: AttributeInterface,
    value: string,
    categoryId: string | null
  ) => {
    setAttributeValues((prev) => {
      const next = {
        ...prev,
        [attribute.id]: {
          ...prev[attribute.id],
          value,
        },
      };
      if (categoryId) {
        setCategoryAttributeCache((cache) => ({
          ...cache,
          [categoryId]: next,
        }));
      }
      return next;
    });
  };

  // Save attribute values to backend
  const saveAttributeValues = async (
    productId: number,
    categoryId: string | null
  ) => {
    const selectedCategory = categoryId
      ? getSelectedCategory(categoryId)
      : null;
    const attributes = selectedCategory?.attributes || [];
    const requests = attributes
      .map((attribute) => {
        const existing = attributeValues[attribute.id];
        const value = existing?.value?.trim();
        if (!value) {
          return null;
        }
        if (existing?.documentId) {
          return productApi
            .updateAttributeValue(existing.documentId, {
              value,
              attribute: attribute.id,
              product: productId,
            })
            .then(() => existing.id as number);
        }
        return productApi
          .createAttributeValue({
            value,
            attribute: attribute.id,
            product: productId,
          })
          .then((res) => res.data?.data?.id as number);
      })
      .filter(Boolean) as Promise<number>[];

    if (!requests.length) {
      return [] as number[];
    }

    const ids = await Promise.all(requests);
    return ids.filter(Boolean);
  };

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // Generate slug from name
      const slug = generateSlug(values.name);

      const payload: ProductInput = {
        ...values,
        slug,
        images: imageList.map((img) => img.id).filter(Boolean) as number[],
      };

      if (isEdit && product?.id) {
        const attributeValueIds = await saveAttributeValues(
          product.id,
          values.category
        );
        return productApi.updateProduct(id, {
          ...payload,
          attributeValues: attributeValueIds,
        });
      }

      const created = await productApi.createProduct(payload);
      const createdProduct = created?.data?.data;
      if (createdProduct?.id && createdProduct?.documentId) {
        const attributeValueIds = await saveAttributeValues(
          createdProduct.id,
          values.category
        );
        await productApi.updateProduct(createdProduct.documentId, {
          attributeValues: attributeValueIds,
        });
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["product", id] });
      }
      Alert.alert(
        "Success",
        `Product ${isEdit ? "updated" : "created"} successfully.`
      );
      router.back();
    },
    onError: (err) => {
      console.error("Product save error:", err);
      Alert.alert("Error", `Failed to ${isEdit ? "update" : "create"} product.`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => productApi.deleteProduct(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Alert.alert("Success", "Product deleted successfully.");
      router.back();
    },
    onError: (err) => {
      console.error("Delete product error:", err);
      Alert.alert("Error", "Failed to delete product. Please try again.");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product? This action cannot be undone.",
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

  const handleSubmit = (values: ProductFormValues) => {
    // Validate required attributes
    const selectedCategory = getSelectedCategory(values.category);
    const attributes = selectedCategory?.attributes || [];
    const missingRequired = attributes.find((attribute) => {
      const attrValue = attributeValues[attribute.id]?.value?.trim();
      return attribute.isRequired && !attrValue;
    });

    if (missingRequired) {
      Alert.alert("Validation", `Please provide ${missingRequired.name}.`);
      return;
    }

    mutation.mutate(values);
  };

  // Handle image picker
  const handlePickImage = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo access for image upload."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      try {
        setIsUploadingImage(true);

        const formDataUpload = new FormData();
        formDataUpload.append("files", {
          uri: uri,
          name: `product-image-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        } as any);

        const uploadRes = await uploadApi.uploadFile(formDataUpload);
        const uploadedFileId = uploadRes.data?.[0]?.id;

        if (!uploadedFileId) {
          throw new Error("Upload failed: No file ID returned");
        }

        setImageList((prev) => [
          ...prev,
          { uri, id: uploadedFileId, isExisting: false },
        ]);
        Alert.alert("Success", "Image uploaded successfully.");
      } catch (error: any) {
        console.error("Image upload error:", error?.response?.data || error?.message || error);
        Alert.alert("Error", error?.response?.data?.error?.message || "Failed to upload image. Try again.");
      } finally {
        setIsUploadingImage(false);
      }
    } catch (error: any) {
      console.error("Image picker error:", error?.message || error);
      Alert.alert("Error", error?.message || "Unable to open image picker. Please check app permissions.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute slug preview
  const getSlugPreview = (name: string) => {
    return generateSlug(name);
  };

  if (isLoadingProduct) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView
          style={styles.safeArea}
          edges={["bottom", "left", "right"]}
        >
          <View style={styles.center}>
            <Text>Loading product...</Text>
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
          validationSchema={productValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values, setFieldValue }) => {
            const selectedCategory = getSelectedCategory(values.category);
            const categoryAttributes = selectedCategory?.attributes || [];

            return (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: primaryColor }]}>
                  {isEdit ? "Edit Product" : "Add New Product"}
                </Text>

                <View style={styles.form}>
                  {/* Product Name */}
                  <FormField
                    name="name"
                    type="text"
                    label="Product Name"
                    placeholder="e.g. LED Bulb 9W"
                    required
                  />

                  {/* Description */}
                  <FormField
                    name="description"
                    type="textarea"
                    label="Description"
                    placeholder="Product description"
                  />

                  {/* Price */}
                  <FormField
                    name="price"
                    type="number"
                    label="Price"
                    placeholder="0.00"
                    required
                  />

                  {/* SKU */}
                  <FormField
                    name="sku"
                    type="text"
                    label="SKU"
                    placeholder="SKU"
                  />

                  {/* Stock Quantity */}
                  <FormField
                    name="stockQuantity"
                    type="number"
                    label="Stock Quantity"
                    placeholder="0"
                  />

                  {/* Category Selection */}
                  <FormField
                    name="category"
                    type="select"
                    label="Category"
                    placeholder="Select a category"
                    required
                    selectMode="dropdown"
                    searchable
                    searchPlaceholder="Search categories..."
                    options={categories.map((cat) => ({
                      label: cat.name,
                      value: cat.documentId,
                    }))}
                  />
                  {selectedCategory?.attributes?.length ? (
                    <Text style={styles.hint}>
                      {selectedCategory.attributes.length} attribute
                      {selectedCategory.attributes.length === 1 ? "" : "s"}{" "}
                      required for this category.
                    </Text>
                  ) : null}

                  {/* Brand Selection */}
                  <FormField
                    name="brand"
                    type="select"
                    label="Brand"
                    placeholder="Select a brand"
                    selectMode="dropdown"
                    searchable
                    searchPlaceholder="Search brands..."
                    options={brands.map((b) => ({
                      label: b.name,
                      value: b.documentId,
                    }))}
                  />

                  {/* Product Images */}
                  <Text style={styles.label}>Product Images</Text>
                  <View style={styles.imagePreviewContainer}>
                    {imageList.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {imageList.map((img, index) => (
                          <View
                            key={`${img.uri}-${index}`}
                            style={styles.imageWrapper}
                          >
                            <Image
                              source={{ uri: img.uri }}
                              style={styles.imagePreview}
                              contentFit="cover"
                            />
                            <TouchableOpacity
                              style={styles.removeImageButton}
                              onPress={() => handleRemoveImage(index)}
                            >
                              <Text style={styles.removeImageText}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noImageText}>No images selected</Text>
                    )}
                    <Button
                      mode="outlined"
                      onPress={handlePickImage}
                      disabled={isUploadingImage}
                      style={styles.pickButton}
                    >
                      {isUploadingImage ? "Uploading..." : "Pick & Upload Image"}
                    </Button>
                  </View>

                  {/* Slug Preview */}
                  <Text style={styles.label}>Slug (auto)</Text>
                  <View style={styles.slugBox}>
                    <Text style={styles.slugText}>
                      {getSlugPreview(values.name) || "-"}
                    </Text>
                  </View>

                  {/* Category Attributes */}
                  {categoryAttributes.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Category Attributes</Text>
                      {categoryAttributes.map((attribute) => {
                        const currentValue =
                          attributeValues[attribute.id]?.value || "";
                        const label = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ""}`;
                        return (
                          <View key={attribute.id} style={styles.attributeBlock}>
                            <Text style={styles.label}>
                              {label}{" "}
                              {attribute.isRequired ? (
                                <Text style={styles.required}>*</Text>
                              ) : null}
                            </Text>
                            {attribute.fieldType === "boolean" ? (
                              <View style={styles.switchRow}>
                                <Text>
                                  {currentValue === "true" ? "Yes" : "No"}
                                </Text>
                                <Switch
                                  value={currentValue === "true"}
                                  onValueChange={(value) =>
                                    handleAttributeChange(
                                      attribute,
                                      value ? "true" : "false",
                                      values.category
                                    )
                                  }
                                />
                              </View>
                            ) : attribute.fieldType === "select" &&
                              attribute.options?.length ? (
                              <SelectDropdown
                                options={attribute.options}
                                value={currentValue}
                                onChange={(value) =>
                                  handleAttributeChange(
                                    attribute,
                                    value,
                                    values.category
                                  )
                                }
                                placeholder={`Select ${attribute.name}`}
                              />
                            ) : (
                              <TextInput
                                style={[
                                  styles.input,
                                  attribute.fieldType === "text"
                                    ? styles.multiline
                                    : null,
                                ]}
                                placeholder="Enter value"
                                value={currentValue}
                                onChangeText={(text) =>
                                  handleAttributeChange(
                                    attribute,
                                    text,
                                    values.category
                                  )
                                }
                                multiline={attribute.fieldType === "text"}
                                numberOfLines={
                                  attribute.fieldType === "text" ? 3 : 1
                                }
                                keyboardType={
                                  attribute.fieldType === "number"
                                    ? "decimal-pad"
                                    : "default"
                                }
                              />
                            )}
                            {attribute.description ? (
                              <Text style={styles.note}>
                                {attribute.description}
                              </Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>

                <Button
                  mode="contained"
                  buttonColor={primaryColor}
                  onPress={() => handleSubmit()}
                  loading={mutation.isPending || isUploadingImage}
                  disabled={mutation.isPending || isUploadingImage}
                  style={styles.submitButton}
                >
                  {isEdit ? "Update Product" : "Create Product"}
                </Button>

                {isEdit && (
                  <Button
                    mode="outlined"
                    textColor="red"
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    disabled={deleteMutation.isPending || mutation.isPending}
                  >
                    Delete Product
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
            );
          }}
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
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
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
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: -1,
  },
  noImageText: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 8,
  },
  pickButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  slugBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  slugText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#444",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  attributeBlock: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: -4,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 4,
  },
  submitButton: {
    marginTop: 12,
    padding: 4,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  deleteButton: {
    marginTop: 16,
    padding: 4,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    borderColor: "red",
  },
  cancelButton: {
    marginTop: 10,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownButtonSelected: {
    borderColor: "#4CAF50",
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownOptionSelected: {
    backgroundColor: "#E8F5E9",
  },
  dropdownOptionText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownOptionTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});
