import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { Alert } from "react-native";
import cartApi, { AddToCartInput, UpdateCartItemInput } from "@/apis/cart.api";
import { CartInterface, CartItemInterface, ProductInterface } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";
import { analytics } from "@/services/analytics";

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => ["cart", "detail"] as const,
  count: () => ["cart", "count"] as const,
};

/**
 * Calculate exponential backoff delay with jitter
 */
const calculateBackoffDelay = (failureCount: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const jitter = Math.random() * 500; // Random 0-500ms

  // Exponential: 1s, 2s, 4s, 8s, 16s, 30s (capped)
  return Math.min(baseDelay * Math.pow(2, failureCount) + jitter, maxDelay);
};

/**
 * Check if error is a network error
 */
const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === "object") {
    const err = error as any;
    // No response means network error
    if (!err.response && err.message) {
      const message = err.message.toLowerCase();
      return (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("econnrefused") ||
        message.includes("enetunreach") ||
        message.includes("fetch")
      );
    }
  }
  return false;
};

/**
 * Hook to fetch the current user's cart
 * Uses dynamic config - cart changes frequently
 */
export const useCart = () => {
  return useQuery<CartInterface | null>({
    queryKey: cartKeys.cart(),
    queryFn: async () => {
      try {
        const response = await cartApi.getCart();
        return response.data;
      } catch (error: any) {
        // If 404, cart doesn't exist yet - return null
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    ...QUERY_CONFIG.dynamic,
    retry: (failureCount, error) => {
      // Retry network errors up to 3 times
      if (isNetworkError(error)) {
        return failureCount < 3;
      }
      // Don't retry other errors
      return false;
    },
    retryDelay: calculateBackoffDelay,
  });
};

/**
 * Hook to get cart item count (for badge)
 */
export const useCartCount = () => {
  const { data: cart } = useCart();

  const count = cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return { count, isLoading: false };
};

/**
 * Hook to check if a product is in the cart
 */
export const useIsInCart = (productId: string | number) => {
  const { data: cart } = useCart();

  const cartItem = cart?.cartItems?.find(
    (item) => item.product?.id === Number(productId) || item.product?.documentId === productId
  );

  return {
    isInCart: !!cartItem,
    quantity: cartItem?.quantity || 0,
    cartItem,
  };
};

/**
 * Hook to add item to cart with optimistic update and retry
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);

  return useMutation({
    mutationFn: async (input: AddToCartInput & { productData?: ProductInterface }) => {
      const response = await cartApi.addToCart({
        product: input.product,
        quantity: input.quantity,
      });
      return response.data;
    },

    // Optimistic update
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartInterface | null>(cartKeys.cart());

      // Optimistically update cart
      if (previousCart && input.productData) {
        const existingItemIndex = previousCart.cartItems?.findIndex(
          (item) =>
            item.product?.id === Number(input.product) || item.product?.documentId === input.product
        );

        if (existingItemIndex !== undefined && existingItemIndex >= 0 && previousCart.cartItems) {
          // Update existing item quantity
          const updatedItems = [...previousCart.cartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + (input.quantity || 1),
          };

          queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
            ...previousCart,
            cartItems: updatedItems,
            total: calculateTotal(updatedItems),
          });
        } else {
          // Add new item
          const newItem: CartItemInterface = {
            id: Date.now(), // Temporary ID
            documentId: `temp-${Date.now()}`,
            product: input.productData,
            quantity: input.quantity || 1,
          };

          const updatedItems = [...(previousCart.cartItems || []), newItem];

          queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
            ...previousCart,
            cartItems: updatedItems,
            total: calculateTotal(updatedItems),
          });
        }
      } else if (!previousCart && input.productData) {
        // Create new cart with item
        const newItem: CartItemInterface = {
          id: Date.now(),
          documentId: `temp-${Date.now()}`,
          product: input.productData,
          quantity: input.quantity || 1,
        };

        queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
          id: Date.now(),
          documentId: `temp-cart-${Date.now()}`,
          cartItems: [newItem],
          total: (input.productData.price || 0) * (input.quantity || 1),
        });
      }

      return { previousCart };
    },

    // On error, rollback
    onError: (error, input, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }

      // Track error
      analytics.trackApiError(
        "cart/add",
        (error as any)?.response?.status || 0,
        (error as Error)?.message || "Unknown error"
      );

      // Show user-friendly error
      const errorMessage = isNetworkError(error)
        ? "Network error. Please check your connection and try again."
        : (error as any)?.response?.data?.error?.message || "Failed to add item to cart";

      Alert.alert("Error", errorMessage);
    },

    // On success, update with server data
    onSuccess: (data, input) => {
      // Track analytics
      const product = input.productData;
      if (product) {
        analytics.track("add_to_cart", {
          product_id: product.documentId,
          product_name: product.name,
          quantity: input.quantity || 1,
          price: product.price,
        });
      }

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Only retry network errors
      if (isNetworkError(error) && failureCount < 3) {
        retryCountRef.current = failureCount;
        return true;
      }
      return false;
    },
    retryDelay: calculateBackoffDelay,
  });
};

/**
 * Hook to update cart item quantity with optimistic update
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const response = await cartApi.updateCartItem(cartItemId, { quantity });
      return response.data;
    },

    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartInterface | null>(cartKeys.cart());

      if (previousCart?.cartItems) {
        const updatedItems = previousCart.cartItems.map((item) =>
          item.documentId === cartItemId ? { ...item, quantity } : item
        );

        queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
          ...previousCart,
          cartItems: updatedItems,
          total: calculateTotal(updatedItems),
        });
      }

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }

      const errorMessage = isNetworkError(error)
        ? "Network error. Please try again."
        : "Failed to update quantity";

      Alert.alert("Error", errorMessage);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },

    retry: (failureCount, error) => isNetworkError(error) && failureCount < 3,
    retryDelay: calculateBackoffDelay,
  });
};

/**
 * Hook to remove item from cart with optimistic update
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const response = await cartApi.removeFromCart(cartItemId);
      return response.data;
    },

    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartInterface | null>(cartKeys.cart());

      if (previousCart?.cartItems) {
        const updatedItems = previousCart.cartItems.filter(
          (item) => item.documentId !== cartItemId
        );

        queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
          ...previousCart,
          cartItems: updatedItems,
          total: calculateTotal(updatedItems),
        });
      }

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }

      const errorMessage = isNetworkError(error)
        ? "Network error. Please try again."
        : "Failed to remove item";

      Alert.alert("Error", errorMessage);
    },

    onSuccess: (_, cartItemId) => {
      analytics.track("remove_from_cart", { cart_item_id: cartItemId });
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },

    retry: (failureCount, error) => isNetworkError(error) && failureCount < 3,
    retryDelay: calculateBackoffDelay,
  });
};

/**
 * Hook to clear entire cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await cartApi.clearCart();
      return response.data;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartInterface | null>(cartKeys.cart());

      // Optimistically clear cart
      if (previousCart) {
        queryClient.setQueryData<CartInterface>(cartKeys.cart(), {
          ...previousCart,
          cartItems: [],
          total: 0,
        });
      }

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }

      const errorMessage = isNetworkError(error)
        ? "Network error. Please try again."
        : "Failed to clear cart";

      Alert.alert("Error", errorMessage);
    },

    onSuccess: () => {
      analytics.track("clear_cart", {});
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },

    retry: (failureCount, error) => isNetworkError(error) && failureCount < 3,
    retryDelay: calculateBackoffDelay,
  });
};

/**
 * Hook to sync cart with server (useful after network recovery)
 */
export const useSyncCart = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      await queryClient.refetchQueries({ queryKey: cartKeys.cart() });
      return true;
    } catch (error) {
      console.error("Failed to sync cart:", error);
      return false;
    }
  }, [queryClient]);
};

/**
 * Combined hook with all cart operations
 */
export const useCartOperations = () => {
  const { data: cart, isLoading, error, refetch } = useCart();
  const { count } = useCartCount();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const syncCart = useSyncCart();

  return {
    // Data
    cart,
    count,
    isLoading,
    error,

    // Operations
    addToCart: addToCart.mutateAsync,
    updateCartItem: updateCartItem.mutateAsync,
    removeFromCart: removeFromCart.mutateAsync,
    clearCart: clearCart.mutateAsync,
    refetch,
    syncCart,

    // Loading states
    isAddingToCart: addToCart.isPending,
    isUpdating: updateCartItem.isPending,
    isRemoving: removeFromCart.isPending,
    isClearing: clearCart.isPending,
  };
};

// Helper function to calculate cart total
function calculateTotal(items: CartItemInterface[] | undefined): number {
  if (!items) return 0;
  return items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
}

export default {
  useCart,
  useCartCount,
  useIsInCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useSyncCart,
  useCartOperations,
};
