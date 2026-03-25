/**
 * wishlist router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/wishlists',
      handler: 'wishlist.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wishlists',
      handler: 'wishlist.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/wishlists/:id',
      handler: 'wishlist.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wishlists/toggle',
      handler: 'wishlist.toggle',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/wishlists/check',
      handler: 'wishlist.check',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
