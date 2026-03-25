/**
 * address router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/addresses',
      handler: 'address.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/addresses/:id',
      handler: 'address.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/addresses',
      handler: 'address.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/addresses/:id',
      handler: 'address.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/addresses/:id',
      handler: 'address.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/addresses/:id/set-primary',
      handler: 'address.setPrimary',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
