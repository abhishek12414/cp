import { Share, Platform, Linking } from "react-native";
import * as LinkingExpo from "expo-linking";

/**
 * Generate a deep link URL for a product
 * Works with both Expo Go (development) and custom builds (production)
 */
export function generateProductDeepLink(productId: string): string {
  // For Expo Go development, use the Expo linking URL
  // For production builds, use the custom scheme
  const isExpoGo = __DEV__ && Platform.OS !== "web";
  
  if (isExpoGo) {
    // Get the current Expo development URL
    const url = LinkingExpo.createURL(`product/${productId}`);
    return url;
  } else {
    // Production build with custom scheme
    return `currentshop://product/${productId}`;
  }
}

/**
 * Generate a web/deep link URL for sharing
 * This can be used with universal links if configured
 */
export function generateProductShareUrl(productId: string, productName?: string): string {
  // For web sharing or if you have a web version
  // You can configure this to point to your web app or use the app deep link
  const deepLink = generateProductDeepLink(productId);
  
  // For Expo Go, the URL can be shared directly
  // Users on Expo Go can open the link and it will navigate to the product
  return deepLink;
}

/**
 * Share a product using the native share dialog
 */
export async function shareProduct(
  productId: string,
  productName: string,
  productPrice?: number,
  productImage?: string
): Promise<boolean> {
  try {
    const url = generateProductDeepLink(productId);
    const priceText = productPrice ? ` - ₹${productPrice.toFixed(0)}` : "";
    const message = `Check out ${productName}${priceText} on CurrentShop!\n\n${url}`;
    
    const result = await Share.share({
      message,
      url: Platform.OS === "ios" ? url : undefined, // iOS can use URL separately
      title: `Share ${productName}`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type
        console.log("Shared with activity:", result.activityType);
      } else {
        // Shared
        console.log("Shared successfully");
      }
      return true;
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log("Share dismissed");
      return false;
    }
    return false;
  } catch (error) {
    console.error("Error sharing product:", error);
    return false;
  }
}

/**
 * Handle incoming deep links
 * Call this when the app receives a deep link
 */
export function parseDeepLink(url: string): { type: string; id: string } | null {
  try {
    // Handle various URL formats:
    // currentshop://product/123
    // exp://host:port/--/product/123
    // https://yourapp.com/product/123
    
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Check for product route
    const productMatch = pathname.match(/\/product\/([^/?]+)/);
    if (productMatch) {
      return { type: "product", id: productMatch[1] };
    }
    
    // Check for category route
    const categoryMatch = pathname.match(/\/category\/([^/?]+)/);
    if (categoryMatch) {
      return { type: "category", id: categoryMatch[1] };
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing deep link:", error);
    return null;
  }
}

/**
 * Get the current app's base URL for deep linking
 * Works with Expo Go and production builds
 */
export function getAppBaseUrl(): string {
  if (__DEV__) {
    // In development, use Expo's linking
    return LinkingExpo.createURL("");
  }
  // In production, use the custom scheme
  return "currentshop://";
}
