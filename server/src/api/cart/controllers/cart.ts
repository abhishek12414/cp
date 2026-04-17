/**
 * cart controller
 * 
 * Provides cart management endpoints:
 * - Get user's cart with items
 * - Add item to cart
 * - Update item quantity
 * - Remove item from cart
 * - Clear cart
 */

import { factories } from '@strapi/strapi';

interface CartItemInput {
  product: string | number;
  quantity?: number;
}

interface UpdateQuantityInput {
  quantity: number;
}

/**
 * Helper to get numeric ID from documentId or numeric ID
 */
async function getProductNumericId(strapi: any, product: string | number): Promise<{ id: number; entity: any } | null> {
  // If it's already a number, use it directly
  if (typeof product === 'number') {
    const entity = await strapi.entityService.findOne('api::product.product', product, {
      populate: ['images', 'brand', 'category'],
    });
    if (entity) {
      return { id: product, entity };
    }
    return null;
  }
  
  // If it's a string, check if it's a numeric string or documentId
  const productStr = String(product);
  
  if (/^\d+$/.test(productStr)) {
    // It's a numeric string
    const numericId = parseInt(productStr, 10);
    const entity = await strapi.entityService.findOne('api::product.product', numericId, {
      populate: ['images', 'brand', 'category'],
    });
    if (entity) {
      return { id: numericId, entity };
    }
    return null;
  }
  
  // It's a documentId - find by documentId
  const entity = await strapi.db.query('api::product.product').findOne({
    where: { documentId: productStr },
    populate: ['images', 'brand', 'category'],
  });
  
  if (entity) {
    return { id: entity.id, entity };
  }
  
  return null;
}

/**
 * Helper to get numeric cart ID
 */
function getCartNumericId(cart: any): number {
  // In Strapi 5, we might have both id (numeric) and documentId (string)
  // The database relations use numeric id
  if (typeof cart.id === 'number') {
    return cart.id;
  }
  // If id is a string (documentId), we need the numeric id from somewhere else
  // Check if there's a separate numericId field or parse it
  if (cart.documentId && typeof cart.id === 'string') {
    // The cart object from db.query should have numeric id
    // This shouldn't happen if we use db.query properly
    console.warn('Cart has string id, this may indicate an issue');
  }
  return Number(cart.id);
}

