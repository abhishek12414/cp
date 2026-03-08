import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UIState = {
  theme: "light" | "dark" | "system";
  showSplash: boolean;
  isLoading: boolean;
  snackbar: {
    visible: boolean;
    message: string;
    type: "info" | "success" | "error" | "warning";
  };
};

const initialState: UIState = {
  theme: "system",
  showSplash: true,
  isLoading: false,
  snackbar: {
    visible: false,
    message: "",
    type: "info",
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    setShowSplash: (state, action: PayloadAction<boolean>) => {
      state.showSplash = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        type: "info" | "success" | "error" | "warning";
      }>
    ) => {
      state.snackbar = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.visible = false;
    },
  },
});

export const {
  setTheme,
  setShowSplash,
  setIsLoading,
  showSnackbar,
  hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;
