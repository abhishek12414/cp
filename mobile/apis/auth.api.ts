import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  code: string;
  password: string;
  passwordConfirmation: string;
}

export const authApi = {
  login: (payload: LoginPayload) => {
    return apiClient.post<AuthResponse>(apiRoutes.LOGIN, payload);
  },

  register: (payload: RegisterPayload) => {
    return apiClient.post<AuthResponse>(apiRoutes.REGISTER, payload);
  },

  googleAuth: (token: string) => {
    return apiClient.post<AuthResponse>(apiRoutes.GOOGLE_AUTH, { token });
  },

  forgotPassword: (payload: ForgotPasswordPayload) => {
    return apiClient.post<{ ok: boolean }>(apiRoutes.FORGOT_PASSWORD, payload);
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return apiClient.post<{ user: AuthResponse["user"] }>(
      apiRoutes.RESET_PASSWORD,
      payload
    );
  },

  getMe: () => {
    return apiClient.get<AuthResponse["user"]>(apiRoutes.ME);
  },

  updateUser: (id: string, data: Partial<AuthResponse["user"]>) => {
    return apiClient.put<AuthResponse["user"]>(apiRoutes.USER(id), data);
  },
};

export default authApi;
