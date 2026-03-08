// Pagination metadata interface for list responses
export interface PaginationMetaInterface {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Generic API payload interface for requests
export interface ApiPayloadInterface<T> {
  data: T;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Generic API response interface for all API responses
export interface ApiResponseInterface<T> {
  data: T;
  meta?: {
    pagination?: PaginationMetaInterface;
  };
}

// Auth response interface (special case for auth endpoints)
export interface AuthResponseInterface {
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
