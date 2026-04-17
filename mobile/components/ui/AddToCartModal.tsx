import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { Button, IconButton, ActivityIndicator } from "react-native-paper";
import { Image } from "expo-image";

import { ProductInterface } from "@/interface";
import { getImageUrl } from "@/helpers/image";
import { useAddToCart, useIsInCart, useUpdateCartItem } from "@/hooks/queries/useCart";
import { Colors } from "@/constants/Colors";

interface AddToCartModalProps {
  visible: boolean;
  product: ProductInterface | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const { isInCart, cartItem } = useIsInCart(product?.documentId || "");
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();

  // Reset quantity when modal opens
  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible]);

  if (!product) return null;

  const stockQuantity = product.stockQuantity ?? product.stock ?? 0;
  const maxQuantity = Math.min(stockQuantity, 99);
  const productImage = product.images?.[0]?.url
    ? getImageUrl(product.images[0].url)
    : null;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (isInCart && cartItem) {
        // Update existing item
        await updateCartItem.mutateAsync({
          cartItemId: cartItem.documentId,
          quantity: cartItem.quantity + quantity,
        });
      } else {
        // Add new item
        await addToCart.mutateAsync({
          product: product.documentId,
          quantity,
          productData: product,
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled in the mutation hook
    }
  };

  const isLoading = addToCart.isPending || updateCartItem.isPending;
  const currentCartQuantity = isInCart ? (cartItem?.quantity || 0) : 0;
  const totalAfterAdd = currentCartQuantity + quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add to Cart</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            {productImage && (
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                contentFit="cover"
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              {product.brand && (
                <Text style={styles.brandName}>{product.brand.name}</Text>
              )}
              <Text style={styles.price}>₹{product.price.toFixed(0)}</Text>
              {stockQuantity <= 10 && stockQuantity > 0 && (
                <Text style={styles.lowStock}>
                  Only {stockQuantity} left in stock
                </Text>
              )}
              {stockQuantity === 0 && (
                <Text style={styles.outOfStock}>Out of Stock</Text>
              )}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <IconButton
                icon="minus"
                size={20}
                mode="outlined"
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isLoading}
              />
              <Text style={styles.quantityText}>{quantity}</Text>
              <IconButton
                icon="plus"
                size={20}
                mode="outlined"
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity || isLoading}
              />
            </View>
          </View>

          {/* Cart Status */}
          {isInCart && (
            <View style={styles.cartStatus}>
              <Text style={styles.cartStatusText}>
                You already have {currentCartQuantity} in cart
              </Text>
              <Text style={styles.cartTotalText}>
                Total after adding: {totalAfterAdd} items (₹{(product.price * totalAfterAdd).toFixed(0)})
              </Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              ₹{(product.price * quantity).toFixed(0)}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddToCart}
              style={styles.addButton}
              buttonColor={Colors.light.primary}
              disabled={stockQuantity === 0 || isLoading}
              loading={isLoading}
            >
              {isLoading 
                ? "Adding..." 
                : isInCart 
                  ? `Add ${quantity} More` 
                  : "Add to Cart"}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  productInfo: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  lowStock: {
    fontSize: 12,
    color: "#ff9500",
    marginTop: 4,
  },
  outOfStock: {
    fontSize: 12,
    color: "#ff3b30",
    marginTop: 4,
    fontWeight: "600",
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: "center",
  },
  cartStatus: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  cartStatusText: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  cartTotalText: {
    fontSize: 12,
    color: "#666",
  },
  totalSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  addButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 6,
  },
});

export default AddToCartModal;
