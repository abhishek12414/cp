import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { getImageUrl } from "@/helpers/image";
import { BrandInterface } from "@/interface";

export type BrandCardProps = {
  data: BrandInterface;
  onPress: (documentId: BrandInterface["documentId"]) => void;
};

const BrandCard = ({ data, onPress }: BrandCardProps) => {
  const imageUri = getImageUrl(data.logo?.url || "");

  return (
    <TouchableOpacity
      onPress={() => onPress(data.documentId)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Open brand ${data.name}`}
      style={styles.container}
    >
      <View style={styles.background}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.logo} contentFit="contain" />
        ) : (
          <Text variant="headlineSmall" style={styles.placeholderText}>
            {data.name?.charAt(0) || "?"}
          </Text>
        )}
      </View>

      <Text variant="labelMedium" style={styles.name} numberOfLines={1}>
        {data.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: "#666" },
  name: { marginTop: 2, textAlign: "center" },
  background: {
    width: 64,
    height: 64,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 52,
    height: 52,
  },
});

export default BrandCard;