export default factories.createCoreController('api::cart.cart', ({ strapi }) => ({
  // Get current user's cart with all items
  async me(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your cart');
    }

    try {
      // Find or create cart for user - use db.query to get numeric IDs
      let cart = await strapi.db.query('api::cart.cart').findOne({
        where: { user: user.id },
        populate: {
          cartItems: {
            populate: {
              product: {
                populate: ['images', 'brand', 'category'],
              },
            },
          },
        },
      });

      // Create cart if doesn't exist
      if (!cart) {
        cart = await strapi.db.query('api::cart.cart').create({
          data: {
            user: user.id,
            total: 0,
          },
          populate: {
            cartItems: {
              populate: {
                product: {
                  populate: ['images', 'brand', 'category'],
                },
              },
            },
          },
        });
      }

      // Calculate total
      let total = 0;
      if (cart.cartItems && cart.cartItems.length > 0) {
        total = cart.cartItems.reduce((sum: number, item: any) => {
          const price = item.product?.price || 0;
          return sum + (price * item.quantity);
        }, 0);

        // Update total if changed
        if (cart.total !== total) {
          await strapi.db.query('api::cart.cart').update({
            where: { id: cart.id },
            data: { total },
          });
          cart.total = total;
        }
      }

      return { data: cart };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return ctx.badRequest('Failed to fetch cart');
    }
  },

  // Add item to cart
  async addItem(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to add items to cart');
    }

    const { product, quantity = 1 } = ctx.request.body.data || ctx.request.body as CartItemInput;

    if (!product) {
      return ctx.badRequest('Product ID is required');
    }

    if (quantity < 1) {
      return ctx.badRequest('Quantity must be at least 1');
    }

    try {
      // Get product numeric ID and entity
      const productResult = await getProductNumericId(strapi, product);
      
      if (!productResult) {
        return ctx.notFound('Product not found');
      }
      
      const { id: productId, entity: productEntity } = productResult;

      // Check stock
      const stockQuantity = (productEntity as any).stockQuantity ?? (productEntity as any).stock ?? 0;
      if (stockQuantity < quantity) {
        return ctx.badRequest(`Insufficient stock. Available: ${stockQuantity}`);
      }

      // Find or create cart using db.query for numeric IDs
      let cart = await strapi.db.query('api::cart.cart').findOne({
        where: { user: user.id },
      });

      if (!cart) {
        cart = await strapi.db.query('api::cart.cart').create({
          data: {
            user: user.id,
            total: 0,
          },
        });
      }

      const cartId = cart.id; // This is now numeric

      // Check if product already in cart - use numeric IDs
      const existingItem = await strapi.db.query('api::cart-item.cart-item').findOne({
        where: { cart: cartId, product: productId },
      });

      let cartItem;
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (stockQuantity < newQuantity) {
          return ctx.badRequest(`Insufficient stock. Available: ${stockQuantity}, in cart: ${existingItem.quantity}`);
        }
        
        // Update using db.query with numeric ID
        cartItem = await strapi.db.query('api::cart-item.cart-item').update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          populate: {
            product: {
              populate: ['images', 'brand', 'category'],
            },
          },
        });
      } else {
        // Create new cart item - use numeric IDs
        cartItem = await strapi.db.query('api::cart-item.cart-item').create({
          data: {
            cart: cartId,
            product: productId,
            quantity,
          },
          populate: {
            product: {
              populate: ['images', 'brand', 'category'],
            },
          },
        });
      }

      // Update cart total
      await updateCartTotal(strapi, cartId);

      return { data: cartItem };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return ctx.badRequest('Failed to add item to cart');
    }
  },

  // Update cart item quantity
  async updateItem(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to update cart');
    }

    const { id } = ctx.params;
    const { quantity } = ctx.request.body.data || ctx.request.body as UpdateQuantityInput;

    if (quantity === undefined || quantity < 1) {
      return ctx.badRequest('Valid quantity is required');
    }

    try {
      // Find cart item by documentId
      const cartItem = await strapi.db.query('api::cart-item.cart-item').findOne({
        where: { documentId: id },
        populate: ['cart', 'cart.user', 'product'],
      });

      if (!cartItem) {
        return ctx.notFound('Cart item not found');
      }

      if ((cartItem as any).cart?.user?.id !== user.id) {
        return ctx.forbidden('You can only update your own cart items');
      }

      // Check stock
      const stockQuantity = (cartItem as any).product?.stockQuantity ?? (cartItem as any).product?.stock ?? 0;
      if (stockQuantity < quantity) {
        return ctx.badRequest(`Insufficient stock. Available: ${stockQuantity}`);
      }

      // Update quantity using db.query with numeric ID
      const updatedItem = await strapi.db.query('api::cart-item.cart-item').update({
        where: { id: cartItem.id },
        data: { quantity },
        populate: {
          product: {
            populate: ['images', 'brand', 'category'],
          },
        },
      });

      // Update cart total
      await updateCartTotal(strapi, (cartItem as any).cart.id);

      return { data: updatedItem };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return ctx.badRequest('Failed to update cart item');
    }
  },

  // Remove item from cart
  async removeItem(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to remove items from cart');
    }

    const { id } = ctx.params;

    try {
      // Find cart item by documentId
      const cartItem = await strapi.db.query('api::cart-item.cart-item').findOne({
        where: { documentId: id },
        populate: ['cart', 'cart.user'],
      });

      if (!cartItem) {
        return ctx.notFound('Cart item not found');
      }

      if ((cartItem as any).cart?.user?.id !== user.id) {
        return ctx.forbidden('You can only remove your own cart items');
      }

      const cartId = (cartItem as any).cart.id;

      // Delete using db.query with numeric ID
      await strapi.db.query('api::cart-item.cart-item').delete({
        where: { id: cartItem.id },
      });

      // Update cart total
      await updateCartTotal(strapi, cartId);

      return { data: { deleted: true } };
    } catch (error) {
      console.error('Error removing cart item:', error);
      return ctx.badRequest('Failed to remove cart item');
    }
  },

  // Clear entire cart
  async clear(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to clear cart');
    }

    try {
      // Find cart using db.query
      const cart = await strapi.db.query('api::cart.cart').findOne({
        where: { user: user.id },
        populate: ['cartItems'],
      });

      if (!cart) {
        return { data: { cleared: true } };
      }

      // Delete all cart items using db.query
      if (cart.cartItems && cart.cartItems.length > 0) {
        for (const item of cart.cartItems) {
          await strapi.db.query('api::cart-item.cart-item').delete({
            where: { id: item.id },
          });
        }
      }

      // Update total to 0
      await strapi.db.query('api::cart.cart').update({
        where: { id: cart.id },
        data: { total: 0 },
      });

      return { data: { cleared: true } };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return ctx.badRequest('Failed to clear cart');
    }
  },

  // Get cart item count
  async count(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      const cart = await strapi.db.query('api::cart.cart').findOne({
        where: { user: user.id },
        populate: ['cartItems'],
      });

      const count = cart?.cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

      return { data: { count } };
    } catch (error) {
      console.error('Error getting cart count:', error);
      return ctx.badRequest('Failed to get cart count');
    }
  },
}));

// Helper function to update cart total
async function updateCartTotal(strapi: any, cartId: number) {
  const cart = await strapi.db.query('api::cart.cart').findOne({
    where: { id: cartId },
    populate: {
      cartItems: {
        populate: ['product'],
      },
    },
  });

  let total = 0;
  if (cart?.cartItems) {
    total = cart.cartItems.reduce((sum: number, item: any) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  }

  await strapi.db.query('api::cart.cart').update({
    where: { id: cartId },
    data: { total },
  });
}
