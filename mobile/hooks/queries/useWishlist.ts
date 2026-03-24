import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import wishlistApi, { WishlistItem } from "@/apis/wishlist.api";

/**
 * Hook to get the current user's wishlist
 */
export const useWishlist = () => {
  return useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await wishlistApi.getWishlist();
      return response.data.data || [];
    },
    staleTime: 0,
  });
};

/**
 * Hook to check if a product is in the wishlist
 */
export const useIsInWishlist = (productId: string | number) => {
  const { data: wishlistItems = [] } = useWishlist();
  
  return wishlistItems.some(
    (item) => item.product?.id === Number(productId) || 
               item.product?.documentId === productId
  );
};

/**
 * Hook to toggle wishlist status
 */
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string | number) => {
      const response = await wishlistApi.toggleWishlist(productId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

/**
 * Hook to remove from wishlist by ID
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wishlistId: number | string) => {
      return wishlistApi.removeFromWishlist(wishlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

/**
 * Get wishlist item ID for a product (if exists)
 */
export const useWishlistItemId = (productId: string | number): number | null => {
  const { data: wishlistItems = [] } = useWishlist();
  const item = wishlistItems.find(
    (item) => item.product?.id === Number(productId) || 
               item.product?.documentId === productId
  );
  return item?.id || null;
};
