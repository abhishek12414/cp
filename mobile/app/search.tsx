import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  Searchbar,
  Chip,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useSearchProducts,
  useSearchCategories,
} from "@/hooks/queries";
import { useSearchBrands } from "@/hooks/queries/useBrand";
import { getImageUrl } from "@/helpers/image";
import { BrandInterface, CategoryInterface, ProductInterface } from "@/interface";

const { width } = Dimensions.get("window");

// Search result type
type SearchResultType = "product" | "category" | "brand";

interface SearchResult {
  id: string;
  type: SearchResultType;
  documentId: string;
  name: string;
  subtitle?: string;
  image?: string | null;
  price?: number;
  comparePrice?: number;
  rating?: number | null;
  data: ProductInterface | CategoryInterface | BrandInterface;
}

type FilterTab = "all" | "products" | "categories" | "brands";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = params.q || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchSubmitted, setSearchSubmitted] = useState(!!initialQuery);

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  // Search hooks
  const { data: products = [], isLoading: isLoadingProducts } = useSearchProducts(
    searchQuery,
    searchSubmitted && searchQuery.length >= 2
  );
  const { data: categories = [], isLoading: isLoadingCategories } = useSearchCategories(
    searchQuery,
    searchSubmitted && searchQuery.length >= 2
  );
  const { data: brands = [], isLoading: isLoadingBrands } = useSearchBrands(
    searchQuery,
    searchSubmitted && searchQuery.length >= 2
  );

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingBrands;

  // Convert results to unified format
  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    // Add products
    products.forEach((product) => {
      results.push({
        id: `product-${product.documentId}`,
        type: "product",
        documentId: product.documentId,
        name: product.name,
        subtitle: product.brand?.name || product.category?.name,
        image: product.images?.[0] ? getImageUrl(product.images[0].url) : null,
        price: product.price,
        comparePrice: product.comparePrice,
        rating: product.rating,
        data: product,
      });
    });

    // Add categories
    categories.forEach((category) => {
      results.push({
        id: `category-${category.documentId}`,
        type: "category",
        documentId: category.documentId,
        name: category.name,
        subtitle: category.description || "Category",
        image: category.image?.data?.attributes?.url
          ? getImageUrl(category.image.data.attributes.url)
          : null,
        data: category,
      });
    });

    // Add brands
    brands.forEach((brand) => {
      results.push({
        id: `brand-${brand.documentId}`,
        type: "brand",
        documentId: brand.documentId,
        name: brand.name,
        subtitle: brand.description || "Brand",
        image: brand.logo?.data?.attributes?.url
          ? getImageUrl(brand.logo.data.attributes.url)
          : null,
        data: brand,
      });
    });

    return results;
  }, [products, categories, brands]);

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return allResults;
    return allResults.filter((r) => r.type === activeFilter.slice(0, -1)); // Remove 's' from filter
  }, [allResults, activeFilter]);

  // Counts for filter tabs
  const counts = useMemo(
    () => ({
      all: allResults.length,
      products: products.length,
      categories: categories.length,
      brands: brands.length,
    }),
    [allResults, products, categories, brands]
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setSearchSubmitted(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchSubmitted(false);
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case "product":
        router.push(`/product/${result.documentId}`);
        break;
      case "category":
        router.push(`/category/${result.documentId}`);
        break;
      case "brand":
        router.push(`/brand/${result.documentId}`);
        break;
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <SearchResultItem
      result={item}
      onPress={() => handleResultPress(item)}
      primaryColor={primaryColor}
      isDark={isDark}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleGoBack}
            iconColor={isDark ? "#fff" : "#000"}
          />
          <Searchbar
            placeholder="Search products, categories, brands..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearchSubmit}
            onClearIconPress={handleClearSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            autoFocus
          />
        </View>

        {/* Filter Tabs */}
        {searchSubmitted && searchQuery.length >= 2 && (
          <View style={styles.filterTabs}>
            {(["all", "products", "categories", "brands"] as FilterTab[]).map(
              (filter) => (
                <Chip
                  key={filter}
                  mode={activeFilter === filter ? "flat" : "outlined"}
                  selected={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && {
                      backgroundColor: primaryColor,
                    },
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    activeFilter === filter && { color: "#fff" },
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} ({counts[filter]})
                </Chip>
              )
            )}
          </View>
        )}

        {/* Results */}
        <View style={styles.resultsContainer}>
          {!searchSubmitted ? (
            <View style={styles.emptyContainer}>
              <IconButton icon="magnify" size={64} iconColor="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Search for products, categories, or brands
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Type at least 2 characters and press enter
              </Text>
            </View>
          ) : searchQuery.length < 2 ? (
            <View style={styles.emptyContainer}>
              <IconButton icon="alert-circle-outline" size={64} iconColor="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Query too short
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Please enter at least 2 characters to search
              </Text>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating color={primaryColor} size="large" />
              <Text variant="bodyMedium" style={{ marginTop: 12 }}>
                Searching...
              </Text>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconButton icon="cart-off" size={64} iconColor="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No results found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Try different keywords or check your spelling
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item.id}
              renderItem={renderResultItem}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider />}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  result: SearchResult;
  onPress: () => void;
  primaryColor: string;
  isDark: boolean;
}

const SearchResultItem = ({
  result,
  onPress,
  primaryColor,
  isDark,
}: SearchResultItemProps) => {
  const typeIcon = {
    product: "package-variant",
    category: "shape-outline",
    brand: "tag-outline",
  };

  const typeLabel = {
    product: "Product",
    category: "Category",
    brand: "Brand",
  };

  return (
    <TouchableOpacity
      style={[styles.resultItem, isDark && styles.resultItemDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.resultImageContainer}>
        {result.image ? (
          <Image
            source={{ uri: result.image }}
            style={styles.resultImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.resultImagePlaceholder, { backgroundColor: primaryColor }]}>
            <Text style={styles.resultImagePlaceholderText}>
              {result.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Chip
            mode="flat"
            compact
            style={[styles.typeChip, { backgroundColor: primaryColor + "20" }]}
            textStyle={[styles.typeChipText, { color: primaryColor }]}
          >
            {typeLabel[result.type]}
          </Chip>
        </View>
        <Text variant="titleMedium" style={styles.resultName} numberOfLines={2}>
          {result.name}
        </Text>
        {result.subtitle && (
          <Text variant="bodySmall" style={styles.resultSubtitle} numberOfLines={1}>
            {result.subtitle}
          </Text>
        )}
        {result.type === "product" && result.price !== undefined && (
          <View style={styles.priceRow}>
            <Text variant="titleMedium" style={styles.price}>
              ₹{result.price.toFixed(0)}
            </Text>
            {result.comparePrice && result.comparePrice > result.price && (
              <Text variant="bodySmall" style={styles.comparePrice}>
                ₹{result.comparePrice.toFixed(0)}
              </Text>
            )}
          </View>
        )}
        {result.type === "product" && result.rating !== undefined && result.rating !== null && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {result.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <IconButton
        icon="chevron-right"
        size={24}
        iconColor={isDark ? "#666" : "#999"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  resultItemDark: {
    backgroundColor: "#1e1e1e",
  },
  resultImageContainer: {
    marginRight: 12,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  resultImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resultImagePlaceholderText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  resultContent: {
    flex: 1,
    justifyContent: "center",
  },
  resultHeader: {
    marginBottom: 4,
  },
  typeChip: {
    height: 24,
    paddingHorizontal: 8,
    width: "auto"
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  resultName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  resultSubtitle: {
    color: "#666",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  comparePrice: {
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  ratingRow: {
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#FFA500",
  },
});
