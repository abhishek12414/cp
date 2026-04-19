/**
 * fee-config router
 */

export default {
  routes: [
    // Get active fee config for checkout
    {
      method: 'GET',
      path: '/fee-configs/active',
      handler: 'fee-config.getActive',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Default CRUD (admin can manage configs)
    {
      method: 'GET',
      path: '/fee-configs',
      handler: 'fee-config.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/fee-configs',
      handler: 'fee-config.create',
      config: {
        policies: [],
      },
    },
  ],
};
