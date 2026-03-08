import apiClient from "@/apis/apiClient";
import { useQuery } from "@tanstack/react-query";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiClient.get("/orders").then((res) => res.data),
  });
};
