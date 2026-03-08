import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export type OrderUploadButtonProps = {
  onPress: () => void;
};

export function OrderUploadButton({ onPress }: OrderUploadButtonProps) {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const textColor = "#FFF";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: primaryColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={24} color={textColor} />
        </View>
        <View style={styles.textContainer}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: textColor }]}
          >
            Upload Purchase Order
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.subtitle, { color: textColor }]}
          >
            Take a photo of your order form
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    opacity: 0.9,
  },
});
