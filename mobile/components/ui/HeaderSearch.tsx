import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useThemeColor } from "../../hooks/useThemeColor";

type HeaderSearchProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export function HeaderSearch({
  placeholder = "Search products...",
  onSearch,
}: HeaderSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const router = useRouter();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default search route
      router.push({
        pathname: "/search",
        params: { query: searchQuery },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[
          styles.searchBar,
          { backgroundColor: colorScheme === "light" ? "#F5F5F5" : "#333" },
        ]}
        inputStyle={styles.input}
        iconColor={Colors[colorScheme].primary}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    borderRadius: 8,
    elevation: 0,
  },
  input: {
    fontSize: 16,
  },
});
