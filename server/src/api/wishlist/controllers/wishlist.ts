/**
 * wishlist controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wishlist.wishlist', ({ strapi }) => ({
  // Get current user's wishlist
  async find(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your wishlist');
    }

    const wishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
      },
      populate: {
        product: {
          populate: ['images', 'brand', 'category'],
        },
      },
    });

    return { data: wishlists };
  },

  // Add product to wishlist
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to add to wishlist');
    }

    const { product: productId } = ctx.request.body.data || ctx.request.body;

    if (!productId) {
      return ctx.badRequest('Product ID is required');
    }

    // Check if already in wishlist
    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    if (existing.length > 0) {
      // Already in wishlist, return the existing one
      return { data: existing[0], meta: { alreadyExists: true } };
    }

    // Create new wishlist entry
    const wishlist = await strapi.entityService.create('api::wishlist.wishlist', {
      data: {
        user: user.id,
        product: productId,
      },
      populate: {
        product: {
          populate: ['images', 'brand', 'category'],
        },
      },
    });

    return { data: wishlist };
  },

  // Remove product from wishlist
  async delete(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to remove from wishlist');
    }

    const { id } = ctx.params;

    // Find the wishlist entry
    const wishlist = await strapi.entityService.findOne('api::wishlist.wishlist', id, {
      populate: ['user'],
    });

    if (!wishlist) {
      return ctx.notFound('Wishlist entry not found');
    }

    // Check if user owns this wishlist entry
    if ((wishlist as any).user?.id !== user.id) {
      return ctx.forbidden('You can only remove your own wishlist items');
    }

    await strapi.entityService.delete('api::wishlist.wishlist', id);

    return { data: { deleted: true } };
  },

  // Toggle wishlist (add if not present, remove if present)
  async toggle(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to toggle wishlist');
    }

    const { product: productId } = ctx.request.body.data || ctx.request.body;

    if (!productId) {
      return ctx.badRequest('Product ID is required');
    }

    // Check if already in wishlist
    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    if (existing.length > 0) {
      // Remove from wishlist
      await strapi.entityService.delete('api::wishlist.wishlist', existing[0].id);
      return { data: { inWishlist: false, removed: true } };
    } else {
      // Add to wishlist
      const wishlist = await strapi.entityService.create('api::wishlist.wishlist', {
        data: {
          user: user.id,
          product: productId,
        },
        populate: {
          product: {
            populate: ['images', 'brand', 'category'],
          },
        },
      });
      return { data: { inWishlist: true, added: true, wishlist } };
    }
  },

  // Check if product is in wishlist
  async check(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return { data: { inWishlist: false } };
    }

    const { productId } = ctx.query;

    if (!productId) {
      return ctx.badRequest('Product ID is required');
    }

    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    return { data: { inWishlist: existing.length > 0 } };
  },
}));
