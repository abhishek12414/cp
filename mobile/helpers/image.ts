import { API_URL } from "@/apis/apiRoutes";

export const getImageUrl = (path: string) => {
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_URL}${path}`;
};
