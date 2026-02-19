import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import { ProductInterface } from "@/interface";

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
  const image =
    images?.[0]?.url || "https://via.placeholder.com/180x180?text=No+Image";
  const discountPrice = comparePrice;
  const hasDiscount =
    discountPrice !== undefined && discountPrice < price && discountPrice > 0;
  const isLowStock = stock <= (lowStockThreshold || 0);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(documentId)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: image }} style={styles.image} />
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
      {onAddToWishlist && (
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => onAddToWishlist(documentId)}
        >
          <IconButton icon="heart-outline" iconColor="#fff" size={20} />
        </TouchableOpacity>
      )}
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
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#f5f5f5",
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
