import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

import { API_URL } from "./apiRoutes";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore token errors
  }
  return config;
});

// Simple response interceptor for common errors
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem("auth_token");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
