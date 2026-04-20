import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWishlist } from "@/hooks/queries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { logout } from "@/reducers/auth.reducer";

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string | number;
  onPress: () => void;
}

const MenuItem = ({ icon, label, subtitle, badge, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <IconButton icon={icon} size={24} iconColor="#666" style={styles.menuIcon} />
      <View style={styles.menuItemText}>
        <Text variant="bodyLarge" style={styles.menuLabel}>
          {label}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <IconButton icon="chevron-right" size={20} iconColor="#999" />
    </View>
  </TouchableOpacity>
);

export default function AccountScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const isDark = colorScheme === "dark";
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const { data: wishlistItems = [] } = useWishlist();

  const displayName =
    user?.name || user?.username || (user?.email ? user.email.split("@")[0] : "User");
  const avatarLabel = displayName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              My Account.
            </Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Avatar.Text
              size={68}
              label={avatarLabel}
              style={[styles.avatar, { backgroundColor: primaryColor }]}
              labelStyle={{ color: "#fff", fontWeight: "700" }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={styles.profileName}>
                {displayName}
              </Text>
              {user?.email && (
                <Text variant="bodyMedium" style={styles.profileDetail}>
                  {user.email}
                </Text>
              )}
              {user?.phone && (
                <Text variant="bodyMedium" style={styles.profileDetail}>
                  +91 {user.phone}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => console.log("Edit Profile")}>
              <IconButton icon="pencil" size={20} iconColor={primaryColor} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/wishlist")}>
              <Text variant="titleMedium" style={[styles.statNumber, { color: primaryColor }]}>
                {wishlistItems.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Wishlist
              </Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/orders")}>
              <Text variant="titleMedium" style={[styles.statNumber, { color: primaryColor }]}>
                {/* Dynamic count can be added later */}0
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Orders
              </Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push("/addresses")}>
              <Text variant="titleMedium" style={[styles.statNumber, { color: primaryColor }]}>
                0
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Addresses
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionHeader}>
              ACCOUNT
            </Text>
            <View style={styles.sectionCard}>
              <MenuItem
                icon="heart-outline"
                label="My Wishlist"
                subtitle="Saved items"
                badge={wishlistItems.length}
                onPress={() => router.push("/wishlist")}
              />
              <Divider />
              <MenuItem
                icon="package-variant-closed"
                label="My Orders"
                subtitle="Track & manage orders"
                onPress={() => router.push("/orders")}
              />
              <Divider />
              <MenuItem
                icon="map-marker-outline"
                label="My Addresses"
                subtitle="Manage delivery locations"
                onPress={() => router.push("/addresses")}
              />
              <Divider />
              <MenuItem
                icon="cloud-upload-outline"
                label="Upload Orders"
                subtitle="Upload electrician item lists"
                onPress={() => router.push("/upload-orders")}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionHeader}>
              PREFERENCES
            </Text>
            <View style={styles.sectionCard}>
              <MenuItem
                icon="bell-outline"
                label="Notifications"
                onPress={() => console.log("Notifications")}
              />
              <Divider />
              <MenuItem
                icon="cog-outline"
                label="Settings"
                onPress={() => console.log("Settings")}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionHeader}>
              SUPPORT
            </Text>
            <View style={styles.sectionCard}>
              <MenuItem
                icon="help-circle-outline"
                label="Help & FAQs"
                onPress={() => console.log("Help")}
              />
              <Divider />
              <MenuItem
                icon="phone-outline"
                label="Contact Us"
                onPress={() => console.log("Contact")}
              />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <IconButton icon="logout" size={22} iconColor="#e53935" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.footerText}>
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontWeight: "700" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatar: { elevation: 0 },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontWeight: "700" },
  profileDetail: { color: "#666", marginTop: 2 },
  editBtn: { padding: 4 },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontWeight: "700" },
  statLabel: { color: "#666", marginTop: 4 },
  statDivider: { width: 1, height: 36, backgroundColor: "#eee" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuIcon: { margin: 0 },
  menuItemText: { flex: 1, marginLeft: 4 },
  menuLabel: { fontWeight: "500" },
  menuSubtitle: { color: "#999", marginTop: 2 },
  menuItemRight: { flexDirection: "row", alignItems: "center" },
  badge: {
    backgroundColor: "#ff9800",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e53935",
  },
  logoutText: { color: "#e53935", fontWeight: "600", fontSize: 16 },
  footer: { alignItems: "center", paddingVertical: 32 },
  footerText: { color: "#999" },
});
