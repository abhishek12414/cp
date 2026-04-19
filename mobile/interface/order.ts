import { ProductInterface } from "./product";
import { AddressInterface } from "./address";

export interface OrderItemInterface {
  id: number;
  documentId: string;
  product: ProductInterface;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderInterface {
  id: number;
  documentId: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalPrice: number;
  subtotal?: number;
  deliveryFee?: number;
  platformFee?: number;
  packagingFee?: number;
  paymentMethod: "cod";
  shippingAddress: string;
  expectedDeliveryDate?: string;
  notes?: string;
  orderItems?: OrderItemInterface[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutInput {
  addressId?: number | string;
  paymentMethod?: "cod";
  notes?: string;
}

export interface CheckoutResponse {
  data: {
    order: OrderInterface;
    message: string;
    expectedDelivery: string;
  };
}

export interface FeeConfigInterface {
  id?: number;
  platformFee: number;
  deliveryFee: number;
  packagingFee: number;
  freeDeliveryThreshold?: number;
  deliveryTimeMinDays?: number;
  deliveryTimeMaxDays?: number;
}
