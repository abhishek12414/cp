// If you use react-native-dotenv or @env, uncomment the import above and
// remove the fallback below. Expo also exposes public env vars prefixed with
// EXPO_PUBLIC_. Use `EXPO_PUBLIC_API_URL` for apps built with EAS or Expo.
export const API_URL = process.env.API_URL;
console.log("🚀 ~ API_URL:", API_URL);
const apiV1 = "/api";

export const apiRoutes = {
  // Authentication
  LOGIN: `${apiV1}/auth/local`,
  REGISTER: `${apiV1}/auth/local/register`,
  GOOGLE_AUTH: `${apiV1}/auth/google`,
  FORGOT_PASSWORD: `${apiV1}/auth/forgot-password`,
  RESET_PASSWORD: `${apiV1}/auth/reset-password`,

  // User
  ME: `${apiV1}/users/me`,
  USER: (id: string) => `${apiV1}/users/${id}`,

  // Categories
  CATEGORIES: `${apiV1}/categories`,
  CATEGORY: (id: string) => `${apiV1}/categories/${id}`,

  // Brands
  BRANDS: `${apiV1}/brands`,
  BRAND: (id: string) => `${apiV1}/brands/${id}`,

  // Products
  PRODUCTS: `${apiV1}/products`,
  PRODUCT: (id: string) => `${apiV1}/products/${id}`,
  SEARCH_PRODUCTS: `${apiV1}/products/search`,
  PRODUCT_ATTRIBUTE_VALUES: `${apiV1}/product-attribute-values`,

  // Cart
  CART: `${apiV1}/carts/me`,
  CART_ADD: `${apiV1}/carts/add`,
  CART_ITEM: (id: string) => `${apiV1}/carts/items/${id}`,
  CART_CLEAR: `${apiV1}/carts/clear`,
  CART_COUNT: `${apiV1}/carts/count`,

  // Wishlist
  WISHLISTS: `${apiV1}/wishlists`,
  WISHLIST: (id: string) => `${apiV1}/wishlists/${id}`,
  WISHLIST_TOGGLE: `${apiV1}/wishlists/toggle`,
  WISHLIST_CHECK: `${apiV1}/wishlists/check`,

  // Orders
  ORDERS: `${apiV1}/orders`,
  ORDER: (id: string) => `${apiV1}/orders/${id}`,
  CREATE_ORDER: `${apiV1}/orders`,
  ORDER_CHECKOUT: `${apiV1}/orders/checkout`,
  UPLOAD_PURCHASE_ORDER: `${apiV1}/orders/upload`,

  // Fee Config
  FEE_CONFIG: `${apiV1}/fee-configs/active`,

  // Addresses
  ADDRESSES: `${apiV1}/addresses`,
  ADDRESS: (id: string) => `${apiV1}/addresses/${id}`,
  ADDRESS_SET_PRIMARY: (id: string) => `${apiV1}/addresses/${id}/set-primary`,

  // Upload Orders
  UPLOAD_ORDERS: `${apiV1}/upload-orders`,
  UPLOAD_ORDER: (id: string) => `${apiV1}/upload-orders/${id}`,
  UPLOAD_ORDERS_ADMIN: `${apiV1}/upload-orders-admin/all`,
  UPLOAD_ORDER_ADMIN: (id: string) => `${apiV1}/upload-orders-admin/${id}`,

  // User Activity & Personalization
  TRACK_ACTIVITY: `${apiV1}/user-activities/track`,
  RECENT_SEARCHES: `${apiV1}/user-activities/recent-searches`,
  RECOMMENDATIONS: `${apiV1}/user-activities/recommendations`,

  // Support
  SUPPORT_TICKETS: `${apiV1}/support-tickets`,
  SUPPORT_TICKET: (id: string) => `${apiV1}/support-tickets/${id}`,
  CREATE_SUPPORT_TICKET: `${apiV1}/support-tickets`,
  REPLY_TO_SUPPORT_TICKET: (id: string) => `${apiV1}/support-tickets/${id}/reply`,
};

export const getFullUrl = (path: string) => {
  return `${API_URL}${path}`;
};
