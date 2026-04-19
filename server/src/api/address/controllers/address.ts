/**
 * address controller
 */

import { factories } from '@strapi/strapi';

// Helper to unset primary addresses for a user
async function unsetPrimaryAddresses(strapi: any, userId: number) {
  const primaryAddresses = await strapi.entityService.findMany('api::address.address', {
    filters: { user: userId, isPrimary: true },
  });
  
  for (const addr of primaryAddresses) {
    const docId = addr.documentId || addr.id;
    await strapi.entityService.update('api::address.address', docId, {
      data: { isPrimary: false },
    });
  }
}

// Helper to find address by documentId or numeric id (always returns documentId-ready object)
async function findAddressById(strapi: any, id: string | number) {
  const idStr = String(id);

  // Try by documentId (preferred in Strapi v5)
  let address = await strapi.db.query('api::address.address').findOne({
    where: { documentId: idStr },
    populate: ['user'],
  });

  // Fallback: try by numeric id
  if (!address && /^\d+$/.test(idStr)) {
    address = await strapi.db.query('api::address.address').findOne({
      where: { id: parseInt(idStr, 10) },
      populate: ['user'],
    });
  }

  return address;
}

// Transform address for consistent response
function transformAddress(addr: any) {
  return {
    id: addr.id,
    documentId: addr.documentId,
    label: addr.label,
    fullName: addr.fullName,
    phone: addr.phone,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    country: addr.country,
    isPrimary: addr.isPrimary,
    type: addr.type,
  };
}

export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  // Get current user's addresses
  async find(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view addresses');
    }

    const addresses = await strapi.entityService.findMany('api::address.address', {
      filters: {
        user: user.id,
      },
      sort: { isPrimary: 'desc', createdAt: 'desc' },
    });

    const transformedAddresses = addresses.map(transformAddress);

    return { data: transformedAddresses };
  },

  // Get single address (must own it)
  async findOne(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view this address');
    }

    const { id } = ctx.params;
    const address = await findAddressById(strapi, id);

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.user?.id !== user.id) {
      return ctx.forbidden('You can only view your own addresses');
    }

    return { data: transformAddress(address) };
  },

  // Create new address
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to create an address');
    }

    const data = ctx.request.body.data || ctx.request.body;

    // Validate required fields
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!data[field]) {
        return ctx.badRequest(`${field} is required`);
      }
    }

    // If this is set as primary, unset other primary addresses
    if (data.isPrimary) {
      await unsetPrimaryAddresses(strapi, user.id);
    }

    // Create address
    const address = await strapi.entityService.create('api::address.address', {
      data: {
        ...data,
        user: user.id,
      },
    });

    // If no address is primary yet, make this one primary
    if (!data.isPrimary) {
      const existing = await strapi.entityService.findMany('api::address.address', {
        filters: { user: user.id, isPrimary: true },
      });
      if (existing.length === 0) {
        const docId = address.documentId || address.id;
        await strapi.entityService.update('api::address.address', docId, {
          data: { isPrimary: true },
        });
        address.isPrimary = true;
      }
    }

    return { data: transformAddress(address) };
  },

  // Update address (must own it)
  async update(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update this address');
    }

    const { id } = ctx.params;
    const data = ctx.request.body.data || ctx.request.body;

    const existing = await findAddressById(strapi, id);

    if (!existing) {
      return ctx.notFound('Address not found');
    }

    if (existing.user?.id !== user.id) {
      return ctx.forbidden('You can only update your own addresses');
    }

    // If setting as primary, unset others first
    if (data.isPrimary) {
      await unsetPrimaryAddresses(strapi, user.id);
    }

    const updated = await strapi.entityService.update('api::address.address', existing.documentId, {
      data,
    });

    return { data: transformAddress(updated) };
  },

  // Delete address (must own it)
  async delete(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to delete this address');
    }

    const { id } = ctx.params;

    const existing = await findAddressById(strapi, id);

    if (!existing) {
      return ctx.notFound('Address not found');
    }

    if (existing.user?.id !== user.id) {
      return ctx.forbidden('You can only delete your own addresses');
    }

    await strapi.entityService.delete('api::address.address', existing.documentId);

    return { data: { deleted: true } };
  },

  // Set address as primary
  async setPrimary(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { id } = ctx.params;
    const existing = await findAddressById(strapi, id);

    if (!existing) {
      return ctx.notFound('Address not found');
    }

    if (existing.user?.id !== user.id) {
      return ctx.forbidden('You can only update your own addresses');
    }

    // Unset all other primary
    await unsetPrimaryAddresses(strapi, user.id);

    // Set this one as primary
    const address = await strapi.entityService.update('api::address.address', existing.documentId, {
      data: { isPrimary: true },
    });

    return { data: transformAddress(address) };
  },
}));
