import { useCallback } from "react";
import { analytics, AnalyticsEventName } from "@/services/analytics";

/**
 * Hook for product-related tracking events
 */
export const useProductTracking = () => {
  const trackProductView = useCallback(
    (productId: string, productName: string, price: number, category?: string, brand?: string) => {
      analytics.track("product_view", {
        product_id: productId,
        product_name: productName,
        price,
        category,
        brand,
      });
    },
    []
  );

  const trackProductSearch = useCallback(
    (query: string, resultsCount: number, filters?: Record<string, unknown>) => {
      analytics.track("product_search", {
        query,
        results_count: resultsCount,
        filters,
      });
    },
    []
  );

  const trackProductShare = useCallback(
    (productId: string, productName: string, shareMethod?: string) => {
      analytics.track("product_share", {
        product_id: productId,
        product_name: productName,
        share_method: shareMethod,
      });
    },
    []
  );

  return {
    trackProductView,
    trackProductSearch,
    trackProductShare,
  };
};

/**
 * Hook for cart-related tracking events
 */
export const useCartTracking = () => {
  const trackAddToCart = useCallback(
    (productId: string, productName: string, quantity: number, price: number) => {
      analytics.track("add_to_cart", {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        total_value: quantity * price,
      });
    },
    []
  );

  const trackRemoveFromCart = useCallback(
    (productId: string, productName: string, quantity: number, price: number) => {
      analytics.track("remove_from_cart", {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
      });
    },
    []
  );

  const trackUpdateCartQuantity = useCallback(
    (productId: string, oldQuantity: number, newQuantity: number) => {
      analytics.track("update_cart_quantity", {
        product_id: productId,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        delta: newQuantity - oldQuantity,
      });
    },
    []
  );

  const trackClearCart = useCallback((itemCount: number, totalValue: number) => {
    analytics.track("clear_cart", {
      item_count: itemCount,
      total_value: totalValue,
    });
  }, []);

  const trackViewCart = useCallback((itemCount: number, totalValue: number) => {
    analytics.track("view_cart", {
      item_count: itemCount,
      total_value: totalValue,
    });
  }, []);

  return {
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateCartQuantity,
    trackClearCart,
    trackViewCart,
  };
};

/**
 * Hook for wishlist-related tracking events
 */
export const useWishlistTracking = () => {
  const trackAddToWishlist = useCallback(
    (productId: string, productName: string, price: number) => {
      analytics.track("add_to_wishlist", {
        product_id: productId,
        product_name: productName,
        price,
      });
    },
    []
  );

  const trackRemoveFromWishlist = useCallback(
    (productId: string, productName: string) => {
      analytics.track("remove_from_wishlist", {
        product_id: productId,
        product_name: productName,
      });
    },
    []
  );

  return {
    trackAddToWishlist,
    trackRemoveFromWishlist,
  };
};

/**
 * Hook for order-related tracking events
 */
export const useOrderTracking = () => {
  const trackCheckoutStart = useCallback(
    (cartValue: number, itemCount: number) => {
      analytics.track("checkout_start", {
        cart_value: cartValue,
        item_count: itemCount,
      });
    },
    []
  );

  const trackOrderCreate = useCallback(
    (orderId: string, totalValue: number, itemCount: number, paymentMethod?: string) => {
      analytics.track("order_create", {
        order_id: orderId,
        total_value: totalValue,
        item_count: itemCount,
        payment_method: paymentMethod,
      });
    },
    []
  );

  const trackOrderComplete = useCallback(
    (orderId: string, totalValue: number, itemCount: number) => {
      analytics.track("order_complete", {
        order_id: orderId,
        total_value: totalValue,
        item_count: itemCount,
      });
    },
    []
  );

  const trackOrderCancel = useCallback(
    (orderId: string, reason?: string) => {
      analytics.track("order_cancel", {
        order_id: orderId,
        reason,
      });
    },
    []
  );

  return {
    trackCheckoutStart,
    trackOrderCreate,
    trackOrderComplete,
    trackOrderCancel,
  };
};

/**
 * Hook for authentication-related tracking events
 */
export const useAuthTracking = () => {
  const trackLogin = useCallback((method: string = "email") => {
    analytics.track("login", { method });
  }, []);

  const trackLogout = useCallback(() => {
    analytics.track("logout", {});
  }, []);

  const trackSignup = useCallback((method: string = "email") => {
    analytics.track("signup", { method });
  }, []);

  const trackPasswordResetRequest = useCallback((email: string) => {
    analytics.track("password_reset_request", {
      email_domain: email.split("@")[1], // Only track domain for privacy
    });
  }, []);

  const trackPasswordResetComplete = useCallback(() => {
    analytics.track("password_reset_complete", {});
  }, []);

  return {
    trackLogin,
    trackLogout,
    trackSignup,
    trackPasswordResetRequest,
    trackPasswordResetComplete,
  };
};

/**
 * Hook for upload order tracking events
 */
export const useUploadOrderTracking = () => {
  const trackUploadOrderCreate = useCallback((fileCount: number, notes?: string) => {
    analytics.track("upload_order_create", {
      file_count: fileCount,
      has_notes: !!notes,
    });
  }, []);

  const trackUploadOrderView = useCallback((orderId: string, status: string) => {
    analytics.track("upload_order_view", {
      order_id: orderId,
      status,
    });
  }, []);

  return {
    trackUploadOrderCreate,
    trackUploadOrderView,
  };
};

/**
 * Hook for screen view tracking
 */
export const useScreenTracking = () => {
  const trackScreenView = useCallback(
    (screenName: string, params?: Record<string, unknown>) => {
      analytics.trackScreenView(screenName, params);
    },
    []
  );

  return { trackScreenView };
};

/**
 * Hook for error tracking
 */
export const useErrorTracking = () => {
  const trackError = useCallback((error: Error, context?: Record<string, unknown>) => {
    analytics.trackError(error, context);
  }, []);

  const trackApiError = useCallback(
    (endpoint: string, status: number, message: string, context?: Record<string, unknown>) => {
      analytics.trackApiError(endpoint, status, message, context);
    },
    []
  );

  const trackNetworkError = useCallback((endpoint: string, errorType: string) => {
    analytics.track("network_error", {
      endpoint,
      error_type: errorType,
    });
  }, []);

  return {
    trackError,
    trackApiError,
    trackNetworkError,
  };
};

/**
 * Combined tracking hook with all tracking functions
 */
export const useTracking = () => {
  const product = useProductTracking();
  const cart = useCartTracking();
  const wishlist = useWishlistTracking();
  const order = useOrderTracking();
  const auth = useAuthTracking();
  const uploadOrder = useUploadOrderTracking();
  const screen = useScreenTracking();
  const error = useErrorTracking();

  return {
    ...product,
    ...cart,
    ...wishlist,
    ...order,
    ...auth,
    ...uploadOrder,
    ...screen,
    ...error,
    
    // Direct track for custom events
    track: analytics.track,
  };
};
