/**
 * order controller
 * 
 * Custom checkout flow for COD:
 * - Validates stock at checkout time
 * - Calculates fees from fee-config
 * - Creates order + orderItems with price snapshot
 * - Reduces product stock on success
 * - Clears cart ONLY on successful order creation
 * - On any failure: returns error, keeps cart intact
 */

import { factories } from '@strapi/strapi';

interface CheckoutInput {
  addressId?: number | string;
  paymentMethod?: 'cod';
  notes?: string;
}

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  // Main checkout endpoint - POST /api/orders/checkout
  async checkout(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to checkout');
    }

    const { addressId, notes = '' } = (ctx.request.body.data || ctx.request.body) as CheckoutInput;

    try {
      // 1. Fetch user's cart with items and products (with stock)
      const cart = await strapi.db.query('api::cart.cart').findOne({
        where: { user: user.id },
        populate: {
          cartItems: {
            populate: {
              product: true,
            },
          },
        },
      });

      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return ctx.badRequest('Your cart is empty');
      }

      // 2. Validate stock for all items (critical check at checkout time)
      const outOfStockItems: string[] = [];
      const cartItems = cart.cartItems;

      for (const item of cartItems) {
        const product = item.product;
        const currentStock = product?.stockQuantity ?? product?.stock ?? 0;
        if (currentStock < item.quantity) {
          outOfStockItems.push(product?.name || `Product #${product?.id}`);
        }
      }

      if (outOfStockItems.length > 0) {
        return ctx.badRequest({
          error: 'Some items are out of stock',
          outOfStockItems,
          message: `The following items are out of stock: ${outOfStockItems.join(', ')}. Please remove them from cart to proceed.`,
        });
      }

      // 3. Fetch active fee config
      const feeConfig = await strapi.db.query('api::fee-config.fee-config').findOne({
        where: { isActive: true },
      }) || {
        platformFee: 0,
        deliveryFee: 50,
        packagingFee: 20,
        freeDeliveryThreshold: 1000,
        deliveryTimeMinDays: 3,
        deliveryTimeMaxDays: 5,
      };

      // 4. Calculate amounts
      const subtotal = cartItems.reduce((sum: number, item: any) => {
        const price = item.product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      const platformFee = feeConfig.platformFee || 0;
      const packagingFee = feeConfig.packagingFee || 0;

      let deliveryFee = feeConfig.deliveryFee || 0;
      if (feeConfig.freeDeliveryThreshold && subtotal >= feeConfig.freeDeliveryThreshold) {
        deliveryFee = 0;
      }

      const totalPrice = subtotal + deliveryFee + platformFee + packagingFee;

      // 5. Resolve shipping address (snapshot as text or relation)
      let shippingAddressText = '';
      if (addressId) {
        // Support both numeric id and documentId (Strapi v5)
        const addressIdStr = String(addressId);
        let address = null;

        if (/^\d+$/.test(addressIdStr)) {
          // Numeric ID
          address = await strapi.db.query('api::address.address').findOne({
            where: { id: parseInt(addressIdStr, 10), user: user.id },
          });
        } else {
          // Document ID (string)
          address = await strapi.db.query('api::address.address').findOne({
            where: { documentId: addressIdStr, user: user.id },
          });
        }

        if (address) {
          shippingAddressText = `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}, ${address.phone}`;
        }
      }

      if (!shippingAddressText) {
        // Try to get primary address
        const primaryAddress = await strapi.db.query('api::address.address').findOne({
          where: { user: user.id, isPrimary: true },
        });
        if (primaryAddress) {
          shippingAddressText = `${primaryAddress.fullName}, ${primaryAddress.addressLine1}, ${primaryAddress.city} - ${primaryAddress.pincode}`;
        } else {
          return ctx.badRequest('Please select or add a shipping address');
        }
      }

      // Calculate expected delivery date
      const minDays = feeConfig.deliveryTimeMinDays || 3;
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + minDays);

      // 6. Create the Order
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;

      const order = await strapi.db.query('api::order.order').create({
        data: {
          orderNumber,
          user: user.id,
          status: 'pending',
          totalPrice,
          subtotal,
          deliveryFee,
          platformFee,
          packagingFee,
          paymentMethod: 'cod',
          shippingAddress: shippingAddressText,
          notes,
          expectedDeliveryDate: expectedDeliveryDate.toISOString().split('T')[0],
        },
      });

      // 7. Create OrderItems + Reduce stock
      for (const item of cartItems) {
        const product = item.product;
        const priceAtPurchase = product.price;

        // Create order item
        await strapi.db.query('api::order-item.order-item').create({
          data: {
            order: order.id,
            product: product.id,
            quantity: item.quantity,
            priceAtPurchase,
          },
        });

        // Reduce stock
        const newStock = Math.max(0, (product.stockQuantity ?? product.stock ?? 0) - item.quantity);
        await strapi.db.query('api::product.product').update({
          where: { id: product.id },
          data: { stockQuantity: newStock },
        });
      }

      // 8. Clear the cart ONLY after successful order creation and stock update
      if (cart.cartItems && cart.cartItems.length > 0) {
        for (const item of cart.cartItems) {
          await strapi.db.query('api::cart-item.cart-item').delete({
            where: { id: item.id },
          });
        }
        await strapi.db.query('api::cart.cart').update({
          where: { id: cart.id },
          data: { total: 0 },
        });
      }

      // 9. Fetch full order with items for response
      const fullOrder = await strapi.db.query('api::order.order').findOne({
        where: { id: order.id },
        populate: {
          orderItems: {
            populate: {
              product: {
                populate: ['images', 'brand'],
              },
            },
          },
          user: true,
        },
      });

      return {
        data: {
          order: fullOrder,
          message: 'Order placed successfully! You will receive a confirmation shortly.',
          expectedDelivery: `Expected delivery in ${minDays}-${feeConfig.deliveryTimeMaxDays || 5} days`,
        },
      };
    } catch (error: any) {
      console.error('Checkout error:', error);
      // IMPORTANT: Cart is NOT cleared on failure
      return ctx.badRequest({
        error: 'Checkout failed',
        message: error?.message || 'Failed to place order. Please try again.',
      });
    }
  },

  // Get current user's orders (enhanced)
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const orders = await strapi.db.query('api::order.order').findMany({
      where: { user: user.id },
      populate: {
        orderItems: {
          populate: { product: { populate: ['images', 'brand'] } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: orders };
  },
}));
