import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";
import orderApi from "@/apis/order.api";
import { CheckoutInput } from "@/interface";
import { cartKeys } from "./useCart";
import { QUERY_CONFIG } from "@/config/queryConfig";
import { analytics } from "@/services/analytics";
import { FeeConfigInterface, OrderInterface } from "@/interface";

// Fee config query
export const useFeeConfig = () => {
  return useQuery<FeeConfigInterface | null>({
    queryKey: ["fee-config"],
    queryFn: async () => {
      try {
        const response = await orderApi.getFeeConfig();
        return response.data;
      } catch {
        // Return sensible defaults if config not available
        return {
          platformFee: 0,
          deliveryFee: 50,
          packagingFee: 20,
          freeDeliveryThreshold: 1000,
          deliveryTimeMinDays: 3,
          deliveryTimeMaxDays: 5,
        };
      }
    },
    ...QUERY_CONFIG.static,
  });
};

// Calculate order summary with fees
export const calculateOrderSummary = (
  subtotal: number,
  feeConfig?: FeeConfigInterface | null
) => {
  const platformFee = feeConfig?.platformFee || 0;
  const packagingFee = feeConfig?.packagingFee || 0;
  let deliveryFee = feeConfig?.deliveryFee || 0;

  if (feeConfig?.freeDeliveryThreshold && subtotal >= feeConfig.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  const total = subtotal + deliveryFee + platformFee + packagingFee;

  return {
    subtotal,
    deliveryFee,
    platformFee,
    packagingFee,
    total,
  };
};

// Main checkout mutation hook
export const useCheckout = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: CheckoutInput) => {
      setIsProcessing(true);
      try {
        const response = await orderApi.checkout(input);
        return response.data;
      } finally {
        setIsProcessing(false);
      }
    },

    onSuccess: (data) => {
      // Invalidate cart (now empty) and orders
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Track successful checkout
      if (typeof analytics.track === "function") {
        analytics.track("add_to_cart" as any, {
          order_id: data.order?.orderNumber,
          total: data.order?.totalPrice,
        });
      }
    },

    onError: (error: any) => {
      const errorData = error?.response?.data || error;
      const message = errorData?.message || errorData?.error?.message || "Checkout failed. Please try again.";

      // Special handling for out of stock
      if (errorData?.outOfStockItems) {
        Alert.alert(
          "Out of Stock",
          `Some items are no longer available:\n\n${errorData.outOfStockItems.join("\n")}\n\nPlease remove these items from your cart to continue.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Checkout Failed", message, [{ text: "OK" }]);
      }

      analytics.trackApiError("checkout", error?.response?.status || 0, message);
    },
  });

  return {
    checkout: mutation.mutateAsync,
    isCheckingOut: mutation.isPending || isProcessing,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

// Hook to fetch user's orders
export const useUserOrders = () => {
  return useQuery<OrderInterface[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderApi.getOrders();
      return response.data || [];
    },
    ...QUERY_CONFIG.dynamic,
  });
};
