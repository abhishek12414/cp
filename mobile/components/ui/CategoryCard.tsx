import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { getImageUrl } from "@/helpers/image";
import { CategoryInterface } from "@/interface";

export type CategoryCardProps = {
  data: CategoryInterface;
  onPress: (category: CategoryInterface) => void;
};

export function CategoryCard({ data, onPress }: CategoryCardProps) {
  const imageUri = getImageUrl(data.image?.url || "");

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(data)} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text variant="headlineSmall" style={styles.placeholderText}>
              {data.name?.charAt(0) || "?"}
            </Text>
          </View>
        )}
      </View>
      <Text variant="labelMedium" style={styles.name} numberOfLines={2}>
        {data.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: "center",
    marginRight: 12,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F3F5",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9ECEF",
  },
  placeholderText: {
    color: "#ADB5BD",
    fontWeight: "bold",
  },
  name: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
    paddingHorizontal: 4,
  },
});
