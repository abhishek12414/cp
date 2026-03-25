/**
 * upload-order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::upload-order.upload-order', ({ strapi }) => ({
  // Get current user's upload orders
  async find(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const uploadOrders = await strapi.entityService.findMany('api::upload-order.upload-order', {
      filters: { user: user.id },
      sort: { createdAt: 'desc' },
      populate: ['files', 'generatedOrder'],
    });

    return { data: uploadOrders };
  },

  // Get single upload order (must own it)
  async findOne(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    
    const uploadOrder = await strapi.db.query('api::upload-order.upload-order').findOne({
      where: { documentId: id, user: user.id },
      populate: ['files', 'generatedOrder'],
    });

    if (!uploadOrder) {
      return ctx.notFound('Upload order not found');
    }

    return { data: uploadOrder };
  },

  // Create new upload order
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { files, notes } = ctx.request.body.data || ctx.request.body;

    if (!files || files.length === 0) {
      return ctx.badRequest('At least one file is required');
    }

    const uploadOrder = await strapi.entityService.create('api::upload-order.upload-order', {
      data: {
        files,
        notes,
        user: user.id,
        status: 'pending',
      },
    });

    return { data: uploadOrder };
  },

  // Admin: Get all upload orders (for admin panel)
  async findAll(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if user is admin
    const isAdmin = user.role?.type === 'admin' || user.isAdmin === true;
    if (!isAdmin) {
      return ctx.forbidden('Admin access required');
    }

    const uploadOrders = await strapi.entityService.findMany('api::upload-order.upload-order', {
      sort: { createdAt: 'desc' },
      populate: ['files', 'user', 'generatedOrder'],
    });

    return { data: uploadOrders };
  },

  // Admin: Update upload order status and generate order
  async update(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const isAdmin = user.role?.type === 'admin' || user.isAdmin === true;
    if (!isAdmin) {
      return ctx.forbidden('Admin access required');
    }

    const { id } = ctx.params;
    const { status, adminNotes, totalAmount, generatedOrder } = ctx.request.body.data || ctx.request.body;

    const uploadOrder = await strapi.entityService.update('api::upload-order.upload-order', id, {
      data: {
        status,
        adminNotes,
        totalAmount,
        generatedOrder,
      },
    });

    return { data: uploadOrder };
  },
}));
