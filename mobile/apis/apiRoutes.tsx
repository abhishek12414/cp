// If you use react-native-dotenv or @env, uncomment the import above and
// remove the fallback below. Expo also exposes public env vars prefixed with
// EXPO_PUBLIC_. Use `EXPO_PUBLIC_API_URL` for apps built with EAS or Expo.
export const API_URL = "http://192.168.29.17:3010"; //process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
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
  ADD_TO_CART: `${apiV1}/carts/add`,
  CART_ITEM: `${apiV1}/carts/update`,
  REMOVE_FROM_CART: `${apiV1}/carts/remove`,

  // Wishlist
  WISHLIST: `${apiV1}/wishlists/me`,
  ADD_TO_WISHLIST: `${apiV1}/wishlists/add`,
  REMOVE_FROM_WISHLIST: `${apiV1}/wishlists/remove`,

  // Orders
  ORDERS: `${apiV1}/orders`,
  ORDER: (id: string) => `${apiV1}/orders/${id}`,
  CREATE_ORDER: `${apiV1}/orders`,
  UPLOAD_PURCHASE_ORDER: `${apiV1}/orders/upload`,

  // Support
  SUPPORT_TICKETS: `${apiV1}/support-tickets`,
  SUPPORT_TICKET: (id: string) => `${apiV1}/support-tickets/${id}`,
  CREATE_SUPPORT_TICKET: `${apiV1}/support-tickets`,
  REPLY_TO_SUPPORT_TICKET: (id: string) =>
    `${apiV1}/support-tickets/${id}/reply`,
};

export const getFullUrl = (path: string) => {
  return `${API_URL}${path}`;
};
