# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

## 🛒 Product Schema Design (Scalable & Future-Proof)

### Overview
Implemented an EAV (Entity-Attribute-Value) based schema for Products with dynamic attributes associated at the *product type* (Category) level. This supports common attributes (e.g., name, price, category, **brand**) + type-specific dynamic ones (e.g., Bulb.wattage vs. Wire.gauge) using Strapi content types/relations on SQLite. Fully flexible: add new types/attrs/brands without core table changes. Each product belongs to exactly one Brand (one-to-many: Brand → Products).

**Key Principles:**
- **Scalable Core Product**: Only common fields (name, price, etc.). No hardcoded category-specific fields. Now includes Brand relation for organization.
- **Type-Associated Dynamic Attributes**: Attributes defined per Category (product type); values stored via EAV for consistency/validation.
- **Brand Association**: One-to-many relation (Product manyToOne to Brand) for grouping/filtering products by brand (e.g., Philips bulbs).
- **Category-based Organization**: `Category` links to `Attribute` set; Products inherit via category.
- **Future-Proof**: New product types (e.g., "Solar Panel"), attrs (e.g., "efficiency"), or brands added via admin/data; extensible to custom field types.
- **Performance**: Dedicated indexes on FKs (incl. brand), search fields, and EAV values for filtering/joins (e.g., products by brand/category or attribute).

### Content Types & Structure
- **api::brand.brand** (Brand Details)
  - name (string, unique), slug (uid), description (text), logo (media), website (string), isActive (boolean)
  - products (oneToMany to Product)
- **api::category.category** (Product Type)
  - name (string, unique), slug (uid), description (text)
  - products (oneToMany to Product)
  - attributes (manyToMany to Attribute) -- associates type-specific attrs
- **api::attribute.attribute** (Dynamic Attr Definition)
  - name, slug, fieldType (enum: string/number/boolean/select/text), unit, options (JSON for selects), isFilterable, isRequired, description
  - categories (manyToMany), productAttributeValues (oneToMany)
- **api::product.product**
  - name, slug, description (richtext), price (decimal), sku (unique), stockQuantity, images (media)
  - category (manyToOne to Category), brand (manyToOne to Brand)
  - attributeValues (oneToMany to ProductAttributeValue)
  - cartItems (oneToMany to CartItem), orderItems (oneToMany to OrderItem) -- for e-com links
- **api::product-attribute-value.product-attribute-value** (EAV Values)
  - value (text -- flexible, parsed by attribute's fieldType)
  - product (manyToOne), attribute (manyToOne)
- **api::cart.cart** (Shopping Cart)
  - user (oneToOne to User), cartItems (oneToMany to CartItem), total (decimal)
- **api::cart-item.cart-item** (Cart Item)
  - quantity (integer), cart (manyToOne), product (manyToOne to Product) -- links to brand via product
- **api::order.order** (Order)
  - orderNumber (uid), user (manyToOne to User), status (enum: pending/shipped/etc.), totalPrice (decimal), shippingAddress (text), orderItems (oneToMany), notes
- **api::order-item.order-item** (Order Item)
  - quantity (integer), priceAtPurchase (decimal snapshot), order (manyToOne), product (manyToOne to Product) -- links to brand via product

*Note: User relations (for cart/order) are fully bidirectional via extension in src/extensions/users-permissions/content-types/user/schema.json (fixes inversedBy errors; merges with plugin defaults).*

### Example Usage (Association & Data)
- **Cart Flow**: Create cart for user, add CartItem: {cart: userCart, product: "LED Bulb" (Philips brand), quantity: 2}. Total auto-computable.
- **Order Flow**: From cart, create Order: {user, status: "pending", totalPrice: 20.00, orderItems: [{product: "LED Bulb", quantity: 2, priceAtPurchase: 10.00}, ...]}. Populate brand via product: e.g., Philips products in shipped order.
- **Queries**: `/api/carts?filters[user][id][$eq]=1&populate[cartItems][populate]=product.brand` or `/api/orders?populate[orderItems][populate]=product.brand&filters[status][$eq]=shipped`
- **Products/Brand Link**: E.g., Philips (brand) Bulb (product) appears in carts/orders/items; use for inventory/sales reports.
- New: Add product to cart/order easily; EAV attrs (e.g., wattage) populate via product.

### API Configuration (Controllers, Routes, Services & Permissions)
- **Core Factories Used**: For each model (attribute, brand, cart, category, order, order-item, product, product-attribute-value):
  - `controllers/*.js`: `createCoreController('api::model.model')`
  - `services/*.js`: `createCoreService('api::model.model')`
  - `routes/*.js`: `createCoreRouter('api::model.model')`
  - Explicitly defined in `src/api/<model>/{controllers,routes,services}/` (overrides Strapi auto-gen for customization).
- **Public Access**: Bootstrap in `src/index.ts` auto-enables CRUD permissions for the **public** role (find/findOne/create/update/delete) on all APIs. This ensures frontend can access without auth (visible/enabled under **Settings > Users & Permissions Plugin > Roles > Public**).
  - Runs on startup; logs confirmation.
  - **Security Note**: In prod, restrict sensitive actions (e.g., cart/order create) to authenticated roles via admin UI or custom logic.
- Restart server after changes for perms to apply.

### Database
- SQLite (`.tmp/data.db`)
- Strapi auto-handles basic indexes for unique fields, FKs (e.g., brand, category, product in items), and joins; custom migrations can be added to `database/migrations/` for advanced perf (e.g., composite on order items).
- Run `npm run develop` to sync schemas and populate via Admin panel (http://localhost:1337/admin).
- Join table for cat-attr (e.g., `categories_attributes_lnk`) auto-managed by Strapi.

This EAV + Brand + Cart/Order ensures clean structure, type/brand-level associations for dynamic attrs, and full e-commerce scalability. For advanced (e.g., typed values, validation hooks, lifecycle totals, payments), extend as needed.

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
