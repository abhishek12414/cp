import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  Chip,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ui/ProductCard";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useBrandByDocumentId,
  useBrandCategories,
  useBrandCategoryProducts,
  useBrandFeaturedProducts,
} from "@/hooks/queries/useBrand";
import { getImageUrl } from "@/helpers/image";
import { CategoryInterface, ProductInterface } from "@/interface";

const { width } = Dimensions.get("window");
const CATEGORY_TAB_HEIGHT = 48;
const GALLERY_HEIGHT = 280;

export default function BrandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";

  // Fetch brand data
  const { data: brand, isLoading: isLoadingBrand } = useBrandByDocumentId(id || "");
  const { data: featuredProducts, isLoading: isLoadingFeatured } =
    useBrandFeaturedProducts(id || "");
  const { data: categories, isLoading: isLoadingCategories } = useBrandCategories(id || "");

  // State for selected category and expanded sections
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadedCategoryProducts, setLoadedCategoryProducts] = useState<Set<string>>(new Set());

  // Track section visibility for lazy loading
  const [galleryVisible, setGalleryVisible] = useState(true);
  const categoryScrollRef = useRef<ScrollView>(null);

  // Get currently selected category
  const selectedCategory = categories?.[selectedCategoryIndex];

  // Lazy load products for selected category
  const { data: categoryProducts, isLoading: isLoadingCategoryProducts } =
    useBrandCategoryProducts(
      id || "",
      selectedCategory?.documentId || "",
      !!selectedCategory
    );

  // Pre-load products for categories that are expanded
  useEffect(() => {
    if (categories) {
      // Auto-expand first category and load its products
      if (categories.length > 0 && expandedCategories.size === 0) {
        setExpandedCategories(new Set([categories[0].documentId]));
        setLoadedCategoryProducts(new Set([categories[0].documentId]));
      }
    }
  }, [categories]);

  // Gallery images from featured products
  const galleryImages = useMemo(() => {
    if (!featuredProducts || featuredProducts.length === 0) {
      return [
        {
          id: "placeholder",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
        },
      ];
    }
    return featuredProducts
      .filter((p) => p.images && p.images.length > 0)
      .slice(0, 5)
      .map((p) => ({
        id: p.documentId,
        image: getImageUrl(p.images![0].url) || "",
        product: p,
      }));
  }, [featuredProducts]);

  const handleGoBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
  };

  const handleCategoryPress = (index: number) => {
    setSelectedCategoryIndex(index);
    categoryScrollRef.current?.scrollTo({
      x: index * (width - 32),
      animated: true,
    });
    // Mark this category's products as needing to be loaded
    const categoryDocId = categories?.[index]?.documentId;
    if (categoryDocId) {
      setLoadedCategoryProducts((prev) => new Set([...prev, categoryDocId]));
    }
  };

  const toggleCategoryExpand = (categoryDocId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryDocId)) {
        next.delete(categoryDocId);
      } else {
        next.add(categoryDocId);
        setLoadedCategoryProducts((prev) => new Set([...prev, categoryDocId]));
      }
      return next;
    });
  };

  if (isLoadingBrand) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={primaryColor} size="large" />
        <Text style={{ marginTop: 12 }}>Loading brand...</Text>
      </ThemedView>
    );
  }

  if (!brand) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <IconButton icon="alert-circle" size={48} />
        <Text>Brand not found</Text>
        <IconButton icon="arrow-left" onPress={handleGoBack} />
      </ThemedView>
    );
  }

  const brandLogoUri = getImageUrl(brand.logo?.data?.attributes?.url);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleGoBack}
            iconColor={isDark ? "#fff" : "#000"}
          />
          <View style={styles.headerTitleContainer}>
            {brandLogoUri ? (
              <Image
                source={{ uri: brandLogoUri }}
                style={styles.headerLogo}
                contentFit="contain"
              />
            ) : (
              <Text variant="titleLarge" style={styles.headerTitle}>
                {brand.name}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="share-variant"
              size={22}
              iconColor={isDark ? "#fff" : "#000"}
            />
            <IconButton
              icon="heart-outline"
              size={22}
              iconColor={isDark ? "#fff" : "#000"}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Gallery Carousel */}
          <View style={styles.galleryContainer}>
            <GalleryCarousel images={galleryImages} />
            {/* Brand overlay - using View with gradient-like background */}
            <View style={styles.galleryOverlay}>
              <View style={styles.brandInfoOverlay}>
                {brandLogoUri && (
                  <Image
                    source={{ uri: brandLogoUri }}
                    style={styles.brandLogoLarge}
                    contentFit="contain"
                  />
                )}
                <Text variant="headlineSmall" style={styles.brandNameOverlay}>
                  {brand.name}
                </Text>
                {brand.description && (
                  <Text
                    variant="bodyMedium"
                    style={styles.brandDescription}
                    numberOfLines={2}
                  >
                    {brand.description}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {categories?.length || 0}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                Categories
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {featuredProducts?.length || 0}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                Products
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                4.5
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                Rating
              </Text>
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Shop by Category
            </Text>
            {isLoadingCategories ? (
              <ActivityIndicator animating color={primaryColor} />
            ) : categories && categories.length > 0 ? (
              <View style={styles.categoriesContainer}>
                {categories.map((category, index) => (
                  <CategorySection
                    key={category.documentId}
                    category={category}
                    brandDocumentId={id || ""}
                    isExpanded={expandedCategories.has(category.documentId)}
                    onToggle={() => toggleCategoryExpand(category.documentId)}
                    onProductPress={handleProductPress}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    shouldLoad={loadedCategoryProducts.has(category.documentId)}
                    primaryColor={primaryColor}
                    isDark={isDark}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text variant="bodyMedium">No categories available</Text>
              </View>
            )}
          </View>

          {/* Featured Products Section */}
          {featuredProducts && featuredProducts.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Featured Products
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredProductsScroll}
              >
                {featuredProducts.slice(0, 6).map((product) => (
                  <View key={product.documentId} style={styles.featuredProductCard}>
                    <ProductCard
                      data={product}
                      onPress={handleProductPress}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// Gallery Carousel Component
interface GalleryCarouselProps {
  images: Array<{ id: string; image: string; product?: ProductInterface }>;
}

const GalleryCarousel = ({ images }: GalleryCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, images.length]);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.image }}
            style={styles.galleryImage}
            contentFit="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View style={styles.carouselDots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.carouselDot, i === activeIndex && styles.carouselDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Category Section Component with Lazy Loading
interface CategorySectionProps {
  category: CategoryInterface;
  brandDocumentId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onProductPress: (id: string) => void;
  onAddToCart: (id: string) => void;
  onAddToWishlist: (id: string) => void;
  shouldLoad: boolean;
  primaryColor: string;
  isDark: boolean;
}

const CategorySection = ({
  category,
  brandDocumentId,
  isExpanded,
  onToggle,
  onProductPress,
  onAddToCart,
  onAddToWishlist,
  shouldLoad,
  primaryColor,
  isDark,
}: CategorySectionProps) => {
  const { data: products, isLoading } = useBrandCategoryProducts(
    brandDocumentId,
    category.documentId,
    shouldLoad
  );

  const categoryImageUri = getImageUrl(category.image?.data?.attributes?.url);

  return (
    <Surface
      style={[styles.categoryCard, isDark && styles.categoryCardDark]}
      elevation={isExpanded ? 3 : 1}
    >
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.categoryHeaderLeft}>
          {categoryImageUri ? (
            <Image
              source={{ uri: categoryImageUri }}
              style={styles.categoryImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.categoryImagePlaceholder, { backgroundColor: primaryColor }]}>
              <Text style={styles.categoryImagePlaceholderText}>
                {category.name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.categoryInfo}>
            <Text variant="titleMedium" style={styles.categoryName}>
              {category.name}
            </Text>
            <Text variant="labelSmall" style={styles.categoryProductCount}>
              {products?.length || "..."} products
            </Text>
          </View>
        </View>
        <IconButton
          icon={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          iconColor={isDark ? "#fff" : "#333"}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.categoryContent}>
          {isLoading ? (
            <View style={styles.loadingProducts}>
              <ActivityIndicator animating color={primaryColor} />
              <Text variant="bodySmall" style={{ marginTop: 8 }}>
                Loading products...
              </Text>
            </View>
          ) : products && products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.slice(0, 4).map((product) => (
                <View key={product.documentId} style={styles.productCardWrapper}>
                  <ProductCard
                    data={product}
                    onPress={onProductPress}
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noProducts}>
              <Text variant="bodyMedium">No products in this category</Text>
            </View>
          )}
          {products && products.length > 4 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push(`/category/${category.documentId}`)}
            >
              <Text style={[styles.viewAllText, { color: primaryColor }]}>
                View all {products.length} products
              </Text>
              <IconButton icon="arrow-right" size={16} iconColor={primaryColor} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Surface>
  );
};

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerLogo: {
    width: 80,
    height: 32,
  },
  headerTitle: {
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  galleryContainer: {
    height: GALLERY_HEIGHT,
    position: "relative",
  },
  carouselContainer: {
    flex: 1,
  },
  galleryImage: {
    width: width,
    height: GALLERY_HEIGHT,
  },
  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  brandInfoOverlay: {
    padding: 16,
    alignItems: "center",
  },
  brandLogoLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  brandNameOverlay: {
    color: "#fff",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  brandDescription: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  carouselDots: {
    position: "absolute",
    bottom: 130,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  carouselDotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    color: "#666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  categoryCardDark: {
    backgroundColor: "#1e1e1e",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  categoryImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryImagePlaceholderText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  categoryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
  },
  categoryProductCount: {
    color: "#666",
    marginTop: 2,
  },
  categoryContent: {
    padding: 12,
    paddingTop: 0,
  },
  loadingProducts: {
    paddingVertical: 24,
    alignItems: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCardWrapper: {
    width: "50%",
    padding: 4,
  },
  noProducts: {
    paddingVertical: 24,
    alignItems: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontWeight: "600",
  },
  featuredProductsScroll: {
    paddingRight: 16,
    gap: 8,
  },
  featuredProductCard: {
    width: width * 0.5,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
