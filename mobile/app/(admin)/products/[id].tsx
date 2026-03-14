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
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import {
  useBrand,
  useCategoriesForProducts,
  useProductByDocumentId,
} from "@/hooks/queries";
import productApi from "@/apis/product.api";
import {
  AttributeInterface,
  ProductAttributeInterface,
  ProductInput,
} from "@/interface";
import { getImageUrl } from "@/helpers/image";

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
    isEdit ? id : "",
  );

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    price: 0,
    sku: "",
    stockQuantity: 0,
    category: null,
    brand: null,
    images: [],
  });

  const [priceInput, setPriceInput] = useState("0");
  const [stockInput, setStockInput] = useState("0");
  const [attributeValues, setAttributeValues] = useState<
    Record<number, AttributeValueState>
  >({});
  const [categoryAttributeCache, setCategoryAttributeCache] = useState<
    Record<string, Record<number, AttributeValueState>>
  >({});
  const [imageList, setImageList] = useState<ImageWithMeta[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (categoryItem) => categoryItem.documentId === formData.category,
    );
  }, [categories, formData.category]);

  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        sku: product.sku || "",
        stockQuantity: product.stockQuantity ?? product.stock ?? 0,
        category: product.category?.documentId || null,
        brand: product.brand?.documentId || null,
        images: [],
      });
      setPriceInput(String(product.price ?? 0));
      setStockInput(String(product.stockQuantity ?? product.stock ?? 0));

      if (product.images?.length) {
        const existingImages: ImageWithMeta[] = product.images.map(
          (imageItem) => ({
            uri: getImageUrl(imageItem.url) || "",
            id: imageItem.id,
            isExisting: true,
          }),
        );
        setImageList(existingImages);
      }

      // Use both possible keys for attribute values from Strapi
      const rawAttributeValues =
        product.attributeValues || product.productAttributes || [];
      const existingAttributes = Array.isArray(rawAttributeValues)
        ? rawAttributeValues
        : (rawAttributeValues as any)?.data || [];

      const existingMap: Record<number, AttributeValueState> = {};
      existingAttributes.forEach((valueItem: ProductAttributeInterface) => {
        // The attribute is nested inside valueItem.attribute
        // valueItem structure: { id, documentId, value, attribute: { id, name, fieldType, ... } }
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

  useEffect(() => {
    const categoryId = formData.category || "";
    if (!selectedCategory?.attributes?.length) {
      setAttributeValues({});
      return;
    }

    const cached = categoryId ? categoryAttributeCache[categoryId] : undefined;
    if (cached) {
      setAttributeValues(cached);
      return;
    }

    if (!isEdit) {
      setAttributeValues({});
      return;
    }

    setAttributeValues((prev) => {
      const allowed = selectedCategory.attributes || [];
      const retained: Record<number, AttributeValueState> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const attrId = Number(key);
        if (allowed.some((attr) => attr.id === attrId)) {
          retained[attrId] = value;
        }
      });
      if (categoryId) {
        setCategoryAttributeCache((cache) => ({
          ...cache,
          [categoryId]: retained,
        }));
      }
      return retained;
    });
  }, [categoryAttributeCache, formData.category, selectedCategory]);

  const mutation = useMutation({
    mutationFn: async (payload: ProductInput) => {
      if (isEdit && product?.id) {
        const attributeValueIds = await saveAttributeValues(product.id);
        return productApi.updateProduct(id, {
          ...payload,
          attributeValues: attributeValueIds,
        });
      }

      const created = await productApi.createProduct(payload);
      const createdProduct = created?.data?.data;
      if (createdProduct?.id && createdProduct?.documentId) {
        const attributeValueIds = await saveAttributeValues(createdProduct.id);
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
      setCategoryAttributeCache((prev) => {
        if (!formData.category) {
          return prev;
        }
        return {
          ...prev,
          [formData.category as string]: attributeValues,
        };
      });
      Alert.alert(
        "Success",
        `Product ${isEdit ? "updated" : "created"} successfully.`,
      );
      router.back();
    },
    onError: (err) => {
      console.error("Product save error:", err);
      Alert.alert(
        "Error",
        `Failed to ${isEdit ? "update" : "create"} product.`,
      );
    },
  });

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

  const saveAttributeValues = async (productId: number) => {
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

  const updateField = (
    field: keyof ProductInput,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const slugValue = useMemo(() => {
    return formData.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }, [formData.name]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation", "Product name is required.");
      return;
    }
    if (!formData.category) {
      Alert.alert("Validation", "Please select a category.");
      return;
    }
    if (!priceInput || Number.isNaN(Number(priceInput))) {
      Alert.alert("Validation", "Please enter a valid price.");
      return;
    }

    const attributes = selectedCategory?.attributes || [];
    const missingRequired = attributes.find((attribute) => {
      const value = attributeValues[attribute.id]?.value?.trim();
      return attribute.isRequired && !value;
    });
    if (missingRequired) {
      Alert.alert("Validation", `Please provide ${missingRequired.name}.`);
      return;
    }

    const payload: ProductInput = {
      ...formData,
      slug: slugValue,
      price: Number(priceInput),
      stockQuantity: Number(stockInput || 0),
      images: imageList.map((img) => img.id).filter(Boolean) as number[],
    };

    mutation.mutate(payload);
  };

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
      ],
    );
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo access for image upload.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

        const uploadRes = await productApi.uploadImage(formDataUpload);

        const uploadedFileId = uploadRes.data?.[0]?.id;

        if (!uploadedFileId) {
          throw new Error("Upload failed: No file ID returned");
        }

        setImageList((prev) => [
          ...prev,
          { uri, id: uploadedFileId, isExisting: false },
        ]);
      } catch {
        Alert.alert("Error", "Failed to upload image. Try again.");
      } finally {
        setIsUploadingImage(false);
      }
    } catch {
      Alert.alert("Error", "Unable to open image picker.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (
    attribute: AttributeInterface,
    value: string,
  ) => {
    setAttributeValues((prev) => {
      const next = {
        ...prev,
        [attribute.id]: {
          ...prev[attribute.id],
          value,
        },
      };
      const categoryId = formData.category;
      if (categoryId) {
        setCategoryAttributeCache((cache) => ({
          ...cache,
          [categoryId]: next,
        }));
      }
      return next;
    });
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

  const categoryAttributes = selectedCategory?.attributes || [];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: primaryColor }]}>
            {isEdit ? "Edit Product" : "Add New Product"}
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>
              Product Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. LED Bulb 9W"
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Product description"
              value={formData.description}
              onChangeText={(text) => updateField("description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>
              Price <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>SKU</Text>
            <TextInput
              style={styles.input}
              placeholder="SKU"
              value={formData.sku || ""}
              onChangeText={(text) => updateField("sku", text)}
            />

            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={stockInput}
              onChangeText={setStockInput}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionList}>
              {categories.map((category) => (
                <Button
                  key={category.documentId}
                  mode={
                    formData.category === category.documentId
                      ? "contained"
                      : "outlined"
                  }
                  buttonColor={primaryColor}
                  textColor={
                    formData.category === category.documentId
                      ? "#fff"
                      : undefined
                  }
                  onPress={() => updateField("category", category.documentId)}
                  style={styles.optionButton}
                >
                  {category.name}
                </Button>
              ))}
            </View>
            {selectedCategory?.attributes?.length ? (
              <Text style={styles.hint}>
                {selectedCategory.attributes.length} attribute
                {selectedCategory.attributes.length === 1 ? "" : "s"} required
                for this category.
              </Text>
            ) : null}

            <Text style={styles.label}>Brand</Text>
            <View style={styles.optionList}>
              {brands.map((brand) => (
                <Button
                  key={brand.documentId}
                  mode={
                    formData.brand === brand.documentId
                      ? "contained"
                      : "outlined"
                  }
                  buttonColor={primaryColor}
                  textColor={
                    formData.brand === brand.documentId ? "#fff" : undefined
                  }
                  onPress={() => updateField("brand", brand.documentId)}
                  style={styles.optionButton}
                >
                  {brand.name}
                </Button>
              ))}
            </View>

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

            <Text style={styles.label}>Slug (auto)</Text>
            <View style={styles.slugBox}>
              <Text style={styles.slugText}>{slugValue || "-"}</Text>
            </View>

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
                          <Text>{currentValue === "true" ? "Yes" : "No"}</Text>
                          <Switch
                            value={currentValue === "true"}
                            onValueChange={(value) =>
                              handleAttributeChange(
                                attribute,
                                value ? "true" : "false",
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
                            handleAttributeChange(attribute, value)
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
                            handleAttributeChange(attribute, text)
                          }
                          multiline={attribute.fieldType === "text"}
                          numberOfLines={attribute.fieldType === "text" ? 3 : 1}
                          keyboardType={
                            attribute.fieldType === "number"
                              ? "decimal-pad"
                              : "default"
                          }
                        />
                      )}
                      {attribute.description ? (
                        <Text style={styles.note}>{attribute.description}</Text>
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
            onPress={handleSubmit}
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
