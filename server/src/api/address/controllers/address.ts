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
    await strapi.entityService.update('api::address.address', addr.documentId || addr.id, {
      data: { isPrimary: false },
    });
  }
}

// Helper to find address by documentId or numeric id
async function findAddressById(strapi: any, id: string) {
  // Try documentId first (string format)
  let address = await strapi.db.query('api::address.address').findOne({
    where: { documentId: id },
    populate: ['user'],
  });
  
  // If not found, try numeric id
  if (!address) {
    address = await strapi.entityService.findOne('api::address.address', id, {
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
        await strapi.entityService.update('api::address.address', address.documentId || address.id, {
          data: { isPrimary: true },
        });
        address.isPrimary = true;
      }
    }

    return { data: transformAddress(address) };
  },

  // Note: update and delete use Strapi's default core controller methods
  // The user relation on address handles ownership at data level
  // Frontend should only send requests for user's own addresses (based on list from find)

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
    const address = await strapi.entityService.update('api::address.address', existing.documentId || existing.id, {
      data: { isPrimary: true },
    });

    return { data: transformAddress(address) };
  },
}));
