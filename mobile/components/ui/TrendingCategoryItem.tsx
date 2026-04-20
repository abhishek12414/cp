import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface TrendingCategoryItemProps {
  id: string;
  name: string;
  productsCount?: number;
  trend?: string; // e.g. '+23%'
  icon?: string;
  onPress?: (id: string) => void;
}

export const TrendingCategoryItem: React.FC<TrendingCategoryItemProps> = ({
  id,
  name,
  productsCount,
  trend,
  icon = "flash",
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.85} onPress={() => onPress?.(id)}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={18} color="#007AFF" />
        </View>
        <View>
          <Text variant="bodyMedium" style={styles.name}>
            {name}
          </Text>
          {productsCount !== undefined && (
            <Text variant="labelSmall" style={styles.count}>
              {productsCount.toLocaleString()} products
            </Text>
          )}
        </View>
      </View>
      {trend && (
        <Text variant="labelSmall" style={styles.trend}>
          {trend}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  name: { fontWeight: "600" },
  count: { color: "#666", marginTop: 2 },
  trend: { color: "#18A558", fontWeight: "600" },
});
