import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Panel",
          // Custom header styling for admin section (orange theme to stand out)
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Sub-screens for management sections.
          - brands.tsx -> /admin/brands (list)
          - brands/[id].tsx -> /admin/brands/[id] (dynamic form for add/edit, id='new' for create)
          - Explicit registration for titles/headers matches root/_layout.tsx and prevents
            nav issues. Extend later for other sections/customization. */}
      <Stack.Screen name="brands" options={{ title: "Manage Brands" }} />
      {/* Dynamic form route for brands CRUD (reused for add/edit) */}
      <Stack.Screen name="brands/[id]" options={{ title: "Brand Form" }} />
      <Stack.Screen name="categories" options={{ title: "Manage Categories" }} />
      {/* Dynamic form route for categories CRUD (id='new' for create, documentId for edit) */}
      <Stack.Screen name="categories/[id]" options={{ title: "Category Form" }} />
      <Stack.Screen name="products" options={{ title: "Manage Products" }} />
      <Stack.Screen name="products/[id]" options={{ title: "Product Form" }} />
      <Stack.Screen name="orders" options={{ title: "Manage Orders" }} />
      {/* Catch-all for any undefined sub-routes in admin (e.g., mis-nav); matches
          root layout's +not-found handling to avoid crashes. */}
      <Stack.Screen name="+not-found" options={{ title: "Admin Not Found" }} />
    </Stack>
  );
}
