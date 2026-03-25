import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import { useDispatch } from "react-redux";

import { useRecommendations } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import ProductCard from "./ProductCard";
import { addToCart } from "@/reducers/cart.reducer";
import { getImageUrl } from "@/helpers/image";
import { AppDispatch } from "@/store";

export function Recommendations() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const dispatch = useDispatch<AppDispatch>();

  const { data: products = [], isLoading } = useRecommendations();

  const handleAddToCart = (product: { id: string; documentId: string; name: string; price: number; images?: { url: string }[] }) => {
    dispatch(addToCart({
      productId: product.documentId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url ? getImageUrl(product.images[0].url) : "",
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>
          Recommended For You
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={primaryColor} />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Recommended For You
        </Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={[styles.seeAll, { color: primaryColor }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            data={product}
            onPress={(id: string) => router.push(`/product/${id}`)}
            onAddToCart={(id: string) => handleAddToCart(product)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontWeight: "700",
  },
  seeAll: {
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  productCard: {
    width: 160,
  },
});
