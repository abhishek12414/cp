/**
 * user-activity controller
 */

import { factories } from '@strapi/strapi';

// Type definitions for populated relations
interface PopulatedProduct {
  id: number;
  documentId: string;
  name: string;
}

interface PopulatedCategory {
  id: number;
  documentId: string;
  name: string;
}

interface PopulatedBrand {
  id: number;
  documentId: string;
  name: string;
}

interface UserActivityWithRelations {
  id: number;
  documentId: string;
  type: string;
  searchQuery?: string;
  product?: PopulatedProduct;
  category?: PopulatedCategory;
  brand?: PopulatedBrand;
  createdAt: string;
}

interface ProductWithRelations {
  id: number;
  documentId: string;
  name: string;
  price: number;
  images?: { url: string }[];
  category?: PopulatedCategory;
  brand?: PopulatedBrand;
}

export default factories.createCoreController('api::user-activity.user-activity', ({ strapi }) => ({
  // Track user activity
  async track(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { type, searchQuery, product, category, brand, metadata } = ctx.request.body.data || ctx.request.body;

    if (!type) {
      return ctx.badRequest('Activity type is required');
    }

    const activity = await strapi.entityService.create('api::user-activity.user-activity', {
      data: {
        type,
        searchQuery,
        product,
        category,
        brand,
        metadata,
        user: user.id,
      },
    });

    return { data: activity };
  },

  // Get user's recent searches
  async getRecentSearches(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const activities = await strapi.entityService.findMany('api::user-activity.user-activity', {
      filters: {
        user: user.id,
        type: 'search',
      },
      sort: { createdAt: 'desc' },
      limit: 10,
    });

    // Return unique search queries
    const uniqueSearches = [...new Set(activities.map((a) => a.searchQuery).filter(Boolean))];

    return { data: uniqueSearches };
  },

  // Get personalized recommendations
  async getRecommendations(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Get user's recent activities with populated relations
    const recentActivities = await strapi.entityService.findMany('api::user-activity.user-activity', {
      filters: { user: user.id },
      sort: { createdAt: 'desc' },
      limit: 50,
      populate: ['product', 'category', 'brand'],
    }) as unknown as UserActivityWithRelations[];

    // Extract interests
    const viewedProductIds: number[] = [];
    const viewedCategoryIds: number[] = [];
    const viewedBrandIds: number[] = [];
    const searchTerms: string[] = [];

    for (const activity of recentActivities) {
      if (activity.product) viewedProductIds.push(activity.product.id);
      if (activity.category) viewedCategoryIds.push(activity.category.id);
      if (activity.brand) viewedBrandIds.push(activity.brand.id);
      if (activity.searchQuery) searchTerms.push(activity.searchQuery.toLowerCase());
    }

    // Get products from viewed categories (excluding already viewed)
    let recommendedProducts: ProductWithRelations[] = [];

    if (viewedCategoryIds.length > 0) {
      const categoryProducts = await strapi.entityService.findMany('api::product.product', {
        filters: {
          category: { id: { $in: viewedCategoryIds } },
          id: { $notIn: viewedProductIds.length > 0 ? viewedProductIds : [0] },
        },
        populate: ['images', 'category', 'brand'],
        limit: 10,
      }) as unknown as ProductWithRelations[];
      recommendedProducts = [...recommendedProducts, ...categoryProducts];
    }

    // Get products from viewed brands (excluding already viewed)
    if (viewedBrandIds.length > 0 && recommendedProducts.length < 10) {
      const excludedIds = [...viewedProductIds, ...recommendedProducts.map((p) => p.id)];
      const brandProducts = await strapi.entityService.findMany('api::product.product', {
        filters: {
          brand: { id: { $in: viewedBrandIds } },
          id: { $notIn: excludedIds.length > 0 ? excludedIds : [0] },
        },
        populate: ['images', 'category', 'brand'],
        limit: 10 - recommendedProducts.length,
      }) as unknown as ProductWithRelations[];
      recommendedProducts = [...recommendedProducts, ...brandProducts];
    }

    // If still not enough, add random products
    if (recommendedProducts.length < 10) {
      const excludedIds = [...viewedProductIds, ...recommendedProducts.map((p) => p.id)];
      const randomProducts = await strapi.entityService.findMany('api::product.product', {
        filters: {
          id: { $notIn: excludedIds.length > 0 ? excludedIds : [0] },
        },
        sort: { createdAt: 'desc' },
        populate: ['images', 'category', 'brand'],
        limit: 10 - recommendedProducts.length,
      }) as unknown as ProductWithRelations[];
      recommendedProducts = [...recommendedProducts, ...randomProducts];
    }

    return { 
      data: recommendedProducts,
      meta: {
        basedOn: {
          categories: viewedCategoryIds.length,
          brands: viewedBrandIds.length,
          searches: searchTerms.length,
        }
      }
    };
  },
}));
