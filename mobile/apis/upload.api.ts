import apiClient from "./apiClient";

export interface UploadedFile {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: {
      name: string;
      hash: string;
      ext: string;
      mime: string;
      path: string | null;
      width: number;
      height: number;
      size: number;
      sizeInBytes: number;
      url: string;
    };
    small?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface UploadFilesResponse {
  data: UploadedFile[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GetFilesParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, unknown>;
}

/**
 * Clear any cached data (kept for backward compatibility)
 */
export const clearFilesCache = (): void => {
  // No-op - server-side pagination doesn't need client cache
};

const uploadApi = {
  /**
   * Upload a file to Strapi's upload endpoint
   * @param file - FormData containing the file to upload
   * @returns Promise with the upload response containing file metadata
   */
  uploadFile: (file: FormData) => {
    return apiClient.post("/api/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Fetch uploaded files from Strapi media library with server-side pagination
   *
   * IMPORTANT: This uses server-side pagination to avoid fetching all files at once.
   * Strapi 5 supports pagination via query parameters.
   *
   * @param params - Pagination and filter parameters
   * @returns Promise with paginated list of uploaded files
   */
  getFiles: async (params: GetFilesParams = {}): Promise<UploadFilesResponse> => {
    const { page = 1, pageSize = 20, sort = "createdAt:desc", filters } = params;

    // Build query parameters for Strapi REST API pagination
    const queryParams = new URLSearchParams();
    queryParams.append("sort", sort);

    // Add pagination params (Strapi 5 format)
    queryParams.append("pagination[page]", String(page));
    queryParams.append("pagination[pageSize]", String(pageSize));

    // Add filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    const response = await apiClient.get<UploadedFile[]>(
      `/api/upload/files?${queryParams.toString()}`
    );

    const files = response.data || [];

    // Get pagination info from response headers or fallback
    const totalCount = parseInt(response.headers["x-total-count"] || "0", 10);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      data: files,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: totalPages,
          total: totalCount || files.length,
        },
      },
    };
  },

  /**
   * Fetch a single file by ID
   * @param id - File ID
   * @returns Promise with the file metadata
   */
  getFileById: (id: number) => {
    return apiClient.get<UploadedFile>(`/api/upload/files/${id}`);
  },

  /**
   * Delete a file by ID
   * @param id - File ID
   * @returns Promise with the deletion response
   */
  deleteFile: (id: number) => {
    return apiClient.delete(`/api/upload/files/${id}`);
  },

  /**
   * Get total file count (useful for showing total in UI)
   * @returns Promise with the total count
   */
  getFileCount: async (): Promise<number> => {
    try {
      // Fetch with pageSize=1 to get total count efficiently
      const response = await apiClient.get<UploadedFile[]>(
        "/api/upload/files?pagination[page]=1&pagination[pageSize]=1"
      );
      const totalCount = parseInt(response.headers["x-total-count"] || "0", 10);
      return totalCount;
    } catch (error) {
      console.error("[UploadApi] Failed to get file count:", error);
      return 0;
    }
  },
};

export default uploadApi;
