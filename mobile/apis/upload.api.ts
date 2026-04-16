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
  provider_metadata: any | null;
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

// Cache for uploaded files to prevent repeated API calls
let cachedFiles: UploadedFile[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the files cache (call this after uploading a new file)
 */
export const clearFilesCache = () => {
  cachedFiles = null;
  cacheTimestamp = 0;
};

const uploadApi = {
  /**
   * Upload a file to Strapi's upload endpoint
   * @param file - FormData containing the file to upload
   * @returns Promise with the upload response containing file metadata
   */
  uploadFile: (file: FormData) => {
    // Clear cache when uploading a new file
    clearFilesCache();
    return apiClient.post("/api/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Fetch uploaded files from Strapi media library
   * Note: Strapi's /api/upload/files returns all files (no server-side pagination)
   * We implement client-side pagination by slicing the results
   * Uses caching to prevent repeated API calls
   * @param page - Page number for pagination
   * @param pageSize - Number of items per page (default: 10, max: 20)
   * @param sort - Sort field (default: 'createdAt:desc')
   * @param forceRefresh - Force refresh cache (default: false)
   * @returns Promise with the list of uploaded files
   */
  getFiles: async (
    page: number = 1, 
    pageSize: number = 10, 
    sort: string = 'createdAt:desc',
    forceRefresh: boolean = false
  ): Promise<UploadFilesResponse> => {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (!forceRefresh && cachedFiles && (now - cacheTimestamp) < CACHE_DURATION) {
      const total = cachedFiles.length;
      const pageCount = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedFiles = cachedFiles.slice(startIndex, endIndex);
      
      return {
        data: paginatedFiles,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount,
            total,
          }
        }
      };
    }

    // Fetch from API if cache is empty, expired, or force refresh
    const response = await apiClient.get<UploadedFile[]>(
      `/api/upload/files?sort=${sort}`
    );
    
    const allFiles = response.data || [];
    
    // Update cache
    cachedFiles = allFiles;
    cacheTimestamp = now;
    
    const total = allFiles.length;
    const pageCount = Math.ceil(total / pageSize);
    
    // Client-side pagination: slice the results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);
    
    return {
      data: paginatedFiles,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
        }
      }
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
};

export default uploadApi;
