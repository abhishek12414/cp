# Developer Experience (DX) Improvements & Architecture Documentation

## Overview

This document outlines the Developer Experience improvements implemented in the CurrentShop (Currentshop) e-commerce codebase (React Native Expo mobile app + Strapi v5 backend) and provides comprehensive Architecture Documentation.

The improvements focus on productivity, maintainability, scalability, type safety, environment management, and developer ergonomics.

---

## List of All Developer Experience Improvements Made

1. **Multi-Environment Configuration & Switching**
   - Dedicated `APP_ENV` support (development, staging, production).
   - Scripts in package.json: `start`, `start:staging`, `start:prod`, `android:staging`, etc.
   - Separate `.env`, `.env.staging`, `.env.production` files.
   - EAS build profiles in `eas.json` tied to envs.
   - Dynamic loading via babel plugin.

2. **Dynamic Environment Variables with react-native-dotenv**
   - Configured in `babel.config.js` to load `.env.${APP_ENV || 'development'}`.
   - Enables seamless switching without code changes or rebuilds for config.

3. **Path Aliases for Clean Imports**
   - `tsconfig.json` configured with `"@/*": ["./*"]`.
   - Allows `import X from "@/apis/apiClient"` instead of relative `../../../` hell.

4. **Centralized API Endpoint Management**
   - All routes defined in `apis/apiRoutes.tsx` as constants and functions.
   - Easy to update, autocomplete, and avoid hard-coded strings.
   - `getFullUrl` helper.

5. **Axios API Client with Interceptors**
   - `apis/apiClient.ts`: Auth token attachment from AsyncStorage, 401 auto-logout, timeout, JSON headers.
   - Reusable across all API files (auth.api.ts, product.api.ts, etc.).

6. **React Query Integration for Data Fetching**
   - `@tanstack/react-query` v5 used.
   - Dedicated `hooks/queries/` folder with hooks like `useProduct.ts`, `useCart.ts`, `useOrders.ts`, `useWishlist.ts`, etc.
   - Query keys, caching, `staleTime`, `enabled` flags, initialData.
   - Automatic background refetch, optimistic updates potential.

7. **Redux Toolkit for Global State**
   - `store.tsx` with RTK `configureStore`.
   - Reducers: `auth.reducer.ts`, `cart.reducer.ts`, `wishlist.reducer.ts`, `ui.reducer.ts`.
   - Serializable check disabled for complex state (e.g., dates).
   - Typed `RootState`, `AppDispatch`.

8. **Centralized Form Validation**
   - `helpers/validation/` with Yup schemas: `product.ts`, `category.ts`, `brand.ts`, `address.ts`.
   - Export schemas + `initialValues` + TypeScript types for forms (used with Formik).
   - Consistent error messages and rules.

9. **Reusable Form & UI Components**
   - `components/FormField.tsx` for consistent inputs.
   - Themed components: `ThemedText.tsx`, `ThemedView.tsx`.
   - `LoadingScreen.tsx`, `OfflineScreen.tsx`.
   - UI library: `react-native-paper` + custom `components/ui/`.

10. **Expo Router File-Based Navigation with Groups**
    - Organized routes: `(tabs)/`, `(admin)/`, `(auth)/`.
    - Dynamic routes: `product/[id].tsx`, `category/[id].tsx`, `brands/[id].tsx`.
    - `_layout.tsx` files for nested navigators.
    - Deep linking support with `parseDeepLink` in `helpers/share.ts`.

11. **Strapi Bootstrap Auto-Permissions**
    - `server/src/index.ts`: `enablePublicPermissions` runs on bootstrap.
    - Batch creates/updates public role perms for all e-com models (product, cart, order, etc.) using efficient queries (`findMany` + `createMany`/`updateMany`).
    - Reduces manual admin panel config; logs success. Typed for TS.

12. **Comprehensive TypeScript Interfaces**
    - `interface/` folder: `product.ts`, `brand.ts`, `category.ts`, `address.ts`, `uploadOrder.ts`, `api.ts`, `attribute.ts`, `filter.ts`, `image.ts`.
    - Server: `types/generated/` from Strapi.
    - Strict TS in tsconfig.

13. **Query Params Helper for Strapi Filters**
    - `helpers/queryParams.ts`: `getQueryString` builds complex `?filters[...]&populate=...` strings.
    - Used in all query hooks for consistent API calls.

14. **Offline Resilience & Network Handling**
    - Connectivity checks in auth flow.
    - `OfflineScreen` with retry.
    - AppState listener to re-validate auth on foreground.
    - Token persistence + auto-remove on 401.

