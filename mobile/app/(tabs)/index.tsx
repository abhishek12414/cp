import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { ActivityIndicator, Avatar, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { BannerCarousel } from "@/components/ui/BannerCarousel";
import BrandCard from "@/components/ui/BrandCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { OrderUploadButton } from "@/components/ui/OrderUploadButton";
import { Recommendations } from "@/components/ui/Recommendations";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { TrendingCategoryItem } from "@/components/ui/TrendingCategoryItem";
import CartIcon from "@/components/ui/CartIcon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

// Import mock data for initial development
import { useCategories } from "@/hooks/queries";
import { useBrand } from "@/hooks/queries/useBrand";
import { BrandInterface, CategoryInterface } from "@/interface";
import { services, trendingCategories } from "@/mock/products";

export default function HomeScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const bottomTabOverflow = useBottomTabOverflow();

  // React Query hooks would replace these when connecting to real API
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();

  const { data: brandsData, isLoading: isLoadingBrands } = useBrand();

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleCategoryPress = (category: CategoryInterface) => {
    router.push(`/category/${category.documentId}`);
  };

  const handleBrandPress = (documentId: BrandInterface["documentId"]) => {
    // Navigate to brand details screen
    router.push(`/brand/${documentId}`);
  };

  const handleUploadOrder = () => {
    // Navigate to order upload screen
    router.push("/upload-order");
  };

  const handleCartPress = () => {
    router.push("/cart");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text variant="titleMedium" style={styles.brandName}>
              CurrentShop
            </Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => {}}>
              <Avatar.Icon size={32} icon="bell-outline" style={styles.iconBtn} />
            </TouchableOpacity>
            <CartIcon onPress={handleCartPress} color="#333" size={24} />
          </View>
        </View>
        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.8}>
          <View pointerEvents="none">
            <Searchbar
              placeholder="Search for electrical products..."
              value=""
              style={styles.searchBar}
            />
          </View>
        </TouchableOpacity>
        <Text variant="labelSmall" style={styles.location}>
          Deliver to: New York 10001 • Change
        </Text>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomTabOverflow + 24 },
          ]}
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

          {/* Personalized Recommendations */}
          <Recommendations />

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
  scrollView: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
  },
  location: { marginHorizontal: 16, marginTop: 6, color: "#007AFF" },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 12,
    gap: 4,
  },
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
