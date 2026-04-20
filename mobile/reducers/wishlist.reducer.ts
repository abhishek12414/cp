import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
};

export type WishlistState = {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
};

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Omit<WishlistItem, "id">>) => {
      const { productId, name, price, image } = action.payload;
      const existingItem = state.items.find((item) => item.productId === productId);

      if (!existingItem) {
        const id = Date.now().toString();
        state.items.push({
          id,
          productId,
          name,
          price,
          image,
        });
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWishlistError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistLoading,
  setWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
