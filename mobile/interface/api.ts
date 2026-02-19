export interface ApiPayload<T> {
  data: T;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
}
