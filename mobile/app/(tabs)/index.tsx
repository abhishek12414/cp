import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "../../components/ThemedView";
import { BannerCarousel } from "../../components/ui/BannerCarousel";
import BrandCard from "../../components/ui/BrandCard";
import { CategoryCard } from "../../components/ui/CategoryCard";
import { DealCard } from "../../components/ui/DealCard";
import { HorizontalScroller } from "../../components/ui/HorizontalScroller";
import { OrderUploadButton } from "../../components/ui/OrderUploadButton";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { ServiceCard } from "../../components/ui/ServiceCard";
import { SmallProductStripItem } from "../../components/ui/SmallProductStripItem";
import { TrendingCategoryItem } from "../../components/ui/TrendingCategoryItem";
import { Colors } from "../../constants/Colors";
import { useThemeColor } from "../../hooks/useThemeColor";

// Import mock data for initial development
import { useCategories, useProducts } from "@/hooks/queries";
import { useBrand } from "@/hooks/queries/useBrand";
import { BrandInterface, CategoryInterface } from "@/interface";
import {
  deals,
  products,
  recentlyViewed,
  recommendedProducts,
  services,
  trendingCategories,
} from "../../mock/products";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // React Query hooks would replace these when connecting to real API
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();

  const { data: brandsData, isLoading: isLoadingBrands } = useBrand();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({});

  const { data: featuredProducts } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => Promise.resolve(products),
    initialData: products,
  });

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryPress = (category: CategoryInterface) => {
    router.push(`/category/${category.documentId}`);
  };

  const handleBrandPress = (id: BrandInterface["id"]) => {
    // Navigate to brand details screen
    // Brand page not implemented yet, so stay on current page
    console.log("Brand pressed:", id);
    // Will implement later: router.push(`/brand/${id}`);
  };

  const handleProductPress = (id: string) => {
    // Navigate to product details screen
    router.push(`/product/${id}`);
  };

  const handleAddToCart = (id: string) => {
    // Add product to cart logic
    console.log("Add to cart:", id);
  };

  const handleAddToWishlist = (id: string) => {
    // Add product to wishlist logic
    console.log("Add to wishlist:", id);
  };

  const handleUploadOrder = () => {
    // Navigate to order upload screen
    router.push("/upload-order");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text variant="titleMedium" style={styles.brandName}>
              CurrentShop
            </Text>
          </View>
          <View style={styles.actionsRow}>
            <Avatar.Icon size={32} icon="bell-outline" style={styles.iconBtn} />
            <Avatar.Icon size={32} icon="cart-outline" style={styles.iconBtn} />
          </View>
        </View>
        <Searchbar
          placeholder="Search for electrical products..."
          onChangeText={onSearchChange}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Text variant="labelSmall" style={styles.location}>
          Deliver to: New York 10001 • Change
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Carousel */}
          <BannerCarousel
            banners={[
              {
                id: "b1",
                image:
                  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200",
              },
              {
                id: "b2",
                image:
                  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200",
              },
              {
                id: "b3",
                image:
                  "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=1200",
              },
            ]}
            height={150}
          />

          {/* Quick Categories (icon cards reuse CategoryCard horizontally) */}
          <SectionHeader title="Quick Categories" />
          {isLoadingCategories ? (
            <ActivityIndicator animating color={primaryColor} />
          ) : (
            <HorizontalScroller>
              {categoriesData?.slice(0, 8).map((data) => (
                <CategoryCard
                  key={data.id}
                  data={data}
                  onPress={handleCategoryPress}
                />
              ))}
            </HorizontalScroller>
          )}

          {/* Popular Brands */}
          <SectionHeader title="Popular Brands" onPressAction={() => {}} />
          {isLoadingBrands ? (
            <ActivityIndicator animating color={primaryColor} />
          ) : (
            <HorizontalScroller>
              {brandsData?.map((brand) => (
                <BrandCard
                  key={brand.id}
                  data={brand}
                  onPress={handleBrandPress}
                />
              ))}
            </HorizontalScroller>
          )}

          {/* Today's Deals */}
          <SectionHeader title="Today's Deals" />
          <HorizontalScroller>
            {deals.map((d) => (
              <DealCard
                key={d.id}
                id={d.id}
                title={d.title}
                subtitle={d.subtitle}
                badge={d.badge}
                image={d.image}
              />
            ))}
          </HorizontalScroller>

          {/* Trending Categories */}
          <SectionHeader title="Trending Categories" onPressAction={() => {}} />
          <View style={styles.trendingList}>
            {trendingCategories.map((tc) => (
              <TrendingCategoryItem
                key={tc.id}
                id={tc.id}
                name={tc.name}
                productsCount={tc.productsCount}
                trend={tc.trend}
                icon={tc.icon}
              />
            ))}
          </View>

          {/* Featured Products (grid) */}
          <SectionHeader title="Featured Products" onPressAction={() => {}} />
          {isLoadingProducts ? (
            <ActivityIndicator animating color={primaryColor} />
          ) : (
            <View style={styles.productsGrid}>
              {/* {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  image={product.image}
                  brand={brands.find((b) => b.id === product.brandId)?.name}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))} */}
            </View>
          )}

          {/* Recently Viewed */}
          <SectionHeader title="Recently Viewed" />
          <HorizontalScroller>
            {recentlyViewed.map((p) => (
              <SmallProductStripItem
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
              />
            ))}
          </HorizontalScroller>

          {/* Recommended */}
          <SectionHeader title="Recommended for You" />
          <HorizontalScroller>
            {recommendedProducts.map((p) => (
              <SmallProductStripItem
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
              />
            ))}
          </HorizontalScroller>

          {/* Services */}
          <SectionHeader title="Our Services" />
          <HorizontalScroller>
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                id={s.id}
                icon={s.icon}
                title={s.title}
                subtitle={s.subtitle}
              />
            ))}
          </HorizontalScroller>

          <OrderUploadButton onPress={handleUploadOrder} />
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
  searchBar: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
  },
  location: { marginHorizontal: 16, marginTop: 6, color: "#007AFF" },
  scrollContent: { paddingBottom: 48, paddingTop: 12, gap: 4 },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  trendingList: { paddingHorizontal: 16, marginTop: 4 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  brandRow: { flexDirection: "column" },
  brandName: { fontWeight: "700" },
  allCategories: { color: "#007AFF", marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 8 },
  iconBtn: { backgroundColor: "#F2F4F7" },
});
