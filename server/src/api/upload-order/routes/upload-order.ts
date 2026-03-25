/**
 * upload-order router
 */

export default {
  routes: [
    // User routes
    {
      method: 'GET',
      path: '/upload-orders',
      handler: 'upload-order.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/upload-orders/:id',
      handler: 'upload-order.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/upload-orders',
      handler: 'upload-order.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Admin routes
    {
      method: 'GET',
      path: '/upload-orders-admin/all',
      handler: 'upload-order.findAll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/upload-orders-admin/:id',
      handler: 'upload-order.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
