import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isOffline: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

export type UserRole = {
  id: number;
  name: string;
  type: string;
};

export type User = {
  id: number | string;
  email: string;
  username?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: UserRole;
};

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  isOffline: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    initializeSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    initializeFail: (state) => {
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.user = null;
      state.token = null;
      state.loading = false;
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  initializeStart,
  initializeSuccess,
  initializeFail,
  setOffline,
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;
export default authSlice.reducer;
