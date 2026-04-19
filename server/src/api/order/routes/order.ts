/**
 * order router
 */

export default {
  routes: [
    // Standard CRUD (keep basic)
    {
      method: 'GET',
      path: '/orders',
      handler: 'order.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/:id',
      handler: 'order.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        policies: [],
      },
    },
    // Custom Checkout - Main entry point for COD checkout flow
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'order.checkout',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
