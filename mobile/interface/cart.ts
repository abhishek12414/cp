import { ProductInterface } from "./product";

export interface CartItemInterface {
  id: number;
  documentId: string;
  product: ProductInterface;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartInterface {
  id: number;
  documentId: string;
  cartItems?: CartItemInterface[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartInput {
  product: string | number;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartCountResponse {
  count: number;
}
