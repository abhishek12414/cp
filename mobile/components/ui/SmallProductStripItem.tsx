import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";

interface SmallProductStripItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  onPress?: (id: string) => void;
}

export const SmallProductStripItem: React.FC<SmallProductStripItemProps> = ({
  id,
  title,
  price,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => onPress?.(id)}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text numberOfLines={1} variant="bodySmall" style={styles.title}>
          {title}
        </Text>
        <Text variant="labelSmall" style={styles.price}>
          ${price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 84, marginRight: 12 },
  image: {
    width: 84,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  info: { marginTop: 6 },
  title: { fontWeight: "500" },
  price: { color: "#007AFF", fontWeight: "600", marginTop: 2 },
});
