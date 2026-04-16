import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View, Dimensions, ScrollView } from "react-native";
import { ActivityIndicator, IconButton, Text, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ui/ProductCard";
import FilterModal from "@/components/ui/FilterModal";
import { buildFilterQuery } from "@/components/ui/ProductFilter";

import { Colors } from "@/constants/Colors";
import { useCategoryWithAttributes, useProducts, useBrand } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProductFilterState, AttributeInterface } from "@/interface";
import { extractMediaUrl } from "@/helpers/image";

const { width } = Dimensions.get("window");

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  const { data: category, isLoading: isLoadingCategory } =
    useCategoryWithAttributes(id || "");

  const { data: brands = [] } = useBrand();

  // Filter state
  const [filters, setFilters] = useState<ProductFilterState | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Build query based on filters
  const query = useMemo(() => {
    if (filters) {
      return buildFilterQuery(id || "", filters);
    }
    return {
      filters: {
        category: { documentId: { $eq: id } },
      },
    };
  }, [id, filters]);

  const { data: categoryProducts, isLoading: isLoadingProducts } =
    useProducts(query);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    Object.values(filters.attributes).forEach((attr) => {
      if (attr.value !== null && attr.value !== "" && attr.value !== undefined) {
        count++;
      }
    });
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.brands.selectedBrandIds.length > 0) count++;
    return count;
  }, [filters]);

  const handleGoBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // Implement add to cart logic
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
    // Implement add to wishlist logic
  };

  const handleOpenFilter = () => {
    setIsFilterVisible(true);
  };

  const handleCloseFilter = () => {
    setIsFilterVisible(false);
  };

  const handleApplyFilters = useCallback((newFilters: ProductFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters(null);
  };

  // Get category attributes for filter
  const categoryAttributes: AttributeInterface[] = useMemo(() => {
    return category?.attributes || [];
  }, [category]);

  // Get available brands for filter
  const availableBrands = useMemo(() => {
    return brands.map((brand) => ({
      documentId: brand.documentId,
      name: brand.name,
    }));
  }, [brands]);

  // Get category image URL
  const categoryImageUrl = extractMediaUrl(category?.image);

  if (isLoadingCategory) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={primaryColor} />
        <Text>Loading category...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Category Banner with Image */}
        {categoryImageUrl && (
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: categoryImageUrl }}
              style={styles.bannerImage}
              contentFit="cover"
            />
            <View style={styles.bannerOverlay}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={handleGoBack}
                iconColor="#fff"
                style={styles.bannerBackButton}
              />
              <View style={styles.bannerTitleContainer}>
                <Text variant="headlineSmall" style={styles.bannerTitle}>
                  {category?.name}
                </Text>
                <Text variant="bodySmall" style={styles.bannerSubtitle}>
                  {categoryProducts?.length || 0} products
                </Text>
              </View>
              <IconButton
                icon="filter-variant"
                size={24}
                onPress={handleOpenFilter}
                iconColor={activeFilterCount > 0 ? primaryColor : "#fff"}
                containerColor={activeFilterCount > 0 ? "#fff" : "rgba(255,255,255,0.2)"}
                style={styles.bannerFilterButton}
              />
            </View>
          </View>
        )}

        {/* Simple header when no image */}
        {!categoryImageUrl && (
          <View style={styles.header}>
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {category?.name}
            </Text>
            <IconButton
              icon="filter-variant"
              size={24}
              onPress={handleOpenFilter}
              containerColor={activeFilterCount > 0 ? primaryColor : undefined}
              iconColor={activeFilterCount > 0 ? "#fff" : undefined}
            />
          </View>
        )}

        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <View style={styles.activeFiltersContainer}>
            <FlatList
              horizontal
              data={[
                ...(filters?.priceRange.min !== null || filters?.priceRange.max !== null
                  ? [{ id: "price", label: `Price: ${filters?.priceRange.min || 0} - ${filters?.priceRange.max || "∞"}` }]
                  : []),
                ...(filters?.brands.selectedBrandIds.map((brandId) => ({
                  id: `brand-${brandId}`,
                  label: brands.find((b) => b.documentId === brandId)?.name || brandId,
                })) || []),
                ...Object.values(filters?.attributes || {})
                  .filter((attr) => attr.value !== null && attr.value !== "")
                  .map((attr) => ({
                    id: `attr-${attr.attributeId}`,
                    label: `${attr.attributeName}: ${attr.value}`,
                  })),
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Chip
                  mode="outlined"
                  onClose={() => {
                    // Handle removing individual filter
                    if (item.id === "price") {
                      setFilters((prev) =>
                        prev
                          ? { ...prev, priceRange: { min: null, max: null } }
                          : null
                      );
                    } else if (item.id.startsWith("brand-")) {
                      const brandId = item.id.replace("brand-", "");
                      setFilters((prev) =>
                        prev
                          ? {
                              ...prev,
                              brands: {
                                selectedBrandIds: prev.brands.selectedBrandIds.filter(
                                  (id) => id !== brandId
                                ),
                              },
                            }
                          : null
                      );
                    } else if (item.id.startsWith("attr-")) {
                      const attrId = Number(item.id.replace("attr-", ""));
                      setFilters((prev) =>
                        prev
                          ? {
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [attrId]: {
                                  ...prev.attributes[attrId],
                                  value: null,
                                },
                              },
                            }
                          : null
                      );
                    }
                  }}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterChipText}
                >
                  {item.label}
                </Chip>
              )}
              contentContainerStyle={styles.activeFiltersList}
              showsHorizontalScrollIndicator={false}
            />
            <Button
              mode="text"
              compact
              onPress={handleClearFilters}
              textColor={primaryColor}
              style={styles.clearButton}
            >
              Clear
            </Button>
          </View>
        )}

        {isLoadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={categoryProducts}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.productCardContainer}>
                <ProductCard
                  data={item}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              </View>
            )}
            keyExtractor={(item) => item.documentId}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="titleMedium">No products found</Text>
                <Text variant="bodyMedium">
                  Try changing your search or filters
                </Text>
                {activeFilterCount > 0 && (
                  <Button
                    mode="outlined"
                    onPress={handleClearFilters}
                    style={styles.resetFilterButton}
                    textColor={primaryColor}
                  >
                    Reset Filters
                  </Button>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterVisible}
        onClose={handleCloseFilter}
        categoryId={id || ""}
        attributes={categoryAttributes}
        availableBrands={availableBrands}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters || undefined}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContainer: {
    height: 180,
    position: "relative",
  },
  bannerImage: {
    width: width,
    height: 180,
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  bannerBackButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bannerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  bannerTitle: {
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  bannerFilterButton: {
    margin: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: "700",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  activeFiltersList: {
    paddingRight: 8,
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  activeFilterChipText: {
    fontSize: 12,
  },
  clearButton: {
    marginLeft: 4,
  },
  productsList: {
    padding: 8,
  },
  productCardContainer: {
    width: "50%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resetFilterButton: {
    marginTop: 16,
    borderColor: "#007AFF",
  },
});
