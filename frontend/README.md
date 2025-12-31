# VTC Frontend

Overview
- React + Vite single-page application for the VTC storefront and admin UI.
- Provides customer storefront, cart/checkout flow, account management, product browsing, reviews, wishlist, and a full-featured admin interface for products, categories, orders, analytics and settings.

Tech Stack
- React 19, Vite
- Tailwind CSS (configured), styled-components
- React Router v6 for client routing
- Axios for HTTP requests
- Recharts for charts (admin analytics)
- Lottie, Swiper, Leaflet used for UI/UX enhancements

Project Structure (important folders)
- `src/` — application source
	- `api/` — frontend API clients (e.g., `productApi.js`, `authApi.js`, `orderApi.js`, `adminAnalyticsApi.js`)
	- `admin/` — admin UI components and pages (analytics, products, orders, users, settings)
	- `components/` — reusable UI components organized by feature (cart, auth, account, products, checkout, common, layout, etc.)
	- `pages/` — route-level pages for customer-facing app (Home, ProductDetails, Checkout, Account, Login, Register, Wishlist, etc.)
	- `context/` — `AuthContext.jsx`, `CartContext.jsx` for global state
	- `services/` — client helpers (e.g., avatar, reviews)
	- `utils/` — helpers (slugify, validation, wishlist)
	- `styles/` — `App.css`, `index.css`

Key Features
- Public storefront: product listing, search, category pages, product details with variations and images.
- Cart: add/update/remove items, localStorage sync and merge on login.
- Checkout: authenticated checkout flow integrated with backend `POST /api/checkout`.
- Orders: order history, order details, order confirmation flow.
- Account: registration, login, refresh token handling (via backend), profile update, change password, addresses (billing/shipping).
- Wishlist: per-user wishlist with local merge support.
- Reviews: submit and list product reviews (supports anonymous reviewers with name/email and optional JWT-authenticated user association).
- Coupons: apply coupon codes client-side using `/api/coupons/apply`.
- Admin UI: product management (images, variations), category management (images & tiles), order management, users management, analytics dashboards.
- Image uploads: admin image upload flows (frontend posts multipart to backend endpoints which proxy to Cloudinary).
- Notifications: in-app notifications via `api/notifications.js`.

Authentication & API Integration
- The frontend uses `src/api/axios.js` to create an Axios instance configured with the backend base URL and interceptors for auth tokens.
- Auth flow: login/register -> receive access token (stored in memory or localStorage per app policy) and `vtc_refresh` cookie set by backend. The client calls `POST /api/auth/refresh` or relies on backend cookie to refresh tokens.
- Protected routes use `AuthContext` and role checks for admin pages.

Scripts
- Install dependencies:

	```bash
	npm install
	```

- Development:

	```bash
	npm run dev
	```

- Build for production:

	```bash
	npm run build
	```

- Preview production build:

	```bash
	npm run preview
	```

- Lint:

	```bash
	npm run lint
	```

Configuration & Environment
- Copy `.env.example` to `.env` and update values before running.
- Typical env vars used by the frontend (see `.env.example`):
	- `VITE_API_BASE_URL` — backend API base URL (e.g., `http://localhost:8080`)
	- Any third-party keys used by the frontend (maps, analytics) should be placed in environment variables prefixed with `VITE_`.

Routing
- Main app routes are defined in `src/main.jsx`, `App.jsx` and admin routes under `src/admin/routes`.
- Legacy redirects and route guards exist (see `routes/LegacyProductRedirect.jsx` and admin route components).

Admin Panel
- The admin application (`src/admin/*`) exposes features:
	- Analytics dashboard and sales analytics pages
	- Product manager with create/edit/full-add (images & variations)
	- Category management with image uploads for `main|tile1|tile2`
	- Orders list and order details with status updates
	- User management (list, edit, create, roles) integrated with backend admin endpoints

Assets & Static Files
- Static assets live under `public/assets` and `src/assets` (brand logos, carousel images, etc.).

Styling
- Tailwind CSS is present and integrated with Vite; additional component-level styling uses `styled-components`.

Testing & Quality
- ESLint config provided. Run `npm run lint` and address warnings.
- Add unit/integration tests as needed; current repo focuses on UI and manual testing flows.

Deployment
- This project is suitable for Vercel, Netlify, or static hosting behind a CDN. `vercel.json` and an `nginx.conf` are included for reference.
- Build and ship static assets produced by `npm run build` to your hosting platform, ensuring `VITE_API_BASE_URL` points to the deployed backend.

Troubleshooting
- If API calls fail, verify `VITE_API_BASE_URL` and backend health.
- For CORS issues, ensure backend CORS config allows frontend origin.
- For image uploads, ensure backend Cloudinary credentials are configured and reachable.

Contributing
- Follow existing component and hook patterns. Keep components small, use `context` for cross-cutting state (auth/cart), and centralize API calls in `src/api`.

Useful file references
- Main entry: `src/main.jsx`
- App root: `src/App.jsx`
- Admin entry: `src/AdminApp.jsx`
- API clients: `src/api` (e.g., `productApi.js`, `authApi.js`)

License & Attribution
- See project root for license and contributor information.

