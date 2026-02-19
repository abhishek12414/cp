import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface ServiceCardProps {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: (id: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  icon,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(id)}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={22} color="#007AFF" />
      </View>
      <Text variant="bodyMedium" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="labelSmall" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontWeight: "600" },
  subtitle: { marginTop: 4, color: "#666" },
});
