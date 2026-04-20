import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type CartState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
};

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "id">>) => {
      const { productId, name, price, quantity, image } = action.payload;
      const existingItem = state.items.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const id = Date.now().toString();
        state.items.push({
          id,
          productId,
          name,
          price,
          quantity,
          image,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity); // Ensure quantity is at least 1
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartLoading,
  setCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
