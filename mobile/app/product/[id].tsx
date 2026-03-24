import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";

import { Colors } from "@/constants/Colors";
import { useProductByDocumentId, useIsInWishlist, useToggleWishlist } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getImageUrl } from "@/helpers/image";
import { shareProduct } from "@/helpers/share";

const { width } = Dimensions.get("window");

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProductByDocumentId(id || "");

  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Wishlist hooks
  const isInWishlist = useIsInWishlist(id || "");
  const toggleWishlist = useToggleWishlist();

  // Use fields returned from Strapi
  const brandName = product?.brand?.name;
  const categoryName = product?.category?.name;
  const productImages = product?.images || [];
  const attributes = product?.attributeValues || product?.productAttributes || [];
  const stockValue = product?.stockQuantity ?? product?.stock ?? 0;
  const isLowStock =
    !!product && stockValue <= (product.lowStockThreshold || 0);
  const isFeatured = !!product && !!product.isFeatured;

  const handleGoBack = () => {
    router.back();
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", { productId: id, quantity });
    // Implement add to cart logic
  };

  const handleToggleWishlist = () => {
    if (id) {
      toggleWishlist.mutate(id);
    }
  };

  if (isLoading || !product) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Text>Loading product details...</Text>
      </ThemedView>
    );
  }

  const hasCompare =
    product?.comparePrice !== undefined && product.comparePrice > product.price;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          <View style={styles.headerTitleContainer}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.headerTitleText}
            >
              {product.name}
            </Text>
            {brandName ? (
              <Text style={styles.headerBrandText}>{brandName}</Text>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="share-variant"
              size={24}
              onPress={() => shareProduct(id || "", product.name, product.price)}
            />
            <IconButton
              icon={isInWishlist ? "heart" : "heart-outline"}
              iconColor={isInWishlist ? "#FF6B6B" : undefined}
              size={24}
              onPress={handleToggleWishlist}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.carouselContainer}>
            {productImages.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const index = Math.round(offsetX / width);
                  setActiveIndex(index);
                }}
              >
                {productImages.map((img, index) => (
                  <Image
                    key={img.id || index}
                    source={{ uri: getImageUrl(img.url) }}
                    style={styles.carouselImage}
                    contentFit="contain"
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No images available</Text>
              </View>
            )}
            {productImages.length > 1 && (
              <View style={styles.carouselProgressContainer} pointerEvents="none">
                <View style={styles.carouselSegments}>
                  {productImages.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.segment,
                        idx === activeIndex ? styles.activeSegment : null,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.metaRow}>
              {brandName && (
                <Chip style={styles.brandChip} mode="outlined">
                  {brandName}
                </Chip>
              )}
            </View>

            <Text variant="bodyMedium" style={styles.productName}>
              {product.name}
            </Text>

            <View style={styles.priceContainer}>
              {hasCompare ? (
                <>
                  <Text variant="headlineMedium" style={styles.discountPrice}>
                    ₹{product.price.toFixed(2)}
                  </Text>
                  <Text variant="titleMedium" style={styles.originalPrice}>
                    ₹{product.comparePrice?.toFixed(2)}
                  </Text>
                </>
              ) : (
                <Text variant="headlineMedium" style={styles.price}>
                  ₹{product.price.toFixed(2)}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              <Chip
                style={styles.stockChip}
                icon={stockValue > 0 ? "check" : "alert-circle"}
              >
                {stockValue > 0 ? `In stock` : "Out of stock"}
              </Chip>
            </View>

            {categoryName && (
              <Text variant="bodyMedium" style={styles.categoryText}>
                Category: {categoryName}
              </Text>
            )}

            <View style={styles.quantityContainer}>
              <Text variant="titleMedium">Quantity:</Text>
              <View style={styles.quantitySelector}>
                <IconButton
                  icon="minus"
                  size={20}
                  mode="contained"
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                />
                <Text variant="titleMedium" style={styles.quantityText}>
                  {quantity}
                </Text>
                <IconButton
                  icon="plus"
                  size={20}
                  mode="contained"
                  onPress={incrementQuantity}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {product.description}
            </Text>
            <Button
              mode="text"
              onPress={() => setShowFullDescription((s) => !s)}
            >
              {showFullDescription ? "Show less" : "Read more"}
            </Button>

            {!!attributes.length && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Specifications
                </Text>
                <View style={styles.attributesList}>
                  {attributes.map((attr) => (
                    <View key={attr.id} style={styles.attributeRow}>
                      <Text style={styles.attributeName}>
                        {attr.attribute?.name || "Attribute"}
                      </Text>
                      <Text style={styles.attributeValue}>{attr.value}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.quantitySelectorFooter}>
              <IconButton
                icon="minus"
                size={20}
                mode="contained"
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              />
              <Text variant="titleMedium" style={styles.quantityText}>
                {quantity}
              </Text>
              <IconButton
                icon="plus"
                size={20}
                mode="contained"
                onPress={incrementQuantity}
              />
            </View>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              disabled={stockValue <= 0}
            >
              Add to Cart
            </Button>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 4,
    marginRight: 8,
  },
  headerTitleText: {
    fontWeight: "700",
    fontSize: 16,
  },
  headerBrandText: {
    fontSize: 11,
    color: "#666",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  quickPriceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickPrice: {
    fontWeight: "700",
    fontSize: 16,
  },
  quickCompare: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  quickDiscountBadge: {
    marginLeft: 8,
    backgroundColor: "#E53935",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quickDiscountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  quickRating: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  featuredSmall: {
    marginLeft: 8,
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredSmallText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "700",
  },
  lowStockSmall: {
    marginLeft: 8,
    backgroundColor: "#FFA500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockSmallText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  carouselIndicator: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "rgba(0,0,0,0.8)",
    width: 10,
    height: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    padding: 16,
  },
  brandChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  productName: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontWeight: "bold",
  },
  discountPrice: {
    fontWeight: "bold",
    color: "#E53935",
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    marginLeft: 8,
  },
  discount: {
    marginLeft: 8,
    backgroundColor: "#E53935",
    color: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  stockInfo: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addToCartButton: {
    borderRadius: 8,
  },
  carouselContainer: {
    width: width,
    height: width * 0.9,
    backgroundColor: "#ffffff",
  },
  carouselImage: {
    width: width,
    height: width * 0.9,
  },
  noImageContainer: {
    width: width,
    height: width * 0.9,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 16,
    color: "#999",
  },
  carouselProgressContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  carouselSegments: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  segment: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  activeSegment: {
    backgroundColor: "#007AFF",
    width: 20,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  stockChip: {
    alignSelf: "flex-end",
  },
  attributesList: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    padding: 8,
  },
  attributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  attributeName: {
    color: "#555",
  },
  attributeValue: {
    color: "#111",
    fontWeight: "600",
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantitySelectorFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
});
