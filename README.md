# VTC Web — Full Project

This repository contains the VTC storefront and admin web application: a modern React frontend (Vite) and a Spring Boot backend API. The project provides a complete e-commerce stack with product & category management, cart & wishlist, checkout & orders, user accounts, admin analytics, image uploads, email templates and more.

LinkedIn post: https://www.linkedin.com/feed/update/urn:li:ugcPost:7411019189148123136

## High-level Overview
- Monorepo with two main subprojects:
  - `backend/` — Spring Boot REST API (Java 17+, Spring Security, Spring Data, Flyway)
  - `frontend/` — React + Vite single page application (customer storefront + admin UI)

## Main Use & Applications
- Customer storefront: browse products & categories, search, product detail pages with variations/images, reviews, wishlist, cart and checkout.
- Account management: register/login, profile, addresses, order history, password reset flows.
- Admin UI: product/category CRUD with image uploads, product variations, order management, user management, sales & dashboard analytics.
- Integrations: cloud image storage (Cloudinary via backend proxy), SMTP email templates for transactional emails, coupon & discount logic, JWT authentication with refresh tokens.

## All Features (consolidated)
- Products: create/read/update/delete, full-product creation (images + variations), SKU generation, search, pagination, stats by SKU.
- Product images: proxy upload endpoints, primary/secondary image handling, variation images.
- Product variations: price, stock, attributes, per-variation images.
- Categories: CRUD, tile/main images, product counts per category.
- Cart: per-user cart with local merge, add/update/remove items.
- Wishlist: per-user wishlist, merge local wishlist on login.
- Checkout & Orders: checkout endpoint, order creation, owner/admin access, status updates, cancel, list (paged).
- Users & Auth: registration, login, refresh tokens (cookie `vtc_refresh`), logout, forgot/reset password, role-based access (CUSTOMER, MANAGER, ADMIN).
- Admin features: analytics endpoints, shipping config override, admin user management (roles, status), order and product management.
- Reviews: submit & list reviews, optional JWT association.
- Coupons: apply coupon endpoint for discount calculation.
- Email: template-based async email sends (account welcome, order confirmation, password reset, contact reply, newsletter, order status).
- Storage: image uploads via `ImageStorageService` (Cloudinary implementation example).
- Database migrations: Flyway-based migrations in `backend/src/main/resources/db/migration`.

## Tech Stack
- Backend
  - Java 17+
  - Spring Boot (REST, Security)
  - Spring Data JPA (repositories)
  - Flyway (DB migrations)
  - JWT for authentication
  - Maven build system

- Frontend
  - React 19 with Vite
  - React Router v6
  - Axios for API calls
  - Tailwind CSS + styled-components
  - Recharts for admin charts
  - Framer Motion, Lottie, Swiper for UI enhancements

- Infrastructure & Tools
  - PostgreSQL (recommended in production)
  - Cloudinary (image storage) or compatible storage provider
  - SMTP provider for email delivery
  - Docker / docker-compose for local dev & deployment

## Repo Layout
- `backend/` — Spring Boot API. See `backend/README.md` for full backend API docs and endpoint reference.
- `frontend/` — React SPA. See `frontend/README.md` for frontend usage, scripts and features.
- `docker-compose.yml` — example docker-compose to run backend + DB + other services locally.

## Quickstart (Development)
Prerequisites: Java 17, Maven, Node.js (16+), npm/yarn, Docker (optional)

1) Backend (local):

```bash
cd backend
cp .env.example .env
# configure DB url, email, cloud storage creds in .env or application.properties
./mvnw spring-boot:run
```

2) Frontend (local):

```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_BASE_URL to backend (e.g., http://localhost:8080)
npm run dev
```

3) Run via Docker Compose (recommended for integrated dev):

```bash
docker-compose up --build
```

## Build & Deployment
- Backend: `./mvnw -DskipTests package` → produce JAR in `backend/target`.
- Frontend: `npm run build` in the `frontend` folder → static assets to serve behind CDN/NGINX.
- See `frontend/vercel.json` and `frontend/nginx.conf` for deployment references.

## Environment Variables
- Backend `.env` / `application.properties`: DB connection, JWT secrets, refresh TTLs, cloudinary creds, SMTP creds.
- Frontend `.env`: `VITE_API_BASE_URL`, and any `VITE_` prefixed keys for external services.

## API & Docs
- This repo contains detailed backend API docs in `backend/README.md` and endpoint definitions in `backend/src/main/java/com/vtcweb/backend/controller`.
- Frontend API clients are in `frontend/src/api` and map to the backend endpoints.

## Testing
- Backend tests in `backend/src/test` — run `./mvnw test`.
- Frontend uses ESLint; run `npm run lint`. Add Jest or other test runner if creating unit tests.

## Observability & Logs
- Backend logs to STDOUT. Configure app logging via `application.properties`.
- Monitor email queue logs for delivery, and image upload logs for storage issues.

## Contributing
- Follow code style in each module:
  - Backend: typical Spring Boot conventions, DTOs under `dto`, services under `service`, controllers under `controller`.
  - Frontend: small components, centralize API calls in `src/api`, use `AuthContext` and `CartContext` for shared state.
- Create feature branches, run tests and linters before PRs.

## Security Notes
- Keep JWT secrets, DB credentials, and cloudinary SMTP credentials out of the repo. Use environment variables or secret stores.
- Refresh tokens use an HttpOnly cookie named `vtc_refresh` — backend is responsible for secure cookie settings.

## Where to Look Next
- Backend API reference: `backend/README.md` and controller sources under `backend/src/main/java/com/vtcweb/backend/controller`.
- Frontend docs: `frontend/README.md` and `frontend/src` structure.

## Contact
- Repository owner and contributors: check project settings or git history for contact details.
