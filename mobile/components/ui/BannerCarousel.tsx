import React, { useRef, useEffect, useState } from "react";
import { View, FlatList, Image, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface BannerCarouselProps {
  banners: { id: string; image: string; title?: string }[];
  intervalMs?: number;
  height?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  intervalMs = 4000,
  height = 150,
}) => {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      const next = (index + 1) % banners.length;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [index, banners.length, intervalMs]);

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={listRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.image }}
            style={[styles.image, { height }]}
          />
        )}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
      />
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View
            key={b.id}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eaeaea",
  },
  image: { width, resizeMode: "cover" },
  dots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: "#fff", width: 18 },
});
