import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";

export type CategoryCardProps = {
  id: string;
  name: string;
  image: string;
  onPress: (id: string) => void;
};

export function CategoryCard({ id, name, image, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <Text variant="bodyMedium" style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: "#f5f5f5",
  },
  name: {
    padding: 12,
    paddingTop: 10,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    minHeight: 50,
  },
});
