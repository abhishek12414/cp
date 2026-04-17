/**
 * cart router
 */

export default {
  routes: [
    // Get user's cart
    {
      method: 'GET',
      path: '/carts/me',
      handler: 'cart.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Add item to cart
    {
      method: 'POST',
      path: '/carts/add',
      handler: 'cart.addItem',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Update cart item quantity
    {
      method: 'PUT',
      path: '/carts/items/:id',
      handler: 'cart.updateItem',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Remove item from cart
    {
      method: 'DELETE',
      path: '/carts/items/:id',
      handler: 'cart.removeItem',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Clear cart
    {
      method: 'DELETE',
      path: '/carts/clear',
      handler: 'cart.clear',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get cart item count
    {
      method: 'GET',
      path: '/carts/count',
      handler: 'cart.count',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