15. **Deep Linking & Universal Links**
    - `Linking` listeners + `parseDeepLink` helper.
    - Routes for product, category deep links.

16. **Admin Features in Mobile App**
    - `(admin)/` route group: brands, categories, products, orders, upload-orders management.
    - Dynamic admin screens like `brands/[id].tsx`, `products/[id].tsx`.
    - Upload orders for bulk/custom purchases.

17. **Specialized Upload & Image Features**
    - `components/ImagePicker.tsx`, `apis/upload.api.ts`, `uploadOrder.api.ts`.
    - Camera, gallery, multiple file support via expo-image-picker.

18. **Wishlist & Cart Sync**
    - Local Redux state + API sync via hooks.
    - Reducers handle optimistic-like updates.

19. **Theming & Color Scheme**
    - `hooks/useColorScheme.ts` (with web variant).
    - `theme.tsx`, `constants/Colors.ts`.
    - React Navigation ThemeProvider.

20. **ESLint + Scripts**
    - `eslint.config.js` (flat config, expo preset).
    - `lint` and `lint:fix` scripts.

21. **Splash Screen & Asset Loading**
    - `SplashScreen.preventAutoHideAsync()` + font loading in root layout.
    - Proper hiding after assets ready.

22. **Helper Utilities**
    - `helpers/dataFormatter.ts`, `image.ts`, `share.ts`.
    - Mock data in `mock/` for dev/testing.

23. **Server-Side DX**
    - Strapi v5 with TS configs.
    - EAV schema for flexible products (detailed in README.md).
    - Core factories + explicit controllers/routes/services for customization.
    - Migrations folder ready.
    - PG + SQLite support.

24. **Package Management & Tooling**
    - Expo ~54, React 19, RN 0.81.
    - Dev deps: TS, ESLint, types.
    - reset-project script.

---

