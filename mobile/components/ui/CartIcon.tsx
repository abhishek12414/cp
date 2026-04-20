import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Badge } from "react-native-paper";

import { useCartCount } from "@/hooks/queries/useCart";
import { Colors } from "@/constants/Colors";

interface CartIconProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export const CartIcon: React.FC<CartIconProps> = ({ onPress, color = "#000", size = 24 }) => {
  const { count } = useCartCount();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={[styles.icon, { fontSize: size, color }]}>🛒</Text>
        {count > 0 && (
          <Badge style={[styles.badge, { backgroundColor: Colors.light.primary }]} size={18}>
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  iconWrapper: {
    position: "relative",
  },
  icon: {
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    fontWeight: "700",
  },
});

export default CartIcon;
