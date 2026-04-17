import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View, Alert } from "react-native";
import { Button, Chip, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useProductByDocumentId, useIsInWishlist, useToggleWishlist, useIsInCart } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getImageUrl } from "@/helpers/image";
import { shareProduct } from "@/helpers/share";
import AddToCartModal from "@/components/ui/AddToCartModal";
import CartIcon from "@/components/ui/CartIcon";

const { width } = Dimensions.get("window");

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProductByDocumentId(id || "");

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Wishlist hooks
  const isInWishlist = useIsInWishlist(id || "");
  const toggleWishlist = useToggleWishlist();

  // Cart hooks
  const { isInCart, quantity: cartQuantity } = useIsInCart(id || "");

  // Use fields returned from Strapi
  const brandName = product?.brand?.name;
  const categoryName = product?.category?.name;
  const productImages = product?.images || [];
  const attributes = product?.attributeValues || product?.productAttributes || [];
  const stockValue = product?.stockQuantity ?? product?.stock ?? 0;
  const isLowStock = stockValue > 0 && stockValue <= 5;
  const isFeatured = !!product && !!product.isFeatured;

  const handleGoBack = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (stockValue <= 0) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }
    setShowCartModal(true);
  };

  const handleToggleWishlist = () => {
    if (id) {
      toggleWishlist.mutate(id);
    }
  };

  const handleViewCart = () => {
    router.push("/cart");
  };

  const handleCartPress = () => {
    router.push("/cart");
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
            <CartIcon onPress={handleCartPress} color="#333" size={22} />
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
                    source={{ uri: getImageUrl(img.url) || undefined }}
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
              {isFeatured && (
                <Chip style={styles.featuredChip} mode="flat">
                  Featured
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
                    ₹{product.price.toFixed(0)}
                  </Text>
                  <Text variant="titleMedium" style={styles.originalPrice}>
                    ₹{product.comparePrice?.toFixed(0)}
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
                    </Text>
                  </View>
                </>
              ) : (
                <Text variant="headlineMedium" style={styles.price}>
                  ₹{product.price.toFixed(0)}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              <Chip
                style={[styles.stockChip, stockValue <= 0 && styles.outOfStockChip]}
                icon={stockValue > 0 ? "check" : "alert-circle"}
              >
                {stockValue > 0 ? `In stock` : "Out of stock"}
              </Chip>
            </View>

            {isLowStock && (
              <Text style={styles.lowStockWarning}>
                Only {stockValue} left in stock - order soon!
              </Text>
            )}

            {isInCart && (
              <View style={styles.inCartBanner}>
                <Text style={styles.inCartText}>
                  {cartQuantity} already in your cart
                </Text>
                <Button
                  mode="text"
                  compact
                  onPress={handleViewCart}
                  textColor={primaryColor}
                >
                  View Cart
                </Button>
              </View>
            )}

            {categoryName && (
              <Text variant="bodyMedium" style={styles.categoryText}>
                Category: {categoryName}
              </Text>
            )}

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {product.description || "No description available."}
            </Text>
            {product.description && product.description.length > 100 && (
              <Button
                mode="text"
                onPress={() => setShowFullDescription((s) => !s)}
              >
                {showFullDescription ? "Show less" : "Read more"}
              </Button>
            )}

            {!!attributes.length && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Specifications
                </Text>
                <View style={styles.attributesList}>
                  {attributes.map((attr) => {
                    const attrName = 'name' in attr.attribute 
                      ? attr.attribute.name 
                      : attr.attribute.data?.name || "Attribute";
                    return (
                      <View key={attr.id} style={styles.attributeRow}>
                        <Text style={styles.attributeName}>
                          {attrName}
                        </Text>
                        <Text style={styles.attributeValue}>{attr.value}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            buttonColor={primaryColor}
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            disabled={stockValue <= 0}
          >
            {stockValue <= 0 ? "Out of Stock" : isInCart ? "Add More to Cart" : "Add to Cart"}
          </Button>
        </View>
      </SafeAreaView>

      {/* Add to Cart Modal */}
      <AddToCartModal
        visible={showCartModal}
        product={product}
        onClose={() => setShowCartModal(false)}
        onSuccess={() => {
          // Optional: Show success message or navigate
        }}
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
  scrollContent: {
    paddingBottom: 24,
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
  detailsContainer: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  brandChip: {
    alignSelf: "flex-start",
  },
  featuredChip: {
    backgroundColor: "#FFD700",
  },
  productName: {
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 18,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
  discountBadge: {
    marginLeft: 8,
    backgroundColor: "#E53935",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stockChip: {
    backgroundColor: "#E8F5E9",
  },
  outOfStockChip: {
    backgroundColor: "#FFEBEE",
  },
  lowStockWarning: {
    color: "#FF9500",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  inCartBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  inCartText: {
    color: "#1976D2",
    fontWeight: "500",
  },
  categoryText: {
    marginBottom: 16,
    color: "#666",
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
    color: "#333",
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  addToCartButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
});
