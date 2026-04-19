/**
 * fee-config controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::fee-config.fee-config', ({ strapi }) => ({
  // Get active fee config (for checkout calculations)
  async getActive(ctx) {
    try {
      const activeConfig = await strapi.db.query('api::fee-config.fee-config').findOne({
        where: { isActive: true },
        orderBy: { id: 'desc' },
      });

      if (!activeConfig) {
        // Return default config if none configured
        return {
          data: {
            platformFee: 0,
            deliveryFee: 50,
            packagingFee: 20,
            freeDeliveryThreshold: 1000,
            deliveryTimeMinDays: 3,
            deliveryTimeMaxDays: 5,
          },
        };
      }

      return { data: activeConfig };
    } catch (error) {
      console.error('Error fetching fee config:', error);
      return ctx.badRequest('Failed to fetch fee configuration');
    }
  },
}));
