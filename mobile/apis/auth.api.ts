import { AuthResponseInterface } from "@/interface";
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
  phone?: string;
  name?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  code: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  phone?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: number;
  name: string;
  type: string;
}

export interface AuthMeResponse {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  phone?: string;
  name?: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

const authApi = {
  login: (payload: LoginPayload) => {
    return apiClient.post<AuthResponseInterface>(apiRoutes.LOGIN, payload);
  },

  register: (payload: RegisterPayload) => {
    return apiClient.post<AuthResponseInterface>(apiRoutes.REGISTER, payload);
  },

  googleAuth: (token: string) => {
    return apiClient.post<AuthResponseInterface>(apiRoutes.GOOGLE_AUTH, { token });
  },

  forgotPassword: (payload: ForgotPasswordPayload) => {
    return apiClient.post<{ ok: boolean }>(apiRoutes.FORGOT_PASSWORD, payload);
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return apiClient.post<{ user: AuthResponseInterface["user"] }>(
      apiRoutes.RESET_PASSWORD,
      payload
    );
  },

  getMe: () => {
    return apiClient.get<AuthMeResponse>(`${apiRoutes.ME}?populate=role`);
  },

  updateUser: (id: string, data: Partial<AuthResponseInterface["user"]>) => {
    return apiClient.put<AuthResponseInterface["user"]>(apiRoutes.USER(id), data);
  },
};

export default authApi;
