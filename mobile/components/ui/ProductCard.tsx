import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { Image } from "expo-image";

import { ProductInterface } from "@/interface";
import { getImageUrl } from "@/helpers/image";
import { shareProduct } from "@/helpers/share";
import { useIsInWishlist, useToggleWishlist } from "@/hooks/queries";

const { width } = Dimensions.get("window");

export type ProductCardProps = {
  data: ProductInterface;
  onPress: (id: string) => void;
  onAddToCart: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
};

const ProductCard = ({
  data,
  onPress,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) => {
  const {
    documentId,
    id,
    name,
    price,
    comparePrice,
    brand,
    images,
    rating,
    reviewCount,
    isFeatured,
    stock,
    lowStockThreshold,
  } = data;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productImages = images || [];
  const hasMultipleImages = productImages.length > 1;
  const discountPrice = comparePrice;
  const hasDiscount =
    discountPrice !== undefined && discountPrice < price && discountPrice > 0;
  const stockValue = data.stockQuantity ?? stock ?? 0;
  const isLowStock = stockValue <= (lowStockThreshold || 0);

  // Wishlist hooks
  const isInWishlist = useIsInWishlist(documentId);
  const toggleWishlist = useToggleWishlist();

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (width * 0.5 - 24));
    setActiveImageIndex(Math.max(0, Math.min(index, productImages.length - 1)));
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(documentId)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {productImages.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              style={styles.imageScrollView}
            >
              {productImages.map((img, index) => (
                <View key={img.id || index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: getImageUrl(img.url) }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
              ))}
            </ScrollView>
            {hasMultipleImages && (
              <View style={styles.imageIndicators}>
                {productImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      index === activeImageIndex && styles.activeIndicatorDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: "https://via.placeholder.com/180x180?text=No+Image" }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      {isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {Math.round(((price - discountPrice) / price) * 100)}% OFF
          </Text>
        </View>
      )}
      {isLowStock && (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Low Stock</Text>
        </View>
      )}
      {/* Wishlist Button */}
      <TouchableOpacity
        style={styles.wishlistBtn}
        onPress={() => toggleWishlist.mutate(documentId)}
      >
        <IconButton 
          icon={isInWishlist ? "heart" : "heart-outline"} 
          iconColor={isInWishlist ? "#FF6B6B" : "#fff"} 
          size={20} 
        />
      </TouchableOpacity>
      {/* Share Button */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={() => shareProduct(documentId, name, price)}
      >
        <IconButton icon="share-variant" iconColor="#fff" size={20} />
      </TouchableOpacity>

      <View style={styles.content}>
        {brand && <Text style={styles.brand}>{brand.name}</Text>}
        <Text numberOfLines={2} style={styles.title}>
          {name}
        </Text>
        {rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}>({reviewCount} reviews)</Text>
          </View>
        )}
        <View style={styles.priceRow}>
          {hasDiscount ? (
            <>
              <Text style={styles.discountPrice}>
                ₹{discountPrice.toFixed(0)}
              </Text>
              <Text style={styles.originalPrice}>₹{price.toFixed(0)}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{price.toFixed(0)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => onAddToCart(documentId)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const CARD_WIDTH = width * 0.5 - 24;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    maxWidth: CARD_WIDTH,
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  imageScrollView: {
    flex: 1,
  },
  imageWrapper: {
    width: CARD_WIDTH,
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  activeIndicatorDot: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  featuredText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  discountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  lowStockBadge: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  lowStockText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    zIndex: 10,
  },
  shareBtn: {
    position: "absolute",
    top: 4,
    right: 48,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    zIndex: 10,
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFA500",
    marginRight: 4,
  },
  reviewText: {
    fontSize: 12,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ProductCard;

