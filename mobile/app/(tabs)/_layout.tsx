import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";

import HapticTab from "@/components/HapticTab";
import Icon from "@/components/ui/Icon";
import TabBarBackground from "@/components/ui/TabBarBackground";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { RootState } from "@/store";

/**
 * Helper function to check if user has admin role
 * Admin role can be identified by role type 'admin' or role name containing 'admin'
 */
function useIsAdmin(): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user?.role) return false;
  
  // Check if role type is 'admin' or role name contains 'admin' (case-insensitive)
  const roleType = user.role.type?.toLowerCase() || '';
  const roleName = user.role.name?.toLowerCase() || '';
  
  return roleType === 'admin' || roleName.includes('admin');
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isAdmin = useIsAdmin();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="view-grid" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload-order"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="camera" color={color} />
          ),
        }}
      />
      {/* Admin Panel tab: Only visible to users with admin role.
          - Uses admin.tsx in (tabs) as a redirect wrapper to /(admin)
          - href: null hides the tab from the tab bar for non-admin users */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin Panel",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="shield-account" color={color} />
          ),
        }}
        href={isAdmin ? undefined : null}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="account-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
