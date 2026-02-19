import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";

interface DealCardProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string; // e.g. '25% OFF'
  image: string;
  onPress?: (id: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  id,
  title,
  subtitle,
  badge,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={() => onPress?.(id)}
    >
      <Image source={{ uri: image }} style={styles.image} />
      {badge && (
        <View style={styles.badge}>
          <Text variant="labelSmall" style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text numberOfLines={2} variant="bodyMedium" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="labelSmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 90,
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontWeight: "700" },
  info: { padding: 8 },
  title: { fontWeight: "600" },
  subtitle: { marginTop: 2, color: "#666" },
});
