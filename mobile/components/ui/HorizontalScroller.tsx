import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";

interface HorizontalScrollerProps {
  children: React.ReactNode;
  gap?: number;
  contentPaddingHorizontal?: number;
  style?: any;
}

export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  gap = 12,
  contentPaddingHorizontal = 16,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        { gap, paddingHorizontal: contentPaddingHorizontal },
      ]}
      style={style}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
});
