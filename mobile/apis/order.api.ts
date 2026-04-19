import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { ApiResponseInterface, CheckoutInput, CheckoutResponse, FeeConfigInterface, OrderInterface } from "@/interface";

export const orderApi = {
  /**
   * Create order via checkout (COD only)
   * Handles stock validation, fees, order creation, stock reduction
   */
  checkout: async (input: CheckoutInput): Promise<CheckoutResponse> => {
    const response = await apiClient.post<CheckoutResponse>(
      apiRoutes.ORDER_CHECKOUT,
      { data: input }
    );
    return response.data;
  },

  /**
   * Get all user orders
   */
  getOrders: async (): Promise<{ data: OrderInterface[] }> => {
    const response = await apiClient.get<ApiResponseInterface<OrderInterface[]>>(
      apiRoutes.ORDERS
    );
    return response.data;
  },

  /**
   * Get single order
   */
  getOrder: async (id: string): Promise<{ data: OrderInterface }> => {
    const response = await apiClient.get<ApiResponseInterface<OrderInterface>>(
      apiRoutes.ORDER(id)
    );
    return response.data;
  },

  /**
   * Get active fee configuration
   */
  getFeeConfig: async (): Promise<{ data: FeeConfigInterface }> => {
    const response = await apiClient.get<{ data: FeeConfigInterface }>(
      apiRoutes.FEE_CONFIG
    );
    return response.data;
  },
};

export default orderApi;