## Architecture Documentation

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CurrentShop                          │
├──────────────────────────────┬──────────────────────────────┤
│         Mobile (Expo)        │        Backend (Strapi)      │
│  - React Native + Expo 54    │  - Strapi v5 (Node/TS)       │
│  - Expo Router (file-based)  │  - SQLite (dev) / Postgres   │
│  - React Query + Redux RTK   │  - EAV for Products + Brand  │
│  - Formik + Yup              │  - REST API /api/*           │
│  - React Native Paper        │  - Users & Permissions       │
│  - EAS Builds                │  - Admin Panel (port 1337)   │
└──────────────────────────────┴──────────────────────────────┘
```

**Communication**: Mobile → Strapi via Axios (JSON, auth Bearer token).

### Mobile App Architecture

#### Directory Structure (Key Parts)

```
mobile/
├── app/                  # Expo Router screens & layouts
│   ├── (tabs)/           # Bottom tab nav (home, categories, account, admin)
│   ├── (admin)/          # Admin management screens
│   ├── (auth)/           # Auth group
│   ├── product/[id].tsx  # Dynamic product detail
│   ├── _layout.tsx       # Root layout + providers + AuthProvider
│   └── ...
├── apis/                 # API layer
│   ├── apiClient.ts      # Axios instance + interceptors
│   ├── apiRoutes.tsx     # Endpoint constants
│   └── *.api.ts          # Resource-specific API functions
├── components/
│   ├── ui/               # Base UI (BannerCarousel, ProductCard, etc.)
│   ├── FormField.tsx
│   ├── LoadingScreen.tsx
│   └── ...
├── hooks/
│   ├── queries/          # React Query hooks (useProduct.ts, useCart.ts, ...)
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
├── reducers/             # Redux slices (auth, cart, wishlist, ui)
├── store.tsx             # RTK store
├── helpers/
│   ├── validation/       # Yup schemas
│   ├── queryParams.ts
│   ├── image.ts
│   └── share.ts
├── interface/            # TS interfaces for all entities
├── constants/            # Colors, theme
├── mock/                 # Mock data for dev
├── assets/
└── ...
```

#### Navigation Architecture
- **Expo Router**: File system = routes. Groups `(tabs)`, `(admin)`, `(auth)` don't add segments.
- Root `_layout.tsx` handles:
  - Font loading + SplashScreen
  - QueryClientProvider + Redux Provider + ThemeProvider
  - AuthProvider (token check, offline, deep links, app state)
  - Conditional navigator: auth screens vs app screens vs offline
- Deep links: `currentshop://product/123` → `/product/123`

#### State Management
- **Server State**: React Query (products, cart, orders, wishlist, recommendations).
- **Client State**: Redux (auth user, cart items local, wishlist, UI flags like loading/offline).
- Sync: Mutations invalidate relevant queries; auth token in both.

#### Data Fetching Pattern (Example from hooks/queries/useProduct.ts)
```ts
useQuery({
  queryKey: ["products", filters],
  queryFn: () => apiClient.get(...).then(r => r.data.data),
  staleTime: 0,
});
```
Populate via `getQueryString({ populate: "*", filters })`.

#### Forms
- Formik + Yup schema from `helpers/validation/`.
- FormField component wraps inputs + error display.

### Backend Architecture (Strapi)

#### Content Types (EAV Model for Flexibility)
From server README.md:

- **Brand**: name, slug, description, logo, website, isActive, products (1:N)
- **Category** (Product Type): name, slug, description, products (1:N), attributes (M:N to Attribute)
- **Attribute**: name, slug, fieldType (string/number/boolean/select/text), unit, options (JSON), isFilterable, isRequired
- **Product**: name, slug, description (richtext), price, sku, stockQuantity, images (media), category (M:1), brand (M:1), attributeValues (1:N to ProductAttributeValue)
- **ProductAttributeValue** (EAV): value (text), product, attribute
- **Cart / CartItem**, **Order / OrderItem**, **Wishlist**, **UploadOrder**, **UserActivity**, **Address**

**Why EAV?** Dynamic attributes per category (e.g., Bulb.wattage vs Wire.gauge) without schema changes. Scalable.

#### API Structure
```
server/src/api/<content-type>/
├── content-types/<type>/schema.json
├── controllers/<type>.ts   # createCoreController (customizable)
├── routes/<type>.ts        # createCoreRouter
└── services/<type>.ts      # createCoreService
```
- Public role auto-permissioned via bootstrap (find/findOne/create/update/delete).
- Custom routes for carts/me, wishlists/toggle, orders/upload, etc.

#### Server Config
- `config/server.ts`, `config/database.ts` (env driven, SQLite default).
- `src/index.ts` bootstrap for perms + register hook.

#### Database
- Dev: better-sqlite3
- Prod: pg (Postgres)
- Auto indexes on FKs, uniques. Migrations in `database/migrations/`.

### Key Data Flows

1. **Product Browsing**:
   - Mobile: useProducts hook → apiClient → /api/products?populate=*&filters[...]
   - Backend: Strapi controller → DB (with EAV joins via populate)

2. **Add to Cart**:
   - Redux optimistic? + mutation → POST /api/carts/add → invalidate cart query

3. **Auth**:
   - Login → token in AsyncStorage → attach to all requests → validate /users/me on init/foreground

4. **Admin**:
   - Mobile admin screens call same APIs (public or with token)

### Configuration Files

- `mobile/app.config.js`: Dynamic Expo config from env (bundle ID, projectId, extra.appEnv)
- `mobile/babel.config.js`: dotenv + reanimated plugin
- `mobile/metro.config.js`: Asset exts
- `server/config/*.ts`: env-based Strapi config
- `eas.json`: Build channels per env

### Development Workflow

1. Backend: `cd server && npm run develop` (port 1337)
2. Mobile: `cd mobile && npm run start` (or start:staging)
3. Use Expo Go or dev client.
4. Admin: http://localhost:1337/admin
5. Lint: `npm run lint:fix`

### Extending the Codebase

- **New API Resource**: Add Strapi content type → generate → add apiRoutes → create hook + api fn.
- **New Screen**: Add file in app/ → update layouts if needed.
- **New Validation**: Add to helpers/validation/.
- **New Admin Screen**: Add in (admin)/.
- **Env Var**: Add to .env.* and app.config.js if needed for Expo extra.

### Security & Prod Notes

- Restrict cart/order create/update to authenticated in prod (via Strapi roles or policies).
- Use EAS for signed builds.
- Environment secrets via EAS Secrets or hosting platform.

---

## Conclusion

These DX improvements make the codebase:
- **Faster to develop**: Aliases, centralized routes, reusable hooks/validation, auto-perms.
- **More reliable**: TS strict, interceptors, offline handling, query caching.
- **Scalable**: EAV, modular structure, env separation, EAS.
- **Maintainable**: Clear folders, docs in README/dev.md, typed code.

For further details, refer to:
- [mobile/README.md](/testbed/cp/mobile/README.md)
- [server/README.md](/testbed/cp/server/README.md) (includes full product schema design)
- [mobile/docs/rn-project-structure.txt](/testbed/cp/mobile/docs/rn-project-structure.txt) (reference patterns)

This architecture supports a full-featured e-commerce app with dynamic products, user accounts, cart/wishlist, orders, upload orders, recommendations via user activity, and admin management.
