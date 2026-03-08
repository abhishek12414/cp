import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cart.reducer";
import wishlistReducer from "./reducers/wishlist.reducer";
import authReducer from "./reducers/auth.reducer";
import uiReducer from "./reducers/ui.reducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
