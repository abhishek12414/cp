import type { Core } from '@strapi/strapi';

/**
 * Helper to enable permissions for public role on specified models/actions.
 * This ensures APIs for attribute, brand, cart, etc., are accessible without auth
 * (listed/enabled under Settings > Users & Permissions > Public in admin UI).
 * Note: For production, restrict cart/order writes to authenticated roles for security.
 *
 * Types added for readability: explicit arrays, query result shapes (based on users-permissions plugin),
 * return Promise<void>, and error typing in catch.
 */
async function enablePublicPermissions(strapi: Core.Strapi): Promise<void> {
  // publicRole: query result for users-permissions role (id + type; null if not found)
  const publicRole = (await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } })) as { id: number; type: string } | null;

  if (publicRole) {
    // models: list of API UIDs matching content types for permissions
    const models: string[] = [
      'attribute',
      'brand',
      'cart',
      'category',
      'order',
      'order-item',
      'fee-config',
      'product',
      'product-attribute-value',
    ];
    // actions: CRUD actions for public role enablement
    const actions: ('find' | 'findOne' | 'create' | 'update' | 'delete')[] = ['find', 'findOne', 'create', 'update', 'delete'];

    // Generate all action IDs (e.g., 'api::product.product.find')
    // This is O(1) prep for batching.
    const actionIds: string[] = models.flatMap((model) =>
      actions.map((action) => `api::${model}.${model}.${action}`)
    );

    // Batch check: single findMany with $in operator (Strapi/DB supported) instead of N sequential findOne.
    // Much faster than loops with awaits; returns only existing perms for the public role.
    // Type as array of {id, action} for the fields we need.
    const existingPerms = (await strapi
      .query('plugin::users-permissions.permission')
      .findMany({
        where: {
          role: publicRole.id,
          action: { $in: actionIds },  // Batch filter
        },
        select: ['id', 'action'],  // Only fetch needed fields for efficiency
      })) as Array<{ id: number; action: string }>;

    // Compute deltas for batch ops: sets/maps for O(1) lookup.
    const existingActionSet = new Set(existingPerms.map((p) => p.action));
    const toCreate: Array<{ action: string; role: number; enabled: boolean }> = actionIds
      .filter((actionId) => !existingActionSet.has(actionId))
      .map((actionId) => ({
        action: actionId,
        role: publicRole.id,
        enabled: true,
      }));
    const toUpdateIds: number[] = existingPerms.map((p) => p.id);

    // Batch writes in parallel with Promise.all:
    // - createMany for new perms (if any): single query vs. N creates.
    // - updateMany for existing (set enabled=true): single query vs. N updates.
    // Safe/parallel since independent; filters empty to avoid no-op errors.
    // This reduces queries from ~80 sequential to ~3 max , avoiding loop bottlenecks.
    await Promise.all([
      toCreate.length > 0 &&
        strapi.query('plugin::users-permissions.permission').createMany({
          data: toCreate,
        }),
      toUpdateIds.length > 0 &&
        strapi.query('plugin::users-permissions.permission').updateMany({
          where: { id: { $in: toUpdateIds } },
          data: { enabled: true },
        }),
    ].filter(Boolean) as Promise<any>[]);  // Type guard for Promise.all

    console.log('✅ Public role permissions enabled for e-commerce APIs (Cart, Order, Product, etc.)');
  } else {
    console.warn('⚠️ Public role not found; permissions not auto-configured.');
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  // Explicitly type the register callback param and void return for Strapi bootstrap API contract.
  register({ strapi }: { strapi: Core.Strapi }): void {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  // bootstrap param typed (Strapi lifecycle); calls typed helper above.
  bootstrap({ strapi }: { strapi: Core.Strapi }): void {
    // Auto-enable public access for the APIs so frontend can fetch/create
    // carts, orders, products, brands, etc. without auth (configurable later)
    // err: generic Error for logging.
    enablePublicPermissions(strapi).catch((err: Error) => {
      console.error('❌ Failed to configure public permissions:', err);
    });
  },
};
