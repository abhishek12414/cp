import apiClient from "./apiClient";

export const uploadApi = {
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
};

export default uploadApi;
